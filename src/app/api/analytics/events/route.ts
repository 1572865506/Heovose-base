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
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    } else if (range === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    } else if (range === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    } else if (range === 'all') {
      startDate = undefined;
    }

    const where: any = {};
    if (startDate) {
      where.timestamp = { gte: startDate };
    }

    const events = await db.analyticsEvent.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 50000, // Safe generous limit
    });
    return NextResponse.json(events);
  } catch (error) {
    console.error('[Analytics Events API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
