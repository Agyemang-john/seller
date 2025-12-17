// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/orders',
  '/payment',
  '/products',
  '/profile',
  '/reviews',
  '/working-hours',
  '/help',
  '/about',
] as const;

// Safe JWT payload decoder (only decodes, no crypto verification)
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
  const accessToken = request.cookies.get('vendor_access')?.value;
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // If trying to access a protected route
  if (isProtectedRoute) {
    // No access token at all → force login
    if (!accessToken) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    const payload = decodeJWT(accessToken);
    const now = Math.floor(Date.now() / 1000);

    // Invalid token
    if (!payload) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // Expired token
    if (payload.exp && payload.exp < now) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('expired', 'true');
      loginUrl.searchParams.set('redirect', encodeURIComponent(pathname));
      return NextResponse.redirect(loginUrl);
    }

    // Additional vendor verification for dashboard
    if (pathname.startsWith('/dashboard')) {
      if (payload.role !== 'vendor' || payload.is_verified_vendor !== true) {
        return NextResponse.redirect(new URL('/not-verified', request.url));
      }
    }
  }

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
    '/about/:path*',
  ],
};