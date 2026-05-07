import { auth } from "@/auth";
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const locales = ['en', 'zh', 'id', 'vi'];

export default auth((request) => {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  // Skip for API and static files
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
  ],
};
