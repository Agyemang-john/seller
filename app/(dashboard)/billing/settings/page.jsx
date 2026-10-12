'use client';
// app/vendor/billing/settings/page.jsx
// Settings tab: billing details and auto-renew.

import { useState, useEffect } from 'react';
import { Box, Typography, Stack, Button, Alert, Skeleton } from '@mui/material';
import AutorenewIcon from '@mui/icons-material/Autorenew';
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

// The Free plan has a 100-year record; it isn't a subscription to manage.
const paidOnly = (sub) => (sub && parseFloat(sub.plan?.price) > 0 ? sub : null);

export default function BillingSettingsPage() {
  const { overview, loading, error, refetch } = useBillingOverview();
  const { data: profile, mutate: refetchProfile } = useSWR('/api/v1/payments/billing/profile/', fetcher, { revalidateOnFocus: false });

  const [togglingRenew, setTogglingRenew] = useState(false);

  const sub = paidOnly(overview?.subscription);

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
      <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', mb: 0.5 }} color="text.primary">
        Billing Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Manage your billing details and renewal preferences
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
      <SectionCard>
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
                {togglingRenew ? 'Updating…' : sub.auto_renew ? 'Turn off auto-renew' : sub.cancel_at_period_end ? 'Keep my plan' : 'Turn on auto-renew'}
              </Button>
            </Stack>

            {!sub.auto_renew && (
              <Alert severity="warning" sx={{ borderRadius: '10px' }}>
                Auto-renew is off. Your {sub.plan.name} plan ends on {fmtDate(sub.end_date)}, then your store moves to Free.
              </Alert>
            )}
          </>
        )}
      </SectionCard>

    </Box>
  );
}