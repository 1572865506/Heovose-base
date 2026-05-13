import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const events = await db.analyticsEvent.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5000, // Limit for performance
    });
    return NextResponse.json(events);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
