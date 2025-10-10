'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth, finishInitialLoad, logout } from '@/redux/features/authSlice';
import { useVerifyMutation, useRefreshMutation } from '@/redux/features/authApiSlice';
import Cookies from 'js-cookie';

export default function useVerify() {
  const dispatch = useAppDispatch();
  const [verify] = useVerifyMutation();
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const runVerification = async () => {
      try {
        // Try verifying access token first
        await verify(undefined).unwrap();
        dispatch(setAuth());
      } catch (err) {
        // If verify fails (probably 401), try to refresh
        try {
          // 👇 We do NOT need to check Cookies.get('refresh')
          // Backend will handle it via HttpOnly cookie automatically
          await refresh(undefined).unwrap();
          await verify(undefined).unwrap();
          dispatch(setAuth());
        } catch (refreshErr) {
          dispatch(logout());
        }
      } finally {
        dispatch(finishInitialLoad());
      }
    };

    // Run immediately on mount
    runVerification();

    // Re-run every 10 minutes
    intervalId = setInterval(runVerification, 10 * 60 * 1000);

    // Also re-run when user comes back to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        runVerification();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [verify, refresh, dispatch]);
}
