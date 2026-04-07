import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Paths that require authentication
const PROTECTED_PREFIXES = ['/startup', '/operator', '/admin'];
// Paths only accessible to unauthenticated users
const AUTH_ONLY_PREFIXES = ['/auth'];
// Paths PENDING_APPROVAL users may still access
const PENDING_APPROVAL_ALLOWED = ['/application', '/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('platform.sid');
  const isAuthenticated = Boolean(sessionCookie?.value);
  const userStatus = request.cookies.get('platform.user_status')?.value;
  const isPendingApproval = userStatus === 'PENDING_APPROVAL';

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY_PREFIXES.some((p) => pathname.startsWith(p));

  // Redirect unauthenticated users away from protected routes
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // PENDING_APPROVAL users can only see /application/* and /auth/*
  if (isAuthenticated && isPendingApproval) {
    const allowed = PENDING_APPROVAL_ALLOWED.some((p) => pathname.startsWith(p));
    if (!allowed && pathname !== '/') {
      return NextResponse.redirect(new URL('/application/status', request.url));
    }
  }

  // Redirect authenticated users away from auth pages (e.g. /auth/login → /dashboard)
  if (isAuthPage && isAuthenticated && !isPendingApproval) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|gif|webp)$).*)',
  ],
};
