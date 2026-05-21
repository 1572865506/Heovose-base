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

      const content = (item.content as any) || {};
      return Object.values(content).some(
        (val) => typeof val === 'string' && val.toLowerCase().includes(searchLower)
      );
    });

    // 限制返回条数，格式化输出
    const results = filtered.slice(0, 15).map((item: any) => ({
      id: item.id,
      content: item.content,
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
