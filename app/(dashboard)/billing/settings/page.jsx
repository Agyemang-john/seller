'use client';
// app/vendor/billing/settings/page.jsx
// Settings tab: billing details, auto-renew, notification preferences.

import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Switch, FormControlLabel, Alert, Skeleton, Divider } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import BillingDetailsForm from '../../subscribe/_components/Billingdetailsform';
import { useBillingOverview } from '@/hooks/useBilling';
import { createAxiosClient } from '@/utils/clientFetch';
import useSWR from 'swr';
import Swal from 'sweetalert2';

const fetcher = (url) => createAxiosClient().get(url).then((r) => r.data);

function SectionLabel({ children }) {
  return (
    <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 2 }}>
      {children}
    </Typography>
  );
}

function SectionCard({ children, sx }) {
  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', ...sx }}>
      {children}
    </Box>
  );
}

export default function BillingSettingsPage() {
  const { overview, loading, error, refetch } = useBillingOverview();
  const { data: profile, mutate: refetchProfile } = useSWR('/api/v1/payments/billing/profile/', fetcher, { revalidateOnFocus: false });

  const [togglingRenew, setTogglingRenew] = useState(false);
  const [emailOnRenew,  setEmailOnRenew]  = useState(true);
  const [emailOnFail,   setEmailOnFail]   = useState(true);

  const sub = overview?.subscription;

  const handleToggleAutoRenew = async () => {
    if (!sub) return;
    setTogglingRenew(true);
    try {
      await createAxiosClient().patch('/api/v1/payments/auto-renew/', { auto_renew: !sub.auto_renew });
      await refetch();
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Could not update auto-renewal.' });
    } finally {
      setTogglingRenew(false);
    }
  };

  if (loading) return (
    <Box>
      <Skeleton width={180} height={32} sx={{ mb: 3 }} />
      <Skeleton height={300} sx={{ borderRadius: '16px', mb: 3 }} />
      <Skeleton height={180} sx={{ borderRadius: '16px' }} />
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>;

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GH', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', mb: 0.5 }} color="text.primary">
        Billing Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your billing details, renewal preferences, and notifications
      </Typography>

      {/* ── 1. Billing details ───────────────────────────────────────── */}
      <SectionLabel>Billing details</SectionLabel>
      <SectionCard sx={{ mb: 4 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
          This information appears on your invoices and is used to pre-fill payment forms. Your billing email may differ from your login email.
        </Typography>
        <BillingDetailsForm
          profile={profile}
          onProfileSaved={(p) => refetchProfile()}
          compact={false}
        />
      </SectionCard>

      {/* ── 2. Auto-renewal ──────────────────────────────────────────── */}
      <SectionLabel>Renewal settings</SectionLabel>
      <SectionCard sx={{ mb: 4 }}>
        {!sub ? (
          <Typography variant="body2" color="text.disabled">No active subscription to configure.</Typography>
        ) : (
          <>
            <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'flex-start' }} justifyContent="space-between" spacing={2} sx={{ mb: 2.5 }}>
              <Box>
                <Typography variant="body1" fontWeight={700} color="text.primary" sx={{ mb: 0.5 }}>
                  Automatic renewal
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 420 }}>
                  {sub.auto_renew
                    ? `Your ${sub.plan.name} plan will automatically renew on ${fmtDate(sub.end_date)} using your default payment method.`
                    : `Your plan expires on ${fmtDate(sub.end_date)} and will not renew automatically.`}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AutorenewIcon sx={{ fontSize: 16 }} />}
                onClick={handleToggleAutoRenew}
                disabled={togglingRenew}
                sx={{
                  flexShrink: 0, borderRadius: '10px', fontWeight: 600,
                  borderColor: sub.auto_renew ? 'error.light' : 'divider',
                  color: sub.auto_renew ? 'error.main' : 'text.secondary',
                  '&:hover': { borderColor: sub.auto_renew ? 'error.main' : 'text.primary', color: sub.auto_renew ? 'error.main' : 'text.primary' },
                }}
              >
                {togglingRenew ? 'Updating…' : sub.auto_renew ? 'Turn off auto-renew' : 'Enable auto-renew'}
              </Button>
            </Stack>

            {!sub.auto_renew && (
              <Box sx={{ px: 2, py: 1.5, borderRadius: '10px', bgcolor: 'warning.lighter', border: '1px solid', borderColor: 'warning.light' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.dark', lineHeight: 1.6 }}>
                  ⚠ Auto-renew is off. Your subscription will expire on {fmtDate(sub.end_date)}. You will need to manually renew to keep your vendor access.
                </Typography>
              </Box>
            )}
          </>
        )}
      </SectionCard>

      {/* ── 3. Notification preferences ─────────────────────────────── */}
      <SectionLabel>Email notifications</SectionLabel>
      <SectionCard>
        <Stack direction="row" alignItems="flex-start" spacing={2} sx={{ mb: 0.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <NotificationsOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, flex: 1 }}>
            Control which billing emails you receive. These are sent to your billing email address.
          </Typography>
        </Stack>

        <Divider sx={{ my: 2.5 }} />

        <Stack spacing={2}>
          {[
            { label: 'Renewal reminder',       desc: 'Receive a reminder 7 days before your subscription renews.',     state: emailOnRenew, set: setEmailOnRenew },
            { label: 'Payment failed',         desc: 'Get notified immediately when a payment attempt fails.',          state: emailOnFail,  set: setEmailOnFail  },
          ].map(({ label, desc, state, set }) => (
            <Stack key={label} direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">{label}</Typography>
                <Typography variant="caption" color="text.secondary">{desc}</Typography>
              </Box>
              <Switch
                checked={state}
                onChange={(e) => set(e.target.checked)}
                size="small"
                sx={{ flexShrink: 0, mt: 0.25, '& .MuiSwitch-track': { borderRadius: '10px' } }}
              />
            </Stack>
          ))}
        </Stack>

        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2.5 }}>
          Note: Critical security and billing notifications cannot be disabled.
        </Typography>
      </SectionCard>
    </Box>
  );
}