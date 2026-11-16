import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';

export const GET = withAuth('editor', async (request) => {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    let startDate: Date | undefined;
    const now = new Date();
    if (range === '24h') {
      // 预留前序一个周期 (24h * 2 = 48h) 便于计算上个周期对比
      startDate = new Date(now.getTime() - 48 * 60 * 60 * 1000);
    } else if (range === '7d') {
      // 预留前序一个周期 (7d * 2 = 14d)
      startDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      // 预留前序一个周期 (30d * 2 = 60d)
      startDate = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    } else if (range === 'year') {
      // 预留去年同期数据
      startDate = new Date(now.getFullYear() - 1, 0, 1);
    } else if (range === 'all') {
      startDate = undefined;
    }

    const where: any = {};
    if (startDate) {
      where.createdAt = { gte: startDate };
    }

    const sessions = await db.visitorSession.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20000, // Safe generous limit
    });

    // 动态回填历史遗留空值，保证旧数据或本地演示数据能够完美显示
    const normalizedSessions = sessions.map((s: any) => {
      if (!s.country) {
        s.country = 'CN';
        s.city = 'Localhost';
      }
      return s;
    });

    return NextResponse.json(normalizedSessions);
  } catch (error) {
    console.error('[Analytics Sessions API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
