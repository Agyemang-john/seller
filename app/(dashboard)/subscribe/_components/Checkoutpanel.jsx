'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Stack, Divider, TextField, MenuItem,
  Select, FormControl, InputLabel, CircularProgress, Alert,
  Chip, Button, Checkbox, FormControlLabel,
} from '@mui/material';
import PhoneAndroidIcon   from '@mui/icons-material/PhoneAndroid';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon   from '@mui/icons-material/ErrorOutline';
import LockOutlinedIcon   from '@mui/icons-material/LockOutlined';
import CreditCardIcon     from '@mui/icons-material/CreditCard';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import BillingDetailsForm from '../_components/Billingdetailsform';
import Script from 'next/script';
import { createAxiosClient } from '@/utils/clientFetch';
import { usePlanQuote } from '@/hooks/useSubscription';
import { initiateSubscription, chargeSavedCard } from '@/libs/api/subscriptions';
import { ApiRequestError } from '@/libs/api/client';
import { formatGHS, formatLongDate } from '@/libs/utils/planBuilder';
import { momoProviders as PROVIDERS } from '@/theme/designTokens';

// ── Helpers ───────────────────────────────────────────────────────────────────

const CARD_BG = {
  visa:       '#1a1a2e',
  mastercard: '#302b63',
  verve:      '#134e5e',
};

const _maskPhone = (p) => {
  const s = (p || '').replace(/\s/g, '');
  return s.length >= 4 ? '•'.repeat(Math.max(s.length - 4, 0)) + s.slice(-4) : s;
};

const TABS = [
  { key: 'momo', label: 'Mobile Money', icon: PhoneAndroidIcon },
  { key: 'card', label: 'Card',         icon: CreditCardIcon   },
];

const FIGTREE = 'var(--font-figtree), system-ui, sans-serif';

const errorMessage = (err, fallback) => {
  if (err instanceof ApiRequestError) return err.message;
  return err?.response?.data?.error || err?.response?.data?.detail || fallback;
};

function SectionLabel({ children, sx }) {
  return (
    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 1.75, ...sx }}>
      {children}
    </Typography>
  );
}

// ── Countdown timer — shown when a USSD session is locked ────────────────────
function MomoCountdownRetry({ onRetryReady, seconds = 180 }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) { onRetryReady?.(); return; }
    const t = setInterval(() => setRemaining((r) => r - 1), 1000);
    return () => clearInterval(t);
  }, [remaining]);

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const pct  = ((seconds - remaining) / seconds) * 100;

  if (remaining <= 0) {
    return (
      <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600 }}>
        Session expired. You can try again now.
      </Typography>
    );
  }

  return (
    <Stack spacing={0.75}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography variant="caption" color="text.disabled">Session expires in</Typography>
        <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontFamily: 'var(--font-mono-stack), ui-monospace, monospace' }}>
          {mins}:{String(secs).padStart(2, '0')}
        </Typography>
      </Stack>
      <Box sx={{ height: 3, borderRadius: 2, bgcolor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: 'text.primary', borderRadius: 2, transition: 'width 1s linear' }} />
      </Box>
    </Stack>
  );
}

