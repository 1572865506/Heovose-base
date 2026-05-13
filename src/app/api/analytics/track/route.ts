import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, sessionId, visitorId, path, x, y, element, ...rest } = body;

    if (!sessionId || !visitorId) {
      return NextResponse.json({ error: 'Session ID and Visitor ID required' }, { status: 400 });
    }

    if (type === 'pageview') {
      // Create or Update Session
      await db.visitorSession.upsert({
        where: { id: sessionId },
        update: {
          lastPath: path,
          updatedAt: new Date(),
        },
        create: {
          id: sessionId,
          visitorId: visitorId,
          userAgent: rest.userAgent || '',
          referrer: rest.referrer || '',
          lastPath: path,
        },
      });
    }

    // Record Event
    await db.analyticsEvent.create({
      data: {
        sessionId,
        type: type.toUpperCase(), // Normalize to uppercase
        path,
        x: x || null,
        y: y || null,
        element: element || null,
        extraData: rest, // Store other info in extraData JSON
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
