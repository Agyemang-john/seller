// hooks/useRedirectIfAuthenticated.js
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter, useSearchParams } from 'next/navigation';

export default function useRedirectIfAuthenticated() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      const rawRedirect = searchParams.get('redirect');
      if (rawRedirect) {
        try {
          const decoded = decodeURIComponent(rawRedirect);
          if (decoded.startsWith('/') && !decoded.startsWith('//') && !decoded.includes('://')) {
            router.replace(decoded);
            return;
          }
        } catch { /* ignore */ }
      }
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router, searchParams]);
}
