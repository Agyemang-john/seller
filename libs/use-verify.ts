'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth, finishInitialLoad } from '@/redux/features/authSlice';
import { useVerifyMutation, useRefreshMutation } from '@/redux/features/authApiSlice';

export default function useVerify() {
  const dispatch = useAppDispatch();

  const [verify] = useVerifyMutation();
  const [refresh] = useRefreshMutation();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const runVerification = async () => {
      try {
        await verify(undefined).unwrap();
        dispatch(setAuth());
      } catch (err) {
        try {
          await refresh(undefined).unwrap();
          await verify(undefined).unwrap();
          dispatch(setAuth());
        } catch (refreshErr) {
          throw refreshErr;
        }
      } finally {
        dispatch(finishInitialLoad());
      }
    };

    runVerification();

    intervalId = setInterval(() => {
      runVerification();
    }, 10 * 60 * 1000);

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
  }, []);
}
