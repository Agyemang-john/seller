'use client';

import { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';

/**
 * "Enter the code we sent to …" step, shared by email and phone verification.
 *
 * Props:
 *   title, destination      e.g. "Verify your email", "a***@gmail.com"
 *   onSubmit(code)          resolves on success; throw to show an error
 *   onResend()              resolves when a new code was sent
 *   cooldown                seconds before "Resend" is enabled (server enforces it too)
 *   footer                  optional extra actions (e.g. "Change number")
 */
export default function CodeStep({ title, description, destination, onSubmit, onResend, cooldown = 60, footer }) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [wait, setWait] = useState(cooldown);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const submit = async (e) => {
    e.preventDefault();
    if (!/^\d{4,8}$/.test(code)) {
      setError('Enter the code exactly as you received it.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err.message || 'That code did not work.');
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError('');
    setInfo('');
    try {
      await onResend();
      setInfo('A new code is on its way.');
      setWait(cooldown);
    } catch (err) {
      // 429 from the server carries how long is left.
      if (err.waitSeconds) setWait(err.waitSeconds);
      setError(err.message || 'Could not send a new code.');
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 0.5 }}>{title}</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
        {description || 'We sent a verification code to'} <strong>{destination}</strong>.
        It expires in 10 minutes.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {info && !error && <Alert severity="success" sx={{ mb: 2 }}>{info}</Alert>}

      <TextField
        label="Verification code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
        fullWidth
        autoFocus
        autoComplete="one-time-code"
        inputProps={{ inputMode: 'numeric', style: { letterSpacing: '0.4em', fontSize: 20, fontWeight: 600 } }}
        sx={{ mb: 2 }}
      />

      <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ py: 1.25, textTransform: 'none', fontWeight: 600 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Verify'}
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
        <Button size="small" onClick={resend} disabled={wait > 0} sx={{ textTransform: 'none' }}>
          {wait > 0 ? `Resend code in ${wait}s` : 'Resend code'}
        </Button>
        {footer}
      </Box>
    </Box>
  );
}
