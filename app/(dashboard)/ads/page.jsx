'use client';

/**
 * Sponsored products (backend: ads/). Pay per click, from your earnings.
 * Ads show in the first places of search results and category pages; you
 * never pay more than your bid, and usually less (just enough to beat the
 * next ad). Spend is deducted from your balance each night.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, Grid, Stack, Switch, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError } from '@/libs/seller-ops';

const money = (v) => `GHS ${Number(v || 0).toFixed(2)}`;

function ProductPicker({ value, onChange }) {
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      createAxiosClient().get('/api/v1/vendor/products/', { params: { search: input, status: 'published', page_size: 20 } })
        .then(({ data }) => setOptions((data.results || []).map((p) => ({ id: p.id, title: p.title }))))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [input]);
  return (
    <Autocomplete multiple options={options} value={value} filterSelectedOptions
                  getOptionLabel={(o) => o.title} isOptionEqualToValue={(a, b) => a.id === b.id}
                  onChange={(_, v) => onChange(v)} onInputChange={(_, v) => setInput(v)}
                  renderInput={(params) => <TextField {...params} size="small" label="Products to advertise" />} />
  );
}

function CampaignDialog({ open, onClose, onSaved, reserve }) {
  const [form, setForm] = useState({ name: '', bid: '0.50', daily_budget: '20', auto_targeting: true });
  const [products, setProducts] = useState([]);
  const [keywords, setKeywords] = useState([]);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await createAxiosClient().post('/api/v1/ads/seller/campaigns/', {
        ...form, products: products.map((p) => p.id), keywords: keywords.map((phrase) => ({ phrase })),
      });
      toast.success('Campaign started');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(apiError(err, 'Could not create the campaign.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>New campaign</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField size="small" label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <ProductPicker value={products} onChange={setProducts} />
          <Stack direction="row" spacing={2}>
            <TextField size="small" type="number" label="Max cost per click (GHS)" value={form.bid}
                       helperText={`At least ${reserve}`} onChange={(e) => setForm({ ...form, bid: e.target.value })} />
            <TextField size="small" type="number" label="Daily budget (GHS)" value={form.daily_budget}
                       helperText="At least 5.00" onChange={(e) => setForm({ ...form, daily_budget: e.target.value })} />
          </Stack>
          <Autocomplete multiple freeSolo options={[]} value={keywords} onChange={(_, v) => setKeywords(v.slice(0, 100))}
                        renderInput={(params) => <TextField {...params} size="small" label="Keywords (optional)"
                                                            helperText="Press Enter after each. Your ads show when a search contains these words." />} />
          <FormControlLabel control={<Switch checked={form.auto_targeting} onChange={(e) => setForm({ ...form, auto_targeting: e.target.checked })} />}
                            label="Also show for searches that match the product (recommended)" />
          <Typography variant="caption" color="text.secondary">
            Ads also appear at the top of your products&apos; category pages.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disableElevation onClick={save} disabled={saving || !form.name || !products.length}>
          Start campaign
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function AdsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    createAxiosClient().get('/api/v1/ads/seller/campaigns/').then(({ data: d }) => setData(d))
      .catch((err) => setError(apiError(err, 'Could not load campaigns.')));
  }, []);
  useEffect(() => { load(); }, [load]);

  const setStatus = async (c, status) => {
    try {
      await createAxiosClient().patch(`/api/v1/ads/seller/campaigns/${c.id}/`, { status });
      load();
    } catch (err) {
      toast.error(apiError(err, 'Could not update the campaign.'));
    }
  };

  const totals = (data?.results || []).reduce((t, c) => ({
    impressions: t.impressions + Number(c.stats.impressions || 0), clicks: t.clicks + Number(c.stats.clicks || 0),
    spend: t.spend + Number(c.stats.spend || 0), sales: t.sales + Number(c.stats.sales || 0),
  }), { impressions: 0, clicks: 0, spend: 0, sales: 0 });

  return (
    <PageContainer title="Sponsored products" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Ads' }]}>
      <Box sx={{ maxWidth: 1100 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Put your products in the first places of search results and category pages. You pay only when a shopper
          clicks, never more than your bid, and spend is taken from your earnings each night.
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {data && data.funded === false && (
          <Alert severity="warning" sx={{ mb: 2 }}>Your ads are paused until you have earnings to cover them.</Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {[['Impressions (30 days)', totals.impressions.toLocaleString()], ['Clicks', totals.clicks.toLocaleString()],
            ['Spend', money(totals.spend)], ['Sales from ads', money(totals.sales)]].map(([label, value]) => (
            <Grid key={label} size={{ xs: 6, md: 3 }}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{value}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography sx={{ fontWeight: 700 }}>Campaigns</Typography>
          <Button variant="contained" disableElevation onClick={() => setCreating(true)}>New campaign</Button>
        </Stack>
        <Card variant="outlined" sx={{ overflowX: 'auto' }}>
          <Table size="small" sx={{ minWidth: 760 }}>
            <TableHead>
              <TableRow>
                {['Campaign', 'Status', 'Bid', 'Daily budget', 'Impr.', 'Clicks', 'CTR', 'Spend', 'Sales', 'ACoS', ''].map((h) => (
                  <TableCell key={h}>{h}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.results || []).map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600, fontSize: 14 }}>{c.name}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {c.products.length} product{c.products.length === 1 ? '' : 's'}{c.keywords.length ? ` · ${c.keywords.length} keywords` : ''}
                    </Typography>
                  </TableCell>
                  <TableCell><Chip size="small" label={c.status} color={c.status === 'active' ? 'success' : 'default'} /></TableCell>
                  <TableCell>{money(c.bid)}</TableCell>
                  <TableCell>{money(c.daily_budget)}</TableCell>
                  <TableCell>{c.stats.impressions}</TableCell>
                  <TableCell>{c.stats.clicks}</TableCell>
                  <TableCell>{c.stats.ctr}%</TableCell>
                  <TableCell>{money(c.stats.spend)}</TableCell>
                  <TableCell>{money(c.stats.sales)}</TableCell>
                  <TableCell>{c.stats.acos == null ? '—' : `${c.stats.acos}%`}</TableCell>
                  <TableCell>
                    {c.status === 'active'
                      ? <Button size="small" onClick={() => setStatus(c, 'paused')}>Pause</Button>
                      : <Button size="small" onClick={() => setStatus(c, 'active')}>Resume</Button>}
                    <Button size="small" color="inherit" onClick={() => setStatus(c, 'archived')}>Archive</Button>
                  </TableCell>
                </TableRow>
              ))}
              {data && data.results.length === 0 && (
                <TableRow><TableCell colSpan={11}><Typography color="text.secondary">No campaigns yet.</Typography></TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          ACoS = ad spend ÷ sales from ads. Sales count orders placed within 7 days of a click on the product.
        </Typography>
      </Box>
      <CampaignDialog open={creating} onClose={() => setCreating(false)} onSaved={load} reserve={data?.reserve_cpc || '0.20'} />
    </PageContainer>
  );
}
