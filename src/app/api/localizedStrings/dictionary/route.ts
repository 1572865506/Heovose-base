import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    if (!q) {
      return NextResponse.json([]);
    }

    const searchLower = q.toLowerCase();

    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');

    const queryOptions: any = {
      orderBy: { updatedAt: 'desc' }
    };

    if (pageStr && limitStr) {
      const page = parseInt(pageStr, 10);
      const limit = parseInt(limitStr, 10);
      if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
        queryOptions.skip = (page - 1) * limit;
        queryOptions.take = limit;
      }
    } else {
      // 默认在无分页参数时，设置最大取 1000 条以防御内存暴涨风险
      queryOptions.take = 1000;
    }

    // 获取受限范围的本地化字符串进行内存过滤，防范全表大表加载导致的内存耗尽崩溃
    const strings = await db.localizedString.findMany(queryOptions);


    // 过滤：非专属（不以 prod_, cat_, case_ 开头），非系统 UI（不以 SYS_, navbar_ 开头）
    // 且翻译内容中包含查询词
    const filtered = strings.filter((item: any) => {
      const id = item.id;
      const isExclusiveOrSystem = /^(prod_|cat_|case_|SYS_|navbar_)/i.test(id);
      if (isExclusiveOrSystem) return false;

      let content = (item.content as any) || {};
      if (content && typeof content === 'object' && 'content' in content && typeof content.content === 'object' && !Array.isArray(content.content)) {
        content = content.content;
      }
      return Object.values(content).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(searchLower)
      );
    });

    // 智能去重与优化：
    // 1. 中文相同且英文相同的完全重复项仅保留一个。
    // 2. 对于相同的中文，若存在有英文翻译的项，自动舍弃或覆盖无英文翻译的空项。
    const uniqueMap = new Map<string, { id: string; zh: string; en: string }>();

    for (const item of filtered) {
      let content = (item.content as any) || {};
      if (content && typeof content === 'object' && 'content' in content && typeof content.content === 'object' && !Array.isArray(content.content)) {
        content = content.content;
      }

      const zh = (content.zh || '').trim();
      const en = (content.en || '').trim();

      if (!zh) continue;

      const fullKey = `${zh}|||${en}`;

      // 相同的中文+英文组合已存在，直接跳过
      if (uniqueMap.has(fullKey)) {
        continue;
      }

      // 如果当前项英文为空，但已经有相同中文且带英文的项存在，忽略此空英文项
      if (!en) {
        const hasActiveWithEn = Array.from(uniqueMap.values()).some(
          (x) => x.zh === zh && x.en !== ''
        );
        if (hasActiveWithEn) {
          continue;
        }
      }

      // 如果当前项英文不为空，但之前存过相同中文且英文为空的项，则将那个空项清除，用当前高质量项覆盖
      if (en) {
        const emptyEnKey = `${zh}|||`;
        if (uniqueMap.has(emptyEnKey)) {
          uniqueMap.delete(emptyEnKey);
        }
      }

      uniqueMap.set(fullKey, { id: item.id, zh, en });
    }

    // 按照匹配度进行排序：
    // 1. 完全匹配最高优先
    // 2. 前缀匹配次之
    // 3. 包含匹配再次之（越靠前越好）
    // 4. 匹配度相同时，长度越短越优先
    const getMatchScore = (x: { zh: string; en: string }) => {
      const zhLower = x.zh.toLowerCase();
      const enLower = x.en.toLowerCase();
      
      if (zhLower === searchLower || enLower === searchLower) {
        return 0;
      }
      if (zhLower.startsWith(searchLower) || enLower.startsWith(searchLower)) {
        return 1;
      }
      const idxZh = zhLower.indexOf(searchLower);
      const idxEn = enLower.indexOf(searchLower);
      const minIdx = Math.min(
        idxZh !== -1 ? idxZh : Infinity,
        idxEn !== -1 ? idxEn : Infinity
      );
      if (minIdx !== Infinity) {
        return 2 + minIdx / 1000;
      }
      return 4;
    };

    const sortedResults = Array.from(uniqueMap.values()).sort((a, b) => {
      const scoreA = getMatchScore(a);
      const scoreB = getMatchScore(b);
      if (scoreA !== scoreB) {
        return scoreA - scoreB;
      }
      const lenA = Math.min(a.zh.length, a.en ? a.en.length : Infinity);
      const lenB = Math.min(b.zh.length, b.en ? b.en.length : Infinity);
      return lenA - lenB;
    });

    // 限制返回条数，格式化输出
    const results = sortedResults
      .slice(0, 10)
      .map((x) => ({
        id: x.id,
        content: { zh: x.zh, en: x.en },
      }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[API Error] Dictionary route GET:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
