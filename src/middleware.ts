import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

const locales = ['en', 'zh', 'id', 'vi'];

// In-memory rate limiting cache
interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const cache = new Map<string, RateLimitTracker>();
let lastCleanupTime = Date.now();
const CLEANUP_INTERVAL_MS = 60000;

function checkRateLimit(ip: string, limit: number, durationMs: number): { success: boolean; remaining: number } {
  const now = Date.now();
  
  // Lazy cleanup to prevent memory leaks in Edge runtime without setInterval
  if (now - lastCleanupTime > CLEANUP_INTERVAL_MS) {
    for (const [key, record] of cache.entries()) {
      if (now > record.resetTime) {
        cache.delete(key);
      }
    }
    lastCleanupTime = now;
  }

  const record = cache.get(ip);
  if (!record) {
    cache.set(ip, { count: 1, resetTime: now + durationMs });
    return { success: true, remaining: limit - 1 };
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + durationMs;
    return { success: true, remaining: limit - 1 };
  }

  record.count++;
  if (record.count > limit) {
    return { success: false, remaining: 0 };
  }

  return { success: true, remaining: limit - record.count };
}

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // CSRF 防护 (L-7)：拦截跨站的非安全写操作请求（POST, PUT, DELETE, PATCH）
  const method = request.method;
  const isWriteMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (isWriteMethod && pathname !== '/api/analytics/track') {
    const origin = request.headers.get('origin');
    const referer = request.headers.get('referer');
    const secFetchSite = request.headers.get('sec-fetch-site');
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:9002';
    
    // 1. 拦截明确标识的跨站写操作
    if (secFetchSite === 'cross-site') {
      return NextResponse.json({ error: 'CSRF Protection: Cross-site write requests are blocked.' }, { status: 403 });
    }
    
    // 2. 校验 Origin 同源域
    if (origin) {
      const isAllowedOrigin = origin === appUrl || 
                              origin.startsWith('http://localhost:') || 
                              origin.endsWith('.heovose.com') ||
                              origin.endsWith('.web.app');
      if (!isAllowedOrigin) {
        return NextResponse.json({ error: 'CSRF Protection: Origin mismatch.' }, { status: 403 });
      }
    } else if (referer) {
      // 3. 校验 Referer 同源域
      try {
        const refererUrl = new URL(referer);
        const appUrlObj = new URL(appUrl);
        const isAllowedReferer = refererUrl.origin === appUrlObj.origin ||
                                 refererUrl.origin.startsWith('http://localhost:') ||
                                 refererUrl.hostname.endsWith('.heovose.com') ||
                                 refererUrl.hostname.endsWith('.web.app');
        if (!isAllowedReferer) {
          return NextResponse.json({ error: 'CSRF Protection: Referer mismatch.' }, { status: 403 });
        }
      } catch (e) {
        return NextResponse.json({ error: 'CSRF Protection: Invalid Referer.' }, { status: 403 });
      }
    }
  }

  // Protect storage endpoint from non-GET / non-OPTIONS requests (CORS & server-side protection)
  if (pathname.startsWith('/storage')) {

    const requestOrigin = request.headers.get('origin') || '';
    const appUrl = process.env.NEXTAUTH_URL || 'http://localhost:9002';
    const isAllowedOrigin = requestOrigin === appUrl || 
                            requestOrigin.startsWith('http://localhost:') || 
                            requestOrigin.endsWith('.heovose.com') ||
                            requestOrigin.endsWith('.web.app');
    const allowedOrigin = isAllowedOrigin ? requestOrigin : appUrl;

    if (request.method === 'OPTIONS') {
      const response = new NextResponse(null, { status: 204 });
      response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
      response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
      return response;
    }
    if (request.method !== 'GET') {
      return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405 }
      );
    }
  }

  // Rate limiting for specific high-risk API endpoints (including products API to prevent search DoS)
  if (pathname === '/api/products' || pathname === '/api/analytics/track' || pathname.startsWith('/api/auth') || pathname === '/api/inquiries' || pathname === '/api/upload') {
    const isGetProducts = pathname === '/api/products' && request.method === 'GET';
    const isStateChangingPost = request.method === 'POST' && (pathname.startsWith('/api/auth') || pathname === '/api/inquiries' || pathname === '/api/upload' || pathname === '/api/analytics/track');
    
    if (isGetProducts || isStateChangingPost) {
      const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
      
      let limit = 10;
      let duration = 60000; // 1 minute
      
      if (pathname === '/api/inquiries') {
        limit = 5; // max 5 inquiry submissions per minute
      } else if (pathname === '/api/upload') {
        limit = 10; // max 10 file uploads per minute
      } else if (pathname.startsWith('/api/auth')) {
        limit = 10; // max 10 login / auth POST attempts per minute
      } else if (pathname === '/api/products') {
        limit = 60; // max 60 product search/list requests per minute to prevent DoS
      } else if (pathname === '/api/analytics/track') {
        limit = 120; // max 120 track events per minute to prevent DoS
      }
      
      const clientKey = `${ip}:${pathname}`;
      const result = checkRateLimit(clientKey, limit, duration);
      
      if (!result.success) {
        return NextResponse.json(
          { error: "Too many requests. Please try again later." },
          { status: 429 }
        );
      }
    }
  }

  // Skip for all other API and static files
  if (pathname.startsWith('/api') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const isLoggedIn = !!request.auth;

  // 1. Admin protection
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
    return NextResponse.next();
  }

  // 2. Language resolution
  const urlLocale = nextUrl.searchParams.get('lang');
  if (!urlLocale) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const acceptLang = request.headers.get('accept-language')?.split(',')[0].split('-')[0].toLowerCase();
    const locales = ['en', 'zh', 'id', 'vi'];
    
    let resolved = 'en';
    if (cookieLocale && locales.includes(cookieLocale)) {
      resolved = cookieLocale;
    } else if (acceptLang && locales.includes(acceptLang)) {
      resolved = acceptLang;
    }

    const url = nextUrl.clone();
    url.searchParams.set('lang', resolved);
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/api/auth/:path*',
    '/api/inquiries',
    '/api/upload',
    '/api/products',
    '/api/analytics/track',
    '/storage/:path*',
  ],
};
