import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = ['/startup', '/operator', '/admin'];
const AUTH_ONLY_PREFIXES = ['/auth'];
const ONBOARDING_ALLOWED = ['/for-talent/apply', '/auth'];
const PENDING_APPROVAL_ALLOWED = ['/application', '/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('platform.sid');
  const isAuthenticated = Boolean(sessionCookie?.value);
  const userStage = request.cookies.get('platform.user_stage')?.value;
  const isOnboarding = userStage === 'ONBOARDING';
  const isPendingApproval = userStage === 'PENDING_APPROVAL';

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthPage = AUTH_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isOnboarding) {
    const allowed = ONBOARDING_ALLOWED.some((prefix) => pathname.startsWith(prefix));
    if (!allowed && pathname !== '/') {
      return NextResponse.redirect(new URL('/for-talent/apply', request.url));
    }
  }

  if (isAuthenticated && isPendingApproval) {
    const allowed = PENDING_APPROVAL_ALLOWED.some((prefix) => pathname.startsWith(prefix));
    if (!allowed && pathname !== '/') {
      return NextResponse.redirect(new URL('/application/status', request.url));
    }
  }

  if (isAuthPage && isAuthenticated) {
    const destination = isOnboarding
      ? '/for-talent/apply'
      : isPendingApproval
        ? '/application/status'
        : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|gif|webp)$).*)',
  ],
};
