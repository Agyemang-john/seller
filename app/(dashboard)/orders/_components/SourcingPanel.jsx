'use client';

// Imported / made-to-order items in this order (backend order/sourcing.py):
// the seller reports each step, the shopper sees it live on their order page.
import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { createAxiosClient } from '@/utils/clientFetch';

const NEXT_ACTION = {
  awaiting: { status: 'ordered', label: 'I have ordered it from my supplier' },
  ordered: { status: 'in_transit', label: 'It is on its way to me' },
  in_transit: { status: 'arrived', label: 'It has arrived, ready to ship' },
};

const formatDate = (iso) =>
  iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—';

export default function SourcingPanel({ orderId, lines, onUpdated }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const sourced = (lines || []).filter((l) => l.sourcing && l.status !== 'canceled');
  if (!sourced.length) return null;

  // All of this store's sourced lines move together; the earliest one decides the next step.
  const order = ['awaiting', 'ordered', 'in_transit', 'arrived'];
  const earliest = sourced.reduce((a, l) => (order.indexOf(l.sourcing.status) < order.indexOf(a) ? l.sourcing.status : a), 'arrived');
  const next = NEXT_ACTION[earliest];
  const promisedBy = sourced.map((l) => l.sourcing.promised_by).filter(Boolean).sort()[0];

  const advance = async () => {
    setBusy(true);
    setError('');
    try {
      await createAxiosClient().post(`/api/v1/vendor/orders/${orderId}/sourcing/`, { status: next.status });
      await onUpdated?.();
    } catch (err) {
      setError(err?.response?.data?.error || 'Could not update. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
      <Typography variant="subtitle1" fontWeight={700}>Items you need to get first</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Promised to the customer by <b>{formatDate(promisedBy)}</b>. Each update is shown to the customer.
        Until you mark it as ordered they can cancel for free, and after the promised date (plus 3 days) they can cancel for a full refund.
      </Typography>
      <Stack spacing={0.75} sx={{ mb: 1.5 }}>
        {sourced.map((l) => (
          <Box key={l.id} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, fontSize: 13 }}>
            <span>{l.product?.title} ×{l.quantity}</span>
            <Typography component="span" fontSize={13} fontWeight={600} color="primary">{l.sourcing.label}</Typography>
          </Box>
        ))}
      </Stack>
      {next ? (
        <Button variant="contained" onClick={advance} disabled={busy}>
          {busy ? 'Saving…' : next.label}
        </Button>
      ) : (
        <Alert severity="success" sx={{ py: 0 }}>Everything has arrived. Create the shipment below.</Alert>
      )}
      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
    </Paper>
  );
}
