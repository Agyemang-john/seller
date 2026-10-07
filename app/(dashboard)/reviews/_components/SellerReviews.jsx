'use client';

/**
 * Product reviews for the store (backend: vendor/operations_views.py).
 *
 * Reviews are published by Negromart, not by the seller. A seller can:
 *   - reply publicly (shown under the review on the product page)
 *   - report a review that breaks the rules; Negromart staff decide whether to hide it
 */

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  Divider, MenuItem, Pagination, Rating, Skeleton, Stack, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError, formatDate } from '@/libs/seller-ops';

const REPORT_REASONS = [
  { value: 'abusive', label: 'Abusive or offensive' },
  { value: 'not_about_product', label: 'Not about this product' },
  { value: 'fake', label: 'Suspected fake review' },
  { value: 'personal_info', label: 'Contains personal information' },
  { value: 'other', label: 'Other' },
];

export default function SellerReviews() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter = params.get('filter') || 'all';
  const page = Math.max(1, Number(params.get('page') || 1));

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [reporting, setReporting] = useState(null);

  const navigate = (next) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v === '' || v == null ? q.delete(k) : q.set(k, v)));
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const load = useCallback(async () => {
    try {
      const { data: res } = await createAxiosClient().get('/api/v1/vendor/reviews/manage/', {
        params: { filter: filter === 'unanswered' ? 'unanswered' : undefined, page },
      });
      setData(res);
    } catch (err) {
      setError(apiError(err, 'Could not load reviews.'));
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const updateReview = (updated) =>
    setData((d) => ({ ...d, results: d.results.map((r) => (r.id === updated.id ? updated : r)) }));

  const pages = data ? Math.max(1, Math.ceil(data.count / 25)) : 1;

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Customer reviews are published by Negromart. Reply to show shoppers how you handle problems. If a review
        breaks the rules (abuse, a different product, personal details), report it and our team will review it.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filter} onChange={(_, v) => navigate({ filter: v === 'all' ? '' : v, page: '' })}
              sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 600 } }}>
          <Tab value="all" label="All reviews" />
          <Tab value="unanswered" label="Without a reply" />
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        {!data ? (
          <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={90} />)}</Stack>
        ) : data.results.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>No reviews here yet.</Typography>
        ) : (
          <Stack divider={<Divider />}>
            {data.results.map((review) => (
              <ReviewItem key={review.id} review={review} onChange={updateReview} onReport={() => setReporting(review)} />
            ))}
          </Stack>
        )}
      </Card>

      {pages > 1 && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination count={pages} page={page} onChange={(_, p) => navigate({ page: p })} shape="rounded" />
        </Stack>
      )}

      <ReportDialog
        review={reporting}
        onClose={() => setReporting(null)}
        onReported={() => { updateReview({ ...reporting, has_open_report: true }); setReporting(null); }}
      />
    </Box>
  );
}

function ReviewItem({ review, onChange, onReport }) {
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(review.seller_reply || '');
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const { data } = await createAxiosClient().put(`/api/v1/vendor/reviews/${review.id}/reply/`, { reply });
      onChange({ ...review, ...data });
      setEditing(false);
      toast.success('Reply published.');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await createAxiosClient().delete(`/api/v1/vendor/reviews/${review.id}/reply/`);
      onChange({ ...review, seller_reply: '', seller_replied_at: null });
      setReply('');
      toast.success('Reply removed.');
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Box sx={{ p: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap' }}>
        <Rating value={review.rating} readOnly size="small" />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{review.product_title}</Typography>
        {!review.status && <Chip size="small" label="Hidden by Negromart" variant="outlined" />}
        {review.has_open_report && <Chip size="small" label="Reported" variant="outlined" color="warning" />}
      </Stack>
      <Typography variant="caption" color="text.secondary">
        {review.customer_name} · {formatDate(review.date)}
        {review.is_verified_purchase ? ' · Verified purchase' : ''}
        {review.purchased_variant ? ` · Bought: ${review.purchased_variant}` : ''}
        {review.helpful_count ? ` · ${review.helpful_count} found it helpful` : ''}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>{review.review}</Typography>
      {!!review.media?.length && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap', rowGap: 1 }}>
          {review.media.map((m) => (
            <Box key={m.id} component="a" href={m.url} target="_blank" rel="noopener noreferrer"
                 aria-label={m.kind === 'video' ? 'Open customer video' : 'Open customer photo'}
                 sx={{ width: 72, height: 72, borderRadius: 1.5, overflow: 'hidden', border: '1px solid',
                       borderColor: 'divider', bgcolor: 'action.hover', display: 'block', position: 'relative' }}>
              {m.kind === 'video' ? (
                <Box component="video" src={`${m.url}#t=0.5`} preload="metadata" muted
                     sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Box component="img" src={m.thumbnail_url || m.url} alt="" loading="lazy"
                     sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
            </Box>
          ))}
        </Stack>
      )}

      {/* Reply */}
      {editing ? (
        <Box sx={{ mt: 1.5 }}>
          <TextField
            value={reply} onChange={(e) => setReply(e.target.value)} multiline minRows={2} fullWidth autoFocus
            placeholder="Thank the customer, address the problem and say what you'll do."
            inputProps={{ maxLength: 1000 }} helperText={`${reply.length}/1000 · visible to all shoppers`}
          />
          <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
            <Button size="small" color="inherit" onClick={() => { setEditing(false); setReply(review.seller_reply || ''); }}>Cancel</Button>
            <Button size="small" variant="contained" disabled={busy || reply.trim().length < 2} onClick={save}>
              {busy ? <CircularProgress size={16} color="inherit" /> : 'Publish reply'}
            </Button>
          </Stack>
        </Box>
      ) : review.seller_reply ? (
        <Box sx={{ mt: 1.5, pl: 2, borderLeft: '2px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">Your reply · {formatDate(review.seller_replied_at)}</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{review.seller_reply}</Typography>
        </Box>
      ) : null}

      {!editing && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
          <Button size="small" variant="outlined" onClick={() => setEditing(true)}>
            {review.seller_reply ? 'Edit reply' : 'Reply'}
          </Button>
          {review.seller_reply && <Button size="small" color="inherit" disabled={busy} onClick={remove}>Remove reply</Button>}
          {!review.has_open_report && <Button size="small" color="inherit" onClick={onReport}>Report</Button>}
        </Stack>
      )}
    </Box>
  );
}

function ReportDialog({ review, onClose, onReported }) {
  const [reason, setReason] = useState('abusive');
  const [details, setDetails] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => { setReason('abusive'); setDetails(''); }, [review]);
  if (!review) return null;

  const submit = async () => {
    setBusy(true);
    try {
      await createAxiosClient().post(`/api/v1/vendor/reviews/${review.id}/report/`, { reason, details });
      toast.success('Reported. Our team will review it.');
      onReported();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Report review</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Negative reviews are allowed. Report only reviews that break the rules; the review stays visible while we look at it.
        </Typography>
        <TextField select label="Reason" value={reason} onChange={(e) => setReason(e.target.value)} fullWidth sx={{ mb: 2 }}>
          {REPORT_REASONS.map((r) => <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>)}
        </TextField>
        <TextField label="Details (optional)" value={details} onChange={(e) => setDetails(e.target.value)}
                   multiline minRows={3} fullWidth inputProps={{ maxLength: 1000 }} />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" disabled={busy} onClick={submit}>
          {busy ? <CircularProgress size={18} color="inherit" /> : 'Send report'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