// ── MoMo pending state — handles OTP (MTN) and polling (Vodafone/AirtelTigo) ──
function MomoPendingState({ reference, displayText, provider, maskedPhone, requiresOtp, onSuccess, onFail }) {
  const [status,      setStatus]      = useState(requiresOtp ? 'otp' : 'pending');
  const [message,     setMessage]     = useState(displayText || 'Please approve the payment on your phone.');
  const [dots,        setDots]        = useState('');
  const [otp,         setOtp]         = useState('');
  const [otpLoading,  setOtpLoading]  = useState(false);
  const [otpError,    setOtpError]    = useState(null);
  const pollRef = useRef(null);
  const prov    = PROVIDERS.find((p) => p.value === provider) || PROVIDERS[0];

  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(t);
  }, []);

  // Poll once OTP is submitted (status moves from 'otp' to 'pending')
  useEffect(() => {
    if (status !== 'pending') return;
    if (!reference) return;
    pollRef.current = setInterval(async () => {
      try {
        const res = await createAxiosClient().get(`/api/v1/payments/momo/status/?ref=${reference}`);
        const { status: st, message: msg } = res.data;
        if (st === 'success') { clearInterval(pollRef.current); setStatus('success'); setMessage('Payment confirmed!'); setTimeout(() => onSuccess?.(), 1500); }
        else if (st === 'failed') { clearInterval(pollRef.current); setStatus('failed'); setMessage(msg || 'Payment failed.'); setTimeout(() => onFail?.(), 2000); }
        else if (msg) setMessage(msg);
      } catch { /* keep polling */ }
    }, 3000);
    const timeout = setTimeout(() => {
      clearInterval(pollRef.current); setStatus('failed'); setMessage('Payment timed out.'); onFail?.();
    }, 600_000);
    return () => { clearInterval(pollRef.current); clearTimeout(timeout); };
  }, [reference, status]);

  const handleOtpSubmit = async () => {
    if (!otp || otp.length < 4) { setOtpError('Please enter the full OTP code.'); return; }
    setOtpLoading(true); setOtpError(null);
    try {
      const res = await createAxiosClient().post('/api/v1/payments/momo/submit-otp/', { reference, otp });
      if (res.data.status === 'success') {
        setStatus('success'); setMessage('Payment confirmed!');
        setTimeout(() => onSuccess?.(), 1500);
      } else {
        // OTP accepted — now wait for USSD approval (poll)
        setStatus('pending');
        setMessage(res.data.message || 'OTP accepted. Waiting for final confirmation…');
      }
    } catch (err) {
      setOtpError(err?.response?.data?.error || 'Invalid OTP. Please check the SMS and try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      {/* Provider badge */}
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '20px', bgcolor: prov.color, mb: 3 }}>
        <PhoneAndroidIcon sx={{ fontSize: 16, color: prov.text }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: prov.text }}>{prov.label}</Typography>
      </Box>

      {/* Status icon */}
      <Box sx={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid', borderColor: status === 'success' ? 'success.main' : status === 'failed' ? 'error.main' : 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, bgcolor: 'action.hover' }}>
        {(status === 'pending' || status === 'otp') && <CircularProgress size={36} thickness={3} sx={{ color: prov.color }} />}
        {status === 'success' && <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />}
        {status === 'failed'  && <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />}
      </Box>

      <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 22, fontWeight: 700, mb: 1 }} color="text.primary">
        {status === 'otp'     && 'Enter your OTP'}
        {status === 'pending' && `Waiting${dots}`}
        {status === 'success' && 'Confirmed!'}
        {status === 'failed'  && 'Failed'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{message}</Typography>
      <Typography variant="caption" color="text.disabled">{maskedPhone}</Typography>

      {/* OTP input — shown for MTN send_otp flow */}
      {status === 'otp' && (
        <Box sx={{ mt: 3, maxWidth: 280, mx: 'auto', textAlign: 'left' }}>
          <Box sx={{ p: 2, borderRadius: '10px', bgcolor: '#fffbeb', border: '1px solid #fbbf24', mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#92400e', fontWeight: 600, lineHeight: 1.6 }}>
              📱 An OTP code was sent to your phone via SMS. Enter it below to authorise the payment.
              <br />Do not share this code with anyone.
            </Typography>
          </Box>
          {otpError && (
            <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px' }} onClose={() => setOtpError(null)}>
              {otpError}
            </Alert>
          )}
          <TextField
            fullWidth size="small" label="OTP Code" type="number"
            value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
            placeholder="e.g. 449085"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', style: { fontFamily: 'var(--font-mono-stack), ui-monospace, monospace', fontSize: 20, letterSpacing: '0.2em', textAlign: 'center' } }}
            onKeyDown={(e) => e.key === 'Enter' && handleOtpSubmit()}
            sx={{ mb: 1.5, '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}
            autoFocus
          />
          <Box component="button" onClick={handleOtpSubmit} disabled={otpLoading || otp.length < 4}
            sx={{
              width: '100%', py: 1.6, px: 2, borderRadius: '10px', border: 'none',
              cursor: (otpLoading || otp.length < 4) ? 'not-allowed' : 'pointer',
              bgcolor: otp.length < 4 ? 'action.disabledBackground' : '#080808',
              color: otp.length < 4 ? 'text.disabled' : '#ffffff',
              fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 16, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              transition: 'all 0.18s',
            }}>
            {otpLoading ? <><CircularProgress size={14} sx={{ color: '#fff' }} /> Verifying…</> : 'Confirm payment'}
          </Box>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
            Didn't receive the OTP? Check your SMS inbox or wait a moment.
          </Typography>
        </Box>
      )}

      {/* Polling state — Vodafone/AirtelTigo or after OTP submitted */}
      {status === 'pending' && (
        <Box sx={{ mt: 2.5, px: 2, py: 1.5, borderRadius: '10px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', maxWidth: 320, mx: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {reference
              ? '📱 Approve the payment on your phone. Keep this page open.'
              : '📱 A payment session is already open on this number. Check your phone for a USSD prompt or push notification and approve it.'}
          </Typography>
          {!reference && (
            <Box sx={{ mt: 1.5 }}>
              <MomoCountdownRetry onRetryReady={() => { setStatus('failed'); }} />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

// ── Selectable payment method row ─────────────────────────────────────────────
function SelectableRow({ selected, onClick, children, sx }) {
  return (
    <Box onClick={onClick} sx={{
      px: 2, py: 1.25, borderRadius: '10px', cursor: 'pointer',
      border: '2px solid', borderColor: selected ? 'text.primary' : 'divider',
      bgcolor: selected ? 'action.selected' : 'action.hover',
      transition: 'all 0.18s', display: 'flex', alignItems: 'center', gap: 1.5, ...sx,
    }}>
      {children}
      {selected && <CheckCircleIcon sx={{ fontSize: 18, color: 'text.primary', ml: 'auto', flexShrink: 0 }} />}
    </Box>
  );
}

// ── Main CheckoutPanel ────────────────────────────────────────────────────────
// Shows what the change costs today (from the backend quote) and collects
// payment only when something is due. Downgrades are confirmed here and
// take effect at the next renewal.
export default function CheckoutPanel({ plan, billing, onChanged, onCancel }) {
  const planId = plan?.plan?.id ?? null;
  const { quote, loading: quoteLoading, error: quoteError } = usePlanQuote(planId, billing);

  const [activeTab,     setActiveTab]     = useState('momo');
  const [profile,       setProfile]       = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savedMomos,    setSavedMomos]    = useState([]);
  const [savedCards,    setSavedCards]    = useState([]);

  const [selectedMomo,  setSelectedMomo]  = useState(null);
  const [momoPhone,     setMomoPhone]     = useState('');
  const [momoProvider,  setMomoProvider]  = useState('mtn');
  const [saveMomo,      setSaveMomo]      = useState(true);
  const [momoLoading,   setMomoLoading]   = useState(false);
  const [momoError,     setMomoError]     = useState(null);
  const [momoPending,   setMomoPending]   = useState(null);

  const [selectedCard,  setSelectedCard]  = useState(null);
  const [cardLoading,   setCardLoading]   = useState(false);
  const [cardError,     setCardError]     = useState(null);

  const [confirming,    setConfirming]    = useState(false);
  const [confirmError,  setConfirmError]  = useState(null);

  const isYearly        = billing === 'yearly';
  const profileComplete = !!profile?.is_complete;
  const changeType      = quote?.change_type;
  const amountDue       = quote ? parseFloat(quote.amount_due) : 0;
  const credit          = quote ? parseFloat(quote.credit) : 0;
  const needsPayment    = !!quote && (changeType === 'initial' || changeType === 'upgrade') && amountDue > 0;

  // ── Fetch billing profile + saved methods on mount ────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const client = createAxiosClient();
        const [profRes, momoRes, cardRes] = await Promise.all([
          client.get('/api/v1/payments/billing/profile/'),
          client.get('/api/v1/payments/momo/'),
          client.get('/api/v1/payments/billing/cards/'),
        ]);
        setProfile(profRes.data);
        setSavedMomos(momoRes.data);
        setSavedCards(cardRes.data);
        const defMomo = momoRes.data.find((m) => m.is_default);
        if (defMomo) setSelectedMomo(defMomo.id);
        const defCard = cardRes.data.find((c) => c.is_default && !c.is_expired);
        if (defCard) setSelectedCard(defCard.id);
        // Lead with the method the seller already uses.
        if (!defMomo && defCard) setActiveTab('card');
      } catch (err) { console.warn('Load failed:', err); }
      finally { setProfileLoaded(true); }
    })();
  }, []);

  // ── No-payment changes: scheduled downgrade / credit-covered upgrade ──────
  const handleConfirmChange = useCallback(async () => {
    setConfirming(true); setConfirmError(null);
    try {
      const result = await initiateSubscription({ plan_id: planId, billing });
      if (result.authorization_url) {
        // Price changed since the quote — fall back to the normal checkout.
        window.location.href = result.authorization_url;
        return;
      }
      onChanged?.(result);
    } catch (err) {
      setConfirmError(errorMessage(err, 'Could not change your plan.'));
    } finally {
      setConfirming(false);
    }
  }, [planId, billing, onChanged]);

  // ── MoMo pay ──────────────────────────────────────────────────────────────
  const handleMomoPay = useCallback(async () => {
    if (!profileComplete) { setMomoError('Please complete your billing details first.'); return; }
    const account  = selectedMomo ? savedMomos.find((m) => m.id === selectedMomo) : null;
    const phone    = account ? account.phone    : momoPhone;
    const provider = account ? account.provider : momoProvider;
    if (!phone) { setMomoError('Please enter or select a phone number.'); return; }

    setMomoLoading(true); setMomoError(null);
    try {
      const res = await createAxiosClient().post('/api/v1/payments/momo/initiate/', {
        plan_id: planId, billing, phone, provider, save: saveMomo && !selectedMomo,
      });
      const d = res.data;
      if (d.status === 'activated' || d.status === 'scheduled') { onChanged?.(d); return; }
      setMomoPending({
        reference:   d.reference || null,
        displayText: d.display_text,
        maskedPhone: d.masked_phone || _maskPhone(phone),
        provider:    d.provider || provider,
        requiresOtp: d.requires_otp || d.status === 'send_otp',
      });
    } catch (err) {
      const body = err?.response?.data;
      if (body?.error === 'pending_ussd_session') {
        // A USSD session is already open on this phone: show the "check your
        // phone" state (no reference to poll) until it expires.
        setMomoPending({ reference: null, displayText: body.detail, maskedPhone: _maskPhone(phone), provider });
      } else {
        setMomoError(body?.detail || body?.error || 'Could not start the payment.');
      }
    } finally { setMomoLoading(false); }
  }, [profileComplete, selectedMomo, savedMomos, momoPhone, momoProvider, saveMomo, planId, billing, onChanged]);

  // ── Card pay ──────────────────────────────────────────────────────────────
  const handleCardPay = useCallback(async () => {
    if (!profileComplete) return;
    setCardLoading(true); setCardError(null);
    try {
      if (selectedCard) {
        // Saved card: charged directly, no redirect.
        const result = await chargeSavedCard({ plan_id: planId, billing, card_id: selectedCard });
        if (result.reference) window.location.href = `/subscription/verify?ref=${result.reference}`;
        else onChanged?.(result);
        return;
      }
      const result = await initiateSubscription({ plan_id: planId, billing });
      if (!result.authorization_url) { onChanged?.(result); return; }
      if (result.access_code && window.PaystackPop) {
        const handler = window.PaystackPop.setup({
          key:         process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
          access_code: result.access_code,
          onSuccess: () => { window.location.href = `/subscription/verify?ref=${result.reference}`; },
          onCancel:  () => setCardLoading(false),
        });
        handler.openIframe();
      } else {
        window.location.href = result.authorization_url;
      }
    } catch (err) {
      setCardError(errorMessage(err, 'Payment could not be started.'));
      setCardLoading(false);
    }
  }, [profileComplete, selectedCard, planId, billing, onChanged]);

  // MoMo success: the subscription is already active server-side.
  const handleMomoSuccess = useCallback(() => { window.location.href = '/subscription/verify?momo=1'; }, []);
  const handleMomoFail    = useCallback(() => { setMomoPending(null); setMomoError('Payment was not approved. Try again.'); }, []);

  if (!plan?.plan) return null;

  const payBtnSx = (disabled) => ({
    width: '100%', mt: 2.5, py: 1.75, px: 2.25, borderRadius: '12px', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    bgcolor: disabled ? 'action.disabledBackground' : 'text.primary',
    color: disabled ? 'text.disabled' : 'background.paper',
    fontFamily: FIGTREE, fontSize: 16, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.2s',
    '&:hover:not(:disabled)': { opacity: 0.9, transform: 'translateY(-1px)' },
  });

  const title =
    changeType === 'downgrade' ? `Switch to ${plan.plan.name}`
    : changeType === 'upgrade' ? `Upgrade to ${plan.plan.name}`
    : `Subscribe to ${plan.plan.name}`;

  const header = (
    <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
      <Box>
        <Typography sx={{ fontFamily: FIGTREE, fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', mb: 0.4 }} color="text.primary">
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {plan.plan.price_formatted} / {isYearly ? 'year' : 'month'}
          {quote?.current_plan ? ` · currently on ${quote.current_plan}` : ''}
        </Typography>
      </Box>
      <Button size="small" onClick={onCancel} sx={{ color: 'text.secondary', fontWeight: 600 }}>Close</Button>
    </Box>
  );

  // ── Loading / error states for the quote ──────────────────────────────────
  if (quoteLoading || (!quote && !quoteError)) {
    return (
      <Shell>
        {header}
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ p: 4 }}>
          <CircularProgress size={16} thickness={5} />
          <Typography variant="body2" color="text.secondary">Working out your price…</Typography>
        </Stack>
      </Shell>
    );
  }
  if (quoteError) {
    return (
      <Shell>
        {header}
        <Alert severity="error" sx={{ m: 3, borderRadius: '10px' }}>{quoteError}</Alert>
      </Shell>
    );
  }

  // ── Downgrade or credit-covered upgrade: confirm, nothing to pay ──────────
  if (!needsPayment) {
    const isDowngrade = changeType === 'downgrade';
    return (
      <Shell>
        {header}
        <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3.5, maxWidth: 640 }}>
          <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 2.5 }}>
            <EventAvailableOutlinedIcon sx={{ color: 'text.secondary', mt: '2px' }} />
            <Box>
              <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                {isDowngrade
                  ? `Nothing to pay today. ${plan.plan.name} starts on ${formatLongDate(quote.effective_date)}.`
                  : `Your unused ${quote.current_plan} days cover this upgrade, so there's nothing to pay.`}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                {isDowngrade
                  ? `You keep ${quote.current_plan} until then. On that date we'll charge ${formatGHS(quote.price)} for ${plan.plan.name}. You can change your mind any time before.`
                  : `${plan.plan.name} starts now and renews on ${formatLongDate(quote.period_end)} at ${formatGHS(quote.price)}.`}
              </Typography>
            </Box>
          </Stack>
          {confirmError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{confirmError}</Alert>}
          <Stack direction="row" spacing={1.25}>
            <Button variant="contained" disableElevation onClick={handleConfirmChange} disabled={confirming}
              startIcon={confirming ? <CircularProgress size={14} color="inherit" /> : null}
              sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 700, px: 2.5, '&:hover': { bgcolor: 'text.secondary' } }}>
              {isDowngrade ? `Schedule switch to ${plan.plan.name}` : `Switch to ${plan.plan.name} now`}
            </Button>
            <Button onClick={onCancel} sx={{ borderRadius: '10px', fontWeight: 600, color: 'text.secondary' }}>Not now</Button>
          </Stack>
        </Box>
      </Shell>
    );
  }

  // ── Payment ───────────────────────────────────────────────────────────────
  const dueLabel = formatGHS(quote.amount_due);

  return (
    <Shell>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      {header}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' } }}>

        {/* Left — billing details + payment */}
        <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3.5, borderRight: { md: '1px solid' }, borderColor: { md: 'divider' } }}>
          <Box sx={{ mb: 3.5 }}>
            {!profileLoaded
              ? <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={14} thickness={5} /><Typography variant="caption" color="text.disabled">Loading your details…</Typography></Stack>
              : <BillingDetailsForm profile={profile} onProfileSaved={(p) => setProfile(p)} compact required />}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <SectionLabel>Payment method</SectionLabel>
          <Box role="tablist" sx={{ display: 'grid', gridTemplateColumns: `repeat(${TABS.length},1fr)`, gap: '4px', bgcolor: 'action.hover', borderRadius: '12px', p: '4px', mb: 3, border: '1px solid', borderColor: 'divider' }}>
            {TABS.map(({ key, label, icon: Icon }) => (
              <Box key={key} component="button" type="button" role="tab" aria-selected={activeTab === key}
                onClick={() => { setActiveTab(key); setMomoPending(null); setMomoError(null); setCardError(null); }}
                sx={{ py: 1.1, borderRadius: '9px', cursor: 'pointer', textAlign: 'center', font: 'inherit', transition: 'all 0.18s', bgcolor: activeTab === key ? 'background.paper' : 'transparent', border: '1px solid', borderColor: activeTab === key ? 'divider' : 'transparent', boxShadow: activeTab === key ? 1 : 0 }}>
                <Icon sx={{ fontSize: 16, display: 'block', mx: 'auto', mb: 0.3, color: activeTab === key ? 'text.primary' : 'text.disabled' }} />
                <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: activeTab === key ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
              </Box>
            ))}
          </Box>

          {/* ── MoMo ─────────────────────────────────────────────────────── */}
          {activeTab === 'momo' && (
            momoPending ? (
              <MomoPendingState reference={momoPending.reference} displayText={momoPending.displayText} maskedPhone={momoPending.maskedPhone} provider={momoPending.provider} requiresOtp={momoPending.requiresOtp} onSuccess={handleMomoSuccess} onFail={handleMomoFail} />
            ) : (
              <Box>
                {momoError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setMomoError(null)}>{momoError}</Alert>}

                {savedMomos.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.25 }}>Saved MoMo numbers</Typography>
                    <Stack spacing={0.75}>
                      {savedMomos.map((acc) => {
                        const prov = PROVIDERS.find((p) => p.value === acc.provider) || PROVIDERS[0];
                        return (
                          <SelectableRow key={acc.id} selected={selectedMomo === acc.id} onClick={() => setSelectedMomo(selectedMomo === acc.id ? null : acc.id)}>
                            <Box sx={{ width: 28, height: 28, borderRadius: '7px', bgcolor: prov.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <PhoneAndroidIcon sx={{ fontSize: 14, color: prov.text }} />
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary">{acc.display_name}</Typography>
                              <Typography variant="caption" color="text.disabled">{prov.label}</Typography>
                            </Box>
                            {acc.is_default && <Chip label="Default" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
                          </SelectableRow>
                        );
                      })}
                    </Stack>
                    {selectedMomo
                      ? <Button size="small" onClick={() => setSelectedMomo(null)} sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>Use a different number</Button>
                      : <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25, mb: 1 }}>Or use a different number:</Typography>}
                  </Box>
                )}

                {!selectedMomo && (
                  <Stack spacing={1.75} sx={{ mb: 0.5 }}>
                    <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
                      <InputLabel>Network</InputLabel>
                      <Select value={momoProvider} onChange={(e) => setMomoProvider(e.target.value)} label="Network">
                        {PROVIDERS.map((p) => (
                          <MenuItem key={p.value} value={p.value}>
                            <Stack direction="row" alignItems="center" spacing={1.25}>
                              <Box sx={{ width: 22, height: 22, borderRadius: '5px', bgcolor: p.color, flexShrink: 0 }} />
                              <span>{p.label}</span>
                            </Stack>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField fullWidth size="small" label="Mobile number" type="tel" value={momoPhone} onChange={(e) => setMomoPhone(e.target.value)} placeholder="0XX XXX XXXX" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
                    <FormControlLabel
                      control={<Checkbox size="small" checked={saveMomo} onChange={(e) => setSaveMomo(e.target.checked)} />}
                      label={<Typography variant="caption" color="text.secondary">Save this number for renewals</Typography>}
                    />
                  </Stack>
                )}

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, lineHeight: 1.7 }}>
                  You&apos;ll get a prompt on your phone. Enter your PIN to approve, and keep this page open.
                </Typography>

                <Box component="button" onClick={handleMomoPay} disabled={momoLoading || !profileComplete} sx={payBtnSx(momoLoading || !profileComplete)}>
                  <span>{momoLoading ? 'Sending prompt…' : !profileComplete ? 'Complete billing details first' : `Pay ${dueLabel} with MoMo`}</span>
                  {momoLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <PhoneAndroidIcon sx={{ fontSize: 18 }} />}
                </Box>
              </Box>
            )
          )}

          {/* ── Card ─────────────────────────────────────────────────────── */}
          {activeTab === 'card' && (
            <Box>
              {cardError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setCardError(null)}>{cardError}</Alert>}

              {savedCards.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.25 }}>Saved cards</Typography>
                  <Stack spacing={0.75}>
                    {savedCards.map((card) => {
                      const bg = CARD_BG[card.card_type?.toLowerCase()] || '#232526';
                      return (
                        <SelectableRow key={card.id} selected={selectedCard === card.id}
                          onClick={() => !card.is_expired && setSelectedCard(selectedCard === card.id ? null : card.id)}
                          sx={card.is_expired ? { opacity: 0.55, cursor: 'not-allowed' } : undefined}>
                          <Box sx={{ width: 44, height: 28, borderRadius: '6px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{card.card_type?.toUpperCase().slice(0, 4)}</Typography>
                          </Box>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} color="text.primary">{card.display_name}</Typography>
                            <Typography variant="caption" color="text.disabled">Exp {card.expiry_display}{card.is_expired ? ' · Expired' : ''}</Typography>
                          </Box>
                          {card.is_default && !card.is_expired && <Chip label="Default" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
                        </SelectableRow>
                      );
                    })}
                  </Stack>
                  {selectedCard
                    ? <Button size="small" onClick={() => setSelectedCard(null)} sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>Use a new card</Button>
                    : <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25 }}>Or pay with a new card:</Typography>}
                </Box>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.7 }}>
                {selectedCard
                  ? 'Your saved card is charged straight away.'
                  : "You'll enter your card on Paystack's secure checkout. It's saved for renewals."}
              </Typography>

              <Box component="button" onClick={handleCardPay} disabled={cardLoading || !profileComplete} sx={payBtnSx(cardLoading || !profileComplete)}>
                <span>{cardLoading ? (selectedCard ? 'Charging card…' : 'Opening checkout…') : !profileComplete ? 'Complete billing details first' : `Pay ${dueLabel}`}</span>
                {cardLoading ? <CircularProgress size={16} sx={{ color: 'inherit' }} /> : <CreditCardIcon sx={{ fontSize: 18 }} />}
              </Box>
            </Box>
          )}

          <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="center" sx={{ mt: 2.5 }}>
            <LockOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
            <Typography variant="caption" color="text.disabled">Payments secured by Paystack · Cancel any time</Typography>
          </Stack>
        </Box>

        {/* Right — order summary */}
        <Box sx={{ px: { xs: 2.5, md: 3 }, py: 3.5, bgcolor: 'action.hover' }}>
          <SectionLabel sx={{ mb: 2.5 }}>Summary</SectionLabel>
          <Stack spacing={1.25} sx={{ mb: 2, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
            <SummaryRow label={`${plan.plan.name} (${isYearly ? 'yearly' : 'monthly'})`} value={formatGHS(quote.price)} />
            {credit > 0 && (
              <SummaryRow label={`Credit for unused ${quote.current_plan} days`} value={`− ${formatGHS(credit)}`} />
            )}
            {changeType === 'upgrade' && quote.period_end && quote.effective_date && (
              <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.6 }}>
                {plan.plan.billing_cycle === (quote.current_billing_cycle ?? plan.plan.billing_cycle)
                  ? 'Charged for the days left until your renewal date.'
                  : 'A new billing period starts today.'}
              </Typography>
            )}
          </Stack>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.75 }}>
            <Typography variant="body2" fontWeight={700} color="text.primary">Due today</Typography>
            <Typography sx={{ fontFamily: FIGTREE, fontSize: 24, fontWeight: 700 }} color="text.primary">{dueLabel}</Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3, lineHeight: 1.6 }}>
            Then {formatGHS(quote.price)} every {isYearly ? 'year' : 'month'} from {formatLongDate(quote.period_end)}.
          </Typography>

          <Stack spacing={1.1} sx={{ mb: 2.5 }}>
            {[
              ['Commission', plan.plan.commission_display],
              ['Payouts', `${plan.plan.payout_delay_days} days after delivery`],
              ['Listings', plan.plan.max_products >= 999999 ? 'Unlimited' : plan.plan.max_products],
            ].map(([k, v]) => <SummaryRow key={k} label={k} value={v} muted />)}
          </Stack>

          {plan.unlocks?.length > 0 && (
            <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
              <SectionLabel sx={{ mb: 1.5 }}>Included</SectionLabel>
              <Stack spacing={0.9}>
                {plan.unlocks.map((u) => (
                  <Stack key={u} direction="row" alignItems="center" spacing={1}>
                    <CheckCircleIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">{u}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Box>
    </Shell>
  );
}

function Shell({ children }) {
  return (
    <Box sx={{ pb: 6, animation: 'slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both', '@keyframes slideDown': { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
      <Box sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
        {children}
      </Box>
    </Box>
  );
}

function SummaryRow({ label, value, muted }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2}>
      <Typography variant={muted ? 'caption' : 'body2'} color={muted ? 'text.disabled' : 'text.secondary'}>{label}</Typography>
      <Typography variant={muted ? 'caption' : 'body2'} fontWeight={600} color={muted ? 'text.secondary' : 'text.primary'} sx={{ textAlign: 'right' }}>{value}</Typography>
    </Stack>
  );
}
