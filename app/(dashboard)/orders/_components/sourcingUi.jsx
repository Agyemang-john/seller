'use client';

// Shared pieces for imported / made-to-order items (backend order/sourcing.py):
// the panel on the order page and the Imported orders page both use them.
// `s` is a line's `sourcing` object from the seller API (line_info seller=True).
import { useState } from 'react';
import dayjs from 'dayjs';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { createAxiosClient } from '@/utils/clientFetch';

export const HEALTH = {
  late:     { label: 'Late',      hue: 'red' },
  overdue:  { label: 'Overdue',   hue: 'rose' },
  due_soon: { label: 'Due soon',  hue: 'amber' },
  on_track: { label: 'On track',  hue: 'green' },
};

export const STEP_ORDER = ['awaiting', 'ordered', 'in_transit', 'arrived'];

export const NEXT_ACTION = {
  awaiting:   { status: 'ordered',    label: 'I have ordered it from my supplier' },
  ordered:    { status: 'in_transit', label: 'It is on its way to me' },
  in_transit: { status: 'arrived',    label: 'It has arrived, ready to ship' },
};

export const fmtDate = (iso) => (iso ? dayjs(iso).format('MMM D, YYYY') : '—');
const fmtShort = (iso) => (iso ? dayjs(iso).format('MMM D') : '—');
const days = (n) => `${n} day${Math.abs(n) === 1 ? '' : 's'}`;

export async function postSourcing(orderId, body) {
  try {
    await createAxiosClient().post(`/api/v1/vendor/orders/${orderId}/sourcing/`, body);
    return null;
  } catch (err) {
    return err?.response?.data?.error || 'Could not update. Please try again.';
  }
}

export function HealthChip({ health }) {
  const theme = useTheme();
  const cfg = HEALTH[health];
  if (!cfg) return null;
  const c = theme.palette.status[cfg.hue];
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.65, px: 1.1, py: 0.4, borderRadius: '6px', bgcolor: c.bg, flexShrink: 0 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: c.dot }} />
      <Typography sx={{ fontSize: 11, fontWeight: 700, color: c.text, letterSpacing: '0.05em', lineHeight: 1, whiteSpace: 'nowrap' }}>
        {cfg.label.toUpperCase()}
      </Typography>
    </Box>
  );
}

/** "Day 27 of 47" with a bar, and days left until the customer's date. */
export function Countdown({ s }) {
  const theme = useTheme();
  if (!s.total_days) return null;
  const pct = Math.min(100, Math.max(0, (s.day_number / s.total_days) * 100));
  const hue = HEALTH[s.health]?.hue || 'blue';
  const left = s.days_left;
  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 0.5, gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontSize: 13, fontWeight: 600 }}>
          Day {Math.min(s.day_number, s.total_days)} of {s.total_days}
        </Typography>
        <Typography sx={{ fontSize: 13, color: left < 0 ? 'error.main' : 'text.secondary', fontWeight: left < 0 ? 600 : 400 }}>
          {left > 0 && `${days(left)} left · customer expects it by ${fmtDate(s.promised_by)}`}
          {left === 0 && `Due to the customer today (${fmtDate(s.promised_by)})`}
          {left < 0 && `${days(-left)} past the customer's date (${fmtDate(s.promised_by)})`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', '& .MuiLinearProgress-bar': { bgcolor: theme.palette.status[hue].dot, borderRadius: 3 } }}
      />
    </Box>
  );
}

