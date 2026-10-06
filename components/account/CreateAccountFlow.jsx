'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, Grid, IconButton, InputAdornment, TextField, Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Turnstile } from '@marsidev/react-turnstile';
import CodeStep from './CodeStep';
import { errorCode, errorMessage, signup } from './accountApi';

/**
 * Create a Negromart account without leaving the seller site, Amazon-style:
 *
 *   details → code emailed → code texted → signed in (customer session)
 *
 * The backend keeps the account INACTIVE until both codes are confirmed, then
 * signs the user in and calls onComplete(). Progress survives a page reload
 * through an HttpOnly cookie, so we ask the server where we are on mount.
 *
 * Props:
 *   onComplete()               account verified and signed in
 *   onAccountExists(email)     email already registered → switch to sign-in
 *   defaultEmail, lockEmail    used by team invites (account must match the invite)
 */
export default function CreateAccountFlow({ onComplete, onAccountExists, defaultEmail = '', lockEmail = false }) {
  const [step, setStep] = useState('loading'); // loading | details | verify_email | verify_phone
  const [state, setState] = useState(null);     // server state: masked_email, masked_phone, …

  // Resume a sign-up started earlier in this browser.
  useEffect(() => {
    signup.state()
      .then((s) => { setState(s); setStep(s.step === 'done' ? 'details' : s.step); })
      .catch(() => setStep('details'));
  }, []);

  const asError = (err) => {
    const e = new Error(errorMessage(err));
    e.waitSeconds = err?.response?.data?.wait_seconds;
    if (errorCode(err) === 'signup_expired') setStep('details');
    return e;
  };

  if (step === 'loading') {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress size={28} /></Box>;
  }

  if (step === 'details') {
    return (
      <DetailsForm
        defaultEmail={defaultEmail}
        lockEmail={lockEmail}
        onAccountExists={onAccountExists}
        onStarted={(s) => { setState(s); setStep(s.step); }}
      />
    );
  }

  if (step === 'verify_email') {
    return (
      <CodeStep
        key="email"
        title="Verify your email"
        destination={state?.masked_email}
        cooldown={state?.resend_cooldown_seconds ?? 60}
        onSubmit={async (code) => {
          try {
            const s = await signup.verifyEmail(code);
            setState(s);
            setStep(s.step);
          } catch (err) { throw asError(err); }
        }}
        onResend={async () => {
          try { await signup.resend(); } catch (err) { throw asError(err); }
        }}
      />
    );
  }

  // verify_phone
  return (
    <PhoneCodeStep
      state={state}
      onState={setState}
      asError={asError}
      onVerified={onComplete}
    />
  );
}

function PhoneCodeStep({ state, onState, asError, onVerified }) {
  const [changing, setChanging] = useState(false);
  const [phone, setPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  if (changing) {
    return (
      <Box component="form" noValidate onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        try {
          onState(await signup.changePhone(phone));
          setChanging(false);
        } catch (err) {
          setError(errorMessage(err));
        } finally {
          setBusy(false);
        }
      }}>
        <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 1.5 }}>Use a different phone number</Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          label="Mobile number" placeholder="+233241234567" value={phone}
          onChange={(e) => setPhone(e.target.value)} fullWidth autoFocus sx={{ mb: 2 }}
          helperText="Include your country code."
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button onClick={() => setChanging(false)} sx={{ textTransform: 'none' }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={busy} sx={{ textTransform: 'none', flex: 1 }}>
            {busy ? <CircularProgress size={20} color="inherit" /> : 'Send code'}
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <CodeStep
      key={`phone-${state?.masked_phone}`}
      title="Verify your phone"
      description="Your email is confirmed. We texted a code to"
      destination={state?.masked_phone}
      cooldown={state?.resend_cooldown_seconds ?? 60}
      onSubmit={async (code) => {
        try {
          await signup.verifyPhone(code);
          onVerified?.();
        } catch (err) { throw asError(err); }
      }}
      onResend={async () => {
        try { await signup.resend(); } catch (err) { throw asError(err); }
      }}
      footer={
        <Button size="small" onClick={() => setChanging(true)} sx={{ textTransform: 'none' }}>
          Wrong number?
        </Button>
      }
    />
  );
}

