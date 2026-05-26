import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';

export const GET = withAuth('editor', async (request) => {
  try {
    const events = await db.analyticsEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5000, // Limit for performance
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
