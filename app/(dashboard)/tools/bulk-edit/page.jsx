'use client';

/**
 * Bulk edit (backend tools/bulk_edit.py): change price, old price, stock and
 * cost of many products and versions at once, apply an action to a selection,
 * or round-trip a CSV through Excel / Google Sheets.
 */

import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Box, Button, Checkbox, CircularProgress, InputAdornment, MenuItem, Pagination, Stack, TextField, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import Swal from 'sweetalert2';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { NumberField, fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const API = '/api/v1/tools/bulk-edit/';
const ACTIONS = [
  { value: 'price_percent', label: 'Change price by %', hint: '-10 = 10% off' },
  { value: 'price_amount', label: 'Change price by GHS', hint: '-5 or 5' },
  { value: 'price_set', label: 'Set price to', hint: 'GHS' },
  { value: 'stock_add', label: 'Add to stock', hint: 'negative removes' },
  { value: 'stock_set', label: 'Set stock to', hint: 'units' },
  { value: 'cost_set', label: 'Set cost price to', hint: 'GHS' },
];
const rowKey = (r) => `${r.product_id}:${r.variant_id ?? ''}`;

function Row({ row, edit, error, selected, onSelect, onChange }) {
  const v = (field) => (edit?.[field] ?? row[field] ?? '');
  const changed = edit && Object.keys(edit).length > 0;
  return (
    <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: error ? 'error.light' : changed ? 'warning.light' : 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.25, minWidth: 0 }}>
        <Checkbox checked={selected} onChange={(e) => onSelect(row.product_id, e.target.checked)}
          inputProps={{ 'aria-label': `Select ${row.title}` }} sx={{ m: -1 }} />
        <Box sx={{ width: 40, height: 40, borderRadius: '8px', overflow: 'hidden', bgcolor: 'action.hover', flexShrink: 0 }}>
          {row.image && <Box component="img" src={row.image} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>{row.title}</Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {[row.version, row.seller_sku && `SKU ${row.seller_sku}`, row.status !== 'published' && row.status].filter(Boolean).join(' · ') || ' '}
          </Typography>
        </Box>
      </Stack>
      <Grid container spacing={1}>
        <Grid size={{ xs: 6, md: 3 }}>
          <NumberField label="Price" value={v('price')} onChange={(x) => onChange(row, 'price', x)}
            InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          {row.variant_id ? <TextField size="small" fullWidth disabled label="Old price" value="Per product" sx={fieldSx} /> : (
            <NumberField label="Old price" value={v('compare_at_price')} onChange={(x) => onChange(row, 'compare_at_price', x)}
              InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} />
          )}
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NumberField decimals={false} label="Stock" value={v('stock')} onChange={(x) => onChange(row, 'stock', x)} />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <NumberField label="Your cost" value={v('unit_cost')} onChange={(x) => onChange(row, 'unit_cost', x)}
            InputProps={{ startAdornment: <InputAdornment position="start">₵</InputAdornment> }} helperText={null} />
        </Grid>
      </Grid>
      {error && <Typography variant="caption" color="error" sx={{ display: 'block', mt: 0.75 }}>{error}</Typography>}
    </Box>
  );
}

