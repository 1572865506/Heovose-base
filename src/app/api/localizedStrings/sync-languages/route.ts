import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { translateContent } from '@/ai/flows/translate-flow';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // 1. 获取支持的语言
    const langSetting = await db.setting.findUnique({ where: { id: 'languages' } });
    let supportedCodes: string[] = ['en', 'zh', 'id', 'vi'];
    let defaultLanguage = 'zh';

    if (langSetting && langSetting.value) {
      const parsed = JSON.parse(langSetting.value as string);
      if (Array.isArray(parsed.supportedLanguages)) {
        supportedCodes = parsed.supportedLanguages.map((l: any) => l.code);
      }
      if (parsed.defaultLanguage) {
        defaultLanguage = parsed.defaultLanguage;
      }
    }

    // 2. 查找所有的 localizedString 记录
    const strings = await db.localizedString.findMany();
    
    // 3. 找出有哪些需要翻译补全的项
    const pendingTasks: { id: string; sourceText: string; targetLang: string; currentContent: any }[] = [];

    for (const item of strings) {
      const content = (item.content as any) || {};
      
      // 找出当前词条中已经存在的任意一个非空翻译作为源文本
      const sourceLang = [defaultLanguage, 'zh', 'en', ...Object.keys(content)].find(
        (lang) => content[lang] !== undefined && content[lang] !== null && content[lang] !== ''
      );

      if (!sourceLang) continue; // 如果完全没有任何语言有翻译，跳过
      const sourceText = content[sourceLang];

      // 遍历所有启用的支持语种，看哪些缺失了
      for (const code of supportedCodes) {
        if (!content[code] || content[code].trim() === '') {
          if (code !== sourceLang) {
            pendingTasks.push({
              id: item.id,
              sourceText,
              targetLang: code,
              currentContent: content,
            });
          }
        }
      }
    }

    if (pendingTasks.length === 0) {
      return NextResponse.json({
        success: true,
        processedCount: 0,
        remainingCount: 0,
        message: '所有语言翻译已是最新状态！',
      });
    }

    // 限制单次最大处理数，以防止 API 频率超限或请求超时
    const batchLimit = 20;
    const tasksToProcess = pendingTasks.slice(0, batchLimit);
    let successCount = 0;

    for (const task of tasksToProcess) {
      try {
        const translationResult = await translateContent({
          text: task.sourceText,
          targetLangs: [task.targetLang],
          taskType: 'text',
        });

        if (translationResult && translationResult[task.targetLang]) {
          const newContent = {
            ...task.currentContent,
            [task.targetLang]: translationResult[task.targetLang],
          };

          await db.localizedString.update({
            where: { id: task.id },
            data: { content: newContent },
          });

          successCount++;
        }
      } catch (err: any) {
        console.warn(
          `[sync-languages] Failed to translate "${task.sourceText}" to "${task.targetLang}":`,
          err.message
        );
      }
    }

    return NextResponse.json({
      success: true,
      processedCount: successCount,
      remainingCount: Math.max(0, pendingTasks.length - tasksToProcess.length),
    });
  } catch (error: any) {
    console.error('[API Error] sync-languages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
