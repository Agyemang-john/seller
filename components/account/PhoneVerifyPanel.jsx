'use client';

import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, TextField, Typography } from '@mui/material';
import CodeStep from './CodeStep';
import { errorMessage, phoneVerification } from './accountApi';

/**
 * One-time phone check for customers who signed up before phone verification
 * existed. Opening a store requires a verified phone (Amazon-style), and the
 * number is also used for seller-login codes and payout notifications.
 *
 * Props: maskedPhone (number on file, masked), onVerified()
 */
export default function PhoneVerifyPanel({ maskedPhone, onVerified }) {
  const [stage, setStage] = useState('intro'); // intro | code
  const [useOther, setUseOther] = useState(false);
  const [phone, setPhone] = useState('');
  const [destination, setDestination] = useState(maskedPhone);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const send = async (e) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await phoneVerification.send(useOther ? phone : undefined);
      if (res.phone_verified) {
        onVerified?.();
        return;
      }
      setDestination(res.masked_phone);
      setStage('code');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (stage === 'code') {
    return (
      <CodeStep
        title="Verify your phone"
        destination={destination}
        onSubmit={async (code) => {
          try {
            await phoneVerification.confirm(code);
            onVerified?.();
          } catch (err) {
            throw new Error(errorMessage(err));
          }
        }}
        onResend={async () => {
          try {
            await phoneVerification.send(useOther ? phone : undefined);
          } catch (err) {
            const e = new Error(errorMessage(err));
            e.waitSeconds = err?.response?.data?.wait_seconds;
            throw e;
          }
        }}
        footer={
          <Button size="small" onClick={() => setStage('intro')} sx={{ textTransform: 'none' }}>
            Use a different number
          </Button>
        }
      />
    );
  }

  return (
    <Box component="form" onSubmit={send} noValidate>
      <Typography sx={{ fontWeight: 700, fontSize: 18, mb: 0.5 }}>Verify your phone number</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary', mb: 2 }}>
        Sellers must confirm a mobile number before applying. We use it for sign-in codes and
        important store alerts. It only takes a minute.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {useOther ? (
        <TextField
          label="Mobile number" placeholder="+233241234567" value={phone}
          onChange={(e) => setPhone(e.target.value)} fullWidth size="small" autoFocus sx={{ mb: 2 }}
          helperText="Include your country code. It replaces the number on your account once verified."
        />
      ) : (
        <Typography sx={{ fontSize: 14, mb: 2 }}>
          We’ll text a code to the number on your account: <strong>{maskedPhone}</strong>
        </Typography>
      )}

      <Button type="submit" variant="contained" fullWidth disabled={busy} sx={{ py: 1.25, textTransform: 'none', fontWeight: 600 }}>
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Text me a code'}
      </Button>
      <Button size="small" onClick={() => setUseOther((u) => !u)} sx={{ textTransform: 'none', mt: 1 }}>
        {useOther ? 'Use the number on my account' : 'Use a different number'}
      </Button>
    </Box>
  );
}
