import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

const locales = ['en', 'zh', 'id', 'vi'];

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. 检查路径是否以支持的语种开头 (例如 /zh 或 /zh/products)
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (!pathnameIsMissingLocale) {
    // 提取语种和剩余路径
    const segments = pathname.split('/');
    const locale = segments[1];
    const remainingPath = segments.slice(2).join('/') || '';

    // 将 /zh/products 重写为 /products?lang=zh (改为重定向以确保可靠性)
    const url = new URL(`/${remainingPath}`, request.url);
    url.searchParams.set('lang', locale);
    
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // 匹配所有路径，除了 api, _next/static, _next/image, favicon.ico, image, admin
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|image|admin|admin-panel).*)',
  ],
};
