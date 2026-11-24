'use client';

/**
 * Pricing (backend tools/pricing.py): what others charge for the same item,
 * category price ranges, auto-repricer rules and the price-change history.
 */

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Box, Button, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment,
  MenuItem, Pagination, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError, money, useTools } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { NumberField, fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

function RuleDialog({ row, onClose, onSaved }) {
  const client = useMemo(() => createAxiosClient(), []);
  const r = row.repricer;
  const [form, setForm] = useState({
    strategy: r?.strategy || 'beat', step: r?.step || '1',
    min_price: r?.min_price || '', max_price: r?.max_price || row.price, is_active: r ? r.is_active : true,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const save = async () => {
    setBusy(true); setError('');
    try {
      await client.post('/api/v1/tools/pricing/rules/', { product_id: row.product_id, ...form });
      onSaved();
    } catch (err) {
      const d = err?.response?.data;
      setError(d?.max_price?.[0] || d?.min_price?.[0] || apiError(err));
    } finally { setBusy(false); }
  };
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 700 }}>Auto-repricer: {row.title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2" color="text.secondary">
            Every 15 minutes we check the cheapest other seller and set your price, never below your minimum or above your maximum.
            With no other seller in stock, your price goes to your maximum.
          </Typography>
          <TextField select size="small" label="Strategy" value={form.strategy} onChange={(e) => setForm({ ...form, strategy: e.target.value })} sx={fieldSx}>
            <MenuItem value="beat">Beat the cheapest seller</MenuItem>
            <MenuItem value="match">Match the cheapest seller</MenuItem>
          </TextField>
          {form.strategy === 'beat' && (
            <NumberField label="Beat by" value={form.step} onChange={(v) => setForm({ ...form, step: v })}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} />
          )}
          <Stack direction="row" spacing={1.5}>
            <NumberField label="Never below" value={form.min_price} onChange={(v) => setForm({ ...form, min_price: v })}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} />
            <NumberField label="Never above" value={form.max_price} onChange={(v) => setForm({ ...form, max_price: v })}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} />
          </Stack>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Switch checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
            <Typography variant="body2">{form.is_active ? 'On' : 'Paused'}</Typography>
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={save} disabled={busy || !form.min_price || !form.max_price}
          sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>Save rule</Button>
      </DialogActions>
    </Dialog>
  );
}

function Insights({ repricer }) {
  const [page, setPage] = useState(1);
  const [only, setOnly] = useState('all');
  const [editing, setEditing] = useState(null);
  const { data, mutate, isLoading } = useSWR(`/api/v1/tools/pricing/?page=${page}&only=${only}`, fetcher, { keepPreviousData: true });
  const pages = data ? Math.max(Math.ceil(data.count / data.page_size), 1) : 1;
  return (
    <Box>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <Chip label="All live listings" onClick={() => { setOnly('all'); setPage(1); }} variant={only === 'all' ? 'filled' : 'outlined'} />
        <Chip label="Sold by other stores too" onClick={() => { setOnly('shared'); setPage(1); }} variant={only === 'shared' ? 'filled' : 'outlined'} />
      </Stack>
      {isLoading && !data ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box> : (
        <Stack spacing={1.25}>
          {(data?.results || []).map((r) => (
            <Box key={r.product_id} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} alignItems={{ md: 'center' }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} noWrap>{r.title}</Typography>
                  <Typography variant="body2" color="text.secondary">{r.advice}</Typography>
                </Box>
                <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', rowGap: 1 }} alignItems="center">
                  <Box><Typography variant="caption" color="text.secondary">Your price</Typography><Typography fontWeight={700}>{money(r.price)}</Typography></Box>
                  {r.kind === 'shared' ? (
                    <>
                      <Box><Typography variant="caption" color="text.secondary">Cheapest other</Typography><Typography fontWeight={700}>{money(r.lowest_other)}</Typography></Box>
                      <Box><Typography variant="caption" color="text.secondary">Other sellers</Typography><Typography fontWeight={700}>{r.other_offers}</Typography></Box>
                      <Chip size="small" label={r.buy_box ? 'You have the buy box' : 'Not the buy box'} color={r.buy_box ? 'success' : 'default'} variant="outlined" />
                    </>
                  ) : r.range?.p50 ? (
                    <Box><Typography variant="caption" color="text.secondary">Usual range ({r.compared_with} listings)</Typography>
                      <Typography fontWeight={700}>{money(r.range.p25)} – {money(r.range.p75)}</Typography></Box>
                  ) : null}
                  {r.kind === 'shared' && repricer && !r.has_versions && (
                    <Button size="small" variant={r.repricer ? 'contained' : 'outlined'} disableElevation onClick={() => setEditing(r)}
                      sx={{ borderRadius: '8px', fontWeight: 600, ...(r.repricer && { bgcolor: 'text.primary', color: 'background.paper' }) }}>
                      {r.repricer ? (r.repricer.is_active ? 'Repricer on' : 'Repricer paused') : 'Auto-reprice'}
                    </Button>
                  )}
                </Stack>
              </Stack>
              {r.repricer?.last_result && <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Repricer: {r.repricer.last_result}</Typography>}
            </Box>
          ))}
          {!data?.results?.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No live listings to compare.</Typography>}
        </Stack>
      )}
      {pages > 1 && <Stack alignItems="center" sx={{ mt: 2 }}><Pagination page={page} count={pages} onChange={(_, p) => setPage(p)} shape="rounded" /></Stack>}
      {editing && <RuleDialog row={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); mutate(); }} />}
    </Box>
  );
}

