import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const sessions = await db.visitorSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 1000, // Limit for performance
    });
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
