import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';

export const GET = withAuth('editor', async (request) => {
  try {
    const activeThreshold = new Date(Date.now() - 5 * 60 * 1000);

    // 1. Get events in the last 5 minutes
    const recentEvents = await db.analyticsEvent.findMany({
      where: {
        timestamp: { gte: activeThreshold },
      },
      orderBy: { timestamp: 'desc' },
      include: {
        session: true,
      },
    });

    // 2. Identify unique active sessions & map their latest status
    const activeSessionsMap = new Map<string, {
      sessionId: string;
      visitorId: string;
      lastActive: Date;
      currentPath: string;
      country: string | null;
      city: string | null;
      userAgent: string | null;
      referrer: string | null;
    }>();

    recentEvents.forEach((event: any) => {
      if (!activeSessionsMap.has(event.sessionId)) {
        activeSessionsMap.set(event.sessionId, {
          sessionId: event.sessionId,
          visitorId: event.session.visitorId,
          lastActive: event.timestamp,
          currentPath: event.path,
          country: event.session.country,
          city: event.session.city,
          userAgent: event.session.userAgent,
          referrer: event.session.referrer,
        });
      }
    });

    const activeSessionsList = Array.from(activeSessionsMap.values());
    const onlineCount = activeSessionsList.length;

    // 3. Count current active pages
    const pathDistribution: Record<string, number> = {};
    activeSessionsList.forEach((s) => {
      const p = s.currentPath || '/';
      pathDistribution[p] = (pathDistribution[p] || 0) + 1;
    });

    const pages = Object.entries(pathDistribution)
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      onlineCount,
      activeSessions: activeSessionsList,
      pages,
    });
  } catch (error) {
    console.error('[Realtime Analytics API] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
