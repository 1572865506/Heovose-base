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
    const allowedTypes = ['pageview', 'click', 'hover', 'scroll', 'video_play', 'video_pause', 'video_ended', 'cookie_accept', 'form_start'];
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
    if (rest.scrollDepth !== undefined) {
      const sd = Number(rest.scrollDepth);
      if (!isNaN(sd) && sd >= 0) extraData.scrollDepth = sd;
    }
    if (rest.utm_source) extraData.utm_source = String(rest.utm_source).slice(0, 100);
    if (rest.utm_medium) extraData.utm_medium = String(rest.utm_medium).slice(0, 100);
    if (rest.utm_campaign) extraData.utm_campaign = String(rest.utm_campaign).slice(0, 100);
    if (rest.isLandingPage !== undefined) extraData.isLandingPage = !!rest.isLandingPage;

    // Check privacy consent
    const hasConsent = body.hasConsent === true || type.toLowerCase() === 'cookie_accept';

    let ip: string | null = null;
    let country = "UNKNOWN";
    let city = "UNKNOWN";
    let userAgent: string | null = null;

    if (hasConsent) {
      // 获取客户端真实 IP
      ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || 
           request.headers.get("x-real-ip") || 
           "127.0.0.1";

      // 提取平台地理位置请求头 (适配 App Hosting / Firebase / Cloudflare / Vercel)
      country = request.headers.get("x-appengine-country") || 
                request.headers.get("x-vercel-ip-country") || 
                request.headers.get("cf-ipcountry") || 
                request.headers.get("x-country-code") || 
                "";
                
      city = request.headers.get("x-appengine-city") || 
             request.headers.get("x-vercel-ip-city") || 
             request.headers.get("cf-ipcity") || 
             "";

      // 本地开发及WSL局域网网段后备判定 (排除局域网和本地环回展示为 Unknown 影响本地测试)
      const isLocal = ip === '127.0.0.1' || 
                      ip === '::1' || 
                      ip.includes('127.0.0.1') ||
                      ip.startsWith('192.168.') || 
                      ip.startsWith('10.') || 
                      ip.startsWith('172.') ||
                      ip.includes('172.') ||
                      ip.startsWith('::ffff:172.');

      if (!country && isLocal) {
        country = 'CN';
        city = 'Localhost';
      }

      if (!country) country = 'UNKNOWN';
      if (!city) city = 'UNKNOWN';
      country = country.toUpperCase();
      
      // 直接读取 HTTP 头的真实 User-Agent，不再完全依赖前端上报，防止遗漏
      userAgent = request.headers.get("user-agent") || extraData.userAgent || null;
    }

    // Prepare upsert payload
    const sessionUpdate: any = {
      lastPath: path ? path.slice(0, 255) : null,
      updatedAt: new Date(),
    };
    if (hasConsent) {
      if (ip) sessionUpdate.ip = ip;
      if (country) sessionUpdate.country = country;
      if (city) sessionUpdate.city = city;
      if (userAgent) sessionUpdate.userAgent = userAgent;
    }

    // Create or Update Session
    await db.visitorSession.upsert({
      where: { id: sessionId },
      update: sessionUpdate,
      create: {
        id: sessionId,
        visitorId: visitorId,
        ip: ip,
        country: country,
        city: city,
        userAgent: userAgent || '',
        referrer: extraData.referrer || '',
        lastPath: path ? path.slice(0, 255) : null,
      },
    });

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
