'use client';

/**
 * Seller flash sales (backend: vendor/flash_sale_views.py).
 *
 * Paid plans with "discounts & promotions" can put their own products on a
 * time-limited sale. Sales go live by themselves at the start time and show
 * on the storefront's Flash Sales page. Once a sale has started it can only
 * be paused or resumed — create a new one for different terms.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Alert, Autocomplete, Avatar, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, InputAdornment, LinearProgress, MenuItem, Skeleton, Stack,
  Tab, Tabs, TextField, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { apiError, formatDate, formatMoney } from '@/libs/seller-ops';

const API = '/api/v1/vendor/flash-sales/';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Paused' },
  { value: 'ended', label: 'Ended' },
];

const STATUS = {
  live: { label: 'Live', color: 'success' },
  scheduled: { label: 'Scheduled', color: 'info' },
  paused: { label: 'Paused', color: 'warning' },
  sold_out: { label: 'Sold out', color: 'default' },
  ended: { label: 'Ended', color: 'default' },
};

const LABELS = [
  { value: 'lightning', label: 'Lightning Deal' },
  { value: 'limited', label: 'Limited Offer' },
  { value: 'clearance', label: 'Clearance' },
  { value: 'daily', label: 'Daily Deal' },
];

export default function FlashSalesManager() {
  // Plan decides whether flash sales are available (payments/entitlements.py).
  const { data: plan } = useSWR('/api/v1/vendor/plan/', fetcher, { revalidateOnFocus: false });
  const allowed = plan?.can_offer_discounts;

  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('all');
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const { data: res } = await createAxiosClient().get(API);
      setData(res);
    } catch (err) {
      setError(apiError(err, 'Could not load your flash sales.'));
    }
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  const sales = useMemo(() => {
    const all = data?.results || [];
    if (tab === 'all') return all;
    if (tab === 'ended') return all.filter((s) => s.status === 'ended' || s.status === 'sold_out');
    return all.filter((s) => s.status === tab);
  }, [data, tab]);

  const setActive = async (sale, isActive) => {
    setBusyId(sale.id);
    try {
      await createAxiosClient().patch(`${API}${sale.id}/`, { is_active: isActive });
      toast.success(isActive ? 'Flash sale resumed.' : 'Flash sale paused.');
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (sale) => {
    setBusyId(sale.id);
    try {
      await createAxiosClient().delete(`${API}${sale.id}/`);
      toast.success('Flash sale deleted.');
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  if (!plan) {
    return <Skeleton variant="rounded" height={160} sx={{ maxWidth: 1100 }} />;
  }

  if (!allowed) {
    return (
      <Card variant="outlined" sx={{ maxWidth: 720, borderRadius: '12px', p: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
          <BoltRoundedIcon color="warning" />
          <Typography sx={{ fontWeight: 700 }}>Flash sales are part of paid plans</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Put your products on a time-limited deal with a countdown, featured on Negromart&apos;s Flash Sales page.
          Your {plan.name} plan doesn&apos;t include discounts and promotions.
        </Typography>
        <Button component={Link} href="/subscribe" variant="contained">Compare plans</Button>
      </Card>
    );
  }

  const limits = data?.limits;

  return (
    <Box sx={{ maxWidth: 1100 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ sm: 'flex-start' }} sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
          Run a time-limited deal on your own products. Sales go live automatically at the start time and appear on the
          storefront&apos;s Flash Sales page with a countdown.
          {limits && ` At least ${limits.min_discount_percent}% off, up to ${limits.max_duration_days} days, and ${limits.max_open_sales} running or scheduled at a time.`}
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)} sx={{ flexShrink: 0 }}>
          New flash sale
        </Button>
      </Stack>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 600 } }}
        >
          {TABS.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        {!data ? (
          <Stack spacing={1} sx={{ p: 2 }}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={72} />)}</Stack>
        ) : sales.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            {tab === 'all' ? 'No flash sales yet. Create one to feature a product at a special price.' : 'Nothing here.'}
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            {sales.map((sale) => (
              <SaleRow
                key={sale.id}
                sale={sale}
                busy={busyId === sale.id}
                onPause={() => setActive(sale, false)}
                onResume={() => setActive(sale, true)}
                onDelete={() => remove(sale)}
              />
            ))}
          </Stack>
        )}
      </Card>

      <CreateDialog
        open={creating}
        limits={limits}
        onClose={() => setCreating(false)}
        onCreated={() => { setCreating(false); load(); }}
      />
    </Box>
  );
}

function SaleRow({ sale, busy, onPause, onResume, onDelete }) {
  const status = STATUS[sale.status] || STATUS.ended;
  const capped = sale.max_quantity != null;
  const started = new Date(sale.start_time) <= new Date();

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
      <Avatar variant="rounded" src={sale.product_image || undefined} sx={{ width: 56, height: 56, bgcolor: 'action.hover' }}>
        {sale.product_title?.[0]}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25, flexWrap: 'wrap' }}>
          <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{sale.product_title}</Typography>
          <Chip size="small" label={status.label} color={status.color} variant="outlined" />
        </Stack>
        <Typography variant="body2" color="text.secondary">
          {sale.variant_title ? `${sale.variant_title} · ` : 'All variants · '}
          {formatDate(sale.start_time, true)} → {formatDate(sale.end_time, true)}
        </Typography>
        <Box sx={{ mt: 1, maxWidth: 320 }}>
          <Typography variant="caption" color="text.secondary">
            {sale.sold_count} sold{capped ? ` of ${sale.max_quantity}` : ''}
          </Typography>
          {capped && (
            <LinearProgress
              variant="determinate"
              value={Math.min(100, (sale.sold_count / Math.max(1, sale.max_quantity)) * 100)}
              sx={{ mt: 0.5, height: 6, borderRadius: 3 }}
            />
          )}
        </Box>
      </Box>

      <Box sx={{ textAlign: { md: 'right' }, minWidth: 180 }}>
        <Typography sx={{ fontWeight: 700 }}>{formatMoney(sale.sale_price)}</Typography>
        <Typography variant="caption" color="text.secondary">
          was <s>{formatMoney(sale.original_price)}</s> · {Math.round(sale.discount_percentage)}% off
        </Typography>
        <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }} sx={{ mt: 1.25 }}>
          {!started && sale.sold_count === 0 && (
            <Button size="small" color="error" disabled={busy} onClick={onDelete}>Delete</Button>
          )}
          {sale.status === 'paused' && (
            <Button size="small" variant="outlined" disabled={busy} onClick={onResume}>Resume</Button>
          )}
          {(sale.status === 'live' || sale.status === 'scheduled') && (
            <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={onPause}>
              {sale.status === 'live' ? 'Pause' : 'Pause before start'}
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  );
}

// <input type="datetime-local"> works in local time without a zone.
const toLocalInput = (date) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const emptyForm = () => {
  const start = new Date(Date.now() + 5 * 60 * 1000);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return {
    product: null, variant: '', sale_price: '', original_price: '', max_quantity: '',
    start: toLocalInput(start), end: toLocalInput(end), label: 'lightning',
  };
};

function CreateDialog({ open, limits, onClose, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [options, setOptions] = useState([]);
  const [query, setQuery] = useState('');
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) { setForm(emptyForm()); setErrors({}); }
  }, [open]);

  // Product picker: own published products, searched on the server.
  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(async () => {
      setLoadingOptions(true);
      try {
        const { data } = await createAxiosClient().get(`${API}products/`, { params: { q: query || undefined } });
        setOptions(data);
      } catch {
        setOptions([]);
      } finally {
        setLoadingOptions(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [open, query]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const variant = form.product?.variants.find((v) => String(v.id) === String(form.variant));
  const currentPrice = Number(variant?.price ?? form.product?.price ?? 0);
  const original = Number(form.original_price || currentPrice);
  const discount = form.sale_price && original ? Math.round((1 - Number(form.sale_price) / original) * 100) : null;

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      await createAxiosClient().post(API, {
        product: form.product?.id,
        variant: form.variant || null,
        sale_price: form.sale_price,
        original_price: form.original_price || null,
        max_quantity: form.max_quantity || null,
        start_time: new Date(form.start).toISOString(),
        end_time: new Date(form.end).toISOString(),
        label: form.label,
      });
      toast.success('Flash sale created.');
      onCreated();
    } catch (err) {
      const body = err?.response?.data;
      if (body && typeof body === 'object' && !body.detail) setErrors(body);
      else toast.error(apiError(err));
    } finally {
      setBusy(false);
    }
  };

  const fieldError = (key) => (Array.isArray(errors[key]) ? errors[key][0] : errors[key]);
  const generalError = fieldError('non_field_errors');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New flash sale</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {generalError && <Alert severity="error">{generalError}</Alert>}

          <Autocomplete
            options={options}
            value={form.product}
            loading={loadingOptions}
            filterOptions={(x) => x}
            getOptionLabel={(o) => o.title}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onInputChange={(_, v, reason) => { if (reason === 'input') setQuery(v); }}
            onChange={(_, product) => setForm((f) => ({ ...f, product, variant: '', original_price: '' }))}
            renderOption={(props, o) => (
              <li {...props} key={o.id}>
                <Avatar variant="rounded" src={o.image || undefined} sx={{ width: 32, height: 32, mr: 1.5 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap>{o.title}</Typography>
                  <Typography variant="caption" color="text.secondary">{formatMoney(o.price)}</Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Product"
                error={!!fieldError('product')}
                helperText={fieldError('product') || 'Published products from your store'}
              />
            )}
          />

          {form.product?.variants.length > 0 && (
            <TextField
              select
              label="Variant"
              value={form.variant}
              onChange={(e) => setForm((f) => ({ ...f, variant: e.target.value, original_price: '' }))}
              error={!!fieldError('variant')}
              helperText={fieldError('variant') || 'Leave on "All variants" to discount every option'}
            >
              <MenuItem value="">All variants</MenuItem>
              {form.product.variants.map((v) => (
                <MenuItem key={v.id} value={v.id}>{v.title} · {formatMoney(v.price)}</MenuItem>
              ))}
            </TextField>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Sale price"
              type="number"
              value={form.sale_price}
              onChange={set('sale_price')}
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
              error={!!fieldError('sale_price')}
              helperText={fieldError('sale_price') || (discount != null && discount > 0 ? `${discount}% off` : ' ')}
            />
            <TextField
              label="Was price"
              type="number"
              value={form.original_price}
              onChange={set('original_price')}
              placeholder={currentPrice ? String(currentPrice) : ''}
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
              error={!!fieldError('original_price')}
              helperText={fieldError('original_price') || 'Defaults to the current price'}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Starts"
              type="datetime-local"
              value={form.start}
              onChange={set('start')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!fieldError('start_time')}
              helperText={fieldError('start_time') || ' '}
            />
            <TextField
              label="Ends"
              type="datetime-local"
              value={form.end}
              onChange={set('end')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!fieldError('end_time')}
              helperText={fieldError('end_time') || (limits ? `Up to ${limits.max_duration_days} days` : ' ')}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Units at sale price"
              type="number"
              value={form.max_quantity}
              onChange={set('max_quantity')}
              fullWidth
              error={!!fieldError('max_quantity')}
              helperText={fieldError('max_quantity') || 'Optional. Blank = no limit'}
            />
            <TextField select label="Badge" value={form.label} onChange={set('label')} fullWidth helperText=" ">
              {LABELS.map((l) => <MenuItem key={l.value} value={l.value}>{l.label}</MenuItem>)}
            </TextField>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" disabled={busy || !form.product || !form.sale_price} onClick={submit}>
          {busy ? <CircularProgress size={18} color="inherit" /> : 'Create flash sale'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
