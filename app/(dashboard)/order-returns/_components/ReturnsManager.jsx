'use client';

/**
 * Seller returns queue (backend: vendor/operations_views.py, order/returns.py).
 *
 *   Requested → seller approves or rejects (rejection needs a reason the customer sees)
 *   Approved  → item comes back → seller confirms receipt
 *   Received  → Negromart refunds the customer and debits the seller's balance
 */

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Avatar, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent,
  DialogTitle, Divider, Pagination, Skeleton, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError, formatDate, formatMoney } from '@/libs/seller-ops';

const TABS = [
  { value: 'requested', label: 'To review' },
  { value: 'approved', label: 'Awaiting item' },
  { value: 'received', label: 'Received' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
];

const STATUS_COLOR = {
  requested: 'warning', approved: 'info', received: 'info', refunded: 'success', rejected: 'default', cancelled: 'default',
};

export default function ReturnsManager() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const reference = params.get('ref') || '';
  const status = params.get('status') || (reference ? 'all' : 'requested');
  const page = Math.max(1, Number(params.get('page') || 1));

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [decision, setDecision] = useState(null); // { item, action }

  const navigate = (next) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v === '' || v == null ? q.delete(k) : q.set(k, v)));
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const load = useCallback(async () => {
    setError('');
    try {
      const { data: res } = await createAxiosClient().get('/api/v1/vendor/returns/', {
        params: { status: status === 'all' ? undefined : status, ref: reference || undefined, page },
      });
      setData(res);
    } catch (err) {
      setError(apiError(err, 'Could not load returns.'));
    }
  }, [status, reference, page]);

  useEffect(() => { load(); }, [load]);

  const runAction = async (item, action, note = '') => {
    try {
      await createAxiosClient().post(`/api/v1/vendor/returns/${item.reference}/${action}/`, { note });
      toast.success({
        approve: 'Return approved. The customer has been notified.',
        reject: 'Return rejected. The customer has been notified.',
        receive: 'Marked as received. Negromart will refund the customer.',
      }[action]);
      setDecision(null);
      load();
    } catch (err) {
      toast.error(apiError(err));
    }
  };

  const pages = data ? Math.max(1, Math.ceil(data.count / 25)) : 1;

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Review return requests quickly. Approve to have the item collected, or reject with a clear reason.
        Once you confirm the item is back, Negromart refunds the customer and deducts the amount from your balance.
      </Typography>

      {reference ? (
        <Alert severity="info" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => navigate({ ref: '' })}>Show all</Button>}>
          Showing return {reference}
        </Alert>
      ) : (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={status}
            onChange={(_, v) => navigate({ status: v, page: '' })}
            variant="scrollable"
            sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 600 } }}
          >
            {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
          </Tabs>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        {!data ? (
          <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={72} />)}</Stack>
        ) : data.results.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            No returns here.
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            {data.results.map((item) => (
              <ReturnRow key={item.reference} item={item} onAction={(action) => (
                action === 'receive' ? runAction(item, 'receive') : setDecision({ item, action })
              )} />
            ))}
          </Stack>
        )}
      </Card>

      {pages > 1 && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination count={pages} page={page} onChange={(_, p) => navigate({ page: p })} shape="rounded" />
        </Stack>
      )}

      <DecisionDialog decision={decision} onClose={() => setDecision(null)} onConfirm={runAction} />
    </Box>
  );
}

function ReturnRow({ item, onAction }) {
  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
      <Avatar variant="rounded" src={item.product_image || undefined} sx={{ width: 56, height: 56, bgcolor: 'action.hover' }}>
        {item.product_title?.[0]}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{item.product_title || 'Product'}</Typography>
          <Chip size="small" label={item.status_label} color={STATUS_COLOR[item.status] || 'default'} variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {item.reason_label} · Qty {item.quantity} of {item.line_quantity} · Order {item.order_number} · {item.customer_name}
        </Typography>
        {item.details && (
          <Typography variant="body2" sx={{ mt: 0.75, whiteSpace: 'pre-wrap' }}>“{item.details}”</Typography>
        )}
        {item.seller_note && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Your note: {item.seller_note}
          </Typography>
        )}
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.75 }}>
          {item.reference} · requested {formatDate(item.created_at, true)}
        </Typography>
      </Box>

      <Box sx={{ textAlign: { md: 'right' }, minWidth: 160 }}>
        <Typography sx={{ fontWeight: 700 }}>{formatMoney(item.refund_amount)}</Typography>
        <Typography variant="caption" color="text.secondary">Refund amount</Typography>
        <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }} sx={{ mt: 1.25 }}>
          {item.status === 'requested' && (
            <>
              <Button size="small" variant="outlined" color="inherit" onClick={() => onAction('reject')}>Reject</Button>
              <Button size="small" variant="contained" onClick={() => onAction('approve')}>Approve</Button>
            </>
          )}
          {item.status === 'approved' && (
            <Button size="small" variant="contained" onClick={() => onAction('receive')}>Mark item received</Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

function DecisionDialog({ decision, onClose, onConfirm }) {
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setNote(''); }, [decision]);
  if (!decision) return null;

  const rejecting = decision.action === 'reject';
  const tooShort = rejecting && note.trim().length < 10;

  const submit = async () => {
    setBusy(true);
    await onConfirm(decision.item, decision.action, note);
    setBusy(false);
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{rejecting ? 'Reject return' : 'Approve return'}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {rejecting
            ? 'The customer will see your reason. Be specific, e.g. what the photos or order details show.'
            : `Negromart will arrange collection of ${decision.item.quantity} × ${decision.item.product_title}. You can add a note for the customer.`}
        </Typography>
        <TextField
          label={rejecting ? 'Reason (required)' : 'Note to customer (optional)'}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          multiline minRows={3} fullWidth autoFocus
          inputProps={{ maxLength: 1000 }}
          helperText={rejecting ? 'At least 10 characters.' : ' '}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" color={rejecting ? 'error' : 'primary'} disabled={busy || tooShort} onClick={submit}>
          {busy ? <CircularProgress size={18} color="inherit" /> : rejecting ? 'Reject return' : 'Approve return'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
