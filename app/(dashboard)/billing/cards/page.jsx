'use client';
// app/vendor/billing/cards/page.jsx
// Updated: shows Cards AND MoMo accounts in two sections.

import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box, Typography, Stack, Button, Chip, IconButton, Tooltip,
  Alert, Skeleton, TextField, FormControl, InputLabel, Select, MenuItem,
  Divider, CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Swal from 'sweetalert2';
import { createAxiosClient } from '@/utils/clientFetch';
import { useBillingOverview } from '@/hooks/useBilling';
import useSWR from 'swr';

const CARD_BG = {
  visa:       'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  mastercard: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)',
  verve:      'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
};

const PROVIDERS = [
  { value: 'mtn',        label: 'MTN Mobile Money', color: '#FFCB00', text: '#111' },
  { value: 'vodafone',   label: 'Vodafone Cash',     color: '#E60000', text: '#fff' },
  { value: 'airteltigo', label: 'AirtelTigo Money',  color: '#ED1C24', text: '#fff' },
];

const fetcher = (url) => createAxiosClient().get(url).then((r) => r.data);

// ── Credit card visual ────────────────────────────────────────────────────────
function CreditCard({ card, onSetDefault, onDelete, isSettingDefault, isDeleting }) {
  const bg = CARD_BG[card.card_type?.toLowerCase()] || 'linear-gradient(135deg, #232526 0%, #414345 100%)';
  return (
    <Box sx={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', background: bg, p: '22px 24px', border: card.is_default ? '2px solid rgba(255,255,255,0.3)' : '2px solid transparent', transition: 'all 0.2s', '&:hover': { boxShadow: '0 12px 40px rgba(0,0,0,0.2)' }, minHeight: 168 }}>
      {card.is_default && <Chip label="Default" size="small" sx={{ position: 'absolute', top: 12, right: 12, height: 20, fontSize: 9, fontWeight: 700, bgcolor: 'rgba(255,255,255,0.2)', color: '#fff', borderRadius: '5px', '& .MuiChip-label': { px: 1 } }} />}
      {card.is_expired && <Chip label="Expired" size="small" sx={{ position: 'absolute', top: 12, right: card.is_default ? 80 : 12, height: 20, fontSize: 9, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.3)', color: '#fca5a5', borderRadius: '5px', '& .MuiChip-label': { px: 1 } }} />}
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', mb: 2 }}>{card.card_type}</Typography>
      <Typography sx={{ fontFamily: "'Courier New', monospace", fontSize: 18, fontWeight: 600, color: '#ffffff', letterSpacing: '0.18em', mb: 2.5 }}>•••• •••• •••• {card.last4}</Typography>
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
        <Box>
          <Typography sx={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 0.25 }}>Expires</Typography>
          <Typography sx={{ fontSize: 14, fontWeight: 600, color: card.is_expired ? '#fca5a5' : '#ffffff' }}>{card.expiry_display}</Typography>
        </Box>
        {card.bank && <Typography sx={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', textAlign: 'right', maxWidth: 100 }}>{card.bank}</Typography>}
      </Stack>
      <Stack direction="row" spacing={0.75} sx={{ mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        {!card.is_default && (
          <Button size="small" onClick={() => onSetDefault(card.id)} disabled={isSettingDefault}
            startIcon={<RadioButtonUncheckedIcon sx={{ fontSize: 13 }} />}
            sx={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.6)', bgcolor: 'rgba(255,255,255,0.08)', borderRadius: '6px', '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: '#fff' } }}>
            Set default
          </Button>
        )}
        {card.is_default && <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1 }}><CheckCircleIcon sx={{ fontSize: 13, color: '#4ade80' }} /><Typography sx={{ fontSize: 11, fontWeight: 600, color: '#4ade80' }}>Default</Typography></Stack>}
        <Box sx={{ flex: 1 }} />
        <Tooltip title="Remove card"><IconButton size="small" onClick={() => onDelete(card.id, card.display_name)} disabled={isDeleting} sx={{ borderRadius: '6px', color: 'rgba(255,255,255,0.35)', '&:hover': { bgcolor: 'rgba(239,68,68,0.2)', color: '#fca5a5' } }}><DeleteOutlineIcon sx={{ fontSize: 16 }} /></IconButton></Tooltip>
      </Stack>
    </Box>
  );
}

// ── MoMo account row ──────────────────────────────────────────────────────────
function MomoAccountRow({ account, onSetDefault, onDelete, isSettingDefault, isDeleting }) {
  const prov = PROVIDERS.find((p) => p.value === account.provider) || PROVIDERS[0];
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}
      sx={{ px: 2.5, py: 2, borderRadius: '14px', border: account.is_default ? '2px solid' : '1px solid', borderColor: account.is_default ? 'text.primary' : 'divider', bgcolor: account.is_default ? 'action.selected' : 'background.paper', transition: 'all 0.18s', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.06)' } }}>
      {/* Provider badge */}
      <Box sx={{ width: 42, height: 42, borderRadius: '12px', bgcolor: prov.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <PhoneAndroidIcon sx={{ fontSize: 20, color: prov.text }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.2 }}>
          <Typography variant="body2" fontWeight={700} color="text.primary">{account.display_name}</Typography>
          {account.is_default && <Chip label="Default" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
        </Stack>
        <Typography variant="caption" color="text.secondary">{prov.label}</Typography>
      </Box>

      {!account.is_default && (
        <Tooltip title="Set as default">
          <IconButton size="small" onClick={() => onSetDefault(account.id)} disabled={isSettingDefault}
            sx={{ borderRadius: '8px', color: 'text.disabled', '&:hover': { bgcolor: 'action.selected', color: 'text.primary' } }}>
            <RadioButtonUncheckedIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Remove">
        <IconButton size="small" onClick={() => onDelete(account.id, account.display_name)} disabled={isDeleting}
          sx={{ borderRadius: '8px', color: 'text.disabled', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

// ── Add MoMo form ─────────────────────────────────────────────────────────────
function AddMomoForm({ onAdded, onCancel }) {
  const [phone,    setPhone]    = useState('');
  const [provider, setProvider] = useState('mtn');
  const [nickname, setNickname] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const handleAdd = async () => {
    if (!phone) { setError('Phone number is required.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await createAxiosClient().post('/api/v1/payments/momo/', { phone, provider, nickname });
      onAdded?.(res.data);
    } catch (err) {
      setError(err?.response?.data?.error || err?.response?.data?.phone?.[0] || 'Could not add account.');
    } finally { setLoading(false); }
  };

  return (
    <Box sx={{ p: 2.5, borderRadius: '14px', border: '2px dashed', borderColor: 'divider', bgcolor: 'action.hover' }}>
      <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ mb: 2 }}>Add Mobile Money account</Typography>
      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '8px' }} onClose={() => setError(null)}>{error}</Alert>}
      <Stack spacing={1.5}>
        <FormControl fullWidth size="small" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }}>
          <InputLabel>Network</InputLabel>
          <Select value={provider} onChange={(e) => setProvider(e.target.value)} label="Network">
            {PROVIDERS.map((p) => (
              <MenuItem key={p.value} value={p.value}>
                <Stack direction="row" alignItems="center" spacing={1.25}>
                  <Box sx={{ width: 20, height: 20, borderRadius: '5px', bgcolor: p.color, flexShrink: 0 }} />
                  <span>{p.label}</span>
                </Stack>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField fullWidth size="small" label="Phone number" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
          placeholder="0XX XXX XXXX or +233XXXXXXXXX" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
        <TextField fullWidth size="small" label="Nickname (optional)" value={nickname} onChange={(e) => setNickname(e.target.value)}
          placeholder="e.g. My MTN number" sx={{ '& .MuiOutlinedInput-root': { borderRadius: '10px' } }} />
      </Stack>
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" disableElevation size="small" onClick={handleAdd} disabled={loading}
          startIcon={loading ? <CircularProgress size={12} thickness={5} color="inherit" /> : <AddIcon />}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '8px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
          {loading ? 'Saving…' : 'Add account'}
        </Button>
        <Button size="small" variant="outlined" onClick={onCancel}
          sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
          Cancel
        </Button>
      </Stack>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BillingCardsPage() {
  const { overview, loading, error, refetch } = useBillingOverview();
  const { data: momoAccounts, mutate: refetchMomo } = useSWR('/api/v1/payments/momo/', fetcher, { revalidateOnFocus: false });

  const [settingDefault, setSettingDefault] = useState(null);
  const [cardSaved,      setCardSaved]      = useState(false);
  const searchParams = useSearchParams();

  // Handle Paystack redirect after card tokenization
  useEffect(() => {
    const cardRef = searchParams.get('card_ref');
    if (!cardRef) return;
    // Remove query param from URL without reload
    window.history.replaceState({}, '', '/vendor/billing/cards');
    // Verify the card with backend
    (async () => {
      try {
        const res = await createAxiosClient().get(`/api/v1/payments/billing/verify-card/?ref=${cardRef}`);
        if (res.data?.card_saved) {
          await refetch();
          await refetchMomo();
          Swal.fire({ icon: 'success', title: 'Card saved!', html: `<span style="color:#6b7280">•••• •••• •••• <strong style="color:#111">${res.data.last4}</strong> has been added.</span>`, timer: 3000, showConfirmButton: false });
        } else if (res.data?.reason === 'duplicate') {
          Swal.fire({ icon: 'info', title: 'Already saved', text: 'This card is already in your account.', timer: 2500, showConfirmButton: false });
        }
      } catch (err) {
        Swal.fire({ icon: 'error', title: 'Could not save card', text: err?.response?.data?.error || 'Please try again.' });
      }
    })();
  }, [searchParams]);
  const [deleting,       setDeleting]       = useState(null);
  const [addingCard,     setAddingCard]     = useState(false);
  const [showAddMomo,    setShowAddMomo]    = useState(false);
  const [settingMomoDefault, setSettingMomoDefault] = useState(null);
  const [deletingMomo,       setDeletingMomo]        = useState(null);

  const cards = overview?.saved_cards || [];
  const momos = momoAccounts || [];

  // ── Card handlers ─────────────────────────────────────────────────────────
  const handleSetDefaultCard = useCallback(async (id) => {
    setSettingDefault(id);
    try { await createAxiosClient().patch(`/api/v1/payments/billing/cards/${id}/default/`); await refetch(); }
    catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Could not set default card.' }); }
    finally { setSettingDefault(null); }
  }, [refetch]);

  const handleDeleteCard = useCallback(async (id, name) => {
    const r = await Swal.fire({ title: 'Remove card?', html: `<span style="color:#6b7280;font-size:14px">Remove <strong style="color:#111">${name}</strong>?</span>`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Remove' });
    if (!r.isConfirmed) return;
    setDeleting(id);
    try { await createAxiosClient().delete(`/api/v1/payments/billing/cards/${id}/`); await refetch(); Swal.fire({ icon: 'success', title: 'Card removed', timer: 1800, showConfirmButton: false }); }
    catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Could not remove card.' }); }
    finally { setDeleting(null); }
  }, [refetch]);

  const handleAddCard = async () => {
    setAddingCard(true);
    try { const res = await createAxiosClient().post('/api/v1/payments/billing/add-card/'); if (res.data?.authorization_url) window.location.href = res.data.authorization_url; }
    catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Could not initiate card addition.' }); setAddingCard(false); }
  };

  // ── MoMo handlers ─────────────────────────────────────────────────────────
  const handleSetDefaultMomo = useCallback(async (id) => {
    setSettingMomoDefault(id);
    try { await createAxiosClient().patch(`/api/v1/payments/momo/${id}/default/`); await refetchMomo(); }
    catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Could not set default.' }); }
    finally { setSettingMomoDefault(null); }
  }, [refetchMomo]);

  const handleDeleteMomo = useCallback(async (id, name) => {
    const r = await Swal.fire({ title: 'Remove MoMo account?', html: `<span style="color:#6b7280;font-size:14px">Remove <strong style="color:#111">${name}</strong>?</span>`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#ef4444', confirmButtonText: 'Remove' });
    if (!r.isConfirmed) return;
    setDeletingMomo(id);
    try { await createAxiosClient().delete(`/api/v1/payments/momo/${id}/`); await refetchMomo(); Swal.fire({ icon: 'success', title: 'Account removed', timer: 1800, showConfirmButton: false }); }
    catch { Swal.fire({ icon: 'error', title: 'Error', text: 'Could not remove account.' }); }
    finally { setDeletingMomo(null); }
  }, [refetchMomo]);

  if (loading) return <Box>{[...Array(2)].map((_, i) => <Skeleton key={i} height={200} sx={{ borderRadius: '16px', mb: 2 }} />)}</Box>;
  if (error)   return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>;

  return (
    <Box>
      {/* ── Page header ──────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="flex-end" justifyContent="space-between" sx={{ mb: 4 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
            Payment Methods
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {cards.length + momos.length} method{cards.length + momos.length !== 1 ? 's' : ''} saved
          </Typography>
        </Box>
      </Stack>

      {/* ── SECTION 1: Mobile Money ──────────────────────────────────── */}
      <Box sx={{ mb: 5 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: '#FFCB00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PhoneAndroidIcon sx={{ fontSize: 16, color: '#111' }} />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={700} color="text.primary">Mobile Money</Typography>
              <Typography variant="caption" color="text.secondary">MTN, Vodafone, AirtelTigo</Typography>
            </Box>
          </Stack>
          {!showAddMomo && (
            <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={() => setShowAddMomo(true)}
              sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, fontSize: 12, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
              Add MoMo
            </Button>
          )}
        </Stack>

        {showAddMomo && (
          <Box sx={{ mb: 2 }}>
            <AddMomoForm onAdded={(acc) => { refetchMomo(); setShowAddMomo(false); }} onCancel={() => setShowAddMomo(false)} />
          </Box>
        )}

        {momos.length === 0 && !showAddMomo ? (
          <Box sx={{ py: 5, textAlign: 'center', borderRadius: '14px', border: '2px dashed', borderColor: 'divider', cursor: 'pointer', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }} onClick={() => setShowAddMomo(true)}>
            <PhoneAndroidIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>No MoMo accounts saved</Typography>
            <Typography variant="caption" color="text.disabled">Click to add MTN, Vodafone, or AirtelTigo</Typography>
          </Box>
        ) : (
          <Stack spacing={1.25}>
            {momos.map((acc) => (
              <MomoAccountRow key={acc.id} account={acc}
                onSetDefault={handleSetDefaultMomo} onDelete={handleDeleteMomo}
                isSettingDefault={settingMomoDefault === acc.id} isDeleting={deletingMomo === acc.id} />
            ))}
          </Stack>
        )}
      </Box>

      <Divider sx={{ mb: 5 }} />

      {/* ── SECTION 2: Cards ─────────────────────────────────────────── */}
      <Box sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{ width: 32, height: 32, borderRadius: '9px', bgcolor: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCardOutlinedIcon sx={{ fontSize: 16, color: 'background.paper' }} />
            </Box>
            <Box>
              <Typography variant="body1" fontWeight={700} color="text.primary">Credit & Debit Cards</Typography>
              <Typography variant="caption" color="text.secondary">Visa, Mastercard, Verve</Typography>
            </Box>
          </Stack>
          <Button size="small" variant="outlined" startIcon={<AddIcon sx={{ fontSize: 14 }} />} onClick={handleAddCard} disabled={addingCard}
            sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, fontSize: 12, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
            {addingCard ? 'Opening…' : 'Add card'}
          </Button>
        </Stack>

        {cards.length === 0 ? (
          <Box sx={{ py: 5, textAlign: 'center', borderRadius: '14px', border: '2px dashed', borderColor: 'divider', cursor: 'pointer', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }} onClick={handleAddCard}>
            <CreditCardOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={600}>No cards saved</Typography>
            <Typography variant="caption" color="text.disabled">Click to add a card via Paystack</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2,1fr)', lg: 'repeat(3,1fr)' }, gap: 2 }}>
            {cards.map((card) => (
              <CreditCard key={card.id} card={card} onSetDefault={handleSetDefaultCard} onDelete={handleDeleteCard}
                isSettingDefault={settingDefault === card.id} isDeleting={deleting === card.id} />
            ))}
          </Box>
        )}
      </Box>

      {/* ── Security note ─────────────────────────────────────────────── */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 2, py: 1.5, borderRadius: '10px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
        <LockOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled', flexShrink: 0 }} />
        <Typography variant="caption" color="text.secondary">
          Cards are tokenised by Paystack and never stored on our servers. MoMo numbers are stored securely and used only for subscription renewals. You can remove any payment method at any time.
        </Typography>
      </Stack>
    </Box>
  );
}