'use client';

import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { apiClient } from '@/libs/api/client';

const HEARTBEAT_INTERVAL_MS = 10 * 60 * 1000; // 10 minutes

/**
 * Invisible component — mounts once in the dashboard layout.
 * Sends a heartbeat to the backend every 10 minutes while the browser tab
 * is visible and the vendor is authenticated.
 *
 * This keeps `last_seen_at` fresh even when the vendor isn't actively clicking
 * around the dashboard, preventing premature inactivity auto-closure.
 */
export default function ActivityHeartbeat() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const timerRef = useRef(null);

  const sendHeartbeat = async () => {
    if (document.visibilityState !== 'visible') return;
    try {
      await apiClient.post('/api/v1/vendor/activity/heartbeat/');
    } catch {
      // Silently ignore — heartbeat is best-effort
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Send immediately on mount, then on interval
    sendHeartbeat();
    timerRef.current = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isAuthenticated]);

  return null;
}
