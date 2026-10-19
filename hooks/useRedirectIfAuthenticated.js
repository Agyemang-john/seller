// hooks/useRedirectIfAuthenticated.js
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter, useSearchParams } from 'next/navigation';
import { safeRedirect } from '@/utils/safeRedirect';

export default function useRedirectIfAuthenticated() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(safeRedirect(searchParams.get('redirect')));
    }
  }, [isAuthenticated, router, searchParams]);
}
