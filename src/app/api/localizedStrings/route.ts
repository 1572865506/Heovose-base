import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang');
    const isFull = searchParams.get('full') === 'true';

    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');

    const queryOptions: any = {
      orderBy: { id: 'asc' }
    };

    if (pageStr && limitStr) {
      const page = parseInt(pageStr, 10);
      const limit = parseInt(limitStr, 10);
      if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
        queryOptions.skip = (page - 1) * limit;
        queryOptions.take = limit;
      }
    } else {
      // 默认在无分页参数时，设置最大取 5000 条以防御内存暴涨，同时兼容老接口
      queryOptions.take = 5000;
    }

    const strings = await db.localizedString.findMany(queryOptions);


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
          'adv_'
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
