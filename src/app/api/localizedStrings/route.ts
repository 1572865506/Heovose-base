import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang');
    const isFull = searchParams.get('full') === 'true';

    const strings = await db.localizedString.findMany();

    // 如果指定了语言且非全量模式，执行按需裁剪
    if (lang && !isFull) {
      // 从数据库读取当前的语言配置
      let supportedCodes: string[] = ['en', 'zh', 'id', 'vi'];
      let defaultLanguage = 'en';

      try {
        const langSetting = await db.setting.findUnique({ where: { id: 'languages' } });
        if (langSetting && langSetting.value) {
          const parsed = JSON.parse(langSetting.value);
          if (Array.isArray(parsed.supportedLanguages)) {
            supportedCodes = parsed.supportedLanguages.map((l: any) => l.code);
          }
          if (parsed.defaultLanguage) {
            defaultLanguage = parsed.defaultLanguage;
          }
        }
      } catch (e) {
        console.warn('Failed to parse language settings, using defaults:', e);
      }
      
      // 如果请求的语言在支持列表内，执行过滤以减少传输体积
      if (supportedCodes.includes(lang)) {
        const prunedStrings = strings.map((item: any) => {
          const content = (item.content as any) || {};
          return {
            ...item,
            content: {
              // 仅保留请求的语言，如果缺失则回退到默认语种
              [lang]: content[lang] || content[defaultLanguage] || content['en'] || content['zh'] || ""
            }
          };
        });
        return NextResponse.json(prunedStrings);
      }
    }

    return NextResponse.json(strings);
  } catch (error) {
    console.error('Failed to fetch localized strings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
