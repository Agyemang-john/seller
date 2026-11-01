// Server-side error monitoring (Sentry). Off unless SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN is set.
import * as Sentry from '@sentry/nextjs';

export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    release: process.env.GIT_SHA,
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
  });
}

// Errors thrown while rendering server components, route handlers and the proxy.
export const onRequestError = Sentry.captureRequestError;
