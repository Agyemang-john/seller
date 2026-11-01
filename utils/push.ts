'use client';

// Browser push for the seller dashboard (backend: push/). Asking for permission must come
// from a tap, so enablePush() is called by a button, never on page load.

import { createAxiosClient } from '@/utils/clientFetch';

export type PushState = 'unsupported' | 'disabled' | 'denied' | 'off' | 'on';

const APP = 'seller';

function urlBase64ToUint8Array(base64: string) {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export function pushSupported() {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

async function registration() {
  return (await navigator.serviceWorker.getRegistration('/')) || navigator.serviceWorker.register('/sw.js', { scope: '/' });
}

export async function pushState(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported';
  const { data } = await createAxiosClient().get('/api/v1/push/config/');
  if (!data.webpush) return 'disabled';
  if (Notification.permission === 'denied') return 'denied';
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return sub ? 'on' : 'off';
}

export async function enablePush(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported';
  const { data } = await createAxiosClient().get('/api/v1/push/config/');
  if (!data.webpush) return 'disabled';
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'off';
  const reg = await registration();
  await navigator.serviceWorker.ready;
  const sub = (await reg.pushManager.getSubscription()) || (await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(data.vapid_public_key),
  }));
  await createAxiosClient().post('/api/v1/push/subscriptions/', { app: APP, ...sub.toJSON() });
  return 'on';
}

export async function disablePush(): Promise<PushState> {
  if (!pushSupported()) return 'unsupported';
  const reg = await navigator.serviceWorker.getRegistration('/');
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  if (sub) {
    await createAxiosClient().delete('/api/v1/push/subscriptions/', { data: { endpoint: sub.endpoint } }).catch(() => {});
    await sub.unsubscribe();
  }
  return 'off';
}
