'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Grid, IconButton, InputAdornment, Link, TextField, Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { errorMessage, google } from './accountApi';
import { googleClientId, renderGoogleButton } from './googleIdentity';

const RESET_URL = 'https://www.negromart.com/auth/password-reset';
const PASSWORD_HINT = '8+ characters with upper & lowercase letters, a number and a symbol.';

/**
 * "Sign up with Google" on the seller registration page (never on the
 * Seller Centre login, which is password + code).
 *
 * Every path ends with an account that has a password, so the new seller can
 * sign in to Seller Centre later:
 *   new to Negromart       → name + phone + password  (email proven by Google)
 *   shops with Google only → choose a password
 *   has a password account → that password once, to connect Google
 *   already set up         → signed straight in
 * The phone code is then asked by the register page, as for any customer.
 *
 * Props: onDone() once signed in, text ('signup_with' | 'continue_with')
 * Renders nothing when NEXT_PUBLIC_GOOGLE_CLIENT_ID isn't set.
 */
export default function GoogleSellerSignup({ onDone, text = 'signup_with' }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(null); // 'profile' | 'link' | 'password'
  const [ticket, setTicket] = useState('');
  const [email, setEmail] = useState('');
  const [form, setForm] = useState({ first_name: '', last_name: '', phone: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const close = () => {
    setStep(null);
    setTicket('');
    setForm((f) => ({ ...f, password: '' }));
    setFieldErrors({});
    setBusy(false);
  };

  // Ticket problems mean "start again with Google"; field problems stay in the dialog.
  const fail = (err) => {
    const data = err?.response?.data || {};
    const fields = {};
    ['first_name', 'last_name', 'phone', 'password'].forEach((k) => {
      if (data[k]) fields[k] = [].concat(data[k]).join(' ');
    });
    const code = Array.isArray(data.code) ? data.code[0] : data.code;
    if (Object.keys(fields).length) {
      setFieldErrors(fields);
    } else if (code === 'wrong_password' || code === 'locked') {
      setFieldErrors({ password: errorMessage(err) });
    } else {
      close();
      setError(errorMessage(err, 'Google sign-up didn’t go through. Please try again.'));
    }
    setBusy(false);
  };

  const handleCredential = async (credential) => {
    setBusy(true);
    setError('');
    try {
      const data = await google.signIn(credential);
      if (data.status === 'signed_in') { setBusy(false); onDone?.(); return; }
      setTicket(data.ticket);
      if (data.status === 'needs_profile') {
        setEmail(data.profile.email);
        setForm({ first_name: data.profile.first_name, last_name: data.profile.last_name, phone: '', password: '' });
        setStep('profile');
      } else if (data.status === 'link_required') {
        setEmail(data.email);
        setStep('link');
      } else if (data.status === 'needs_password') {
        setEmail(data.email);
        setStep('password');
      }
      setBusy(false);
    } catch (err) {
      setError(errorMessage(err, 'Google sign-up didn’t go through. Please try again.'));
      setBusy(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFieldErrors({});
    try {
      if (step === 'profile') await google.complete({ ticket, ...form });
      else if (step === 'link') await google.link(ticket, form.password);
      else await google.setPassword(ticket, form.password);
      close();
      onDone?.();
    } catch (err) {
      fail(err);
    }
  };

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setFieldErrors((fe) => ({ ...fe, [key]: undefined }));
  };

  const passwordField = (props) => (
    <TextField
      label="Password" value={form.password} onChange={set('password')} required fullWidth size="small"
      type={showPassword ? 'text' : 'password'}
      error={!!fieldErrors.password} helperText={fieldErrors.password || props.helperText}
      autoComplete={props.autoComplete} autoFocus={props.autoFocus}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small" aria-label="Toggle password visibility">
              {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );

  const titles = {
    profile: 'Finish creating your account',
    link: 'You already have a Negromart account',
    password: 'Choose a password for Seller Centre',
  };
  const actions = { profile: 'Create account', link: 'Connect Google', password: 'Save password' };

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
      <GoogleButton onCredential={handleCredential} busy={busy && !step} text={text} />

      <Dialog open={!!step} onClose={busy ? undefined : close} fullWidth maxWidth="xs">
        <Box component="form" onSubmit={submit} noValidate>
          <DialogTitle sx={{ fontWeight: 700 }}>{titles[step]}</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, pt: '4px !important' }}>
            {step === 'profile' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  Your email <strong>{email}</strong> is confirmed by Google. Add your mobile number and a password:
                  Seller Centre signs in with a password and a one-time code.
                </Typography>
                <Grid container spacing={1.5}>
                  <Grid size={6}>
                    <TextField label="First name" value={form.first_name} onChange={set('first_name')} required fullWidth size="small"
                      error={!!fieldErrors.first_name} helperText={fieldErrors.first_name} autoComplete="given-name" />
                  </Grid>
                  <Grid size={6}>
                    <TextField label="Last name" value={form.last_name} onChange={set('last_name')} required fullWidth size="small"
                      error={!!fieldErrors.last_name} helperText={fieldErrors.last_name} autoComplete="family-name" />
                  </Grid>
                </Grid>
                <TextField label="Mobile number" placeholder="+233241234567" value={form.phone} onChange={set('phone')}
                  required fullWidth size="small" autoFocus type="tel" autoComplete="tel"
                  error={!!fieldErrors.phone}
                  helperText={fieldErrors.phone || 'We’ll text a code to confirm it. Include your country code.'} />
                {passwordField({ autoComplete: 'new-password', helperText: PASSWORD_HINT })}
              </>
            )}

            {step === 'link' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  <strong>{email}</strong> already has a Negromart account. Enter its password once to connect
                  Google to it. You won’t need to do this again.
                </Typography>
                {passwordField({ autoComplete: 'current-password', autoFocus: true })}
                <Link href={RESET_URL} target="_blank" rel="noopener noreferrer" sx={{ fontSize: 13 }}>
                  Forgot your password?
                </Link>
              </>
            )}

            {step === 'password' && (
              <>
                <Typography variant="body2" color="text.secondary">
                  You shop on Negromart with Google (<strong>{email}</strong>). Seller Centre signs in with a password
                  and a one-time code, so choose a password. You can keep using Google to shop.
                </Typography>
                {passwordField({ autoComplete: 'new-password', autoFocus: true, helperText: PASSWORD_HINT })}
              </>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2.5 }}>
            <Button onClick={close} disabled={busy} sx={{ textTransform: 'none' }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={busy} disableElevation sx={{ textTransform: 'none', minWidth: 140 }}>
              {busy ? <CircularProgress size={20} color="inherit" /> : actions[step]}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}

/** Google's own button; nothing at all if Google isn't configured or its script is blocked. */
function GoogleButton({ onCredential, busy, text }) {
  const ref = useRef(null);
  const handler = useRef(onCredential);
  useLayoutEffect(() => { handler.current = onCredential; });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!googleClientId() || !ref.current) return undefined;
    let cleanup;
    let cancelled = false;
    renderGoogleButton(ref.current, (credential) => handler.current?.(credential), { text })
      .then((fn) => { if (cancelled) fn(); else cleanup = fn; })
      .catch(() => { if (!cancelled) setFailed(true); });
    return () => { cancelled = true; cleanup?.(); };
  }, [text]);

  if (!googleClientId() || failed) return null;
  return (
    <Box sx={{ position: 'relative', minHeight: 44, display: 'flex', justifyContent: 'center' }}>
      <Box ref={ref} sx={{ width: '100%', display: 'flex', justifyContent: 'center', opacity: busy ? 0.4 : 1, pointerEvents: busy ? 'none' : 'auto' }} />
      {busy && (
        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={22} />
        </Box>
      )}
    </Box>
  );
}

/** True when the Google button can show (used to decide whether to draw the "or" divider). */
export const googleEnabled = () => !!googleClientId();