function DetailsForm({ defaultEmail, lockEmail, onAccountExists, onStarted }) {
  const [form, setForm] = useState({ first_name: '', last_name: '', email: defaultEmail, phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const turnstileRef = useRef(null);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.first_name.trim()) errs.first_name = 'Required';
    if (!form.last_name.trim()) errs.last_name = 'Required';
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) errs.email = 'Enter a valid email address';
    if (!/^\+?\d{9,15}$/.test(form.phone.replace(/[\s\-().]/g, ''))) errs.phone = 'Include your country code, e.g. +233241234567';
    if (form.password.length < 8) errs.password = 'At least 8 characters, with upper/lowercase, a number and a symbol';
    return errs;
  };

  const submit = async (e) => {
    e.preventDefault();
    setMessage('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (!captcha) {
      setMessage('Please complete the CAPTCHA.');
      return;
    }

    setBusy(true);
    try {
      onStarted(await signup.start({ ...form, cf_turnstile_response: captcha }));
    } catch (err) {
      if (errorCode(err) === 'account_exists') {
        onAccountExists?.(form.email.trim());
        return;
      }
      // Field errors from the serializer (e.g. weak password, phone taken).
      const data = err?.response?.data || {};
      const fieldErrs = {};
      Object.keys(form).forEach((k) => { if (data[k]) fieldErrs[k] = [].concat(data[k])[0]; });
      setErrors(fieldErrs);
      if (!Object.keys(fieldErrs).length) setMessage(errorMessage(err));
      turnstileRef.current?.reset();
      setCaptcha('');
    } finally {
      setBusy(false);
    }
  };

  const field = (key, props) => (
    <TextField
      value={form[key]}
      onChange={set(key)}
      error={!!errors[key]}
      helperText={errors[key] || props.helperText}
      fullWidth
      size="small"
      {...props}
    />
  );

  return (
    <Box component="form" onSubmit={submit} noValidate>
      {message && <Alert severity="error" sx={{ mb: 2 }}>{message}</Alert>}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, sm: 6 }}>{field('first_name', { label: 'First name', autoComplete: 'given-name' })}</Grid>
        <Grid size={{ xs: 12, sm: 6 }}>{field('last_name', { label: 'Last name', autoComplete: 'family-name' })}</Grid>
        <Grid size={12}>
          {field('email', {
            label: 'Email', type: 'email', autoComplete: 'email', disabled: lockEmail,
            helperText: lockEmail ? 'Your invitation was sent to this address.' : 'We’ll send a code to confirm it.',
          })}
        </Grid>
        <Grid size={12}>
          {field('phone', {
            label: 'Mobile number', placeholder: '+233241234567', autoComplete: 'tel',
            helperText: 'We’ll text a code to confirm it. Include your country code.',
          })}
        </Grid>
        <Grid size={12}>
          {field('password', {
            label: 'Password',
            type: showPassword ? 'text' : 'password',
            autoComplete: 'new-password',
            helperText: '8+ characters with upper & lowercase letters, a number and a symbol.',
            InputProps: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((s) => !s)} edge="end" size="small" aria-label="Toggle password visibility">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          })}
        </Grid>
      </Grid>

      <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          onSuccess={setCaptcha}
          onExpire={() => setCaptcha('')}
          onError={() => setCaptcha('')}
        />
      </Box>

      <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ py: 1.25, textTransform: 'none', fontWeight: 600 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Create account'}
      </Button>
      <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 1.5, textAlign: 'center' }}>
        This is a regular Negromart account. You can also use it to shop on www.negromart.com.
      </Typography>
    </Box>
  );
}