/** Every step with the date it happened, or the date it is due. */
export function Timeline({ s }) {
  const done = STEP_ORDER.indexOf(s.status);
  const d = s.deadlines || {};
  const stepDate = (key) => s.steps?.find((x) => x.key === key)?.date;
  const rows = [
    { label: 'Order placed', date: s.placed_on, done: true },
    { label: 'Ordered from supplier', date: stepDate('ordered'), due: d.order_by, done: done >= 1 },
    { label: 'Shipped to you', date: stepDate('in_transit'), done: done >= 2 },
    {
      label: 'In your store', date: stepDate('arrived'), done: done >= 3,
      due: s.supplier_eta && done < 3 ? s.supplier_eta : d.arrive_by,
      dueLabel: s.supplier_eta && done < 3 ? 'supplier says' : 'by',
    },
    { label: 'Handed to courier', due: d.ship_by, done: false },
    { label: 'Customer receives it', due: s.promised_by, done: false },
  ];
  return (
    <Box component="ol" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 0.75 }}>
      {rows.map((r) => (
        <Box component="li" key={r.label} sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: 13 }}>
          <Box sx={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            bgcolor: r.done ? 'success.main' : 'transparent',
            border: '2px solid', borderColor: r.done ? 'success.main' : 'divider',
          }} />
          <Typography component="span" sx={{ fontSize: 13, flex: 1, color: r.done ? 'text.primary' : 'text.secondary' }}>
            {r.label}
          </Typography>
          <Typography component="span" sx={{ fontSize: 12.5, whiteSpace: 'nowrap', color: r.done ? 'text.primary' : 'text.secondary' }}>
            {r.done && r.date ? fmtDate(r.date) : r.due ? `${r.dueLabel || 'by'} ${fmtDate(r.due)}` : '—'}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/** What to do next and by when, coloured by urgency. */
export function NextDeadline({ s }) {
  if (!s.next_action) return null;
  const n = s.next_due_in;
  const severity = { late: 'error', overdue: 'error', due_soon: 'warning' }[s.health] || 'info';
  const when = n < 0
    ? `was due ${fmtShort(s.next_due)} (${days(-n)} ago)`
    : n === 0 ? 'due today' : `by ${fmtShort(s.next_due)} (in ${days(n)})`;
  return (
    <Alert severity={severity} sx={{ py: 0.25, '& .MuiAlert-message': { fontSize: 13 } }}>
      <b>Next:</b> {s.next_action} {when}.
      {s.health === 'late' && ' The customer can now cancel for a full refund 3 days after their date; message them with an update.'}
    </Alert>
  );
}

/** The supplier's arrival date and tracking number. Only the seller sees these. */
export function SupplierDetails({ orderId, s, onSaved }) {
  const [eta, setEta] = useState(s.supplier_eta || '');
  const [tracking, setTracking] = useState(s.supplier_tracking || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const dirty = eta !== (s.supplier_eta || '') || tracking !== (s.supplier_tracking || '');

  const save = async () => {
    setBusy(true);
    setError('');
    const err = await postSourcing(orderId, { supplier_eta: eta || null, supplier_tracking: tracking });
    setBusy(false);
    if (err) setError(err);
    else await onSaved?.();
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
        <TextField
          size="small" type="date" label="Supplier's arrival date" value={eta}
          onChange={(e) => setEta(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ min: dayjs().format('YYYY-MM-DD') }}
          sx={{ minWidth: 190 }}
        />
        <TextField
          size="small" label="Supplier tracking no." value={tracking}
          onChange={(e) => setTracking(e.target.value)}
          inputProps={{ maxLength: 120 }}
          sx={{ flex: 1 }}
        />
        <Button variant="outlined" onClick={save} disabled={busy || !dirty} sx={{ whiteSpace: 'nowrap' }}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
        Only you see these. They help you chase the supplier; the customer sees the steps and dates.
      </Typography>
      {s.supplier_eta_late && (
        <Alert severity="warning" sx={{ mt: 1, py: 0, '& .MuiAlert-message': { fontSize: 13 } }}>
          Your supplier&apos;s date is after {fmtDate(s.deadlines?.arrive_by)}, the day it should be in your store.
          The customer&apos;s date ({fmtDate(s.promised_by)}) may slip; message them now.
        </Alert>
      )}
      {error && <Alert severity="error" sx={{ mt: 1, py: 0 }}>{error}</Alert>}
    </Box>
  );
}
