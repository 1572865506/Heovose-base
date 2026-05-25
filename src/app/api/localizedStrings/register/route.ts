import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { keys } = await request.json();
    if (!Array.isArray(keys)) {
      return NextResponse.json({ error: 'Invalid keys parameter' }, { status: 400 });
    }

    // 过滤出符合系统 ID 规则的 Key
    const systemKeys = keys.filter(
      (k) =>
        typeof k === 'string' &&
        (/^[A-Z0-9_]{5,40}$/.test(k) || /^(navbar_|SYS_)/i.test(k))
    );

    if (systemKeys.length === 0) {
      return NextResponse.json({ success: true, registeredCount: 0 });
    }

    // 查出已存在的 Key，避免重复创建
    const existing = await db.localizedString.findMany({
      where: {
        id: { in: systemKeys },
      },
      select: {
        id: true,
      },
    });

    const existingIds = new Set(existing.map((e: { id: string }) => e.id));
    const toCreate = systemKeys.filter((k: string) => !existingIds.has(k));

    if (toCreate.length > 0) {
      await db.localizedString.createMany({
        data: toCreate.map((k) => ({
          id: k,
          content: {}, // 翻译内容留空
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json({
      success: true,
      registeredCount: toCreate.length,
      keys: toCreate,
    });
  } catch (error: any) {
    console.error('[API Error] LocalizedStrings register POST:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: error.message },
      { status: 500 }
    );
  }
}
