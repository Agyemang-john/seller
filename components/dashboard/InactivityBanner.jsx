'use client';

import { Alert, AlertTitle, Button, Collapse } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import useSWR from 'swr';
import { fetcher } from '@/components/dashboard/DashboardUI';

/**
 * Displays an inactivity warning or auto-closed notice at the top of the
 * dashboard. Data comes from the vendor status endpoint which already exists.
 *
 * - inactivity_auto_closed=true  → red "Your shop is closed" banner
 * - days_until_closure ≤ 7      → orange "You'll be closed in N days" banner
 */
export default function InactivityBanner() {
  const { data } = useSWR('/api/v1/vendor/my-status/', fetcher, {
    refreshInterval: 5 * 60 * 1000, // re-check every 5 min
    revalidateOnFocus: true,
  });

  if (!data) return null;

  const { inactivity_auto_closed, days_until_inactivity_close } = data;

  if (inactivity_auto_closed) {
    return (
      <Collapse in>
        <Alert
          severity="error"
          icon={<LockOutlinedIcon />}
          sx={{ mb: 2, borderRadius: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              variant="outlined"
              href="/dashboard"
              sx={{ whiteSpace: 'nowrap' }}
            >
              You&apos;re back — shop reopened
            </Button>
          }
        >
          <AlertTitle>Your shop is temporarily closed</AlertTitle>
          We detected prolonged inactivity and hid your shop from customers. Now
          that you&apos;re back, your shop will reopen automatically. Browse the
          dashboard to confirm everything looks good.
        </Alert>
      </Collapse>
    );
  }

  if (
    typeof days_until_inactivity_close === 'number' &&
    days_until_inactivity_close <= 7
  ) {
    const urgent = days_until_inactivity_close <= 3;
    return (
      <Collapse in>
        <Alert
          severity={urgent ? 'warning' : 'info'}
          icon={<WarningAmberIcon />}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          <AlertTitle>
            {urgent ? '⚠️ Urgent: ' : ''}Your shop closes in{' '}
            {days_until_inactivity_close} day
            {days_until_inactivity_close !== 1 ? 's' : ''}
          </AlertTitle>
          You haven&apos;t been active for a while. Simply browsing the
          dashboard counts as activity and resets the timer.
        </Alert>
      </Collapse>
    );
  }

  return null;
}
