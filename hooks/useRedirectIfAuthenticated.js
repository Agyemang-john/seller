// hooks/useRedirectIfAuthenticated.js
'use client';

import { useEffect } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { useRouter } from 'next/navigation';

export default function useRedirectIfAuthenticated() {
  const isAuthenticated = useAppSelector(state => state.auth.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);
}
