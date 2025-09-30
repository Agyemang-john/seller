import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = ['/dashboard'];

// Helper to decode JWT safely
function decodeJWT(token: string) {
  try {
    const payload = token.split('.')[1]; // header.payload.signature
    const decoded = JSON.parse(Buffer.from(payload, 'base64').toString());
    return decoded;
  } catch (err) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get('access')?.value;

  const isProtected = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtected) {
    if (!token) {
      // 🔐 No token → redirect to login
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // ✅ Decode token
    const decoded = decodeJWT(token);

    if (!decoded) {
      const redirectUrl = new URL('/auth/login', request.url);
      return NextResponse.redirect(redirectUrl);
    }

    const now = Math.floor(Date.now() / 1000);

    // ⏳ Check expiry
    if (decoded.exp && decoded.exp < now) {
      const redirectUrl = new URL('/auth/login', request.url);
      redirectUrl.searchParams.set('expired', 'true');
      return NextResponse.redirect(redirectUrl);
    }

    // 👔 Check role (only allow vendors for dashboard/checkout)
    if (request.nextUrl.pathname.startsWith('/dashboard') && decoded.role !== 'vendor') {
      return NextResponse.redirect(new URL('/', request.url)); // or /403
    }
  }

  return NextResponse.next();
}

// 🧭 Apply middleware
export const config = {
  matcher: ['/dashboard/:path*']
};
