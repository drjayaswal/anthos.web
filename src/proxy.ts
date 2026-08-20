import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/analyze', '/profile', '/settings', '/admin'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  const hasSessionToken =
    request.cookies.has('better-auth.session_token') ||
    request.cookies.has('__Secure-better-auth.session_token');

  if (isProtectedRoute && !hasSessionToken) {
    const connectUrl = new URL('/connect', request.url);
    connectUrl.searchParams.set('redirect', `${pathname}${search}`);
    return NextResponse.redirect(connectUrl);
  }

  if (pathname === '/connect' && hasSessionToken) {
    const redirectTarget = request.nextUrl.searchParams.get('redirect') || '/analyze';
    return NextResponse.redirect(new URL(redirectTarget, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/analyze/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/admin/:path*',
    '/connect',
  ],
};
