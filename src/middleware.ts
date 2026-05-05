import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'zh', 'id', 'vi'];

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;
  const isLoggedIn = !!request.auth;

  // 1. Protect Admin routes
  if (pathname.startsWith("/admin")) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL("/auth/login", nextUrl));
    }
  }

  // 2. Locale Redirection logic (existing)
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  if (!pathnameIsMissingLocale) {
    const segments = pathname.split('/');
    const locale = segments[1];
    const remainingPath = segments.slice(2).join('/') || '';

    const url = new URL(`/${remainingPath}`, nextUrl);
    url.searchParams.set('lang', locale);
    
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|image|video).*)',
  ],
};
