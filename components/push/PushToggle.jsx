'use client';

// "Notifications on this device" for the seller dashboard (backend: push/).

import { useEffect, useState } from 'react';
import { Box, Switch, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { disablePush, enablePush, pushState } from '@/utils/push';

const HINT = {
  unsupported: "This browser can't show notifications. On iPhone, add the dashboard to your Home Screen first.",
  denied: 'Notifications are blocked for this site in your browser settings.',
  off: 'Get new orders, messages, questions and claims on this device, even when the dashboard is closed.',
  on: "You'll get store updates on this device.",
};

export default function PushToggle() {
  const [state, setState] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { pushState().then(setState).catch(() => setState('unsupported')); }, []);

  if (state === null || state === 'disabled') return null;

  const toggle = async (on) => {
    setBusy(true);
    try {
      setState(on ? await enablePush() : await disablePush());
    } catch {
      toast.error('Could not change notification settings.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, p: 2, border: 1, borderColor: 'divider', borderRadius: 2, mb: 3 }}>
      <Box sx={{ flex: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Notifications on this device</Typography>
        <Typography variant="body2" color="text.secondary">{HINT[state]}</Typography>
      </Box>
      <Switch checked={state === 'on'} disabled={busy || state === 'unsupported' || state === 'denied'}
              onChange={(e) => toggle(e.target.checked)} inputProps={{ 'aria-label': 'Notifications on this device' }} />
    </Box>
  );
}
