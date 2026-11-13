'use client';

/**
 * Seller coupons (backend: vendor/coupon_views.py, rules in order/coupons.py).
 *
 * Two kinds, like Amazon:
 *   Clip coupon   a "Save 10% with coupon" badge on the store's product cards
 *                 and pages; shoppers clip it and it comes off at checkout.
 *   Private code  only shoppers the seller shares the code with can use it.
 * Optional budget: the coupon stops by itself once that much has been given.
 *
 * A store coupon only takes money off this store's items, and the discount
 * comes out of the store's earnings (shown as "Your coupon" in Earnings).
 * Commission is charged on the price after the coupon. Once a shopper has
 * used a code, it can only be switched off or on.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Alert, Autocomplete, Avatar, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, InputAdornment, MenuItem, Skeleton, Stack,
  Tab, Tabs, TextField, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { apiError, formatDate, formatMoney } from '@/libs/seller-ops';

const API = '/api/v1/vendor/coupons/';
// Same picker as flash sales: the store's own published products.
const PRODUCTS_API = '/api/v1/vendor/flash-sales/products/';

const TABS = [
  { value: 'all', label: 'All' },
  { value: 'live', label: 'Live' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'paused', label: 'Switched off' },
  { value: 'ended', label: 'Ended' },
];

const STATUS = {
  live: { label: 'Live', color: 'success' },
  scheduled: { label: 'Scheduled', color: 'info' },
  paused: { label: 'Switched off', color: 'warning' },
  used_up: { label: 'Fully used', color: 'default' },
  ended: { label: 'Ended', color: 'default' },
};

function offText(c) {
  if (c.discount_percentage) {
    const cap = c.max_discount_amount ? ` (up to ${formatMoney(c.max_discount_amount)})` : '';
    return `${Number(c.discount_percentage)}% off${cap}`;
  }
  return `${formatMoney(c.discount_amount)} off`;
}

export default function CouponsManager() {
  // Plan decides whether coupons are available (payments/entitlements.py).
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
      setError(apiError(err, 'Could not load your coupons.'));
    }
  }, []);

  useEffect(() => { if (allowed) load(); }, [allowed, load]);

  const coupons = useMemo(() => {
    const all = data?.results || [];
    if (tab === 'all') return all;
    if (tab === 'ended') return all.filter((c) => c.status === 'ended' || c.status === 'used_up');
    return all.filter((c) => c.status === tab);
  }, [data, tab]);

  const setActive = async (coupon, active) => {
    setBusyId(coupon.id);
    try {
      await createAxiosClient().patch(`${API}${coupon.id}/`, { active });
      toast.success(active ? 'Coupon switched on.' : 'Coupon switched off.');
      load();
    } catch (err) {
      toast.error(apiError(err));
    } finally {
      setBusyId(null);
    }
  };

  const remove = async (coupon) => {
    setBusyId(coupon.id);
    try {
      await createAxiosClient().delete(`${API}${coupon.id}/`);
      toast.success('Coupon deleted.');
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
          <LocalOfferRoundedIcon color="warning" />
          <Typography sx={{ fontWeight: 700 }}>Coupons are part of paid plans</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Put a &quot;Save 10% with coupon&quot; badge on your products, or create codes for social media,
          returning customers and launches. Your {plan.name} plan doesn&apos;t include discounts and promotions.
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
          Clip coupons show a &quot;Save 10% with coupon&quot; badge on your products; shoppers clip it and the
          discount comes off at checkout. Private codes only work for shoppers you share them with. Either way
          the discount comes out of your earnings, commission is charged on the price after the coupon, and it
          only works on your items. Set a budget and the coupon stops by itself when it&apos;s spent.
          {limits && ` Up to ${limits.max_duration_days} days each, ${limits.max_open_coupons} running or scheduled at a time.`}
        </Typography>
        <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)} sx={{ flexShrink: 0 }}>
          New coupon
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
        ) : coupons.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
            {tab === 'all' ? 'No coupons yet. Create a clip coupon to show a discount badge on your products.' : 'Nothing here.'}
          </Typography>
        ) : (
          <Stack divider={<Divider />}>
            {coupons.map((c) => (
              <CouponRow
                key={c.id}
                coupon={c}
                busy={busyId === c.id}
                onOff={() => setActive(c, false)}
                onOn={() => setActive(c, true)}
                onDelete={() => remove(c)}
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

function CouponRow({ coupon, busy, onOff, onOn, onDelete }) {
  const status = STATUS[coupon.status] || STATUS.ended;
  const used = coupon.orders > 0;
  const rules = [
    coupon.min_purchase_amount && `Min. spend ${formatMoney(coupon.min_purchase_amount)}`,
    coupon.per_user_limit ? `${coupon.per_user_limit} per shopper` : 'No limit per shopper',
    coupon.max_uses ? `${coupon.used_count} of ${coupon.max_uses} used` : `${coupon.used_count} used`,
    coupon.budget && `${formatMoney(coupon.discount_spent)} of ${formatMoney(coupon.budget)} budget used`,
    coupon.product_titles?.length ? `${coupon.product_titles.length} product${coupon.product_titles.length > 1 ? 's' : ''}` : 'All your products',
  ].filter(Boolean);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(coupon.code);
      toast.success('Code copied.');
    } catch {
      toast.error('Could not copy. Select the code instead.');
    }
  };

  return (
    <Box sx={{ p: 2, display: 'flex', gap: 2, alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
      <Box sx={{ flex: 1, minWidth: 220 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5, flexWrap: 'wrap', rowGap: 0.5 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15, letterSpacing: 0.5, fontFamily: 'monospace' }}>{coupon.code}</Typography>
          <Tooltip title="Copy code">
            <Button size="small" onClick={copy} sx={{ minWidth: 0, p: 0.5 }} aria-label="Copy code">
              <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
            </Button>
          </Tooltip>
          <Chip size="small" label={status.label} color={status.color} variant="outlined" />
          <Chip
            size="small"
            label={coupon.clippable ? 'Clip coupon · on your products' : 'Private code'}
            color={coupon.clippable ? 'success' : 'default'}
            variant={coupon.clippable ? 'filled' : 'outlined'}
          />
        </Stack>
        <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{offText(coupon)}</Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(coupon.valid_from, true)} → {formatDate(coupon.valid_to, true)}
        </Typography>
        <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 0.5 }}>
          {rules.join(' · ')}
        </Typography>
      </Box>

      <Box sx={{ textAlign: { md: 'right' }, minWidth: 180 }}>
        <Typography sx={{ fontWeight: 700 }}>{coupon.orders} order{coupon.orders === 1 ? '' : 's'}</Typography>
        <Typography variant="caption" color="text.secondary" component="div">
          {formatMoney(coupon.total_discount)} given in discounts
        </Typography>
        {coupon.clippable && (
          <Typography variant="caption" color="text.secondary" component="div">
            Clipped by {coupon.clips} shopper{coupon.clips === 1 ? '' : 's'}
          </Typography>
        )}
        <Stack direction="row" spacing={1} justifyContent={{ md: 'flex-end' }} sx={{ mt: 1.25 }}>
          {!used && (
            <Button size="small" color="error" disabled={busy} onClick={onDelete}>Delete</Button>
          )}
          {coupon.status === 'paused' && (
            <Button size="small" variant="outlined" disabled={busy} onClick={onOn}>Switch on</Button>
          )}
          {(coupon.status === 'live' || coupon.status === 'scheduled') && (
            <Button size="small" variant="outlined" color="inherit" disabled={busy} onClick={onOff}>Switch off</Button>
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
  const end = new Date(start.getTime() + 14 * 24 * 60 * 60 * 1000);
  return {
    clippable: true, code: '', discount_type: 'percent', value: '', max_discount_amount: '',
    min_purchase_amount: '', max_uses: '', budget: '', per_user_limit: '1', products: [],
    start: toLocalInput(start), end: toLocalInput(end),
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

  useEffect(() => {
    if (!open) return undefined;
    const timer = setTimeout(async () => {
      setLoadingOptions(true);
      try {
        const { data } = await createAxiosClient().get(PRODUCTS_API, { params: { q: query || undefined } });
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
  const isPercent = form.discount_type === 'percent';

  const submit = async () => {
    setBusy(true);
    setErrors({});
    try {
      await createAxiosClient().post(API, {
        clippable: form.clippable,
        // Clip coupons need no code; the server makes one up.
        ...(form.clippable ? {} : { code: form.code }),
        budget: form.budget || null,
        discount_type: form.discount_type,
        value: form.value,
        max_discount_amount: isPercent && form.max_discount_amount ? form.max_discount_amount : null,
        min_purchase_amount: form.min_purchase_amount || null,
        max_uses: form.max_uses || null,
        per_user_limit: form.per_user_limit || null,
        products: form.products.map((p) => p.id),
        valid_from: new Date(form.start).toISOString(),
        valid_to: new Date(form.end).toISOString(),
      });
      toast.success('Coupon created.');
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
  const fullScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" fullScreen={fullScreen}>
      <DialogTitle>New coupon</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {generalError && <Alert severity="error">{generalError}</Alert>}

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 1 }}>How shoppers get it</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {[
                { value: true, title: 'Clip coupon', body: 'A "Save 10% with coupon" badge on your product cards and pages. Shoppers clip it; no code needed.' },
                { value: false, title: 'Private code', body: 'A code you share yourself, on social media or with returning customers.' },
              ].map((opt) => {
                const selected = form.clippable === opt.value;
                return (
                  <Box
                    key={opt.title}
                    component="button"
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, clippable: opt.value }))}
                    aria-pressed={selected}
                    sx={{
                      flex: 1, textAlign: 'left', p: 1.5, borderRadius: '10px', cursor: 'pointer', font: 'inherit',
                      color: 'text.primary', bgcolor: selected ? 'action.selected' : 'transparent',
                      border: '1.5px solid', borderColor: selected ? 'primary.main' : 'divider',
                    }}
                  >
                    <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{opt.title}</Typography>
                    <Typography variant="caption" color="text.secondary">{opt.body}</Typography>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {!form.clippable && (
            <TextField
              label="Code"
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '') }))}
              inputProps={{ maxLength: 20, style: { fontFamily: 'monospace', letterSpacing: 1 } }}
              error={!!fieldError('code')}
              helperText={fieldError('code') || 'What shoppers type at checkout, e.g. SUMMER-10'}
            />
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Type" value={form.discount_type} onChange={set('discount_type')} fullWidth helperText=" ">
              <MenuItem value="percent">Percentage off</MenuItem>
              <MenuItem value="amount">Fixed amount off</MenuItem>
            </TextField>
            <TextField
              label={isPercent ? 'Percent off' : 'Amount off'}
              type="number"
              value={form.value}
              onChange={set('value')}
              fullWidth
              InputProps={isPercent
                ? { endAdornment: <InputAdornment position="end">%</InputAdornment> }
                : { startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
              error={!!fieldError('value')}
              helperText={fieldError('value') || (isPercent && limits ? `${limits.min_percent}–${limits.max_percent}%` : ' ')}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {isPercent && (
              <TextField
                label="Max discount"
                type="number"
                value={form.max_discount_amount}
                onChange={set('max_discount_amount')}
                fullWidth
                InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
                error={!!fieldError('max_discount_amount')}
                helperText={fieldError('max_discount_amount') || 'Optional cap per order'}
              />
            )}
            <TextField
              label="Minimum spend"
              type="number"
              value={form.min_purchase_amount}
              onChange={set('min_purchase_amount')}
              fullWidth
              InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
              error={!!fieldError('min_purchase_amount')}
              helperText={fieldError('min_purchase_amount') || 'Optional. On your items in the cart'}
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
              error={!!fieldError('valid_from')}
              helperText={fieldError('valid_from') || ' '}
            />
            <TextField
              label="Ends"
              type="datetime-local"
              value={form.end}
              onChange={set('end')}
              fullWidth
              InputLabelProps={{ shrink: true }}
              error={!!fieldError('valid_to')}
              helperText={fieldError('valid_to') || (limits ? `Up to ${limits.max_duration_days} days` : ' ')}
            />
          </Stack>

          <TextField
            label="Budget"
            type="number"
            value={form.budget}
            onChange={set('budget')}
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
            error={!!fieldError('budget')}
            helperText={fieldError('budget') || 'Optional. The coupon stops once this much discount has been given'}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Total uses"
              type="number"
              value={form.max_uses}
              onChange={set('max_uses')}
              fullWidth
              error={!!fieldError('max_uses')}
              helperText={fieldError('max_uses') || 'Optional. Blank = no limit'}
            />
            <TextField
              label="Uses per shopper"
              type="number"
              value={form.per_user_limit}
              onChange={set('per_user_limit')}
              fullWidth
              error={!!fieldError('per_user_limit')}
              helperText={fieldError('per_user_limit') || 'Blank = no limit'}
            />
          </Stack>

          <Autocomplete
            multiple
            options={options}
            value={form.products}
            loading={loadingOptions}
            filterOptions={(x) => x}
            getOptionLabel={(o) => o.title}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onInputChange={(_, v, reason) => { if (reason === 'input') setQuery(v); }}
            onChange={(_, products) => setForm((f) => ({ ...f, products }))}
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
                label="Products"
                error={!!fieldError('products')}
                helperText={fieldError('products') || 'Optional. Leave empty for all your products'}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit">Cancel</Button>
        <Button variant="contained" disabled={busy || (!form.clippable && !form.code) || !form.value} onClick={submit}>
          {busy ? <CircularProgress size={18} color="inherit" /> : 'Create coupon'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
