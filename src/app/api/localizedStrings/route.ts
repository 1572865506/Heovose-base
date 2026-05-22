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
        const bizPrefixes = [
          'prod_', 'cat_', 'spec_', 'biz_tr_', 'psl_', 'psv_', 'psg_', 
          'adv_', 'case_', 'step_', 'hero_slide_', 'slide_', 
          'hero_wholesale_', 'hero_project_', 'MAP_LOC_'
        ];

        const filteredStrings = strings.filter((item: any) => {
          const itemId = item.id || '';
          const itemKey = item.key || '';
          return !bizPrefixes.some(prefix => 
            itemId.startsWith(prefix) || itemKey.startsWith(prefix)
          );
        });

        const prunedStrings = filteredStrings.map((item: any) => {
          let content = (item.content as any) || {};
          
          // Defensively extract nested translation content if present
          if (content && typeof content === 'object' && 'content' in content && typeof content.content === 'object' && !Array.isArray(content.content)) {
            content = content.content;
          }
          
          return {
            ...item,
            content: {
              // Only retain the requested language translation, never fallback
              [lang]: content[lang] || ""
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
