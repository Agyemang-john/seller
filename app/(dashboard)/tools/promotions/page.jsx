'use client';

/**
 * Promotions autopilot (backend tools/promotions.py): win-back coupons,
 * thank-you coupons and a weekly sale, each switched on once.
 */

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, InputAdornment, Stack, Switch, TextField, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError, money } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { NumberField, fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COPY = {
  win_back: {
    title: 'Win back lapsed customers',
    text: 'Shoppers who bought from you but haven\'t been back get a personal coupon. Sent once in a while, never twice in a row.',
  },
  thank_you: {
    title: 'Thank-you coupon',
    text: 'A few days after a shopper\'s first order from you is delivered, they get a coupon for their next one.',
  },
  weekly_sale: {
    title: 'Weekly sale',
    text: 'A sale on chosen products every week, at the same time. Each one appears as a flash sale shoppers can find on Deals.',
  },
};

function CouponFields({ s, set, kind }) {
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 6, sm: 3 }}>
        <NumberField decimals={false} label="Discount" value={s.percent ?? ''} onChange={(v) => set({ percent: v })}
          InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
      </Grid>
      {kind === 'win_back' ? (
        <Grid size={{ xs: 6, sm: 3 }}>
          <NumberField decimals={false} label="Not back for" value={s.days ?? ''} onChange={(v) => set({ days: v })}
            InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} />
        </Grid>
      ) : (
        <Grid size={{ xs: 6, sm: 3 }}>
          <NumberField decimals={false} label="Send after" value={s.after_days ?? ''} onChange={(v) => set({ after_days: v })}
            InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} helperText="after delivery" />
        </Grid>
      )}
      <Grid size={{ xs: 6, sm: 3 }}>
        <NumberField decimals={false} label="Valid for" value={s.valid_days ?? ''} onChange={(v) => set({ valid_days: v })}
          InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} />
      </Grid>
      <Grid size={{ xs: 6, sm: 3 }}>
        <NumberField label="Min. spend (optional)" value={s.min_spend ?? ''} onChange={(v) => set({ min_spend: v })}
          InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} />
      </Grid>
      {kind === 'win_back' && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <NumberField decimals={false} label="Don't send again for" value={s.cooldown_days ?? ''} onChange={(v) => set({ cooldown_days: v })}
            InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} />
        </Grid>
      )}
    </Grid>
  );
}

function SaleFields({ s, set, max }) {
  const [search, setSearch] = useState('');
  const { data } = useSWR(`/api/v1/tools/products/?search=${encodeURIComponent(search)}`, fetcher, { keepPreviousData: true });
  // Titles of products picked earlier (the search list only holds the current matches).
  const [titles, setTitles] = useState({});
  const picked = useMemo(() => {
    const known = Object.fromEntries((data?.results || []).map((p) => [p.id, p]));
    return (s.product_ids || []).map((id) => known[id] || titles[id] || { id, title: `Product #${id}` });
  }, [s.product_ids, data, titles]);
  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="caption" color="text.secondary">Every</Typography>
        <Stack direction="row" sx={{ gap: 0.75, flexWrap: 'wrap', mt: 0.5 }}>
          {DAYS.map((d, i) => {
            const on = (s.weekdays || []).includes(i);
            return (
              <Chip key={d} label={d} clickable variant={on ? 'filled' : 'outlined'}
                onClick={() => set({ weekdays: on ? s.weekdays.filter((x) => x !== i) : [...(s.weekdays || []), i] })}
                sx={{ fontWeight: 600, ...(on && { bgcolor: 'text.primary', color: 'background.paper' }) }} />
            );
          })}
        </Stack>
      </Box>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, sm: 4 }}>
          <TextField size="small" fullWidth type="time" label="Starts at" value={s.start || '18:00'} onChange={(e) => set({ start: e.target.value })}
            sx={fieldSx} InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid size={{ xs: 6, sm: 4 }}>
          <NumberField decimals={false} label="Lasts" value={s.hours ?? ''} onChange={(v) => set({ hours: v })}
            InputProps={{ endAdornment: <InputAdornment position="end">hours</InputAdornment> }} />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <NumberField decimals={false} label="Discount" value={s.percent ?? ''} onChange={(v) => set({ percent: v })}
            InputProps={{ endAdornment: <InputAdornment position="end">%</InputAdornment> }} />
        </Grid>
      </Grid>
      <Autocomplete multiple size="small" options={data?.results || []} value={picked}
        getOptionLabel={(o) => o.title} isOptionEqualToValue={(o, v) => o.id === v.id}
        onInputChange={(_, v) => setSearch(v)} filterOptions={(x) => x}
        onChange={(_, v) => {
          if (v.length > max) return;
          setTitles((prev) => ({ ...prev, ...Object.fromEntries(v.map((p) => [p.id, p])) }));
          set({ product_ids: v.map((p) => p.id) });
        }}
        renderInput={(params) => <TextField {...params} label={`Products (up to ${max})`} sx={fieldSx} />} />
    </Stack>
  );
}

