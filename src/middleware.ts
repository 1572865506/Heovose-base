import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const { auth } = NextAuth(authConfig);

const locales = ['en', 'zh', 'id', 'vi', 'vn'];

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

const LOGIN_COOKIE_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 天

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function getCookieSigningSecret(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    process.env.ADMIN_LOGIN_SECRET ||
    'heovose_dev_cookie_key'
  );
}

async function signAccessToken(issuedAtMs: number): Promise<string> {
  const payload = String(issuedAtMs);
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(getCookieSigningSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(sigBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${payload}.${sigHex}`;
}

async function verifyAccessToken(token?: string | null): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payload, sigHex] = token.split('.');
  if (!payload || !sigHex) return false;
  const issuedAt = Number(payload);
  if (!Number.isFinite(issuedAt) || Date.now() - issuedAt > LOGIN_COOKIE_TTL_MS || issuedAt > Date.now() + 60000) {
    return false;
  }
  const expected = await signAccessToken(issuedAt);
  return timingSafeEqualStr(token, expected);
}

function applyAdminSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'same-origin');
  return res;
}

export default auth(async (request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:9002';
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const baseOrigin = `${proto}://${host}`;
  const isHttps = proto === 'https' && process.env.NODE_ENV === 'production';

  // 1. 隐藏后台登录入口安全防护（HMAC 签名 Cookie + 生产环境禁止硬编码默认口令）
  if (pathname === '/auth/login') {
    const secretParam = nextUrl.searchParams.get('secret') || '';
    const secretCookie = request.cookies.get('login_access_allowed')?.value;
    const adminSecret =
      process.env.ADMIN_LOGIN_SECRET ||
      (process.env.NODE_ENV !== 'production' ? 'heovose_dev_only' : '');

    const hasValidParam = Boolean(adminSecret && secretParam && timingSafeEqualStr(secretParam, adminSecret));
    const hasValidCookie = await verifyAccessToken(secretCookie);

    // 如果没有合法的 URL 口令，且浏览器内无有效签名授权 Cookie，直接返回 404 伪装无此页面
    if (!hasValidParam && !hasValidCookie) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // 若通过口令进入，为浏览器植入带 HMAC 签名的长期 Cookie 标识，并重定向去除 URL 敏感参数
    if (hasValidParam) {
      const signedToken = await signAccessToken(Date.now());
      const redirectUrl = `${baseOrigin}/auth/login`;
      const response = NextResponse.redirect(redirectUrl);
      response.cookies.set('login_access_allowed', signedToken, {
        httpOnly: true,
        secure: isHttps,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 天有效期
      });
      return applyAdminSecurityHeaders(response);
    }
  }

  // 动态重写 /storage 请求至 MinIO 存储服务（避免构建时硬编码 Endpoint 的问题且性能更好）
  if (pathname.startsWith('/storage/')) {
    const cleanPath = pathname.substring('/storage'.length);
    const endpoint = process.env.STORAGE_ENDPOINT || 'localhost';
    const port = process.env.STORAGE_PORT || '9000';
    const protocol = process.env.STORAGE_USE_SSL === 'true' ? 'https' : 'http';
    
    const targetUrl = new URL(request.url);
    targetUrl.protocol = protocol;
    targetUrl.host = `${endpoint}:${port}`;
    targetUrl.pathname = cleanPath;
    
    const response = NextResponse.rewrite(targetUrl);
    // 强制附加 CORS 头部，完美解决本地测试及任何存储端的跨域限制，确保 HLS (m3u8/ts) 播放顺畅
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
    response.headers.set('Access-Control-Allow-Headers', '*');
    return response;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const secFetchSite = request.headers.get('sec-fetch-site');
  const appUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:9002';

  // CSRF 防护 (L-7)：拦截跨站的非安全写操作请求（POST, PUT, DELETE, PATCH）
  const method = request.method;
  const isWriteMethod = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(method);
  
  if (isWriteMethod && pathname !== '/api/analytics/track') {
    // 维护模式拦截 (问题 4)：在还原/升级期间阻止所有非管理性质的写操作，防范数据冲突与不一致
    if (!pathname.startsWith('/api/admin/system')) {
      try {
        const localApiUrl = `http://127.0.0.1:${process.env.PORT || '9002'}`;
        const checkRes = await fetch(`${localApiUrl}/api/admin/system/maintenance-check`, {
          headers: { 'Cache-Control': 'no-cache' },
          signal: AbortSignal.timeout(800),
        });
        if (checkRes.ok) {
          const checkData = await checkRes.json();
          if (checkData.maintenance === true) {
            return NextResponse.json(
              { error: "System is under maintenance. Write operations are temporarily disabled." },
              { status: 503 }
            );
          }
        }
      } catch (e) {
        // 核心容错修正：如果因为容器网络回环或 DNS 解析失败导致探测接口报错，仅打印日志，不强制拦截登录
        console.error("[Middleware] Maintenance check failed, bypassing block to ensure availability:", e);
      }
    }
    
    // 1. 拦截明确标识的跨站写操作
    if (secFetchSite === 'cross-site') {
      return NextResponse.json({ error: 'CSRF Protection: Cross-site write requests are blocked.' }, { status: 403 });
    }
    
    const isDev = process.env.NODE_ENV !== 'production';
    const isPrivateOrigin = (o: string) =>
      o.startsWith('http://localhost:') ||
      o.startsWith('http://127.0.0.1:') ||
      o.startsWith('http://192.168.') ||
      o.startsWith('http://10.') ||
      o.startsWith('http://172.');

    // 2. 校验 Origin 同源域（生产环境严格禁用 localhost/内网段放行）
    const reqHost = request.headers.get('host');
    if (origin) {
      const isAllowedOrigin = origin === appUrl ||
                              origin === nextUrl.origin ||
                              (reqHost && (origin === `http://${reqHost}` || origin === `https://${reqHost}`)) ||
                              origin.endsWith('.heovose.com') ||
                              origin.endsWith('.web.app') ||
                              (isDev && isPrivateOrigin(origin));
      if (!isAllowedOrigin) {
        console.warn(`[CSRF Blocked] Origin: ${origin} not matched against AppUrl: ${appUrl}, NextUrlOrigin: ${nextUrl.origin}, Host: ${reqHost}`);
        return NextResponse.json({ error: 'CSRF Protection: Origin mismatch.' }, { status: 403 });
      }
    } else if (referer) {
      // 3. 校验 Referer 同源域
      try {
        const refererUrl = new URL(referer);
        const appUrlObj = new URL(appUrl);
        const isAllowedReferer = refererUrl.origin === appUrlObj.origin ||
                                 refererUrl.origin === nextUrl.origin ||
                                 (reqHost && (refererUrl.origin === `http://${reqHost}` || refererUrl.origin === `https://${reqHost}`)) ||
                                 refererUrl.hostname.endsWith('.heovose.com') ||
                                 refererUrl.hostname.endsWith('.web.app') ||
                                 (isDev && isPrivateOrigin(refererUrl.origin));
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
    const appUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:9002';
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
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return NextResponse.json(
        { error: "Method Not Allowed" },
        { status: 405 }
      );
    }
  }

  // Rate limiting for specific high-risk API endpoints (including products API to prevent search DoS)
  if (pathname === '/api/products' || pathname === '/api/analytics/track' || pathname.startsWith('/api/auth') || pathname.endsWith('/auth/login') || pathname === '/api/inquiries' || pathname === '/api/upload') {
    const isGetProducts = pathname === '/api/products' && request.method === 'GET';
    const isStateChangingPost = request.method === 'POST' && (pathname.startsWith('/api/auth') || pathname.endsWith('/auth/login') || pathname === '/api/inquiries' || pathname === '/api/upload' || pathname === '/api/analytics/track');
    
    if (isGetProducts || isStateChangingPost) {
      // 优先采用反代设置的真实 IP（x-real-ip / platform ip），防止伪造 x-forwarded-for 绕过限流
      const ip =
        request.headers.get("x-real-ip")?.trim() ||
        (request as any).ip ||
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "127.0.0.1";
      
      let limit = 10;
      let duration = 60000; // 1 minute
      
      if (pathname === '/api/inquiries') {
        limit = 5; // max 5 inquiry submissions per minute
      } else if (pathname === '/api/upload') {
        limit = 10; // max 10 file uploads per minute
      } else if (pathname.startsWith('/api/auth') || pathname.endsWith('/auth/login')) {
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
  const userRole = (request.auth?.user as any)?.role;
  const hasAdminRole = userRole === 'superadmin' || userRole === 'editor';

  // 2. Admin protection 与入口防探针拦截（验证登录态 + 管理员角色 + HMAC 签名门禁 Cookie）
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn || !hasAdminRole) {
      const secretCookie = request.cookies.get('login_access_allowed')?.value;
      const hasValidCookie = await verifyAccessToken(secretCookie);
      if (hasValidCookie) {
        return applyAdminSecurityHeaders(NextResponse.redirect(`${baseOrigin}/auth/login`));
      } else {
        // 无有效授权 Cookie 时访问后台，直接静默跳转到前台首页，彻底隐匿后台地址
        return NextResponse.redirect(`${baseOrigin}/`);
      }
    }
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith('/auth')) {
    return applyAdminSecurityHeaders(NextResponse.next());
  }

  // 2. Language resolution and subpath routing
  const segments = pathname.split('/');
  const firstSegment = segments[1] || '';
  const isLocaleFormat = (val: string) => /^[a-z]{2,3}(?:-[a-zA-Z]{2,4})?$/.test(val);
  const pathnameHasLocale = isLocaleFormat(firstSegment);

  const isExcluded = pathname === '/' ||
                     pathname.startsWith('/admin') || 
                     pathname.startsWith('/api') || 
                     pathname.startsWith('/auth') || 
                     pathname.startsWith('/storage') ||
                     pathname.includes('.');

  if (!pathnameHasLocale && !isExcluded) {
    const queryLang = nextUrl.searchParams.get('lang');
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    const acceptLang = request.headers.get('accept-language')?.split(',')[0].split('-')[0].toLowerCase();
    
    let resolved = 'en';
    if (queryLang && isLocaleFormat(queryLang)) {
      resolved = queryLang;
    } else if (cookieLocale && isLocaleFormat(cookieLocale)) {
      resolved = cookieLocale;
    } else if (acceptLang && isLocaleFormat(acceptLang)) {
      resolved = acceptLang;
    }

    // Redirect to the subpath (e.g. /zh/products or /en)
    const url = new URL(`${baseOrigin}/${resolved}${pathname === '/' ? '' : pathname}`);
    nextUrl.searchParams.forEach((val, key) => {
      if (key !== 'lang') {
        url.searchParams.set(key, val);
      }
    });
    return NextResponse.redirect(url, 307);
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
