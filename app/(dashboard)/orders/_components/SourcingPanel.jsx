'use client';

// Imported / made-to-order items in this order (backend order/sourcing.py):
// the seller reports each step, the shopper sees it live on their order page.
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Countdown, HEALTH, HealthChip, NEXT_ACTION, NextDeadline, STEP_ORDER, SupplierDetails, Timeline, postSourcing,
} from './sourcingUi';

const URGENCY = Object.keys(HEALTH);

export default function SourcingPanel({ orderId, lines, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sourced = (lines || []).filter((l) => l.sourcing && l.status !== 'canceled');
  if (!sourced.length) return null;

  // All of this store's sourced lines move together; the earliest step decides
  // the next action and the most urgent line drives the dates shown.
  const earliest = sourced.reduce(
    (a, l) => (STEP_ORDER.indexOf(l.sourcing.status) < STEP_ORDER.indexOf(a) ? l.sourcing.status : a), 'arrived');
  const next = NEXT_ACTION[earliest];
  const rank = (l) => (l.sourcing.health ? URGENCY.indexOf(l.sourcing.health) : URGENCY.length);
  const lead = [...sourced].sort((a, b) => rank(a) - rank(b))[0].sourcing;

  const advance = async () => {
    setBusy(true);
    setError('');
    const err = await postSourcing(orderId, { status: next.status });
    if (err) setError(err);
    else await onUpdated?.();
    setBusy(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
        <Typography variant="subtitle1" fontWeight={700}>Items you need to get first</Typography>
        <HealthChip health={lead.health} />
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Each update is shown to the customer. Until you mark it as ordered they can cancel for free,
        and 3 days after their date they can cancel for a full refund.
      </Typography>

      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
        {sourced.map((l) => (
          <Box key={l.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, fontSize: 13 }}>
            <span>{l.product?.title} ×{l.quantity}</span>
            <Typography component="span" fontSize={13} fontWeight={600} color="primary">{l.sourcing.label}</Typography>
          </Box>
        ))}
      </Stack>

      <Stack spacing={1.5}>
        <Countdown s={lead} />
        <NextDeadline s={lead} />
        <Timeline s={lead} />
      </Stack>

      <Box sx={{ mt: 2 }}>
        {next ? (
          <Button variant="contained" onClick={advance} disabled={busy}>
            {busy ? 'Saving…' : next.label}
          </Button>
        ) : (
          <Alert severity="success" sx={{ py: 0 }}>Everything has arrived. Create the shipment below.</Alert>
        )}
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
      </Box>

      {next && (
        <>
          <Divider sx={{ my: 2 }} />
          <SupplierDetails orderId={orderId} s={lead} onSaved={onUpdated} />
        </>
      )}
    </Paper>
  );
}
