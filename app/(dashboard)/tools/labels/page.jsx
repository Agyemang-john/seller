'use client';

/** Labels & pick lists (backend tools/labels.py): print documents for many orders at once. */

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, Stack, Typography,
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { createAxiosClient } from '@/utils/clientFetch';

const DOCS = [
  { key: 'labels:4x6', label: 'Labels 4×6″', hint: 'Thermal label printers' },
  { key: 'labels:a4', label: 'Labels on A4', hint: '4 per sheet, any printer' },
  { key: 'packing_slips', label: 'Packing slips', hint: 'One page per order' },
  { key: 'pick_list', label: 'Pick list', hint: 'What to take off the shelves' },
];

function Labels() {
  const client = useMemo(() => createAxiosClient(), []);
  const { data, isLoading } = useSWR('/api/v1/tools/labels/orders/', fetcher);
  const [picked, setPicked] = useState(new Set());
  const [doc, setDoc] = useState('labels:4x6');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const orders = data?.results || [];
  const max = data?.max_orders || 100;
  const allOn = orders.length > 0 && orders.slice(0, max).every((o) => picked.has(o.id));

  const toggle = (id) => setPicked((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else if (s.size < max) s.add(id); return s; });
  const toggleAll = () => setPicked(allOn ? new Set() : new Set(orders.slice(0, max).map((o) => o.id)));

  const print = async () => {
    const [document, size] = doc.split(':');
    setBusy(true); setError('');
    // Opened before the request so the browser treats it as a click, not a pop-up.
    const tab = window.open('', '_blank');
    try {
      const res = await client.post('/api/v1/tools/labels/', { order_ids: [...picked], document, size: size || '' }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      if (tab) tab.location.href = url;
      else { const a = window.document.createElement('a'); a.href = url; a.download = `${document}.pdf`; a.click(); }
      setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (err) {
      if (tab) tab.close();
      let message = 'The document could not be made. Please try again.';
      try { message = JSON.parse(await err.response.data.text()).error || message; } catch { message = apiError(err, message); }
      setError(message);
    } finally { setBusy(false); }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  return (
    <Box sx={{ pb: picked.size ? 10 : 0 }}>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        Orders waiting to ship, oldest first. Choose them, pick a document and print. Only your items are on each document,
        even when the shopper ordered from other stores too.
      </Typography>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {DOCS.map((d) => (
          <Chip key={d.key} clickable onClick={() => setDoc(d.key)} variant={doc === d.key ? 'filled' : 'outlined'}
            label={<span><b>{d.label}</b> · {d.hint}</span>}
            sx={{ height: 'auto', py: 0.75, borderRadius: '10px', ...(doc === d.key && { bgcolor: 'text.primary', color: 'background.paper' }) }} />
        ))}
      </Stack>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {orders.length === 0 ? (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No orders waiting to ship. Nice work.</Typography>
      ) : (
        <>
          <FormControlLabel control={<Checkbox checked={allOn} onChange={toggleAll} />} label={`Select all (${Math.min(orders.length, max)})`} sx={{ mb: 1 }} />
          <Stack spacing={1}>
            {orders.map((o) => (
              <Box key={o.id} onClick={() => toggle(o.id)}
                sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: picked.has(o.id) ? 'text.primary' : 'divider',
                  bgcolor: 'background.paper', cursor: 'pointer' }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Checkbox checked={picked.has(o.id)} onChange={() => toggle(o.id)} onClick={(e) => e.stopPropagation()}
                    inputProps={{ 'aria-label': `Select order ${o.order_number}` }} sx={{ m: -1 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} noWrap>{o.name || 'Customer'} · {o.town || '—'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Order {o.order_number || o.id} · {new Date(o.date).toLocaleDateString()} · {o.units} item{o.units === 1 ? '' : 's'}
                    </Typography>
                  </Box>
                  {o.pickup && <Chip size="small" label="Pickup station" variant="outlined" />}
                </Stack>
              </Box>
            ))}
          </Stack>
        </>
      )}
      {picked.size > 0 && (
        <Box sx={{ position: 'sticky', bottom: 0, mt: 2, zIndex: 3, p: 1.5, bgcolor: 'background.paper', borderTop: '1px solid',
          borderColor: 'divider', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)', borderRadius: { md: '12px' } }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" fontWeight={600}>{picked.size} order{picked.size === 1 ? '' : 's'}</Typography>
            <Button variant="contained" disableElevation onClick={print} disabled={busy}
              startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <PrintOutlinedIcon />}
              sx={{ borderRadius: '10px', fontWeight: 700, minHeight: 44, bgcolor: 'text.primary', color: 'background.paper' }}>
              Print {DOCS.find((d) => d.key === doc)?.label.toLowerCase()}
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default function LabelsPage() {
  return (
    <PageContainer title="Labels & pick lists" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Labels & pick lists' }]}>
      <ToolGate toolKey="labels"><Labels /></ToolGate>
    </PageContainer>
  );
}