function Rules() {
  const client = useMemo(() => createAxiosClient(), []);
  const { data, mutate } = useSWR('/api/v1/tools/pricing/rules/', fetcher);
  const [error, setError] = useState('');
  const remove = async (id) => {
    try { await client.delete(`/api/v1/tools/pricing/rules/${id}/`); mutate(); } catch (err) { setError(apiError(err)); }
  };
  return (
    <Stack spacing={1.25}>
      {error && <Alert severity="error">{error}</Alert>}
      {(data?.results || []).map((r) => (
        <Box key={r.id} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{r.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {r.strategy === 'beat' ? `Beat the cheapest by ${money(r.step)}` : 'Match the cheapest'} · {money(r.min_price)} – {money(r.max_price)} · now {money(r.price)}
                {!r.is_active && ' · paused'}
              </Typography>
              {r.last_result && <Typography variant="caption" color="text.secondary">{r.last_result}</Typography>}
            </Box>
            <Tooltip title="Delete rule"><IconButton aria-label="Delete rule" onClick={() => remove(r.product_id)}><DeleteOutlineIcon /></IconButton></Tooltip>
          </Stack>
        </Box>
      ))}
      {data && !data.results.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No rules yet. Add one from Insights on an item other stores also sell.</Typography>}
    </Stack>
  );
}

function History() {
  const { data } = useSWR('/api/v1/tools/pricing/changes/', fetcher);
  return (
    <Stack spacing={1}>
      {(data?.results || []).map((c, i) => (
        <Stack key={i} direction="row" spacing={1.5} alignItems="center" sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} noWrap>{c.title}</Typography>
            <Typography variant="caption" color="text.secondary">{new Date(c.at).toLocaleString()} · {c.source === 'repricer' ? 'Auto-repricer' : 'Bulk edit'}{c.note && ` · ${c.note}`}</Typography>
          </Box>
          <Typography variant="body2" sx={{ whiteSpace: 'nowrap' }}>{money(c.old_price)} → <strong>{money(c.new_price)}</strong></Typography>
        </Stack>
      ))}
      {data && !data.results.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No price changes yet.</Typography>}
    </Stack>
  );
}

function Pricing() {
  const { byKey } = useTools();
  const repricer = !!byKey.auto_repricer?.included;
  const [tab, setTab] = useState(0);
  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
        <Tab label="Insights" />
        <Tab label={repricer ? 'Auto-repricer' : 'Auto-repricer (upgrade)'} disabled={!repricer} />
        <Tab label="Price history" />
      </Tabs>
      {tab === 0 && <Insights repricer={repricer} />}
      {tab === 1 && repricer && <Rules />}
      {tab === 2 && <History />}
    </Box>
  );
}

export default function PricingPage() {
  return (
    <PageContainer title="Pricing" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Pricing' }]}>
      <ToolGate toolKey="price_insights"><Pricing /></ToolGate>
    </PageContainer>
  );
}
