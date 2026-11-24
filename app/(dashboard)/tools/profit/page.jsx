'use client';

/** Profit report (backend tools/profit.py): real profit after fees, refunds, ads and the seller's cost. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Alert, Box, Button, Chip, CircularProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import DownloadIcon from '@mui/icons-material/Download';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError, money } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { createAxiosClient } from '@/utils/clientFetch';

const iso = (d) => d.toISOString().slice(0, 10);
// Computed when a preset is picked (not during render: dates are impure).
const rangeFor = (days) => ({ days, end: iso(new Date()), start: iso(new Date(Date.now() - (days - 1) * 86400000)) });
const PRESETS = [{ label: '30 days', days: 30 }, { label: '90 days', days: 90 }, { label: '12 months', days: 365 }];

function Card({ label, value, tone }) {
  return (
    <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', height: '100%' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontSize: { xs: 20, md: 24 }, fontWeight: 800, color: tone }}>{value}</Typography>
    </Box>
  );
}

function Report() {
  const [range, setRange] = useState(() => rangeFor(90));
  const [error, setError] = useState('');
  const client = useMemo(() => createAxiosClient(), []);
  const { days, start, end } = range;
  const { data, isLoading } = useSWR(`/api/v1/tools/profit/?start=${start}&end=${end}`, fetcher, { keepPreviousData: true });
  const t = data?.totals;
  const fees = t ? Number(t.commission) + Number(t.coupons) : 0;
  const maxMonth = Math.max(1, ...(data?.months || []).map((m) => Math.abs(Number(m.profit)) || 0), ...(data?.months || []).map((m) => Number(m.sales) || 0));

  const download = async () => {
    try {
      const res = await client.get(`/api/v1/tools/profit/?export=csv&start=${start}&end=${end}`, { responseType: 'blob' });
      const href = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = href; a.download = `profit_${start}_${end}.csv`; a.click();
      URL.revokeObjectURL(href);
    } catch (err) { setError(apiError(err)); }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1}>
          {PRESETS.map((p) => (
            <Chip key={p.days} label={p.label} onClick={() => setRange(rangeFor(p.days))} variant={days === p.days ? 'filled' : 'outlined'} sx={{ fontWeight: 600 }} />
          ))}
        </Stack>
        <Box sx={{ flex: 1 }} />
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={download} sx={{ borderRadius: '10px' }}>Download CSV</Button>
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {isLoading && !data ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box> : t && (
        <>
          {data.units_without_cost > 0 && (
            <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px' }}
              action={<Button component={Link} href="/tools/bulk-edit" size="small">Add costs</Button>}>
              {data.units_without_cost} of {data.units_sold} units sold have no cost price, so profit is shown higher than it is.
              Add your cost per item in bulk edit.
            </Alert>
          )}
          <Grid container spacing={1.5} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Sales" value={money(t.sales)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Fees & your coupons" value={money(fees)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Refunds" value={money(t.refunds)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Ads" value={money(t.ads)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Delivery earnings" value={money(t.delivery)} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Cost of goods" value={money(-Number(t.cost_of_goods))} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Profit" value={money(t.profit)} tone={Number(t.profit) >= 0 ? 'success.main' : 'error.main'} /></Grid>
            <Grid size={{ xs: 6, md: 3 }}><Card label="Margin" value={t.margin == null ? '—' : `${t.margin}%`} /></Grid>
          </Grid>

          {data.months.length > 0 && (
            <Box sx={{ mb: 3, p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
              <Typography fontWeight={700} sx={{ mb: 1.5 }}>By month</Typography>
              <Stack spacing={1}>
                {data.months.map((m) => (
                  <Stack key={m.month} direction="row" spacing={1.5} alignItems="center">
                    <Typography variant="body2" sx={{ width: 64, flexShrink: 0 }}>{m.month}</Typography>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.selected', width: `${(Number(m.sales) / maxMonth) * 100}%` }} />
                      <Box sx={{ mt: 0.5, height: 8, borderRadius: 4, bgcolor: Number(m.profit) >= 0 ? 'success.main' : 'error.main',
                        width: `${(Math.abs(Number(m.profit)) / maxMonth) * 100}%` }} />
                    </Box>
                    <Typography variant="body2" sx={{ width: 110, textAlign: 'right', fontWeight: 700 }}>{money(m.profit)}</Typography>
                  </Stack>
                ))}
              </Stack>
              <Typography variant="caption" color="text.secondary">Grey: sales · colour: profit</Typography>
            </Box>
          )}

          <Typography fontWeight={700} sx={{ mb: 1 }}>By product</Typography>
          <TableContainer sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {['Product', 'Units', 'Sales', 'Fees', 'Refunds', 'Cost', 'Profit', 'Margin'].map((h) => <TableCell key={h} sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</TableCell>)}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.products.map((p) => (
                  <TableRow key={p.product_id ?? p.title}>
                    <TableCell sx={{ minWidth: 180 }}>{p.title}{p.missing_cost && <Chip size="small" label="no cost" sx={{ ml: 1, height: 18, fontSize: 11 }} />}</TableCell>
                    <TableCell>{p.units}</TableCell>
                    <TableCell>{money(p.sales)}</TableCell>
                    <TableCell>{money(Number(p.commission) + Number(p.coupons))}</TableCell>
                    <TableCell>{money(p.refunds)}</TableCell>
                    <TableCell>{money(-Number(p.cost_of_goods))}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: Number(p.profit) >= 0 ? 'success.main' : 'error.main' }}>{money(p.profit)}</TableCell>
                    <TableCell>{p.margin == null ? '—' : `${p.margin}%`}</TableCell>
                  </TableRow>
                ))}
                {!data.products.length && <TableRow><TableCell colSpan={8} sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>No delivered sales in this period.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Sales count when an order is delivered. Ad spend is shown in the totals, not split across products. Cost uses the cost price set now.
          </Typography>
        </>
      )}
    </Box>
  );
}

export default function ProfitPage() {
  return (
    <PageContainer title="Profit report" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Profit report' }]}>
      <ToolGate toolKey="profit_report"><Report /></ToolGate>
    </PageContainer>
  );
}
