'use client';

// Last-resort error page (the root layout itself failed). Reports to Sentry when enabled.
import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 32, textAlign: 'center' }}>
        <h1 style={{ fontSize: 22 }}>Something went wrong</h1>
        <p style={{ color: '#555' }}>We&apos;ve been notified. Please try again.</p>
        {error.digest && <p style={{ color: '#999', fontSize: 12 }}>Reference: {error.digest}</p>}
        <button type="button" onClick={() => reset()} style={{ marginTop: 12, padding: '10px 18px', borderRadius: 8, border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }}>
          Try again
        </button>
      </body>
    </html>
  );
}
