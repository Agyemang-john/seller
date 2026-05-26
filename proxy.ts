import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_PREFIXES = [
  '/dashboard',
  '/orders',
  '/payment',
  '/products',
  '/profile',
  '/reviews',
  '/working-hours',
  '/help',
  '/payouts',
  '/notifications',
  '/billing',
  '/settings',
  '/subscribe',
  '/store-analytics',
  '/subscription',
  '/logout',
];

function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
  } catch {
    return null;
  }
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  const accessToken = request.cookies.get('vendor_access')?.value;
  const refreshToken = request.cookies.get('vendor_refresh')?.value;

  const redirectToLogin = (extra?: Record<string, string>) => {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    if (extra) {
      for (const [k, v] of Object.entries(extra)) loginUrl.searchParams.set(k, v);
    }
    return NextResponse.redirect(loginUrl);
  };

  // No tokens at all → force login
  if (!accessToken && !refreshToken) {
    return redirectToLogin();
  }

  // If access token is present, validate it
  if (accessToken) {
    const payload = decodeJWT(accessToken);
    const now = Math.floor(Date.now() / 1000);

    if (!payload) {
      // Malformed token — fall back to refresh token if present
      if (!refreshToken) return redirectToLogin();
      return NextResponse.next();
    }

    if (payload.exp && payload.exp < now) {
      // Access token expired — if refresh token exists, let the client refresh
      if (refreshToken) return NextResponse.next();
      return redirectToLogin({ expired: 'true' });
    }

    // Valid access token — enforce vendor role on all protected routes
    if (payload.role !== 'vendor' || payload.is_verified_vendor !== true) {
      return NextResponse.redirect(new URL('/not-verified', request.url));
    }
  }

  // Refresh token exists (and access token is absent or expired) — let client handle refresh
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/orders/:path*',
    '/payment/:path*',
    '/products/:path*',
    '/profile/:path*',
    '/reviews/:path*',
    '/working-hours/:path*',
    '/help/:path*',
    '/payouts/:path*',
    '/notifications/:path*',
    '/billing/:path*',
    '/settings/:path*',
    '/subscribe/:path*',
    '/store-analytics/:path*',
    '/subscription/:path*',
    '/logout/:path*',
  ],
};