function BulkEditor() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [edits, setEdits] = useState({});
  const [errors, setErrors] = useState({});
  const [selected, setSelected] = useState(new Set());
  const [op, setOp] = useState('price_percent');
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);
  const fileRef = useRef(null);
  const client = useMemo(() => createAxiosClient(), []);

  const url = `${API}?${new URLSearchParams({ search: query, status, page: String(page) })}`;
  const { data, mutate, isLoading } = useSWR(url, fetcher, { keepPreviousData: true });
  const rows = data?.results || [];
  const dirty = Object.keys(edits).length;
  const pages = data ? Math.max(Math.ceil(data.count / data.page_size), 1) : 1;

  const change = (row, field, x) => setEdits((prev) => {
    const key = rowKey(row);
    const next = { ...(prev[key] || {}), [field]: x };
    if (String(x) === String(row[field] ?? '')) delete next[field];
    const copy = { ...prev };
    if (Object.keys(next).length) copy[key] = next; else delete copy[key];
    return copy;
  });
  const select = (id, on) => setSelected((prev) => { const s = new Set(prev); if (on) s.add(id); else s.delete(id); return s; });

  const report = (result) => {
    const failed = result.errors || [];
    setNotice({ severity: failed.length ? 'warning' : 'success',
      text: `${result.updated} change${result.updated === 1 ? '' : 's'} saved${failed.length ? `, ${failed.length} not saved (see the rows in red)` : ''}.` });
  };

  const save = async () => {
    const keys = Object.keys(edits);
    const changes = keys.map((k) => {
      const [pid, vid] = k.split(':');
      return { product_id: Number(pid), variant_id: vid ? Number(vid) : null, ...edits[k] };
    });
    setBusy(true); setNotice(null);
    try {
      const { data: result } = await client.post(API, { changes });
      const failed = {};
      (result.errors || []).forEach((e) => { failed[keys[e.index]] = e.message; });
      setErrors(failed);
      setEdits((prev) => Object.fromEntries(Object.entries(prev).filter(([k]) => failed[k])));
      report(result);
      mutate();
    } catch (err) {
      setNotice({ severity: 'error', text: apiError(err) });
    } finally { setBusy(false); }
  };

  const runAction = async (all) => {
    if (value === '' || Number.isNaN(Number(value))) { setNotice({ severity: 'error', text: 'Enter a number for the action.' }); return; }
    const label = ACTIONS.find((a) => a.value === op)?.label;
    const target = all ? `all ${data?.count ?? ''} matching products` : `${selected.size} selected product${selected.size === 1 ? '' : 's'}`;
    const { isConfirmed } = await Swal.fire({ icon: 'question', title: `${label} ${value}?`, text: `This changes ${target} and their versions.`,
      showCancelButton: true, confirmButtonText: 'Apply', reverseButtons: true });
    if (!isConfirmed) return;
    setBusy(true); setNotice(null);
    try {
      const body = { op, value, ...(all ? { search: query, status } : { product_ids: [...selected] }) };
      const { data: result } = await client.post(`${API}action/`, body);
      report(result);
      setSelected(new Set());
      mutate();
    } catch (err) {
      setNotice({ severity: 'error', text: apiError(err) });
    } finally { setBusy(false); }
  };

  const exportCsv = async () => {
    try {
      const res = await client.get(`${API}csv/?${new URLSearchParams({ search: query, status })}`, { responseType: 'blob' });
      const href = URL.createObjectURL(res.data);
      const a = document.createElement('a'); a.href = href; a.download = 'negromart_products.csv'; a.click();
      URL.revokeObjectURL(href);
    } catch (err) { setNotice({ severity: 'error', text: apiError(err) }); }
  };
  const importCsv = async (file) => {
    if (!file) return;
    const form = new FormData(); form.append('file', file);
    setBusy(true); setNotice(null);
    try {
      const { data: result } = await client.post(`${API}csv/`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      report(result);
      mutate();
    } catch (err) {
      const d = err?.response?.data;
      if (d?.updated !== undefined) report(d); else setNotice({ severity: 'error', text: apiError(err) });
    } finally { setBusy(false); }
  };

  return (
    <Box sx={{ pb: dirty ? 10 : 0 }}>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Edit the boxes and save, apply one change to many products, or download a CSV, edit it in Excel or Google Sheets and upload it back.
        Your cost price is private: it powers the profit report.
      </Typography>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField size="small" placeholder="Search name or SKU" value={search} sx={{ ...fieldSx, flex: 1 }}
          onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { setQuery(search.trim()); setPage(1); } }}
          InputProps={{ endAdornment: <Button size="small" onClick={() => { setQuery(search.trim()); setPage(1); }}>Search</Button> }} />
        <TextField select size="small" label="Status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} sx={{ ...fieldSx, minWidth: 160 }}
          SelectProps={{ displayEmpty: true }} InputLabelProps={{ shrink: true }}>
          <MenuItem value="">All</MenuItem>
          <MenuItem value="published">Live</MenuItem>
          <MenuItem value="in_review">In review</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
        </TextField>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportCsv} sx={{ borderRadius: '10px', whiteSpace: 'nowrap' }}>Export CSV</Button>
          <Button variant="outlined" startIcon={<UploadFileIcon />} onClick={() => fileRef.current?.click()} disabled={busy} sx={{ borderRadius: '10px', whiteSpace: 'nowrap' }}>Import CSV</Button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={(e) => { importCsv(e.target.files[0]); e.target.value = ''; }} />
        </Stack>
      </Stack>

      <Box sx={{ p: 1.5, mb: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
          <TextField select size="small" value={op} onChange={(e) => setOp(e.target.value)} sx={{ ...fieldSx, minWidth: 200, bgcolor: 'background.paper', borderRadius: '10px' }}>
            {ACTIONS.map((a) => <MenuItem key={a.value} value={a.value}>{a.label}</MenuItem>)}
          </TextField>
          <TextField size="small" value={value} onChange={(e) => setValue(e.target.value.replace(/[^\d.-]/g, ''))}
            placeholder={ACTIONS.find((a) => a.value === op)?.hint} inputProps={{ inputMode: 'decimal' }}
            sx={{ ...fieldSx, width: { sm: 150 }, bgcolor: 'background.paper', borderRadius: '10px' }} />
          {/* Outlined until something is selected: a disabled dark button reads as a blank block. */}
          <Button variant={selected.size ? 'contained' : 'outlined'} disableElevation disabled={busy || !selected.size} onClick={() => runAction(false)}
            sx={{ borderRadius: '10px', fontWeight: 700, ...(selected.size && { bgcolor: 'text.primary', color: 'background.paper' }) }}>
            Apply to selected ({selected.size})
          </Button>
          <Button disabled={busy || !data?.count} onClick={() => runAction(true)} sx={{ borderRadius: '10px', fontWeight: 600 }}>
            Apply to all {data?.count ?? ''} matching
          </Button>
        </Stack>
      </Box>

      {notice && <Alert severity={notice.severity} onClose={() => setNotice(null)} sx={{ mb: 2, borderRadius: '10px' }}>{notice.text}</Alert>}
      {isLoading && !data ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box> : (
        <Stack spacing={1.25}>
          {rows.map((r) => (
            <Row key={rowKey(r)} row={r} edit={edits[rowKey(r)]} error={errors[rowKey(r)]}
              selected={selected.has(r.product_id)} onSelect={select} onChange={change} />
          ))}
          {!rows.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No products match.</Typography>}
        </Stack>
      )}
      {pages > 1 && (
        <Stack alignItems="center" sx={{ mt: 2 }}>
          <Pagination page={page} count={pages} onChange={(_, p) => setPage(p)} shape="rounded" />
        </Stack>
      )}

      {dirty > 0 && (
        <Box sx={{ position: 'sticky', bottom: 0, mt: 2, zIndex: 3, p: 1.5, borderRadius: { md: '12px' }, bgcolor: 'background.paper',
          borderTop: '1px solid', borderColor: 'divider', boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
            <Typography variant="body2" fontWeight={600}>{dirty} row{dirty === 1 ? '' : 's'} changed</Typography>
            <Stack direction="row" spacing={1}>
              <Button onClick={() => { setEdits({}); setErrors({}); }} disabled={busy} sx={{ borderRadius: '10px' }}>Undo</Button>
              <Button variant="contained" disableElevation onClick={save} disabled={busy}
                startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <SaveOutlinedIcon />}
                sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', minHeight: 44 }}>
                Save changes
              </Button>
            </Stack>
          </Stack>
        </Box>
      )}
    </Box>
  );
}

export default function BulkEditPage() {
  return (
    <PageContainer title="Bulk edit" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Bulk edit' }]}>
      <ToolGate toolKey="bulk_edit"><BulkEditor /></ToolGate>
    </PageContainer>
  );
}
