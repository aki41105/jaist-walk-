import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register', '/recover'];
const ADMIN_PATHS = ['/admin'];

/** Validate redirect path to prevent open redirect attacks */
function getSafeRedirect(redirect: string | null): string {
  if (!redirect) return '/home';
  // Only allow relative paths starting with /
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return '/home';
  return redirect;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('jw_session')?.value;

  // Allow API routes to handle their own auth
  if (pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  // Public paths - redirect to home (or redirect param) if already logged in
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (sessionToken) {
      const redirectTo = getSafeRedirect(request.nextUrl.searchParams.get('redirect'));
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
    return NextResponse.next();
  }

  // Protected paths - redirect to login if not logged in, preserving the original URL
  if (!sessionToken) {
    const loginUrl = new URL('/login', request.url);
    // Preserve the original destination so user can be redirected after login
    const destination = pathname + request.nextUrl.search;
    if (destination !== '/home' && destination !== '/') {
      loginUrl.searchParams.set('redirect', destination);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images/).*)',
  ],
};
