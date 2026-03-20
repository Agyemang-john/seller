// app/vendor/billing/page.jsx  — Overview tab
'use client';

import { Box, Grid, Typography, Stack, Button, Chip, LinearProgress, Skeleton, Alert } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
// import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { useRouter } from 'next/navigation';
import { useBillingOverview } from '@/hooks/useBilling';
import { createAxiosClient } from '@/utils/clientFetch';
import Swal from 'sweetalert2';
import { useState } from 'react';
// import PageContainer from '@/components/PageContainer';

const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

const STATUS_CHIP = {
  active:   { label: 'Active',   color: '#22c55e', bg: 'rgba(34,197,94,0.1)'   },
  trial:    { label: 'Trial',    color: '#3b82f6', bg: 'rgba(59,130,246,0.1)'  },
  expired:  { label: 'Expired',  color: '#ef4444', bg: 'rgba(239,68,68,0.1)'   },
  cancelled:{ label: 'Cancelled',color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' },
  past_due: { label: 'Past Due', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)'  },
};

const TXN_STATUS = {
  success: { color: '#22c55e' },
  failed:  { color: '#ef4444' },
  pending: { color: '#f59e0b' },
  refunded:{ color: '#8b5cf6' },
};

function SectionLabel({ children }) {
  return (
    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 2 }}>
      {children}
    </Typography>
  );
}

