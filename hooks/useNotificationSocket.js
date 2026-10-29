'use client';

/**
 * The notifications websocket (backend: notification/consumers.py, ws/notifications/).
 *
 * Shared by the header bell and the notifications page so both stay live the
 * same way: the socket reconnects with backoff, comes back at once when the tab
 * is shown again or the network returns, and a ping that gets no answer drops a
 * connection that died silently (phone asleep, network switched).
 *
 * Returns send(payload) for actions (mark_read, mark_all_read, delete).
 */

import { useCallback, useEffect, useRef } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';

const PING_MS = 25_000;
const PONG_TIMEOUT_MS = 10_000;

export default function useNotificationSocket(onMessage, enabled = true) {
  const handler = useRef(onMessage);
  handler.current = onMessage;
  const wsRef = useRef(null);

  useEffect(() => {
    if (!enabled) return undefined;
    let alive = true;
    let retry = 0;
    let retryTimer = null;
    let pingTimer = null;
    let pongTimer = null;
    let connecting = false;

    const stopTimers = () => {
      clearInterval(pingTimer);
      clearTimeout(pongTimer);
      pingTimer = null;
      pongTimer = null;
    };

    const scheduleRetry = () => {
      if (!alive || retryTimer) return;
      const delay = Math.min(30_000, 1000 * 2 ** retry++) + Math.random() * 1000;
      retryTimer = setTimeout(() => { retryTimer = null; connect(); }, delay);
    };

    const drop = (ws) => {
      ws.onclose = null;
      ws.onmessage = null;
      ws.onerror = null;
      try { ws.close(); } catch { /* already closed */ }
      if (wsRef.current === ws) wsRef.current = null;
      stopTimers();
    };

    const ping = () => {
      const ws = wsRef.current;
      if (ws?.readyState !== WebSocket.OPEN) return;
      ws.send(JSON.stringify({ action: 'ping' }));
      if (pongTimer) return;
      pongTimer = setTimeout(() => {
        pongTimer = null;
        if (wsRef.current === ws) { drop(ws); retry = 0; connect(); }
      }, PONG_TIMEOUT_MS);
    };

    async function connect() {
      if (!alive || wsRef.current || connecting) return;
      connecting = true;
      let token = null;
      try {
        const res = await createAxiosClient().get('/api/v1/notification/ws-token/');
        token = res.data?.token ?? null;
      } catch {
        token = null;
      }
      connecting = false;
      if (!alive) return;
      if (!token) { scheduleRetry(); return; }

      const base = (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_HOST || '').replace(/^http/, 'ws');
      const ws = new WebSocket(`${base}/ws/notifications/?token=${encodeURIComponent(token)}`);
      wsRef.current = ws;
      ws.onopen = () => {
        retry = 0;
        pingTimer = setInterval(ping, PING_MS);
      };
      ws.onmessage = (e) => {
        clearTimeout(pongTimer); // any frame proves the connection is alive
        pongTimer = null;
        let msg;
        try { msg = JSON.parse(e.data); } catch { return; }
        if (msg.type !== 'pong') handler.current(msg);
      };
      ws.onerror = () => ws.close();
      ws.onclose = () => {
        if (wsRef.current !== ws) return;
        wsRef.current = null;
        stopTimers();
        scheduleRetry();
      };
    }

    const wake = () => {
      if (document.visibilityState !== 'visible') return;
      if (wsRef.current?.readyState === WebSocket.OPEN) { ping(); return; }
      if (wsRef.current || connecting) return;
      clearTimeout(retryTimer);
      retryTimer = null;
      retry = 0;
      connect();
    };

    connect();
    document.addEventListener('visibilitychange', wake);
    window.addEventListener('online', wake);
    return () => {
      alive = false;
      clearTimeout(retryTimer);
      document.removeEventListener('visibilitychange', wake);
      window.removeEventListener('online', wake);
      if (wsRef.current) drop(wsRef.current);
    };
  }, [enabled]);

  return useCallback((payload) => {
    const ws = wsRef.current;
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
      return true;
    }
    return false;
  }, []);
}
