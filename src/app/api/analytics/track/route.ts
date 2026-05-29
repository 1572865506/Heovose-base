import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    const rawText = await request.text();
    if (!rawText.trim()) {
      return NextResponse.json({ error: 'Empty request body' }, { status: 400 });
    }
    const body = JSON.parse(rawText);
    const { type, sessionId, visitorId, path, x, y, element, ...rest } = body;

    // 1. Session ID and Visitor ID format & length validation
    const idRegex = /^[a-zA-Z0-9_\-]+$/;
    if (!sessionId || !visitorId || typeof sessionId !== 'string' || typeof visitorId !== 'string') {
      return NextResponse.json({ error: 'Session ID and Visitor ID are required strings' }, { status: 400 });
    }
    if (sessionId.length > 128 || visitorId.length > 128 || !idRegex.test(sessionId) || !idRegex.test(visitorId)) {
      return NextResponse.json({ error: 'Invalid Session ID or Visitor ID format' }, { status: 400 });
    }

    // 2. Type validation
    const allowedTypes = ['pageview', 'click', 'hover', 'scroll', 'video_play', 'video_pause', 'video_ended'];
    if (!type || typeof type !== 'string' || !allowedTypes.includes(type.toLowerCase())) {
      return NextResponse.json({ error: 'Invalid or unsupported tracking type' }, { status: 400 });
    }

    // 3. Path validation
    if (path && (typeof path !== 'string' || path.length > 500)) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // 4. Position validation
    let valX: number | null = null;
    let valY: number | null = null;
    if (x !== undefined && x !== null) {
      const numX = Number(x);
      if (isNaN(numX) || numX < -10000 || numX > 10000) return NextResponse.json({ error: 'Invalid X position' }, { status: 400 });
      valX = numX;
    }
    if (y !== undefined && y !== null) {
      const numY = Number(y);
      if (isNaN(numY) || numY < -10000 || numY > 10000) return NextResponse.json({ error: 'Invalid Y position' }, { status: 400 });
      valY = numY;
    }

    // 5. Element validation
    if (element && (typeof element !== 'string' || element.length > 255)) {
      return NextResponse.json({ error: 'Invalid element identifier' }, { status: 400 });
    }

    // 6. Whitelist filter rest fields into extraData to prevent DB inflation
    const extraData: Record<string, any> = {};
    if (rest.userAgent) {
      extraData.userAgent = String(rest.userAgent).slice(0, 500);
    }
    if (rest.referrer) {
      extraData.referrer = String(rest.referrer).slice(0, 500);
    }
    if (rest.screenWidth !== undefined) {
      const w = Number(rest.screenWidth);
      if (!isNaN(w) && w >= 0 && w < 10000) extraData.screenWidth = w;
    }
    if (rest.screenHeight !== undefined) {
      const h = Number(rest.screenHeight);
      if (!isNaN(h) && h >= 0 && h < 10000) extraData.screenHeight = h;
    }
    if (rest.duration !== undefined) {
      const d = Number(rest.duration);
      if (!isNaN(d) && d >= 0) extraData.duration = d;
    }
    if (rest.currentTime !== undefined) {
      const ct = Number(rest.currentTime);
      if (!isNaN(ct) && ct >= 0) extraData.currentTime = ct;
    }
    if (type.toLowerCase() === 'pageview') {
      // 获取客户端真实 IP
      const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
                 request.headers.get("x-real-ip") || 
                 "127.0.0.1";

      // 提取平台地理位置请求头 (适配 App Hosting / Firebase / Cloudflare / Vercel)
      let country = request.headers.get("x-appengine-country") || 
                    request.headers.get("x-vercel-ip-country") || 
                    request.headers.get("cf-ipcountry") || 
                    request.headers.get("x-country-code") || 
                    "";
                    
      let city = request.headers.get("x-appengine-city") || 
                 request.headers.get("x-vercel-ip-city") || 
                 request.headers.get("cf-ipcity") || 
                 "";

      // 本地开发友好后备 (无平台头部且为本地/内网 IP 时，模拟为本地来源，防全显示 Unknown)
      if (!country && (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.'))) {
        country = 'CN';
        city = 'Localhost';
      }

      if (!country) country = 'UNKNOWN';
      if (!city) city = 'UNKNOWN';

      // 强制国家代码大写
      country = country.toUpperCase();

      // Create or Update Session
      await db.visitorSession.upsert({
        where: { id: sessionId },
        update: {
          lastPath: path ? path.slice(0, 255) : null,
          updatedAt: new Date(),
        },
        create: {
          id: sessionId,
          visitorId: visitorId,
          ip: ip,
          country: country,
          city: city,
          userAgent: extraData.userAgent || '',
          referrer: extraData.referrer || '',
          lastPath: path ? path.slice(0, 255) : null,
        },
      });
    }

    // Record Event
    await db.analyticsEvent.create({
      data: {
        sessionId,
        type: type.toUpperCase(), // Normalize to uppercase
        path: path ? path.slice(0, 255) : '',
        x: valX,
        y: valY,
        element: element ? element.slice(0, 255) : null,
        extraData: extraData, // Store cleaned info in extraData JSON
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
