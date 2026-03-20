'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, Stack, Divider, TextField, MenuItem,
  Select, FormControl, InputLabel, CircularProgress, Alert,
  Chip, Button,
} from '@mui/material';
import PhoneAndroidIcon   from '@mui/icons-material/PhoneAndroid';
import CheckCircleIcon    from '@mui/icons-material/CheckCircle';
import ErrorOutlineIcon   from '@mui/icons-material/ErrorOutline';
import LockOutlinedIcon   from '@mui/icons-material/LockOutlined';
import CreditCardIcon     from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import BillingDetailsForm from '../_components/Billingdetailsform';
import Script from 'next/script';
import { createAxiosClient } from '@/utils/clientFetch';
import { useInitiateSubscription } from '@/hooks/useSubscription';

// ── Helpers ───────────────────────────────────────────────────────────────────

const PROVIDERS = [
  { value: 'mtn',        label: 'MTN Mobile Money',  color: '#FFCB00', text: '#111' },
  { value: 'vodafone',   label: 'Vodafone Cash',      color: '#E60000', text: '#fff' },
  { value: 'airteltigo', label: 'AirtelTigo Money',   color: '#ED1C24', text: '#fff' },
];

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
  { key: 'momo', label: 'Mobile Money', icon: PhoneAndroidIcon   },
  { key: 'card', label: 'Card',          icon: CreditCardIcon    },
  { key: 'bank', label: 'Bank Transfer', icon: AccountBalanceIcon },
];

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
        <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontFamily: 'monospace' }}>
          {mins}:{String(secs).padStart(2, '0')}
        </Typography>
      </Stack>
      <Box sx={{ height: 3, borderRadius: 2, bgcolor: 'divider', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, bgcolor: 'text.primary', borderRadius: 2, transition: 'width 1s linear' }} />
      </Box>
    </Stack>
  );
}

