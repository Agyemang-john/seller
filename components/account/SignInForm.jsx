'use client';

import { useRef, useState } from 'react';
import {
  Alert, Box, Button, CircularProgress, IconButton, InputAdornment, Link, TextField, Typography,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Turnstile } from '@marsidev/react-turnstile';
import { errorMessage, signIn } from './accountApi';

/**
 * Sign in to an existing Negromart (customer) account from the seller site.
 * Same endpoint and cookies as the main site's login, so the session is
 * shared with www.negromart.com.
 *
 * Note: this is NOT the seller-dashboard login (that one adds an OTP and
 * vendor cookies). It only identifies who is applying or accepting an invite.
 */
export default function SignInForm({ defaultIdentifier = '', notice = '', onSignedIn, onCreateAccount }) {
  const [identifier, setIdentifier] = useState(defaultIdentifier);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const turnstileRef = useRef(null);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifier.trim() || !password) {
      setError('Enter your email or phone and your password.');
      return;
    }
    if (!captcha) {
      setError('Please complete the CAPTCHA.');
      return;
    }
    setBusy(true);
    try {
      await signIn({ identifier, password, captcha });
      onSignedIn?.();
    } catch (err) {
      setError(errorMessage(err, 'Sign-in failed. Please try again.'));
      turnstileRef.current?.reset();
      setCaptcha('');
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box component="form" onSubmit={submit} noValidate>
      {notice && !error && <Alert severity="info" sx={{ mb: 2 }}>{notice}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TextField
        label="Email or phone" value={identifier} onChange={(e) => setIdentifier(e.target.value)}
        fullWidth size="small" autoComplete="username" sx={{ mb: 1.5 }}
      />
      <TextField
        label="Password" type={showPassword ? 'text' : 'password'} value={password}
        onChange={(e) => setPassword(e.target.value)} fullWidth size="small" autoComplete="current-password"
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
      <Box sx={{ textAlign: 'right', mt: 0.5 }}>
        <Link href="https://www.negromart.com/auth/password-reset" target="_blank" rel="noopener noreferrer" sx={{ fontSize: 12 }}>
          Forgot password?
        </Link>
      </Box>

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
        {busy ? <CircularProgress size={22} color="inherit" /> : 'Sign in'}
      </Button>
      {onCreateAccount && (
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 1.5, textAlign: 'center' }}>
          New to Negromart?{' '}
          <Link component="button" type="button" onClick={onCreateAccount} sx={{ fontSize: 13 }}>
            Create an account
          </Link>
        </Typography>
      )}
    </Box>
  );
}
