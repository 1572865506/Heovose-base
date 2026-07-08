import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { translateContent } from '@/ai/flows/translate-flow';
import { calculateHash, getSourceText } from '@/lib/translation-sync';

export async function POST(request: Request) {
  try {
    // 权限校验：仅登录管理员可调用此接口
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, targetLangs } = (await request.json()) as { id: string; targetLangs: string[] };
    if (!id || !targetLangs || !Array.isArray(targetLangs) || targetLangs.length === 0) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // 1. 查询目标词条数据
    const entry = await db.localizedString.findUnique({
      where: { id }
    });
    if (!entry) {
      return NextResponse.json({ error: 'Translation entry not found' }, { status: 404 });
    }

    const content = (entry.content as Record<string, any>) || {};
    const sourceText = getSourceText(content);
    if (!sourceText.trim()) {
      return NextResponse.json({ error: 'Source text is empty' }, { status: 400 });
    }

    const sourceHash = calculateHash(sourceText);
    const updatedContent = { ...content };
    const updatedTranslatedHashes = {
      ...((entry.translatedHashes as Record<string, string>) || {})
    };

    // 2. 依次调用 AI 智译流对所选语种进行翻译
    for (const lang of targetLangs) {
      try {
        console.log(`[Translation Auto-Sync] Translating entry ${id} to ${lang}...`);
        const taskType = (sourceText.startsWith('{') && sourceText.includes('"type"')) ? 'rich-text' :
                         (sourceText.startsWith('{') && (sourceText.includes('g_0') || sourceText.includes('l_0'))) ? 'spec' : 'text';

        const result = await translateContent({
          text: sourceText,
          targetLangs: [lang],
          taskType: taskType as 'text' | 'spec' | 'rich-text' | 'json-map'
        });

        const translatedText = result[lang];
        if (translatedText !== undefined && translatedText !== null) {
          updatedContent[lang] = translatedText;
          updatedTranslatedHashes[lang] = sourceHash; // 更新翻译版本哈希
        }
      } catch (err: any) {
        console.error(`[Translation Auto-Sync] Failed to translate ${id} to ${lang}:`, err);
        return NextResponse.json({ 
          error: `翻译语种 ${lang} 失败: ${err.message || 'AI 响应异常'}` 
        }, { status: 500 });
      }
    }

    // 默认源语言本身处于同步状态
    updatedTranslatedHashes['zh'] = sourceHash;

    // 3. 将最新翻译数据与哈希字典保存到数据库
    const updatedItem = await db.localizedString.update({
      where: { id },
      data: {
        content: updatedContent,
        sourceHash: sourceHash,
        translatedHashes: updatedTranslatedHashes
      }
    });

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (error: any) {
    console.error('[API Error] /api/localizedStrings/auto-sync:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
