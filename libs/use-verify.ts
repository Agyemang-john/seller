'use client';

import { useEffect } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { setAuth, finishInitialLoad } from '@/redux/features/authSlice';
import { useVerifyMutation, useRefreshMutation } from '@/redux/features/authApiSlice';

const logInDev = (...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(...args);
  }
};

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
        // If verify fails (probably 401), try a silent refresh then re-verify.
        // The refresh token lives in an HttpOnly cookie the backend reads itself.
        try {
          await refresh(undefined).unwrap();
          await verify(undefined).unwrap();
          dispatch(setAuth());
        } catch (refreshErr) {
          // Do NOT log the user out on a transient failure (network blip,
          // server hiccup, throttling, or a race right as the 1h access token
          // expires). Forcing logout here flips `isAuthenticated` to false and
          // ClientProviders immediately bounces the dashboard to /auth/login.
          // A genuinely dead session is still handled on the next protected
          // request (RTK reauth in apiSlice) and by the proxy middleware on
          // navigation. This mirrors the customer storefront's behaviour.
          logInDev('Token verify/refresh failed — keeping session:', refreshErr);
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
