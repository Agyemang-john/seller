'use client';

/**
 * Add products in bulk. Two ways, same backend (vendor/bulk_upload.py):
 *   "Add in the browser" — a card per product with photos and versions. Best for most sellers.
 *   "Upload a spreadsheet" — the CSV template, for big catalogues kept in Excel / Google Sheets.
 * The full seller guide is /products/bulk-upload/guide.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert, AlertTitle, Box, Button, Chip, CircularProgress, Collapse, Divider, IconButton, LinearProgress,
  Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import ViewAgendaOutlinedIcon from '@mui/icons-material/ViewAgendaOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import BulkProductGrid from '@/components/products/BulkProductGrid';
import { createAxiosClient } from '@/utils/clientFetch';

const API = '/api/v1/vendor/products/bulk-upload';
const MAX_PREVIEW_ROWS = 50;
const MAX_FILE_MB = 5;
const POLL_MS = 3000;

// ── CSV reading (quotes, commas and line breaks inside cells) ────────────────
function parseCsv(text) {
  const head = text.slice(0, 2048);
  const delimiter = head.includes('\t') && !head.includes(',') ? '\t'
    : (head.split(';').length > head.split(',').length ? ';' : ',');
  const rows = [];
  let row = [''];
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { row[row.length - 1] += '"'; i += 1; }
      else if (ch === '"') quoted = false;
      else row[row.length - 1] += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) row.push('');
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i += 1;
      rows.push(row); row = [''];
    } else row[row.length - 1] += ch;
  }
  if (row.length > 1 || row[0]) rows.push(row);
  const [header = [], ...body] = rows;
  const headers = header.map((h) => h.replace(/^﻿/, '').trim());
  const data = body
    .filter((r) => r.some((v) => v.trim()))
    .map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
  return { headers, rows: data };
}

const ALIASES = {
  sub_category_slug: 'category', brand_slug: 'brand', old_price: 'compare_at_price', total_quantity: 'stock',
  product_type: 'condition', weight: 'weight_kg', gtin: 'barcode', return_period_days: 'return_days',
};
const canonical = (h) => { const k = h.trim().toLowerCase().replace(/ /g, '_'); return ALIASES[k] || k; };

// ── Pieces ───────────────────────────────────────────────────────────────────
function UpgradeGate() {
  const router = useRouter();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', px: 3 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <LockOutlinedIcon sx={{ fontSize: 32, color: 'warning.main' }} />
      </Box>
      <Typography sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 28, md: 36 }, fontWeight: 700, mb: 1.5 }}>Pro feature</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 400, lineHeight: 1.75, mb: 4 }}>
        Adding products in bulk comes with the <strong>Pro plan</strong> and above: up to 500 products at once, with photos and versions.
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button variant="outlined" onClick={() => router.back()} sx={{ borderRadius: '10px' }}>Go back</Button>
        <Button variant="contained" disableElevation href="/subscribe" sx={{ bgcolor: 'warning.main', borderRadius: '10px', fontWeight: 700 }}>See plans</Button>
      </Stack>
    </Box>
  );
}

function Stat({ icon, label, value, color }) {
  return (
    <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', textAlign: 'center' }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography sx={{ fontSize: 26, fontWeight: 800, lineHeight: 1, color }}>{value}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
    </Box>
  );
}

const fieldName = { title: 'Name', category: 'Category', price: 'Price', stock: 'Stock', weight_kg: 'Weight', options: 'Versions',
  ships_to: 'Ships to', delivery_methods: 'Delivery', seller_sku: 'SKU', image_url: 'Photo', more_image_urls: 'Photos',
  compare_at_price: 'Old price', condition: 'Condition', brand: 'Brand', barcode: 'Barcode', return_days: 'Return days' };

function UploadReport({ result, onReset, rowWord }) {
  const [open, setOpen] = useState(true);
  const drafts = (result.products || []).filter((p) => p.status === 'draft');
  const warned = (result.products || []).filter((p) => p.warnings?.length && p.status !== 'draft');
  return (
    <Box>
      <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
        <Grid size={{ xs: 4 }}><Stat icon={<CheckCircleOutlineIcon />} label="Sent for review" value={(result.success_count || 0) - drafts.length} color="success.main" /></Grid>
        <Grid size={{ xs: 4 }}><Stat icon={<EditNoteOutlinedIcon />} label="Drafts to finish" value={drafts.length} color={drafts.length ? 'warning.main' : 'text.disabled'} /></Grid>
        <Grid size={{ xs: 4 }}><Stat icon={<ErrorOutlineIcon />} label="Not saved" value={result.failed_count || 0} color={result.failed_count ? 'error.main' : 'text.disabled'} /></Grid>
      </Grid>

      {!result.failed_count && drafts.length === 0 && (
        <Alert severity="success" sx={{ borderRadius: '10px', mb: 2.5 }}>
          <AlertTitle>All {result.success_count} products were sent for review</AlertTitle>
          You&apos;ll find them in My Products. We&apos;ll let you know when they&apos;re live.
        </Alert>
      )}

      {drafts.length > 0 && (
        <Box sx={{ border: '1px solid', borderColor: 'warning.light', borderRadius: '12px', overflow: 'hidden', mb: 2.5 }}>
          <Box sx={{ px: 2, py: 1.25, bgcolor: 'rgba(245,158,11,0.08)' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Saved as drafts: add a photo, then submit them</Typography>
            <Typography variant="caption" color="text.secondary">Shoppers can&apos;t see a product until it has a photo and passes review.</Typography>
          </Box>
          {drafts.map((p) => (
            <Stack key={p.product_id} direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }}
              sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{p.title}</Typography>
                {p.warnings.map((w) => <Typography key={w} variant="caption" color="text.secondary" sx={{ display: 'block' }}>{w}</Typography>)}
              </Box>
              <Button size="small" variant="outlined" component={Link} href={`/products/product/${p.product_id}`}
                sx={{ borderRadius: '8px', flexShrink: 0 }}>Finish</Button>
            </Stack>
          ))}
        </Box>
      )}

      {warned.length > 0 && (
        <Alert severity="info" sx={{ borderRadius: '10px', mb: 2.5 }}>
          <AlertTitle>Saved, with a note</AlertTitle>
          {warned.map((p) => <Typography key={p.product_id} variant="body2"><strong>{p.title}:</strong> {p.warnings.join(' ')}</Typography>)}
        </Alert>
      )}

      {result.errors?.length > 0 && (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden', mb: 2.5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" onClick={() => setOpen((o) => !o)}
            sx={{ px: 2, py: 1.25, bgcolor: 'rgba(239,68,68,0.05)', cursor: 'pointer' }}>
            <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'error.main' }}>
              {result.errors.length} product{result.errors.length === 1 ? '' : 's'} not saved: fix and upload {result.errors.length === 1 ? 'it' : 'them'} again
            </Typography>
            <IconButton size="small" aria-label={open ? 'Hide' : 'Show'}>{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
          </Stack>
          <Collapse in={open}>
            {result.errors.map((err) => (
              <Box key={`${err.row}-${err.title}`} sx={{ px: 2, py: 1.25, borderTop: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                  <Chip size="small" label={rowWord === 'row' ? `Row ${(err.rows || [err.row]).join(', ')}` : `Product ${err.row}`}
                    sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: 'error.main' }} />
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{err.title}</Typography>
                </Stack>
                {Object.entries(err.errors || {}).map(([field, msg]) => (
                  <Typography key={field} variant="body2" color="text.secondary">
                    <strong>{fieldName[field] || field}:</strong> {Array.isArray(msg) ? msg.join(' ') : String(msg)}
                  </Typography>
                ))}
              </Box>
            ))}
          </Collapse>
        </Box>
      )}

      <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
        <Button variant="outlined" onClick={onReset} sx={{ borderRadius: '10px', fontWeight: 600 }}>
          {result.errors?.length ? 'Fix the rest' : 'Add more'}
        </Button>
        <Button variant="contained" disableElevation component={Link} href="/products"
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600 }}>My products</Button>
      </Stack>
    </Box>
  );
}

function JobProgress({ job }) {
  const done = (job.success_count || 0) + (job.failed_count || 0);
  const pct = job.total_rows ? Math.round((done / job.total_rows) * 100) : 0;
  if (job.status === 'failed') {
    return <Alert severity="error" sx={{ borderRadius: '10px' }}><AlertTitle>The upload stopped</AlertTitle>{job.error_message}</Alert>;
  }
  return (
    <Box sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
        {job.status === 'queued' ? 'Getting started…' : `Adding products… ${done} of ${job.total_rows}`}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Photos are being downloaded and checked, so this can take a few minutes. You can leave this page; the products will appear in My Products.
      </Typography>
      <LinearProgress variant={job.status === 'queued' ? 'indeterminate' : 'determinate'} value={pct} sx={{ height: 8, borderRadius: 4 }} />
    </Box>
  );
}

function LookupPanel({ title, hint, items, code, label }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [copied, setCopied] = useState('');
  const shown = useMemo(() => {
    const l = q.toLowerCase();
    return (items || []).filter((i) => `${label(i)} ${code(i)}`.toLowerCase().includes(l)).slice(0, 200);
  }, [items, q, code, label]);
  const copy = (text) => { navigator.clipboard?.writeText(text).then(() => { setCopied(text); setTimeout(() => setCopied(''), 1200); }).catch(() => {}); };
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25, cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <Box>
          <Typography sx={{ fontWeight: 700, fontSize: 14 }}>{title} ({items?.length ?? 0})</Typography>
          {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
        </Box>
        <IconButton size="small" aria-label={open ? 'Hide' : 'Show'}>{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <TextField size="small" fullWidth placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} sx={{ mb: 1 }} />
          <Box sx={{ maxHeight: 240, overflowY: 'auto' }}>
            {shown.map((i) => (
              <Stack key={code(i)} direction="row" alignItems="center" justifyContent="space-between" spacing={1}
                sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 13, flex: 1, minWidth: 0 }}>{label(i)}</Typography>
                <Tooltip title={copied === code(i) ? 'Copied' : 'Copy'}>
                  <Button size="small" onClick={() => copy(code(i))} endIcon={<ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />}
                    sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, textTransform: 'none', color: 'text.secondary', flexShrink: 0 }}>
                    {code(i)}
                  </Button>
                </Tooltip>
              </Stack>
            ))}
            {!shown.length && <Typography variant="caption" color="text.disabled">Nothing matches.</Typography>}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

function ColumnGuide({ columns }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.25, cursor: 'pointer' }} onClick={() => setOpen((o) => !o)}>
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>What goes in each column</Typography>
        <IconButton size="small" aria-label={open ? 'Hide' : 'Show'}>{open ? <ExpandLessIcon /> : <ExpandMoreIcon />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
          {(columns || []).map((c) => (
            <Box key={c.name} sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography sx={{ fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700, color: c.required ? 'error.main' : 'text.primary' }}>
                {c.name}{c.required ? ' *' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary">{c.help}</Typography>
            </Box>
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

function DropZone({ onFile, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const handle = (file) => {
    setError('');
    if (!file) return;
    const name = file.name.toLowerCase();
    if (/\.(xlsx|xls|numbers|ods)$/.test(name)) { setError('Save the sheet as CSV first (Excel: File › Save As › CSV UTF-8; Google Sheets: File › Download › CSV).'); return; }
    if (!/\.(csv|tsv|txt)$/.test(name)) { setError('Choose a .csv file.'); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { setError(`The file is larger than ${MAX_FILE_MB} MB. Split it into smaller files.`); return; }
    onFile(file);
  };
  return (
    <Box>
      <Box role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click(); }}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => !disabled && inputRef.current?.click()}
        sx={{ border: '2px dashed', borderColor: dragging ? 'text.primary' : 'divider', borderRadius: '16px', p: { xs: 4, md: 6 }, textAlign: 'center',
          cursor: disabled ? 'not-allowed' : 'pointer', bgcolor: dragging ? 'action.selected' : 'action.hover' }}>
        <input ref={inputRef} type="file" accept=".csv,.tsv,.txt,text/csv" hidden onChange={(e) => { handle(e.target.files[0]); e.target.value = ''; }} disabled={disabled} />
        <CloudUploadIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1 }} />
        <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>Drop your CSV file here, or tap to choose it</Typography>
        <Typography variant="body2" color="text.secondary">CSV · up to {MAX_FILE_MB} MB · up to 500 rows</Typography>
      </Box>
      {error && <Alert severity="error" sx={{ mt: 1.5, borderRadius: '10px' }}>{error}</Alert>}
    </Box>
  );
}

function PreviewTable({ headers, rows, required }) {
  return (
    <TableContainer sx={{ maxHeight: 320, border: '1px solid', borderColor: 'divider', borderRadius: '12px' }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, fontSize: 11 }}>Row</TableCell>
            {headers.map((h) => (
              <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap', color: required.includes(canonical(h)) ? 'error.main' : 'text.secondary' }}>{h}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.slice(0, MAX_PREVIEW_ROWS).map((r, i) => (
            <TableRow key={i} sx={{ opacity: (r[headers[0]] || '').startsWith('#') ? 0.45 : 1 }}>
              <TableCell sx={{ fontSize: 11, color: 'text.disabled' }}>{i + 2}</TableCell>
              {headers.map((h) => (
                <TableCell key={h} sx={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r[h]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const router = useRouter();
  const client = useMemo(() => createAxiosClient(), []);
  const gridRef = useRef(null);
  const sentIds = useRef([]);
  const pollRef = useRef(null);

  const [checked, setChecked] = useState(false);
  const [meta, setMeta] = useState(null);
  const [tab, setTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState('');
  const [file, setFile] = useState(null);
  const [csv, setCsv] = useState({ headers: [], rows: [] });

  useEffect(() => {
    client.get(`${API}/meta/`).then((res) => setMeta(res.data)).catch(() => setMeta(null)).finally(() => setChecked(true));
  }, [client]);
  // After an upload: the plan's room left (and the store's defaults) have changed.
  useEffect(() => {
    if (!result?.success_count) return;
    client.get(`${API}/meta/`).then((res) => setMeta(res.data)).catch(() => {});
  }, [result, client]);
  useEffect(() => () => clearInterval(pollRef.current), []);

  const poll = useCallback((jobId) => {
    const tick = async () => {
      try {
        const { data } = await client.get(`${API}/job/${jobId}/`);
        setJob(data);
        if (data.status === 'done' || data.status === 'failed') {
          clearInterval(pollRef.current);
          setUploading(false);
          if (data.status === 'done') setResult(data);
        }
      } catch { /* try again on the next tick */ }
    };
    pollRef.current = setInterval(tick, POLL_MS);
    tick();
  }, [client]);

  const handleResponse = (data) => {
    if (data.mode === 'async') { setJob({ ...data, success_count: 0, failed_count: 0 }); poll(data.job_id); return; }
    setResult(data);
    setUploading(false);
  };
  const handleError = (err) => {
    setUploading(false);
    const data = err?.response?.data;
    if (data?.products || data?.errors) { setResult(data); return; }
    setError(data?.detail || data?.error || 'The upload failed. Check your connection and try again.');
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setResult(null); setJob(null); setError(''); setUploading(false); setFile(null); setCsv({ headers: [], rows: [] });
  };

  // Table
  const submitTable = async ({ products, files, ids }) => {
    sentIds.current = ids;
    setUploading(true); setError(''); setResult(null); setJob(null);
    const form = new FormData();
    form.append('products', JSON.stringify(products));
    files.forEach(([key, f]) => form.append(key, f, f.name || 'photo.jpg'));
    try {
      const { data } = await client.post(`${API}/direct/`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      handleResponse(data);
    } catch (err) { handleError(err); }
  };
  // After a table upload: saved products leave the list, the ones to fix stay with their errors.
  const backToTable = () => {
    const errors = result?.errors || [];
    const failedIds = errors.map((e) => sentIds.current[e.row - 1]).filter(Boolean);
    setResult(null); setJob(null); setError('');
    setTimeout(() => {
      gridRef.current?.keepOnly(failedIds);
      if (errors.length) gridRef.current?.applyServerErrors(errors, sentIds.current);
    }, 0);
  };

  // Spreadsheet
  const chooseFile = (f) => {
    reset();
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setCsv(parseCsv(String(e.target.result || '')));
    reader.readAsText(f);
  };
  const required = meta?.required_columns || [];
  const present = new Set(csv.headers.map(canonical));
  const missing = file && csv.headers.length ? required.filter((c) => !present.has(c)) : [];
  const realRows = csv.rows.filter((r) => !(r[csv.headers[0]] || '').startsWith('#'));
  const uploadFile = async () => {
    setUploading(true); setError(''); setResult(null); setJob(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const { data } = await client.post(`${API}/`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      handleResponse(data);
    } catch (err) { handleError(err); }
  };
  const downloadTemplate = async () => {
    try {
      const res = await client.get(`${API}/template/`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
      const a = document.createElement('a'); a.href = url; a.download = 'negromart_bulk_upload_template.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { setError('The template could not be downloaded. Try again.'); }
  };

  if (!checked) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress size={32} /></Box>;
  if (!meta) return <UpgradeGate />;

  const busyJob = job && !result;
  const remaining = meta.remaining_slots;

  return (
    // minmax(0, 1fr): wide tables scroll inside their box instead of widening the page on phones.
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', maxWidth: 1100, mx: 'auto', px: { xs: 0, md: 2 }, py: { xs: 1, md: 3 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/products')} sx={{ justifySelf: 'start', mb: 2, color: 'text.secondary', borderRadius: '8px', fontWeight: 600 }}>
        My products
      </Button>

      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 2 }}>
        <Box>
          <Typography component="h1" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 30, md: 40 }, fontWeight: 700, letterSpacing: '-0.8px', lineHeight: 1.1, mb: 0.75 }}>
            Add products in bulk
          </Typography>
          <Typography color="text.secondary">
            Up to 500 at once, with photos and versions.
            {remaining != null && <Box component="span" sx={{ ml: 1, fontWeight: 600, color: remaining < 10 ? 'warning.main' : 'text.primary' }}>Room for {remaining} more on your plan.</Box>}
          </Typography>
        </Box>
        <Button component={Link} href="/products/bulk-upload/guide" variant="outlined" startIcon={<MenuBookOutlinedIcon />}
          sx={{ borderRadius: '10px', fontWeight: 600, flexShrink: 0 }}>How it works</Button>
      </Stack>

      <Tabs value={tab} onChange={(_, v) => { setTab(v); reset(); }} variant="fullWidth"
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600, minHeight: 48 } }}>
        <Tab icon={<ViewAgendaOutlinedIcon />} iconPosition="start" label="Add in the browser" />
        <Tab icon={<GridOnOutlinedIcon />} iconPosition="start" label="Upload a spreadsheet" />
      </Tabs>

      {error && <Alert severity="error" sx={{ borderRadius: '10px', mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
      {busyJob && <Box sx={{ mb: 3 }}><JobProgress job={job} /></Box>}
      {result && <Box sx={{ mb: 3 }}><UploadReport result={result} rowWord={tab === 1 ? 'row' : 'product'} onReset={tab === 0 ? backToTable : reset} /></Box>}

      {/* Kept mounted while a report shows, so "Fix the rest" returns to the same cards. */}
      {tab === 0 && !busyJob && (
        <Box sx={{ display: result ? 'none' : 'block' }}>
          <Alert severity="info" icon={false} sx={{ borderRadius: '12px', mb: 2.5 }}>
            <Typography variant="body2">
              Fill in one card per product and add its photos. If it comes in colours, sizes, flavours or pack sizes, tap
              <strong> Comes in versions?</strong>. Products with a photo go to review; without one they&apos;re saved as drafts.
            </Typography>
          </Alert>
          <BulkProductGrid ref={gridRef} meta={meta} onSubmit={submitTable} submitting={uploading} />
        </Box>
      )}

      {tab === 1 && !result && !busyJob && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Stack spacing={2.5}>
              <Box sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>Four steps</Typography>
                {[
                  ['Download the template', 'It has every column and example rows (rows starting with # are skipped).'],
                  ['Fill it in', 'One row per product. Versions: one row per version, all with the same title.'],
                  ['Save as CSV', 'Excel: File › Save As › CSV UTF-8. Google Sheets: File › Download › CSV.'],
                  ['Upload it here', 'We check every row and tell you exactly what to fix.'],
                ].map(([t, d], i) => (
                  <Stack key={t} direction="row" spacing={1.5} sx={{ mb: 1.25 }}>
                    <Box sx={{ width: 24, height: 24, borderRadius: '8px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 12, fontWeight: 800 }}>{i + 1}</Box>
                    <Box><Typography sx={{ fontSize: 14, fontWeight: 600 }}>{t}</Typography><Typography variant="body2" color="text.secondary">{d}</Typography></Box>
                  </Stack>
                ))}
                <Button startIcon={<DownloadIcon />} variant="contained" disableElevation onClick={downloadTemplate}
                  sx={{ mt: 1, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 700 }}>Download template</Button>
              </Box>

              {!file ? <DropZone onFile={chooseFile} disabled={uploading} /> : (
                <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 700, fontSize: 14 }} noWrap>{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {realRows.length} row{realRows.length === 1 ? '' : 's'}{csv.rows.length > realRows.length ? ` (${csv.rows.length - realRows.length} example rows skipped)` : ''}
                      </Typography>
                    </Box>
                    {!uploading && <Tooltip title="Choose another file"><IconButton aria-label="Remove file" onClick={reset}><DeleteOutlineIcon /></IconButton></Tooltip>}
                  </Stack>
                  {missing.length > 0 && (
                    <Alert severity="error" sx={{ mt: 1.5, borderRadius: '8px' }}>
                      <AlertTitle>Missing columns</AlertTitle>
                      Add {missing.join(', ')}. Easiest: copy your rows into the template.
                    </Alert>
                  )}
                </Box>
              )}

              {csv.rows.length > 0 && <PreviewTable headers={csv.headers} rows={csv.rows} required={required} />}
              {uploading && !job && <LinearProgress sx={{ height: 6, borderRadius: 3 }} />}
              {file && (
                <Button variant="contained" disableElevation size="large" onClick={uploadFile} disabled={uploading || missing.length > 0 || !realRows.length}
                  sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '12px', fontWeight: 700, py: 1.5 }}>
                  {uploading ? 'Uploading…' : `Upload ${realRows.length} row${realRows.length === 1 ? '' : 's'}`}
                </Button>
              )}
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Stack spacing={2}>
              <ColumnGuide columns={meta.columns} />
              <LookupPanel title="Category codes" hint="For the category column" items={meta.sub_categories} code={(i) => i.slug} label={(i) => i.label} />
              <LookupPanel title="Brands" hint="For the brand column" items={meta.brands} code={(i) => i.slug} label={(i) => i.title} />
              <LookupPanel title="Countries" hint="For ships_to" items={meta.countries} code={(i) => i.code || i.name} label={(i) => i.name} />
              <LookupPanel title="Delivery methods" hint="For delivery_methods" items={meta.delivery_methods} code={(i) => i.name} label={(i) => `${i.name} (${i.min_days}-${i.max_days} days)`} />
              {meta.defaults?.ships_to?.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  Left empty, ships_to is {meta.defaults.ships_to.map((c) => c.name).join(', ')} and delivery is {meta.defaults.delivery_methods.map((d) => d.name).join(', ') || 'not set'}, like your latest product.
                </Typography>
              )}
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
