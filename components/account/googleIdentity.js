'use client';

// Google Identity Services ("Sign in with Google" button), loaded on demand.
// The button hands us an ID token (a signed JWT); the backend verifies it
// (userauths/google_auth.py), so nothing here is trusted on its own.
//
// GIS has one global callback, so the most recently mounted button owns it.
// Only one Google button is on screen at a time.

const SCRIPT_SRC = 'https://accounts.google.com/gsi/client';

let loading = null;
let initialisedFor = null;
let activeHandler = null;

export const googleClientId = () => process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export function loadGoogleIdentity() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.google?.accounts?.id) return Promise.resolve(window.google);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => (window.google?.accounts?.id ? resolve(window.google) : reject(new Error('gis missing')));
      script.onerror = () => {
        loading = null; // allow a retry (e.g. blocked by an extension, offline)
        reject(new Error('gis failed to load'));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}

/** Render Google's button into `el`; `onCredential(idToken)` fires after the shopper picks an account. */
export async function renderGoogleButton(el, onCredential, { text = 'continue_with', locale = 'en' } = {}) {
  const google = await loadGoogleIdentity();
  const clientId = googleClientId();
  activeHandler = onCredential;
  if (initialisedFor !== clientId) {
    google.accounts.id.initialize({
      client_id: clientId,
      callback: (response) => {
        if (response?.credential && activeHandler) activeHandler(response.credential);
      },
      ux_mode: 'popup',
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });
    initialisedFor = clientId;
  }
  el.innerHTML = '';
  google.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    shape: 'rectangular',
    text,
    logo_alignment: 'center',
    width: Math.min(400, Math.max(220, Math.floor(el.offsetWidth || 320))),
    locale,
  });
  return () => {
    if (activeHandler === onCredential) activeHandler = null;
  };
}
