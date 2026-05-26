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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
