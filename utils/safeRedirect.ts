import type { Route } from 'next';

// Validates the ?redirect= a seller arrives at /auth/login with, so they land
// back on the page they were on (query string included) after signing in.

// Pages it makes no sense to come back to.
const NO_RETURN_PREFIXES = ['/auth', '/logout'];

// Returns a safe in-app path, or `fallback` for anything else — foreign hosts,
// protocol-relative URLs, malformed input — to prevent open redirects.
export function safeRedirect(raw: string | null | undefined, fallback = '/dashboard'): string {
  if (!raw) return fallback;
  let value = raw;
  // Older links double-encoded the value; undo the extra layer.
  if (/^%2F/i.test(value)) {
    try {
      value = decodeURIComponent(value);
    } catch {
      return fallback;
    }
  }
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('://') || value.includes('\\')) {
    return fallback;
  }
  const blocked = NO_RETURN_PREFIXES.some(
    (p) => value === p || value.startsWith(`${p}/`) || value.startsWith(`${p}?`)
  );
  return blocked ? fallback : value;
}

// /auth/login?redirect=… pointing back at `path`.
export function loginHref(path: string | null | undefined): Route {
  const safe = safeRedirect(path, '');
  return (safe ? `/auth/login?redirect=${encodeURIComponent(safe)}` : '/auth/login') as Route;
}
