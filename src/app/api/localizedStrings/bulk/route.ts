import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import crypto from 'crypto';

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { items } = await request.json() as { items: { zh: string; en: string }[] };
    if (!Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items format' }, { status: 400 });
    }

    // 限制单次批量操作最多 500 个条目，防止大载荷内存爆损
    if (items.length > 500) {
      return NextResponse.json({ error: 'Payload too large. Max 500 items per request.' }, { status: 400 });
    }


    // 1. 去重并计算哈希 ID
    const uniqueItemsMap = new Map<string, { zh: string; en: string; hashId: string }>();

    items.forEach(item => {
      const zh = (item.zh || '').trim();
      const en = (item.en || '').trim();
      if (!zh && !en) return; // 忽略双空内容

      const key = `${zh}::${en}`;
      if (!uniqueItemsMap.has(key)) {
        // 使用 SHA-1 产生 16 位紧凑指纹
        const hash = crypto.createHash('sha1').update(key).digest('hex').substring(0, 16);
        const hashId = `biz_tr_${hash}`;
        uniqueItemsMap.set(key, { zh, en, hashId });
      }
    });

    const uniqueItems = Array.from(uniqueItemsMap.values());
    if (uniqueItems.length === 0) {
      return NextResponse.json({ mapping: {} });
    }

    // 2. 批量查找数据库中已存的哈希 ID
    const existingStrings = await db.localizedString.findMany({
      where: {
        id: { in: uniqueItems.map(u => u.hashId) }
      }
    });
    const existingSet = new Set(existingStrings.map((s: { id: string }) => s.id));

    // 3. 找出需要新创建的词条
    const toCreate = uniqueItems.filter(u => !existingSet.has(u.hashId));

    if (toCreate.length > 0) {
      // 批量写入翻译库
      await db.localizedString.createMany({
        data: toCreate.map(u => ({
          id: u.hashId,
          content: { zh: u.zh, en: u.en }
        })),
        skipDuplicates: true
      });
    }

    // 4. 返回翻译文本对到哈希 ID 的映射映射表
    const mapping: Record<string, string> = {};
    uniqueItems.forEach(u => {
      const key = `${u.zh}::${u.en}`;
      mapping[key] = u.hashId;
    });

    return NextResponse.json({ mapping });
  } catch (error: any) {
    console.error('[API Error] LocalizedString BULK:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