export default function BillingOverviewPage() {
  const router = useRouter();
  const { overview, loading, error, refetch } = useBillingOverview();
  const [paying, setPaying] = useState(false);
  const [togglingRenew, setTogglingRenew] = useState(false);

  const sub   = overview?.subscription;
  const usage = overview?.usage;
  const txns  = overview?.recent_transactions || [];
  const cards = overview?.saved_cards || [];

  const handlePayNow = async () => {
    setPaying(true);
    try {
      const client = createAxiosClient();
      await client.post('/api/v1/payments/billing/pay-now/');
      await refetch();
      Swal.fire({ icon: 'success', title: 'Payment successful', timer: 2000, showConfirmButton: false });
    } catch (err) {
      const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Payment failed.';
      if (err?.response?.data?.error === 'no_default_card') {
        Swal.fire({ icon: 'warning', title: 'No payment card', text: 'Add a card first from the Cards tab.', confirmButtonText: 'Go to Cards' })
          .then((r) => { if (r.isConfirmed) router.push('/vendor/billing/cards'); });
      } else {
        Swal.fire({ icon: 'error', title: 'Payment failed', text: msg });
      }
    } finally {
      setPaying(false);
    }
  };

  const handleToggleAutoRenew = async () => {
    if (!sub) return;
    setTogglingRenew(true);
    try {
      const client = createAxiosClient();
      await client.patch('/api/v1/payments/auto-renew/', { auto_renew: !sub.auto_renew });
      await refetch();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not update auto-renew.' });
    } finally {
      setTogglingRenew(false);
    }
  };

  if (loading) return <OverviewSkeleton />;
  if (error)   return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>;

  const st = sub ? (STATUS_CHIP[sub.status] ?? STATUS_CHIP.active) : null;

  return (
    <Box>
      {/* ── Current plan card ────────────────────────────────────────── */}
      <Box sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden', mb: 3 }}>
        {/* Dark header */}
        <Box sx={{ bgcolor: 'action.main', px: { xs: 2.5, md: 3 }, py: { xs: 2.5, md: 3 } }}>
          {sub ? (
            <Grid container alignItems="flex-start" spacing={2}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                  <Chip label={st.label} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: st.bg, color: st.color, borderRadius: '5px', '& .MuiChip-label': { px: 1 } }} />
                  {sub.auto_renew && <Chip label="Auto-renew on" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600, bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)', borderRadius: '5px', '& .MuiChip-label': { px: 1 } }} />}
                </Stack>
                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 26, md: 34 }, fontWeight: 700, letterSpacing: '-1px', color: '1#ffffff', lineHeight: 1.1, mb: 0.75 }}>
                  {sub.plan.name}
                </Typography>
                <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  {ghs(sub.plan.price)} / {sub.plan.billing_cycle_display.toLowerCase()} · {sub.plan.commission_display} commission · {sub.plan.payout_delay_days}d payout
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Stack spacing={1} alignItems={{ md: 'flex-end' }}>
                  <Box sx={{ textAlign: { md: 'right' } }}>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', mb: 0.25 }}>
                      {sub.status === 'active' ? 'Renews' : 'Expires'}
                    </Typography>
                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                      {fmtDate(sub.end_date)}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', mt: 0.3 }}>
                      {sub.days_remaining} days remaining
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                    {sub.status === 'past_due' && (
                      <Button size="small" variant="contained" disableElevation onClick={handlePayNow} disabled={paying}
                        sx={{ bgcolor: '#ef4444', color: '#ffffff', borderRadius: '8px', fontWeight: 700, fontSize: 12, '&:hover': { bgcolor: '#dc2626' } }}>
                        {paying ? 'Processing…' : 'Pay now'}
                      </Button>
                    )}
                    <Button size="small" variant="outlined" onClick={() => router.push('/billing/plans')}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                      sx={{ borderRadius: '8px', borderColor: 'rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600, '&:hover': { borderColor: '#ffffff', color: '#ffffff' } }}>
                      Change plan
                    </Button>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Stack alignItems="flex-start" spacing={2}>
              <Box>
                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px', mb: 0.5 }}>No active plan</Typography>
                <Typography sx={{ color: 'text.primary', fontSize: 14 }}>Subscribe to unlock all vendor features and start selling.</Typography>
              </Box>
              <Button variant="contained" disableElevation onClick={() => router.push('/billing/plans')}
                sx={{ bgcolor: 'action.main', color: 'action.main', borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: 'rgba(255,255,255,0.88)', color: 'text.primary' } }}>
                View plans
              </Button>
            </Stack>
          )}
        </Box>

        {/* Metrics row */}
        {sub && (
          <Grid container sx={{ borderTop: '1px solid', borderColor: 'divider' }}>
            {[
              { label: 'Plan tier',    value: sub.plan.tier_display },
              { label: 'Max products', value: sub.plan.max_products === 999999 ? 'Unlimited' : sub.plan.max_products },
              { label: 'Commission',   value: sub.plan.commission_display },
              { label: 'Payout delay', value: `${sub.plan.payout_delay_days} days` },
            ].map((m, i, arr) => (
              <Grid key={m.label} size={{ xs: 6, sm: 3 }}>
                <Box sx={{ p: '14px 20px', borderRight: i < arr.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', mb: 0.3 }}>{m.label}</Typography>
                  <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, lineHeight: 1 }} color="text.primary">{m.value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* ── Left column ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>

          {/* Usage */}
          {usage && sub && (
            <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
              <SectionLabel>Product usage</SectionLabel>
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong style={{ color: 'inherit', fontWeight: 700 }}>{usage.active_products_count}</strong> of {usage.max_products === 999999 ? 'unlimited' : usage.max_products} products used
                </Typography>
                <Typography variant="caption" color={usage.usage_pct > 80 ? 'error.main' : 'text.disabled'} fontWeight={700}>
                  {usage.usage_pct}%
                </Typography>
              </Stack>
              <LinearProgress variant="determinate" value={Math.min(usage.usage_pct, 100)} sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: usage.usage_pct > 80 ? 'error.main' : 'text.primary' } }} />
              {usage.usage_pct > 80 && (
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="error.main">Running low — consider upgrading your plan.</Typography>
                  <Button size="small" onClick={() => router.push('/billing/plans')} sx={{ fontSize: 11, fontWeight: 600, color: 'text.primary', p: 0 }}>Upgrade →</Button>
                </Stack>
              )}
            </Box>
          )}

          {/* Recent transactions */}
          <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
              <SectionLabel>Recent transactions</SectionLabel>
              <Button size="small" onClick={() => router.push('/billing/history')} endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', p: 0, '&:hover': { color: 'text.primary' } }}>
                See all
              </Button>
            </Stack>
            {txns.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ReceiptLongOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.disabled">No transactions yet</Typography>
              </Box>
            ) : (
              txns.map((txn, i) => {
                const sc = TXN_STATUS[txn.status] ?? { color: '#94a3b8' };
                return (
                  <Stack key={txn.id} direction="row" alignItems="center" sx={{ px: 3, py: 1.75, borderBottom: i < txns.length - 1 ? '1px solid' : 'none', borderColor: 'divider', '&:hover': { bgcolor: 'action.hover' } }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.2 }}>{txn.type_display}</Typography>
                      <Typography variant="caption" color="text.disabled">{txn.plan_name} · {txn.card_last4 || 'Card'} · {new Date(txn.created_at).toLocaleDateString('en-GH', { month: 'short', day: 'numeric', year: 'numeric' })}</Typography>
                    </Box>
                    <Stack alignItems="flex-end" spacing={0.25} sx={{ flexShrink: 0 }}>
                      <Typography variant="body2" fontWeight={700} color="text.primary">{txn.amount_formatted}</Typography>
                      <Typography variant="caption" sx={{ color: sc.color, fontWeight: 600, fontSize: 10 }}>{txn.status_display}</Typography>
                    </Stack>
                  </Stack>
                );
              })
            )}
          </Box>
        </Grid>

        {/* ── Right column ─────────────────────────────────────────────── */}
        <Grid size={{ xs: 12, md: 5 }}>

          {/* Auto-renew toggle */}
          {sub && (
            <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
              <SectionLabel>Auto-renewal</SectionLabel>
              <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                <Box>
                  <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ mb: 0.4 }}>
                    {sub.auto_renew ? 'Enabled' : 'Disabled'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {sub.auto_renew
                      ? `Your plan renews automatically on ${fmtDate(sub.end_date)}.`
                      : 'Your plan will expire on the end date and not renew.'}
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={handleToggleAutoRenew} disabled={togglingRenew}
                  startIcon={sub.auto_renew ? <CancelOutlinedIcon sx={{ fontSize: 14 }} /> : <AutorenewIcon sx={{ fontSize: 14 }} />}
                  sx={{ flexShrink: 0, borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, fontSize: 12, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
                  {sub.auto_renew ? 'Turn off' : 'Enable'}
                </Button>
              </Stack>
            </Box>
          )}

          {/* Default card */}
          <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
              <SectionLabel>Payment method</SectionLabel>
              <Button size="small" onClick={() => router.push('/billing/cards')} endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
                sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', p: 0, '&:hover': { color: 'text.primary' } }}>
                Manage
              </Button>
            </Stack>
            {cards.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Typography variant="body2" color="text.disabled" sx={{ mb: 1.5 }}>No payment cards saved</Typography>
                <Button size="small" variant="outlined" onClick={() => router.push('/billing/cards')}
                  sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
                  Add a card
                </Button>
              </Box>
            ) : (
              <Stack spacing={1}>
                {cards.slice(0, 2).map((card) => (
                  <Stack key={card.id} direction="row" alignItems="center" spacing={1.5}
                    sx={{ p: '10px 14px', borderRadius: '10px', bgcolor: card.is_default ? 'action.selected' : 'action.hover', border: '1px solid', borderColor: card.is_default ? 'text.disabled' : 'transparent' }}>
                    <Box sx={{ width: 36, height: 24, borderRadius: '6px', bgcolor: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 700, color: 'background.paper', letterSpacing: '0.04em' }}>{card.card_type.toUpperCase().slice(0, 4)}</Typography>
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={600} color="text.primary">{card.display_name}</Typography>
                      <Typography variant="caption" color="text.disabled">Exp {card.expiry_display}</Typography>
                    </Box>
                    {card.is_default && <Chip label="Default" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
                    {card.is_expired && <Chip label="Expired" size="small" sx={{ height: 18, fontSize: 9, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '4px', '& .MuiChip-label': { px: 0.75 } }} />}
                  </Stack>
                ))}
                {cards.length > 2 && (
                  <Button size="small" onClick={() => router.push('/billing/cards')}
                    sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
                    +{cards.length - 2} more cards
                  </Button>
                )}
              </Stack>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function OverviewSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '20px', mb: 3 }} />
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 7 }}><Skeleton height={180} sx={{ borderRadius: '16px', mb: 2 }} /><Skeleton height={260} sx={{ borderRadius: '16px' }} /></Grid>
        <Grid size={{ xs: 12, md: 5 }}><Skeleton height={120} sx={{ borderRadius: '16px', mb: 2 }} /><Skeleton height={200} sx={{ borderRadius: '16px' }} /></Grid>
      </Grid>
    </Box>
  );
}