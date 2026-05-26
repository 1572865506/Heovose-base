import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function GET() {
  try {
    const session = await auth();
    console.log('[WelcomeBack] Session:', session?.user?.email);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // 1. Get the current user's lastSeen
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { lastSeen: true }
    });

    const lastSeen = user?.lastSeen;
    const now = new Date();

    console.log('[WelcomeBack] LastSeen:', lastSeen);

    // 2. If it's the very first time, we just set lastSeen and return empty delta
    if (!lastSeen) {
      await db.user.update({
        where: { id: userId },
        data: { lastSeen: now }
      });
      return NextResponse.json({ firstTime: true });
    }

  // 3. Query growth since lastSeen
  const [newInquiries, newProducts, newSessions, totalPending, processedSinceLastSeen] = await Promise.all([
    db.inquiry.count({
      where: { createdAt: { gt: lastSeen } }
    }),
    db.product.count({
      where: { createdAt: { gt: lastSeen } }
    }),
    db.visitorSession.count({
      where: { createdAt: { gt: lastSeen } }
    }),
    db.inquiry.count({
      where: { status: 'pending' }
    }),
    db.inquiry.count({
      where: { 
        status: { not: 'pending' },
        updatedAt: { gt: lastSeen }
      }
    })
  ]);

  // 4. Update lastSeen to now so we don't show the same prompt again immediately
  // NOTE: In a real app, you might want to update this more strategically (e.g., on logout or via a heartbeat)
  // but for a "Welcome Back" feature, updating on first dashboard load is a common pattern.
  await db.user.update({
    where: { id: userId },
    data: { lastSeen: now }
  });

  // 5. Calculate time diff for the "While you were away" text
  const diffHours = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

    return NextResponse.json({
      hasData: newInquiries > 0 || newProducts > 0 || newSessions > 0 || totalPending > 0,
      newInquiries,
      newProducts,
      newSessions,
      totalPending,
      processedSinceLastSeen,
      lastSeen,
      awayTime: diffDays > 0 ? `${diffDays}天` : diffHours > 0 ? `${diffHours}小时` : '一段时间',
      timestamp: now.toISOString()
    });
  } catch (error: any) {
    console.error('[WelcomeBack] Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}
