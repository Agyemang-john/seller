'use client';

/** Stock forecast (backend tools/forecast.py): days of stock left, reorder list, alerts. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Box, Button, Chip, CircularProgress, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const STATUS = {
  out: { label: 'Out of stock', color: '#C62828', bg: 'rgba(198,40,40,0.08)' },
  reorder_now: { label: 'Reorder now', color: '#E65100', bg: 'rgba(230,81,0,0.08)' },
  reorder_soon: { label: 'Reorder soon', color: '#B26A00', bg: 'rgba(245,158,11,0.10)' },
  ok: { label: 'Enough stock', color: '#2E7D32', bg: 'rgba(46,125,50,0.08)' },
  no_sales: { label: 'No recent sales', color: '#616161', bg: 'rgba(0,0,0,0.04)' },
  out_idle: { label: 'Out, not selling', color: '#9E9E9E', bg: 'rgba(0,0,0,0.03)' },
};
const ORDER = ['out', 'reorder_now', 'reorder_soon', 'ok', 'no_sales', 'out_idle'];

function Forecast() {
  const [lead, setLead] = useState('7');
  const [cover, setCover] = useState('30');
  const [applied, setApplied] = useState({ lead: '7', cover: '30' });
  const [filter, setFilter] = useState('');
  const [error, setError] = useState('');
  const client = useMemo(() => createAxiosClient(), []);
  const { data, isLoading } = useSWR(`/api/v1/tools/stock/?lead_days=${applied.lead}&cover_days=${applied.cover}`, fetcher, { keepPreviousData: true });
  const rows = (data?.results || []).filter((r) => !filter || r.status === filter);

  const download = async () => {
    try {
      const res = await client.get(`/api/v1/tools/stock/?export=csv&lead_days=${applied.lead}&cover_days=${applied.cover}`, { responseType: 'blob' });
      const href = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = href; a.download = 'reorder_list.csv'; a.click();
      URL.revokeObjectURL(href);
    } catch (err) { setError(apiError(err)); }
  };

  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Based on what sold in the last 7 and 28 days. Tell us how long a restock takes to arrive and how many days you want to be covered
        after it; we work out what to reorder. You also get an alert each morning for anything that will run out before a restock could arrive.
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <TextField size="small" label="Restock takes" value={lead} onChange={(e) => setLead(e.target.value.replace(/\D/g, ''))} sx={{ ...fieldSx, width: { sm: 150 } }}
          InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} inputProps={{ inputMode: 'numeric' }} />
        <TextField size="small" label="Cover for" value={cover} onChange={(e) => setCover(e.target.value.replace(/\D/g, ''))} sx={{ ...fieldSx, width: { sm: 150 } }}
          InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }} inputProps={{ inputMode: 'numeric' }} />
        <Button variant="outlined" onClick={() => setApplied({ lead: lead || '7', cover: cover || '30' })} sx={{ borderRadius: '10px' }}>Update</Button>
        <Box sx={{ flex: 1 }} />
        <Button variant="contained" disableElevation startIcon={<DownloadIcon />} onClick={download}
          sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>Reorder list (CSV)</Button>
      </Stack>
      {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}

      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 2 }}>
        <Chip label={`All (${data?.results?.length ?? 0})`} onClick={() => setFilter('')} variant={filter ? 'outlined' : 'filled'} />
        {ORDER.filter((s) => data?.counts?.[s]).map((s) => (
          <Chip key={s} label={`${STATUS[s].label} (${data.counts[s]})`} onClick={() => setFilter(s)} variant={filter === s ? 'filled' : 'outlined'}
            sx={{ color: STATUS[s].color, borderColor: STATUS[s].color }} />
        ))}
      </Stack>

      {isLoading && !data ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box> : (
        <Stack spacing={1}>
          {rows.map((r) => {
            const s = STATUS[r.status];
            return (
              <Box key={`${r.product_id}-${r.variant_id}`} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0 }}>
                      {r.image && <Box component="img" src={r.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700} noWrap>{r.title}</Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>{[r.version, r.seller_sku && `SKU ${r.seller_sku}`].filter(Boolean).join(' · ') || ' '}</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
                    <Box><Typography variant="caption" color="text.secondary">In stock</Typography><Typography fontWeight={700}>{r.stock}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Sells / day</Typography><Typography fontWeight={700}>{r.per_day}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Days left</Typography><Typography fontWeight={700}>{r.days_left ?? '—'}</Typography></Box>
                    <Box><Typography variant="caption" color="text.secondary">Reorder</Typography><Typography fontWeight={700}>{r.reorder_qty || '—'}</Typography></Box>
                    <Chip size="small" label={s.label} sx={{ color: s.color, bgcolor: s.bg, fontWeight: 700 }} />
                    <Button size="small" component={Link} href={`/products/product/${r.product_id}`} sx={{ borderRadius: '8px' }}>Edit</Button>
                  </Stack>
                </Stack>
              </Box>
            );
          })}
          {!rows.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>Nothing here.</Typography>}
        </Stack>
      )}
    </Box>
  );
}

export default function StockPage() {
  return (
    <PageContainer title="Stock forecast" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Stock forecast' }]}>
      <ToolGate toolKey="stock_forecast"><Forecast /></ToolGate>
    </PageContainer>
  );
}
