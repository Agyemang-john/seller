'use client';

/**
 * Shopper ↔ seller chat: API calls and types (backend: chat/views.py).
 * Copy of the storefront's components/chat (frontend repo), with this app's HTTP client;
 * keep the two in step.
 */

import { createAxiosClient } from '@/utils/clientFetch';

export type ChatSide = 'customer' | 'vendor';

export interface ChatProduct { id: number; title: string; sku: string; slug: string; image: string | null }

export interface ChatCounterpart {
  kind: 'store' | 'shopper';
  name: string;
  slug: string | null;
  avatar: string | null;
  initials: string;
  online: boolean;
  last_seen: string | null;
}

export interface ChatConversation {
  id: number;
  reason: string;
  created_at: string;
  last_message_at: string | null;
  last_message_preview: string;
  last_sender_side: ChatSide | '';
  last_message_id: number;
  unread: number;
  other_last_read_id: number;
  /** Newest message that reached the other side's open app (✓✓ grey); >= other_last_read_id. */
  other_delivered_id: number;
  counterpart: ChatCounterpart;
  product: ChatProduct | null;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  side: ChatSide;
  body: string;
  created_at: string;
  client_id: string;
  sender_name: string;
  product: ChatProduct | null;
  // Client-only, for optimistic bubbles.
  status?: 'sending' | 'failed';
}

export interface ChatPolicy { retention_days: number; max_length: number }

export interface ChatErrorBody { detail: string; code: string; categories?: string[]; muted_until?: string }

export const REASONS: { value: string; label: string }[] = [
  { value: 'question', label: 'Question or comment' },
  { value: 'product', label: 'About a product' },
  { value: 'order', label: 'About an order' },
  { value: 'other', label: 'Something else' },
];

export const DEFAULT_POLICY: ChatPolicy = { retention_days: 30, max_length: 1000 };

const client = () => createAxiosClient();
const as = (side: ChatSide) => ({ as: side });

/** The cursor token from a DRF "next" link (the link's host may be internal). */
export function cursorOf(next: string | null) {
  if (!next) return null;
  try { return new URL(next).searchParams.get('cursor'); } catch { return null; }
}

export async function listConversations(side: ChatSide, opts: { q?: string; unread?: boolean; cursor?: string | null } = {}) {
  const res = await client().get('/api/v1/chat/conversations/', {
    params: { ...as(side), q: opts.q || undefined, unread: opts.unread ? 1 : undefined, cursor: opts.cursor || undefined },
  });
  return res.data as { results: ChatConversation[]; next: string | null; policy: ChatPolicy };
}

export async function getConversation(side: ChatSide, id: number) {
  const res = await client().get(`/api/v1/chat/conversations/${id}/`, { params: as(side) });
  return res.data as ChatConversation & { policy: ChatPolicy };
}

export async function getMessages(side: ChatSide, id: number, before?: number) {
  const res = await client().get(`/api/v1/chat/conversations/${id}/messages/`, { params: { ...as(side), before } });
  return res.data as { results: ChatMessage[]; has_more: boolean };
}

export async function sendMessage(side: ChatSide, id: number, body: string, clientId: string) {
  const res = await client().post(`/api/v1/chat/conversations/${id}/messages/`, { body, client_id: clientId },
    { params: as(side) });
  return res.data as ChatMessage;
}

export async function markRead(side: ChatSide, id: number) {
  await client().post(`/api/v1/chat/conversations/${id}/read/`, {}, { params: as(side) });
}

export async function getUnread(side: ChatSide) {
  const res = await client().get('/api/v1/chat/unread/', { params: as(side) });
  return (res.data?.conversations ?? 0) as number;
}

export async function getStoreChat(slug: string) {
  const res = await client().get(`/api/v1/chat/store/${slug}/`);
  return res.data as {
    conversation: ChatConversation | null; accepting_messages: boolean; own_store: boolean;
    muted_until: string | null; policy: ChatPolicy;
  };
}

export async function startConversation(payload: {
  vendor: string; body: string; reason: string; product_id?: number | null; client_id: string;
}) {
  const res = await client().post('/api/v1/chat/conversations/', payload);
  return res.data as { conversation: ChatConversation; message: ChatMessage };
}

export async function getSocketToken() {
  const res = await client().get('/api/v1/notification/ws-token/');
  return (res.data?.token ?? null) as string | null;
}

export function errorOf(err: unknown): ChatErrorBody {
  const data = (err as { response?: { data?: Partial<ChatErrorBody> } })?.response?.data;
  if (data?.detail) return { detail: String(data.detail), code: data.code || 'error', categories: data.categories, muted_until: data.muted_until };
  return { detail: "Couldn't send. Check your connection and try again.", code: 'network' };
}

/** Local media comes back as /media/...; prefix the API host. */
export function mediaUrl(url: string | null | undefined) {
  if (!url) return undefined;
  return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_HOST ?? ''}${url}` : url;
}

export function newClientId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
