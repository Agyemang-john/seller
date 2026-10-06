'use client';

/**
 * API calls for the Negromart CUSTOMER account behind a seller.
 *
 * One account is used for shopping and selling (like Amazon). On the seller
 * site we create or sign in to that account inline instead of bouncing the user
 * to www.negromart.com. Everything here talks to the customer auth system
 * (cookies `access` / `refresh` on .negromart.com), never the vendor cookies,
 * because an applicant or invitee has no dashboard access yet.
 *
 * Backend: userauths/seller_signup_views.py
 */

import axios from 'axios';
import { createRegisterClient } from '@/utils/registerClient';

const HOST = process.env.NEXT_PUBLIC_HOST;

// Anonymous calls. The signup progress cookie is HttpOnly, so credentials
// must be included for the backend to know which pending account this is.
const anon = axios.create({
  baseURL: HOST,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json', 'X-User-Type': 'customer' },
});

/** Turn any DRF error shape into one readable sentence. */
export function errorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const data = error?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) return data.non_field_errors[0];
  const first = Object.values(data).flat().find((v) => typeof v === 'string');
  return first || fallback;
}

export const errorCode = (error) => error?.response?.data?.code;

// ── Inline signup (new users) ────────────────────────────────────────────────

export const signup = {
  start: (payload) => anon.post('/api/seller-signup/start/', payload).then((r) => r.data),
  state: () => anon.get('/api/seller-signup/state/').then((r) => r.data),
  verifyEmail: (code) => anon.post('/api/seller-signup/verify-email/', { code }).then((r) => r.data),
  verifyPhone: (code) => anon.post('/api/seller-signup/verify-phone/', { code }).then((r) => r.data),
  resend: () => anon.post('/api/seller-signup/resend/').then((r) => r.data),
  changePhone: (phone) => anon.post('/api/seller-signup/change-phone/', { phone }).then((r) => r.data),
};

// ── Existing customers ───────────────────────────────────────────────────────

/** Normal customer login: sets the same cookies as signing in on www.negromart.com. */
export const signIn = ({ identifier, password, captcha }) =>
  anon.post('/api/jwt/create/', {
    email: identifier.trim().toLowerCase(),
    password,
    cf_turnstile_response: captcha,
  });

/** Who is signed in (customer session), plus verification flags. */
export const fetchCustomer = async () => {
  try {
    const { data } = await createRegisterClient().get('/api/v1/vendor/check');
    return data;
  } catch {
    return null;
  }
};

export const phoneVerification = {
  send: (phone) =>
    createRegisterClient().post('/api/phone/verification/send/', phone ? { phone } : {}).then((r) => r.data),
  confirm: (code) =>
    createRegisterClient().post('/api/phone/verification/confirm/', { code }).then((r) => r.data),
};
