'use client';

// Every imported / made-to-order item the store still has to get and ship,
// most urgent first (backend GET vendor/sourced-items/, order/sourcing.py).
// Items leave this page once handed to the courier.
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import useSWR from 'swr';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FlightLandRoundedIcon from '@mui/icons-material/FlightLandRounded';
import { fetcher } from '@/components/dashboard/DashboardUI';
import {
  Countdown, HealthChip, NEXT_ACTION, NextDeadline, SupplierDetails, Timeline, fmtDate, postSourcing,
} from '../../orders/_components/sourcingUi';

const FILTERS = [
  { value: '',                label: 'All',          count: (c) => c.late + c.overdue + c.due_soon + c.on_track },
  { value: 'late,overdue',    label: 'Behind',       count: (c) => c.late + c.overdue },
  { value: 'due_soon',        label: 'Due soon',     count: (c) => c.due_soon },
  { value: 'on_track',        label: 'On track',     count: (c) => c.on_track },
];

function ItemCard({ item, onChanged }) {
  const s = item.sourcing;
  const next = NEXT_ACTION[s.status];
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showSupplier, setShowSupplier] = useState(false);

  const advance = async () => {
    setBusy(true);
    setError('');
    const err = await postSourcing(item.order_id, { status: next.status });
    if (err) setError(err);
    else await onChanged();
    setBusy(false);
  };

  return (
    <Paper variant="outlined" sx={{ p: { xs: 1.75, sm: 2.25 }, borderRadius: '14px' }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Avatar variant="rounded" src={item.product?.image || undefined} sx={{ width: 52, height: 52, bgcolor: 'action.hover' }}>
          <FlightLandRoundedIcon sx={{ color: 'text.secondary' }} />
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
            <Typography sx={{ fontWeight: 700, fontSize: 15, lineHeight: 1.3, overflowWrap: 'anywhere' }}>
              {item.product?.title || 'Item'} ×{item.quantity}
            </Typography>
            <HealthChip health={s.health} />
          </Stack>
          {item.variant && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.variant}</Typography>}
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            <Link href={`/orders/${item.order_id}/detail`} style={{ color: 'inherit', fontWeight: 600 }}>
              Order #{item.order_number}
            </Link>
            {item.customer && ` · ${item.customer}`} · placed {fmtDate(s.placed_on)}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={1.5}>
        <Countdown s={s} />
        <NextDeadline s={s} />
        <Timeline s={s} />
      </Stack>

      {s.supplier_tracking && !showSupplier && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Supplier tracking: <b>{s.supplier_tracking}</b>
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
        {next ? (
          <Button variant="contained" size="small" onClick={advance} disabled={busy}>
            {busy ? 'Saving…' : next.label}
          </Button>
        ) : (
          <Button variant="contained" size="small" component={Link} href={`/orders/${item.order_id}/detail`}>
            Create the shipment
          </Button>
        )}
        {next && (
          <Button size="small" variant="outlined" onClick={() => setShowSupplier((v) => !v)}>
            {showSupplier ? 'Hide supplier details' : 'Supplier date & tracking'}
          </Button>
        )}
        <Button size="small" component={Link} href={`/orders/${item.order_id}/detail`}>Open order</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 1, py: 0 }}>{error}</Alert>}

      <Collapse in={showSupplier} unmountOnExit>
        <Box sx={{ mt: 2 }}>
          <SupplierDetails orderId={item.order_id} s={s} onSaved={onChanged} />
        </Box>
      </Collapse>
    </Paper>
  );
}

export default function ImportedOrders() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const health = searchParams.get('health') || '';

  const url = `/api/v1/vendor/sourced-items/${health ? `?health=${encodeURIComponent(health)}` : ''}`;
  const { data, error, isLoading, mutate } = useSWR(url, fetcher, { refreshInterval: 5 * 60 * 1000 });
  const counts = data?.counts || { late: 0, overdue: 0, due_soon: 0, on_track: 0 };

  const setFilter = (value) => {
    const p = new URLSearchParams(searchParams.toString());
    if (value) p.set('health', value); else p.delete('health');
    router.replace(`${pathname}${p.toString() ? `?${p}` : ''}`, { scroll: false });
  };

  return (
    <Box>
      <Box sx={{ mb: 2.5 }}>
        <Typography sx={{ fontSize: { xs: 22, sm: 28, md: 36 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, mb: 0.75 }}>
          Imported orders
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
          Items customers bought that you get from a supplier first. Each one shows the day it was ordered,
          what to do next and how many days are left before the date the customer was promised.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 2.5, overflowX: 'auto', pb: 0.5 }}>
        {FILTERS.map((f) => {
          const n = f.count(counts);
          const selected = health === f.value;
          return (
            <Chip
              key={f.value || 'all'}
              label={`${f.label}${data ? ` · ${n}` : ''}`}
              onClick={() => setFilter(f.value)}
              color={selected ? (f.value === 'late,overdue' && n ? 'error' : 'primary') : 'default'}
              variant={selected ? 'filled' : 'outlined'}
              sx={{ fontWeight: 600, flexShrink: 0 }}
            />
          );
        })}
      </Stack>

      {error && <Alert severity="error">Could not load imported orders. Please refresh.</Alert>}

      {isLoading && (
        <Stack spacing={1.5}>
          {[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: '14px' }} />)}
        </Stack>
      )}

      {data && data.items.length === 0 && (
        <Paper variant="outlined" sx={{ p: 5, borderRadius: '14px', textAlign: 'center' }}>
          <FlightLandRoundedIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
          <Typography fontWeight={700}>{health ? 'Nothing here' : 'No imported items waiting'}</Typography>
          <Typography variant="body2" color="text.secondary">
            {health
              ? 'No items match this filter.'
              : 'When a customer buys something you import or make to order, it shows here until you ship it.'}
          </Typography>
        </Paper>
      )}

      {data && data.items.length > 0 && (
        <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' } }}>
          {data.items.map((item) => <ItemCard key={item.id} item={item} onChanged={() => mutate()} />)}
        </Box>
      )}
    </Box>
  );
}
