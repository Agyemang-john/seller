'use client';

/**
 * One chat websocket per app tab (backend: chat/consumers.py), shared by every
 * component that wants live chat events. Components subscribe with
 * useChatEvents(); the socket opens on the first subscriber, closes a little
 * after the last one leaves, reconnects with backoff, and pings so the other
 * side sees us as online.
 *
 * Events: message | read | delivered | typing, plus a local "connected" after
 * every (re)connect so lists can refetch whatever they missed while offline.
 *
 * Staying live: a ping that gets no pong within PONG_TIMEOUT_MS means the
 * connection died silently (phone slept, network switched), so it's dropped and
 * reopened at once; coming back to the tab or back online reconnects
 * immediately instead of waiting out the backoff.
 *
 * Incoming messages also play a sound here (chatSound.ts), once per tab set:
 * a soft tick if that chat is open on screen, a chime otherwise.
 */

import { useEffect, useRef } from 'react';
import { getSocketToken, type ChatConversation, type ChatMessage, type ChatSide } from './chatApi';
import { playMessageSound } from './chatSound';

export type ChatEvent =
  // unread_chats: the receiving side's nav-badge number after this event.
  | { type: 'message'; conversation: ChatConversation; message: ChatMessage; unread_chats?: number }
  | { type: 'read'; conversation_id: number; side: ChatSide; last_read_id: number; unread_chats?: number }
  | { type: 'delivered'; conversation_id: number; side: ChatSide; last_delivered_id: number }
  | { type: 'typing'; conversation_id: number }
  | { type: 'connected' };

type Listener = (event: ChatEvent) => void;

const PING_MS = 25_000;
const PONG_TIMEOUT_MS = 10_000;
const IDLE_CLOSE_MS = 5_000;

class ChatSocket {
  private ws: WebSocket | null = null;
  private listeners = new Set<Listener>();
  private retry = 0;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private pongTimer: ReturnType<typeof setTimeout> | null = null;
  private connecting = false;

  constructor(private side: ChatSide) {
    if (typeof window === 'undefined') return;
    const wake = () => this.wake();
    window.addEventListener('online', wake);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') wake(); });
  }

  /** Back on the tab / back online: reconnect now, or check the open socket is still alive. */
  private wake() {
    if (this.listeners.size === 0) return;
    if (this.ws?.readyState === WebSocket.OPEN) { this.ping(); return; }
    if (this.ws || this.connecting) return;
    if (this.retryTimer) { clearTimeout(this.retryTimer); this.retryTimer = null; }
    this.retry = 0;
    this.connect();
  }

  private ping() {
    if (this.ws?.readyState !== WebSocket.OPEN) return;
    this.send({ action: 'ping' });
    if (this.pongTimer) return;
    const ws = this.ws;
    this.pongTimer = setTimeout(() => {
      this.pongTimer = null;
      if (this.ws === ws) this.drop(ws);
    }, PONG_TIMEOUT_MS);
  }

  /** Give up on a socket that stopped answering and open a fresh one. */
  private drop(ws: WebSocket) {
    ws.onclose = null;
    ws.onmessage = null;
    ws.onerror = null;
    try { ws.close(); } catch { /* already closed */ }
    this.cleanup(ws);
    if (this.listeners.size) { this.retry = 0; this.connect(); }
  }

  /** Forget the current socket (a late close event from an older one changes nothing). */
  private cleanup(ws: WebSocket) {
    if (this.ws !== ws) return false;
    if (this.pingTimer) clearInterval(this.pingTimer);
    if (this.pongTimer) clearTimeout(this.pongTimer);
    this.pingTimer = null;
    this.pongTimer = null;
    this.ws = null;
    return true;
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    if (this.idleTimer) { clearTimeout(this.idleTimer); this.idleTimer = null; }
    if (!this.ws && !this.connecting) this.connect();
    return () => {
      this.listeners.delete(listener);
      if (this.listeners.size === 0) this.idleTimer = setTimeout(() => this.close(), IDLE_CLOSE_MS);
    };
  }

  send(payload: object) {
    if (this.ws?.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(payload));
  }

  private emit(event: ChatEvent) {
    this.listeners.forEach((l) => { try { l(event); } catch (e) { console.error(e); } });
  }

  private async connect() {
    if (typeof window === 'undefined') return;
    this.connecting = true;
    let token: string | null = null;
    try {
      token = await getSocketToken();
    } catch {
      token = null;
    }
    this.connecting = false;
    if (!token || this.listeners.size === 0) {
      if (this.listeners.size) this.scheduleRetry();
      return;
    }
    const base = (process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_HOST || '').replace(/^http/, 'ws');
    const ws = new WebSocket(`${base}/ws/chat/?token=${encodeURIComponent(token)}&as=${this.side}`);
    this.ws = ws;
    ws.onopen = () => {
      this.retry = 0;
      this.pingTimer = setInterval(() => this.ping(), PING_MS);
      this.emit({ type: 'connected' });
    };
    ws.onmessage = (e) => {
      let data: ChatEvent;
      try {
        data = JSON.parse(e.data);
      } catch {
        return; // ignore malformed frames
      }
      // Any frame proves the connection is alive.
      if (this.pongTimer) { clearTimeout(this.pongTimer); this.pongTimer = null; }
      if (data.type === 'message' && data.message.side !== this.side) {
        playMessageSound(isViewing(this.side, data.message.conversation_id) ? 'tick' : 'chime', data.message.id);
      }
      if (data.type === 'message' || data.type === 'read' || data.type === 'delivered' || data.type === 'typing') {
        this.emit(data);
      }
    };
    ws.onerror = () => ws.close();
    ws.onclose = (e) => {
      if (!this.cleanup(ws)) return;
      // 4401/4403: not signed in / not allowed — don't hammer the server.
      if (this.listeners.size && e.code !== 4403) this.scheduleRetry();
    };
  }

  private scheduleRetry() {
    if (this.retryTimer) return;
    const delay = Math.min(30_000, 1000 * 2 ** this.retry++) + Math.random() * 1000;
    this.retryTimer = setTimeout(() => { this.retryTimer = null; if (!this.ws) this.connect(); }, delay);
  }

  private close() {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    this.retryTimer = null;
    const ws = this.ws;
    if (ws) this.cleanup(ws);
    ws?.close();
  }
}

// The conversation open in a ChatThread, per side (set by ChatThread while mounted).
const activeConversation: Partial<Record<ChatSide, number | null>> = {};

export function setActiveConversation(side: ChatSide, id: number | null) {
  activeConversation[side] = id;
}

/** Is this chat open on screen right now (so a new message in it isn't "missed")? */
export function isViewing(side: ChatSide, conversationId: number) {
  return activeConversation[side] === conversationId
    && typeof document !== 'undefined' && document.visibilityState === 'visible';
}

const sockets: Partial<Record<ChatSide, ChatSocket>> = {};

function socketFor(side: ChatSide) {
  return (sockets[side] ??= new ChatSocket(side));
}

/** Receive live chat events while mounted (`enabled` false = no socket, e.g. signed out). */
export function useChatEvents(side: ChatSide, handler: Listener, enabled = true) {
  const ref = useRef(handler);
  ref.current = handler;
  useEffect(() => {
    if (!enabled) return;
    return socketFor(side).subscribe((e) => ref.current(e));
  }, [side, enabled]);
}

export function sendTyping(side: ChatSide, conversationId: number) {
  socketFor(side).send({ action: 'typing', conversation_id: conversationId });
}
