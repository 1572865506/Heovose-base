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

    // 获取所有本地化字符串进行内存过滤以避免复杂 JSON 字段 SQL 检索
    const strings = await db.localizedString.findMany();

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

    // 限制返回条数，格式化输出
    const results = Array.from(uniqueMap.values())
      .slice(0, 10)
      .map((x) => ({
        id: x.id,
        content: { zh: x.zh, en: x.en },
      }));

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('[API Error] Dictionary route GET:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
