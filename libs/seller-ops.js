'use client';

/**
 * Small shared helpers for the seller operations pages
 * (action centre, orders, returns, payouts, reviews).
 */

import { createAxiosClient } from '@/utils/clientFetch';

const moneyFormatters = {};

/** "GHS 1,234.50" — amounts arrive from the API as strings or numbers. */
export function formatMoney(amount, currency = 'GHS') {
  const value = Number(amount ?? 0);
  moneyFormatters[currency] ??= new Intl.NumberFormat('en-GH', {
    style: 'currency', currency, currencyDisplay: 'code', minimumFractionDigits: 2,
  });
  // Intl puts a non-breaking space after the code; keep it readable in tables.
  return moneyFormatters[currency].format(value).replace(/ /g, ' ');
}

export function formatDate(iso, withTime = false) {
  if (!iso) return '—';
  const options = withTime
    ? { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
    : { day: 'numeric', month: 'short', year: 'numeric' };
  return new Date(iso).toLocaleDateString('en-GB', options);
}

/**
 * Download a CSV from an authenticated vendor endpoint. A plain <a href>
 * can't send the X-User-Type header, so fetch it as a blob and save it.
 * Throws an Error whose `.upgrade` is true when the plan doesn't include exports.
 */
export async function downloadCsv(path, params = {}, fallbackName = 'export.csv') {
  try {
    const res = await createAxiosClient().get(path, { params, responseType: 'blob' });
    const disposition = res.headers['content-disposition'] || '';
    const name = /filename="?([^"]+)"?/.exec(disposition)?.[1] || fallbackName;
    const url = URL.createObjectURL(res.data);
    const link = Object.assign(document.createElement('a'), { href: url, download: name });
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    let body = {};
    try { body = JSON.parse(await err?.response?.data?.text?.()); } catch { /* not JSON */ }
    const error = new Error(body?.detail || 'The download failed. Please try again.');
    error.upgrade = body?.error === 'plan_upgrade_required';
    throw error;
  }
}

/** Pull a readable message out of a DRF error response. */
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return typeof data.detail === 'string' ? data.detail : data.detail.detail || fallback;
  const first = Object.values(data).flat().find((v) => typeof v === 'string');
  return first || fallback;
}