// ── MoMo pending state — polls every 3s ───────────────────────────────────────
function MomoPendingState({ reference, displayText, provider, maskedPhone, onSuccess, onFail }) {
  const [status,  setStatus]  = useState('pending');
  const [message, setMessage] = useState(displayText || 'Please approve the payment on your phone.');
  const [dots,    setDots]    = useState('');
  const pollRef = useRef(null);
  const prov    = PROVIDERS.find((p) => p.value === provider) || PROVIDERS[0];

  useEffect(() => {
    const t = setInterval(() => setDots((d) => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (status !== 'pending') return;
    // Don't poll if there's no reference — null reference means USSD-locked / check-phone state
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

  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1, px: 2, py: 0.75, borderRadius: '20px', bgcolor: prov.color, mb: 3 }}>
        <PhoneAndroidIcon sx={{ fontSize: 16, color: prov.text }} />
        <Typography sx={{ fontSize: 12, fontWeight: 700, color: prov.text }}>{prov.label}</Typography>
      </Box>
      <Box sx={{ width: 80, height: 80, borderRadius: '50%', border: '3px solid', borderColor: status === 'success' ? 'success.main' : status === 'failed' ? 'error.main' : 'divider', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 3, bgcolor: status === 'success' ? 'success.lighter' : status === 'failed' ? 'error.lighter' : 'action.hover' }}>
        {status === 'pending' && <CircularProgress size={36} thickness={3} sx={{ color: prov.color }} />}
        {status === 'success' && <CheckCircleIcon sx={{ fontSize: 40, color: 'success.main' }} />}
        {status === 'failed'  && <ErrorOutlineIcon sx={{ fontSize: 40, color: 'error.main' }} />}
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, mb: 1 }} color="text.primary">
        {status === 'pending' && `Waiting${dots}`}{status === 'success' && 'Confirmed!'}{status === 'failed' && 'Failed'}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{message}</Typography>
      <Typography variant="caption" color="text.disabled">{maskedPhone}</Typography>
      {status === 'pending' && (
        <Box sx={{ mt: 2.5, px: 2, py: 1.5, borderRadius: '10px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', maxWidth: 320, mx: 'auto' }}>
          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
            {reference
              ? '📱 Enter your MoMo PIN on your phone to approve.'
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
export default function CheckoutPanel({ plan, billing }) {
  if (!plan?.plan) return null;

  const [activeTab,    setActiveTab]    = useState('momo');
  const [profile,      setProfile]      = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [upgradeInfo,  setUpgradeInfo]  = useState(null);

  // Saved methods
  const [savedMomos,   setSavedMomos]   = useState([]);
  const [savedCards,   setSavedCards]   = useState([]);

  // MoMo selection state
  const [selectedMomo,  setSelectedMomo]  = useState(null);  // saved account id
  const [momoPhone,     setMomoPhone]     = useState('');
  const [momoProvider,  setMomoProvider]  = useState('mtn');
  const [saveMomo,      setSaveMomo]      = useState(false);
  const [momoLoading,   setMomoLoading]   = useState(false);
  const [momoError,     setMomoError]     = useState(null);
  const [momoPending,   setMomoPending]   = useState(null);

  // Card selection state
  const [selectedCard,  setSelectedCard]  = useState(null);  // saved card id

  const [bankRef] = useState(`NM-VND-${Math.random().toString(36).slice(2, 8).toUpperCase()}`);

  const { initiate, loading: cardLoading, error: cardError } = useInitiateSubscription();
  const isYearly        = billing === 'yearly';
  const profileComplete = !!profile?.is_complete;

  // ── Fetch profile + saved methods on mount ────────────────────────────────
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
      } catch (err) { console.warn('Load failed:', err); }
      finally { setProfileLoaded(true); }
    })();
  }, []);

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
        plan_id: plan.plan.id, billing, phone, provider, save: saveMomo && !selectedMomo,
      });
      const d = res.data;
      // status:'check_phone' means a USSD session is already open on the phone
      // We show the same waiting UI but without polling (reference is null)
      setMomoPending({
        reference:   d.reference || null,
        displayText: d.display_text,
        maskedPhone: d.masked_phone || _maskPhone(phone),
        provider:    d.provider || provider,
        checkPhone:  d.status === 'check_phone',
      });
    } catch (err) {
      const body = err?.response?.data;
      if (body?.error === 'billing_profile_incomplete') {
        setMomoError(body.detail);
      } else if (body?.error === 'test_mode_decline') {
        setMomoError(body.detail);
      } else if (body?.error === 'pending_ussd_session') {
        // A USSD session is already open on this phone.
        // Show the polling UI with a "check your phone" message so the vendor
        // can either approve the existing prompt or wait for it to expire.
        // We try to re-surface any pending txn reference for polling.
        const phone    = (selectedMomo ? savedMomos.find((m) => m.id === selectedMomo)?.phone : momoPhone) || '';
        const provider = (selectedMomo ? savedMomos.find((m) => m.id === selectedMomo)?.provider : momoProvider) || 'mtn';
        // Set a synthetic pending state so the user sees the "check phone" UI
        setMomoPending({
          reference:   null,  // no reference to poll — tell user to check phone
          displayText: body.detail,
          maskedPhone: phone.length >= 4 ? '•'.repeat(Math.max(phone.length - 4, 0)) + phone.slice(-4) : phone,
          provider,
          ussdLocked:  true,  // special flag
        });
      } else {
        setMomoError(body?.error || body?.detail || 'Could not initiate payment.');
      }
    } finally { setMomoLoading(false); }
  }, [profileComplete, selectedMomo, savedMomos, momoPhone, momoProvider, saveMomo, plan, billing]);

  // ── Card pay ──────────────────────────────────────────────────────────────
  const handleCardPay = useCallback(async () => {
    if (!profileComplete) return;
    const result = await initiate(plan.plan.id, billing);
    // If Paystack inline SDK is available AND we have an access_code, use popup
    // Otherwise fall back to redirect (handled inside useInitiateSubscription)
    if (result?.access_code && window.PaystackPop) {
      const handler = window.PaystackPop.setup({
        key:         process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        access_code: result.access_code,
        onSuccess: () => { window.location.href = `/vendor/subscription/verify?ref=${result.reference}`; },
        onCancel:  () => { /* vendor closed popup — stay on page */ },
      });
      handler.openIframe();
    }
    // If no access_code or no PaystackPop, useInitiateSubscription already redirected
  }, [profileComplete, plan, billing, initiate]);

  // MoMo: subscription already activated server-side — go straight to verify page with momo=1
  const handleMomoSuccess = useCallback(() => { window.location.href = '/subscription/verify?momo=1'; }, []);
  const handleMomoFail    = useCallback(() => { setMomoPending(null); setMomoError('Payment was not approved. Try again.'); }, []);

  // ── Shared pay button styles ──────────────────────────────────────────────
  const payBtnSx = (disabled) => ({
    width: '100%', mt: 2.5, py: 1.85, px: 2, borderRadius: '12px', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    bgcolor: !profileComplete ? 'action.disabledBackground' : disabled ? 'rgba(8,8,8,0.5)' : '#080808',
    color: !profileComplete ? 'text.disabled' : '#ffffff',
    fontFamily: "'Cormorant Garamond', serif", fontSize: 17, fontWeight: 700,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    transition: 'all 0.2s',
    '&:hover:not(:disabled)': { opacity: 0.88, transform: 'translateY(-1px)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' },
  });

  return (
    <Box sx={{ pb: 9, animation: 'slideDown 0.35s cubic-bezier(0.22,1,0.36,1) both', '@keyframes slideDown': { from: { opacity: 0, transform: 'translateY(-12px)' }, to: { opacity: 1, transform: 'translateY(0)' } } }}>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="lazyOnload" />
      <Box sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>

        {/* Header */}
        <Box sx={{ bgcolor: 'text.primary', px: { xs: 2.5, md: 4 }, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, color: '#ffffff', letterSpacing: '-0.5px', mb: 0.4 }}>Complete subscription</Typography>
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>Payment method saved for automatic renewal</Typography>
          </Box>
          <Box sx={{ px: 2.5, py: 1.5, borderRadius: '12px', bgcolor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'right' }}>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>{plan.plan.name}</Typography>
            <Typography sx={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{plan.plan.price_formatted} / {isYearly ? 'year' : 'month'}</Typography>
          </Box>
        </Box>

        {/* Body */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 340px' } }}>

          {/* Left — billing + payment */}
          <Box sx={{ px: { xs: 2.5, md: 4 }, py: 3.5, borderRight: { md: '1px solid' }, borderColor: { md: 'divider' } }}>

            {/* Billing details */}
            <Box sx={{ mb: 3.5 }}>
              {!profileLoaded
                ? <Stack direction="row" alignItems="center" spacing={1}><CircularProgress size={14} thickness={5} /><Typography variant="caption" color="text.disabled">Loading your details…</Typography></Stack>
                : <BillingDetailsForm profile={profile} onProfileSaved={(p) => setProfile(p)} compact required />
              }
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Payment tabs */}
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 1.75 }}>
              Payment method
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '4px', bgcolor: 'action.hover', borderRadius: '12px', p: '4px', mb: 3, border: '1px solid', borderColor: 'divider' }}>
              {TABS.map(({ key, label, icon: Icon }) => (
                <Box key={key} onClick={() => { setActiveTab(key); setMomoPending(null); setMomoError(null); }}
                  sx={{ py: 1.1, borderRadius: '9px', cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s', bgcolor: activeTab === key ? 'background.paper' : 'transparent', border: '1px solid', borderColor: activeTab === key ? 'divider' : 'transparent', boxShadow: activeTab === key ? 1 : 0 }}>
                  <Icon sx={{ fontSize: 16, display: 'block', mx: 'auto', mb: 0.3, color: activeTab === key ? 'text.primary' : 'text.disabled' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, fontSize: 11, color: activeTab === key ? 'text.primary' : 'text.secondary' }}>{label}</Typography>
                </Box>
              ))}
            </Box>

            {/* ── MoMo tab ─────────────────────────────────────────────── */}
            {activeTab === 'momo' && (
              <Box>
                {momoPending ? (
                  <MomoPendingState reference={momoPending.reference} displayText={momoPending.displayText} maskedPhone={momoPending.maskedPhone} provider={momoPending.provider} onSuccess={handleMomoSuccess} onFail={handleMomoFail} />
                ) : (
                  <Box>
                    {momoError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setMomoError(null)}>{momoError}</Alert>}

                    {/* Saved MoMo accounts */}
                    {savedMomos.length > 0 && (
                      <Box sx={{ mb: 2.5 }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.25 }}>Saved MoMo accounts</Typography>
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
                        {!selectedMomo && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25, mb: 1 }}>Or use a different number:</Typography>}
                        {selectedMomo && <Button size="small" onClick={() => setSelectedMomo(null)} sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>Use a different number</Button>}
                      </Box>
                    )}

                    {/* New number */}
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
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }} onClick={() => setSaveMomo((v) => !v)}>
                          <Box sx={{ width: 18, height: 18, borderRadius: '4px', border: '2px solid', borderColor: saveMomo ? 'text.primary' : 'divider', bgcolor: saveMomo ? 'text.primary' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            {saveMomo && <CheckCircleIcon sx={{ fontSize: 12, color: 'background.paper' }} />}
                          </Box>
                          <Typography variant="caption" color="text.secondary">Save for future payments</Typography>
                        </Box>
                      </Stack>
                    )}

                    <Box sx={{ mt: 2, p: 2, borderRadius: '10px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>📱 You'll receive a USSD prompt or push notification. Enter your PIN to approve. Keep this page open.</Typography>
                    </Box>

                    <Box component="button" onClick={handleMomoPay} disabled={momoLoading || !profileComplete} sx={payBtnSx(momoLoading || !profileComplete)}>
                      <span>{momoLoading ? 'Initiating…' : !profileComplete ? 'Complete billing details first' : 'Pay with Mobile Money'}</span>
                      {momoLoading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <PhoneAndroidIcon sx={{ fontSize: 18, color: !profileComplete ? 'text.disabled' : '#ffffff' }} />}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {/* ── Card tab ─────────────────────────────────────────────── */}
            {activeTab === 'card' && (
              <Box>
                {cardError && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{cardError}</Alert>}

                {/* Saved cards */}
                {savedCards.length > 0 && (
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 1.25 }}>Saved cards</Typography>
                    <Stack spacing={0.75}>
                      {savedCards.map((card) => {
                        const bg = CARD_BG[card.card_type?.toLowerCase()] || '#232526';
                        return (
                          <SelectableRow key={card.id} selected={selectedCard === card.id} onClick={() => setSelectedCard(selectedCard === card.id ? null : card.id)}>
                            <Box sx={{ width: 44, height: 28, borderRadius: '6px', bgcolor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Typography sx={{ fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '0.04em' }}>{card.card_type?.toUpperCase().slice(0,4)}</Typography>
                            </Box>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" fontWeight={600} color="text.primary">{card.display_name}</Typography>
                              <Typography variant="caption" color="text.disabled">Exp {card.expiry_display}{card.is_expired ? ' · Expired' : ''}</Typography>
                            </Box>
                            {card.is_default && <Chip label="Default" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
                            {card.is_expired && <Chip label="Expired" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: 'error.main', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
                          </SelectableRow>
                        );
                      })}
                    </Stack>
                    {!selectedCard && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.25, mb: 1 }}>Or enter a new card:</Typography>}
                    {selectedCard && <Button size="small" onClick={() => setSelectedCard(null)} sx={{ fontSize: 11, color: 'text.secondary', mt: 0.75 }}>Use a different card</Button>}
                  </Box>
                )}

                {/* No saved card selected — clicking Subscribe redirects to Paystack
                    which collects card details securely and saves the card automatically */}
                {!selectedCard && (
                  <Box sx={{ p: 2, borderRadius: '10px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      💳 You'll enter your card details securely on Paystack's checkout page. Your card will be saved automatically for future renewals — no need to enter it again.
                    </Typography>
                  </Box>
                )}

                {upgradeInfo && (
                  <Box sx={{ mt: 2.5, p: 2.25, borderRadius: '12px', bgcolor: '#fffbeb', border: '1px solid #fbbf24' }}>
                    <Stack direction="row" spacing={1.25} sx={{ mb: 1 }}>
                      <WarningAmberRoundedIcon sx={{ color: '#d97706', fontSize: 18, flexShrink: 0 }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#92400e' }}>Changing from {upgradeInfo.from_plan} → {upgradeInfo.to_plan}</Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 12, color: '#78350f', lineHeight: 1.65 }}>You'll be charged {plan.plan.price_formatted} today. Your current plan ends immediately.</Typography>
                  </Box>
                )}

                <Box component="button" onClick={handleCardPay} disabled={cardLoading || !profileComplete} sx={payBtnSx(cardLoading || !profileComplete)}>
                  <span>{cardLoading ? 'Redirecting to Paystack…' : !profileComplete ? 'Complete billing details first' : selectedCard ? 'Pay with saved card' : 'Subscribe now'}</span>
                  {cardLoading ? <CircularProgress size={16} sx={{ color: '#ffffff' }} /> : <span>{plan.plan.price_formatted}</span>}
                </Box>

                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                  {selectedCard
                    ? 'Redirects to Paystack — your saved card will be charged'
                    : 'Redirects to Paystack secure checkout — your card will be saved for future renewals'}
                </Typography>
              </Box>
            )}

            {/* ── Bank transfer tab ─────────────────────────────────────── */}
            {activeTab === 'bank' && (
              <Box sx={{ p: 2.5, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2.5 }}>Transfer the exact amount below. Subscription activates within 2 business hours.</Typography>
                {[['Bank','GCB Bank Ghana'],['Account number','1234567890'],['Account name','Negromart Ghana Ltd'],['Amount',plan.plan.price_formatted],['Reference',bankRef]].map(([k, v]) => (
                  <Stack key={k} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" color="text.disabled" fontWeight={600}>{k}</Typography>
                    <Typography variant="body2" fontWeight={k === 'Reference' ? 700 : 500} color="text.primary" sx={{ fontFamily: k === 'Reference' ? 'monospace' : 'inherit', letterSpacing: k === 'Reference' ? '0.08em' : 0 }}>{v}</Typography>
                  </Stack>
                ))}
              </Box>
            )}

            <Stack direction="row" alignItems="center" spacing={0.75} justifyContent="center" sx={{ mt: 2.5 }}>
              <LockOutlinedIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled">PCI-DSS secured via Paystack · Cancel anytime</Typography>
            </Stack>
          </Box>

          {/* Right — order summary */}
          <Box sx={{ px: { xs: 2.5, md: 3 }, py: 3.5, bgcolor: 'action.hover' }}>
            <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 2.5 }}>Order summary</Typography>
            <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 2.5, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Box>
                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', mb: 0.4 }} color="text.primary">{plan.plan.name} Plan</Typography>
                <Typography variant="caption" color="text.secondary">{isYearly ? 'Billed annually' : 'Billed monthly'}</Typography>
              </Box>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700 }} color="text.primary">{plan.plan.price_formatted}</Typography>
            </Stack>
            <Stack spacing={1.25} sx={{ mb: 2.5 }}>
              {[['Commission rate', plan.plan.commission_display],['Payout delay', `${plan.plan.payout_delay_days} days`],['Max products', plan.plan.max_products >= 999999 ? 'Unlimited' : plan.plan.max_products]].map(([k, v]) => (
                <Stack key={k} direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.disabled">{k}</Typography>
                  <Typography variant="caption" fontWeight={600} color="text.secondary">{v}</Typography>
                </Stack>
              ))}
            </Stack>
            <Stack direction="row" justifyContent="space-between" sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider', mb: 3 }}>
              <Typography variant="body2" fontWeight={700} color="text.primary">Due today</Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">{plan.plan.price_formatted}</Typography>
            </Stack>
            {plan.unlocks?.length > 0 && (
              <Box sx={{ p: 2, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 1.5 }}>You unlock</Typography>
                <Stack spacing={0.9}>
                  {plan.unlocks.map((u) => (
                    <Stack key={u} direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: 'text.primary', flexShrink: 0 }} />
                      <Typography variant="caption" color="text.secondary">{u}</Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}