function Automation({ item, max, onSaved }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [s, setS] = useState(item.settings);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const set = (patch) => setS((prev) => ({ ...prev, ...patch }));
  const copy = COPY[item.kind];
  const save = async (active) => {
    setBusy(true); setError('');
    try {
      const { data } = await client.put(`/api/v1/tools/promotions/${item.kind}/`, { is_active: active, settings: s });
      onSaved(data);
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };
  const st = item.stats;
  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: item.is_active ? 'success.light' : 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="flex-start" spacing={1.5} sx={{ mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontWeight: 700, fontSize: 17 }}>{copy.title}</Typography>
          <Typography variant="body2" color="text.secondary">{copy.text}</Typography>
        </Box>
        <Stack alignItems="center">
          <Switch checked={item.is_active} disabled={busy} onChange={(e) => save(e.target.checked)}
            inputProps={{ 'aria-label': `${copy.title} on or off` }} />
          <Typography variant="caption" color={item.is_active ? 'success.main' : 'text.secondary'}>{item.is_active ? 'On' : 'Off'}</Typography>
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px' }}>{error}</Alert>}
      {item.kind === 'weekly_sale' ? <SaleFields s={s} set={set} max={max} /> : <CouponFields s={s} set={set} kind={item.kind} />}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mt: 2 }}>
        <Button variant="contained" disableElevation disabled={busy} onClick={() => save(true)}
          startIcon={busy ? <CircularProgress size={14} color="inherit" /> : null}
          sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>
          {item.is_active ? 'Save changes' : 'Save and switch on'}
        </Button>
        {item.last_result && <Typography variant="caption" color="text.secondary">Last run: {item.last_result}</Typography>}
      </Stack>
      {st && (
        <Stack direction="row" spacing={3} sx={{ mt: 2, pt: 1.5, borderTop: '1px solid', borderColor: 'divider', flexWrap: 'wrap', rowGap: 1 }}>
          {item.kind === 'weekly_sale' ? (
            <>
              <Box><Typography variant="caption" color="text.secondary">Sales run</Typography><Typography fontWeight={700}>{st.sales}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Units sold on sale</Typography><Typography fontWeight={700}>{st.units_sold}</Typography></Box>
            </>
          ) : (
            <>
              <Box><Typography variant="caption" color="text.secondary">Coupons sent</Typography><Typography fontWeight={700}>{st.sent}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Used</Typography><Typography fontWeight={700}>{st.used}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Orders from them</Typography><Typography fontWeight={700}>{money(st.order_value)}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Discount given</Typography><Typography fontWeight={700}>{money(st.discount_given)}</Typography></Box>
            </>
          )}
        </Stack>
      )}
    </Box>
  );
}

function Promotions() {
  const { data, mutate, isLoading } = useSWR('/api/v1/tools/promotions/', fetcher);
  if (isLoading || !data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  const update = (item) => mutate({ ...data, automations: data.automations.map((a) => (a.kind === item.kind ? item : a)) }, false);
  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 2.5, maxWidth: 720 }}>
        Switch these on once and they run by themselves every day. Coupons are personal (only that shopper can use them, once)
        and come out of your earnings like your other coupons. Shoppers can turn off offers from stores at any time.
      </Typography>
      <Stack spacing={2}>
        {data.automations.map((a) => <Automation key={a.kind} item={a} max={data.max_sale_products} onSaved={update} />)}
      </Stack>
    </Box>
  );
}

export default function PromotionsPage() {
  return (
    <PageContainer title="Promotions autopilot" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Promotions autopilot' }]}>
      <ToolGate toolKey="promotions"><Promotions /></ToolGate>
    </PageContainer>
  );
}
