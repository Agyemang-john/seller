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
];

// Helper to decode JWT safely
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const access = request.cookies.get('access')?.value;
  const refresh = request.cookies.get('refresh')?.value;

  const isProtected = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected) {
    if (!access && !refresh) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', encodeURIComponent(request.nextUrl.pathname));
      return NextResponse.redirect(redirectUrl);
    }

    if (access) {
      const decoded = decodeJWT(access);
      const now = Math.floor(Date.now() / 1000);

      if (!decoded) {
        const redirectUrl = new URL('/auth/login', request.url);
        return NextResponse.redirect(redirectUrl);
      }

      if (decoded.exp && decoded.exp < now) {
        if (!refresh) {
          const redirectUrl = new URL('/auth/login', request.url);
          redirectUrl.searchParams.set('expired', 'true');
          return NextResponse.redirect(redirectUrl);
        }
      }

      if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (decoded.role !== 'vendor' || !decoded.is_verified_vendor) {
          const redirectUrl = new URL('/not-verified', request.url);
          return NextResponse.redirect(redirectUrl);
        }
      }
    }

    if (!access && refresh) {
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/orders', '/payment', '/products', '/profile', '/reviews', '/working-hours', '/help', '/about'],
};
