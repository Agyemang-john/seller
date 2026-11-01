// Browser error monitoring (Sentry). Off unless NEXT_PUBLIC_SENTRY_DSN is set.
// No personal data: no IPs, cookies or request bodies; URLs lose their query strings.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
    tracesSampleRate: Number(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE || 0.05),
    // Noise from browser extensions and flaky networks.
    ignoreErrors: ['ResizeObserver loop', 'Non-Error promise rejection captured', 'Load failed', 'NetworkError', 'AbortError', 'CanceledError'],
    denyUrls: [/extensions\//i, /^chrome:\/\//i, /^moz-extension:\/\//i],
    beforeSend(event) {
      if (event.request?.url) event.request.url = event.request.url.split('?')[0];
      if (event.request) {
        delete event.request.cookies;
        delete event.request.data;
      }
      if (event.user) event.user = event.user.id ? { id: event.user.id } : undefined;
      return event;
    },
  });
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
