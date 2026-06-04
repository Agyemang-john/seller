'use client';

/**
 * /app/(dashboard)/products/bulk-upload/page.jsx
 *
 * Two-mode bulk upload page:
 *   "Add products"  — In-browser table (no CSV required). Primary for most sellers.
 *   "Import CSV"    — File upload for power users who prefer spreadsheets.
 *
 * Both modes share:
 *   • Subscription gate  (can_access_bulk_upload)
 *   • Product-slot banner
 *   • Sync / async result handling (async jobs are polled every 3 s)
 */

import {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Stack, Button, Chip, Alert, AlertTitle,
  LinearProgress, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Tooltip, IconButton, Paper, Collapse,
  CircularProgress, Divider, Grid, Tab, Tabs,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import TableRowsOutlinedIcon from '@mui/icons-material/TableRowsOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import BulkProductGrid from '@/components/products/BulkProductGrid';
import { createAxiosClient } from '@/utils/clientFetch';

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE         = '/api/v1';
const MAX_PREVIEW_ROWS = 50;
const MAX_FILE_MB      = 5;
const POLL_INTERVAL_MS = 3000;

const REQUIRED_COLS = ['title', 'price', 'old_price', 'sub_category_slug', 'product_type', 'total_quantity'];
const ALL_COLS = [
  'title', 'price', 'old_price', 'sub_category_slug', 'brand_slug',
  'product_type', 'total_quantity', 'weight', 'volume', 'life',
  'variant', 'description', 'features', 'specifications',
  'delivery_returns', 'size_names', 'color_names', 'color_codes',
  'variant_prices', 'variant_quantities',
];

// ── Upgrade gate ──────────────────────────────────────────────────────────────
function UpgradeGate() {
  const router = useRouter();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', px: 3 }}>
      <Box sx={{ width: 72, height: 72, borderRadius: '20px', bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
        <LockOutlinedIcon sx={{ fontSize: 32, color: 'warning.main' }} />
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 28, md: 36 }, fontWeight: 700, letterSpacing: '-0.5px', mb: 1.5 }}>
        Pro Feature
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 380, lineHeight: 1.75, mb: 4 }}>
        Bulk product upload is available on the <strong>Pro plan</strong> and above.
        Add up to 500 products at once — no spreadsheet skills needed.
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button variant="outlined" onClick={() => router.back()} sx={{ borderRadius: '10px', borderColor: 'divider' }}>Go back</Button>
        <Button variant="contained" disableElevation href="/subscribe"
          sx={{ bgcolor: 'warning.main', color: 'common.white', borderRadius: '10px', fontWeight: 700, '&:hover': { bgcolor: 'warning.dark' } }}>
          Upgrade to Pro
        </Button>
      </Stack>
    </Box>
  );
}

// ── Result report (shared between grid and CSV modes) ─────────────────────────
function UploadReport({ result, onReset }) {
  const [showErrors, setShowErrors] = useState(true);
  const allPassed = result.failed_count === 0;

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[
          { icon: <InfoOutlinedIcon />, label: 'Total rows', value: result.total_rows, color: 'text.primary' },
          { icon: <CheckCircleOutlineIcon />, label: 'Uploaded', value: result.success_count, color: 'success.main' },
          { icon: <ErrorOutlineIcon />, label: 'Failed', value: result.failed_count, color: result.failed_count > 0 ? 'error.main' : 'text.disabled' },
        ].map(({ icon, label, value, color }) => (
          <Grid item xs={4} key={label}>
            <Box sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', textAlign: 'center' }}>
              <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
              <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color }}>{value}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{label}</Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {allPassed ? (
        <Alert severity="success" sx={{ borderRadius: '10px', mb: 3 }}>
          <AlertTitle>All products uploaded successfully!</AlertTitle>
          {result.success_count} product{result.success_count !== 1 ? 's' : ''} added to your catalog and sent for review.
        </Alert>
      ) : (
        <Alert severity={result.success_count > 0 ? 'warning' : 'error'} sx={{ borderRadius: '10px', mb: 3 }}>
          <AlertTitle>
            {result.success_count > 0
              ? `${result.failed_count} row${result.failed_count !== 1 ? 's' : ''} had errors — ${result.success_count} uploaded successfully`
              : 'No products were uploaded — see errors below'}
          </AlertTitle>
          Fix the issues highlighted below and try again.
        </Alert>
      )}

      {result.errors?.length > 0 && (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between"
            sx={{ px: 2, py: 1.25, bgcolor: 'rgba(239,68,68,0.05)', cursor: 'pointer', borderBottom: showErrors ? '1px solid' : 'none', borderColor: 'divider' }}
            onClick={() => setShowErrors((p) => !p)}>
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: 'error.main' }}>
              {result.errors.length} error{result.errors.length !== 1 ? 's' : ''} to fix
            </Typography>
            <IconButton size="small">{showErrors ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}</IconButton>
          </Stack>
          <Collapse in={showErrors}>
            {result.errors.map((err, i) => (
              <Box key={i} sx={{ px: 2, py: 1.5, borderBottom: i < result.errors.length - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Chip label={`Row ${err.row}`} size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: 'error.main', borderRadius: '5px' }} />
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{err.title}</Typography>
                </Stack>
                {Object.entries(err.errors).map(([field, msgs]) => (
                  <Typography key={field} variant="caption" color="text.secondary" sx={{ display: 'block', pl: 0.5 }}>
                    <strong>{field}:</strong> {Array.isArray(msgs) ? msgs.join(', ') : JSON.stringify(msgs)}
                  </Typography>
                ))}
              </Box>
            ))}
          </Collapse>
        </Box>
      )}

      <Stack direction="row" spacing={1.5}>
        <Button variant="outlined" onClick={onReset} sx={{ borderRadius: '10px', borderColor: 'divider', fontWeight: 600 }}>Upload more</Button>
        <Button variant="contained" disableElevation href="/products"
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
          View my products
        </Button>
      </Stack>
    </Box>
  );
}

// ── Async job panel ───────────────────────────────────────────────────────────
function AsyncJobPanel({ job }) {
  const isRunning = job.status === 'queued' || job.status === 'processing';
  const pct = job.total_rows > 0 ? Math.round(((job.success_count + job.failed_count) / job.total_rows) * 100) : 0;
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
        {isRunning && <HourglassEmptyIcon sx={{ fontSize: 20, color: 'warning.main', animation: 'spin 2s linear infinite', '@keyframes spin': { from: { transform: 'rotate(0deg)' }, to: { transform: 'rotate(360deg)' } } }} />}
        {job.status === 'failed' && <ErrorOutlineIcon sx={{ fontSize: 20, color: 'error.main' }} />}
        <Typography sx={{ fontWeight: 700, fontSize: 14 }}>
          {job.status === 'queued'     && 'Upload queued — waiting for server…'}
          {job.status === 'processing' && `Processing ${job.total_rows} products…`}
          {job.status === 'failed'     && 'Upload failed on server'}
        </Typography>
      </Stack>
      {isRunning && (
        <LinearProgress
          variant={job.status === 'queued' ? 'indeterminate' : 'determinate'}
          value={pct}
          sx={{ borderRadius: 4, height: 6, mb: 2 }}
        />
      )}
      {job.status === 'failed' && job.error_message && (
        <Alert severity="error" sx={{ borderRadius: '10px' }}>
          <AlertTitle>Server error</AlertTitle>
          {job.error_message}
        </Alert>
      )}
    </Box>
  );
}

// ── CSV drop zone ─────────────────────────────────────────────────────────────
function DropZone({ onFile, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const handle = (file) => {
    if (!file) return;
    const ok = file.name.endsWith('.csv') || file.name.endsWith('.tsv') || file.type === 'text/csv';
    if (!ok) { alert('Please upload a .csv or .tsv file.'); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) { alert(`Max file size is ${MAX_FILE_MB} MB.`); return; }
    onFile(file);
  };
  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => !disabled && inputRef.current?.click()}
      sx={{ border: '2px dashed', borderColor: dragging ? 'text.primary' : 'divider', borderRadius: '16px', p: { xs: 4, md: 6 }, textAlign: 'center', cursor: disabled ? 'not-allowed' : 'pointer', bgcolor: dragging ? 'action.selected' : 'action.hover', transition: 'all 0.2s', '&:hover': { borderColor: disabled ? 'divider' : 'text.disabled', bgcolor: 'action.selected' } }}
    >
      <input ref={inputRef} type="file" accept=".csv,.tsv,text/csv" style={{ display: 'none' }} onChange={(e) => handle(e.target.files[0])} disabled={disabled} />
      <CloudUploadIcon sx={{ fontSize: 44, color: 'text.disabled', mb: 1.5 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 16, mb: 0.5 }}>Drop your CSV / spreadsheet file here</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        or click to browse &nbsp;·&nbsp; .csv or .tsv &nbsp;·&nbsp; max {MAX_FILE_MB} MB &nbsp;·&nbsp; max 500 rows
      </Typography>
      <Button variant="outlined" size="small" sx={{ borderRadius: '8px', borderColor: 'divider', fontWeight: 600, fontSize: 12 }} disabled={disabled}>
        Choose file
      </Button>
    </Box>
  );
}

// ── CSV preview table ─────────────────────────────────────────────────────────
function PreviewTable({ headers, rows, errorRows = new Set() }) {
  const [expanded, setExpanded] = useState(true);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.25, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
        onClick={() => setExpanded((p) => !p)}>
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
          Preview — {rows.length} row{rows.length !== 1 ? 's' : ''}
          {rows.length > MAX_PREVIEW_ROWS && ` (first ${MAX_PREVIEW_ROWS} shown)`}
        </Typography>
        <IconButton size="small">{expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}</IconButton>
      </Stack>
      <Collapse in={expanded}>
        <TableContainer sx={{ maxHeight: 300 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper' }}>#</TableCell>
                {headers.map((h) => (
                  <TableCell key={h} sx={{ fontWeight: 700, fontSize: 11, bgcolor: 'background.paper', color: REQUIRED_COLS.includes(h) ? 'error.main' : 'text.secondary', whiteSpace: 'nowrap' }}>
                    {h}{REQUIRED_COLS.includes(h) ? ' *' : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(0, MAX_PREVIEW_ROWS).map((row, i) => (
                <TableRow key={i} sx={{ bgcolor: errorRows.has(i + 2) ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                  <TableCell sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 600 }}>
                    {i + 2}{errorRows.has(i + 2) && <ErrorOutlineIcon sx={{ fontSize: 11, color: 'error.main', ml: 0.5, verticalAlign: 'middle' }} />}
                  </TableCell>
                  {headers.map((h) => (
                    <TableCell key={h} sx={{ fontSize: 12, maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row[h] ?? ''}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Collapse>
    </Box>
  );
}

// ── Column reference (CSV tab sidebar) ────────────────────────────────────────
function ColumnReference() {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.5, cursor: 'pointer' }} onClick={() => setOpen((p) => !p)}>
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Column reference</Typography>
        <IconButton size="small">{open ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 1.5 }}>
            {ALL_COLS.map((c) => (
              <Chip key={c} label={c} size="small" sx={{ fontSize: 10, fontWeight: 700, borderRadius: '5px', bgcolor: REQUIRED_COLS.includes(c) ? 'rgba(239,68,68,0.08)' : 'action.hover', color: REQUIRED_COLS.includes(c) ? 'error.main' : 'text.secondary', border: '1px solid', borderColor: REQUIRED_COLS.includes(c) ? 'rgba(239,68,68,0.3)' : 'divider' }} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.disabled">
            <Box component="span" sx={{ color: 'error.main', fontWeight: 700 }}>Red * = required.</Box>
            {' '}Use semicolons for multiple values: <code>S;M;L</code>
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Slug lookup panel (reusable for sub-cats and brands) ──────────────────────
function SlugLookupPanel({ title, items }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    if (!items?.length) return [];
    const l = q.toLowerCase();
    return items.filter((s) => (s.label ?? s.title).toLowerCase().includes(l) || s.slug.includes(l));
  }, [items, q]);
  const copyToClipboard = (text) => {
    navigator.clipboard?.writeText(text).catch(() => {});
  };
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.5, cursor: 'pointer' }} onClick={() => setOpen((p) => !p)}>
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{title} ({items?.length ?? 0})</Typography>
        <IconButton size="small">{open ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 1.5 }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title.toLowerCase()}…`}
            style={{ width: '100%', padding: '6px 10px', fontSize: 12, border: '1px solid #e2e8f0', borderRadius: 6, outline: 'none', marginBottom: 8, boxSizing: 'border-box' }} />
          <Box sx={{ maxHeight: 180, overflowY: 'auto' }}>
            {filtered.map((s) => (
              <Stack key={s.id ?? s.slug} direction="row" alignItems="center" justifyContent="space-between"
                sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 12, flex: 1 }}>{s.label ?? s.title}</Typography>
                <Tooltip title="Click to copy slug">
                  <Typography
                    onClick={() => copyToClipboard(s.slug)}
                    sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.disabled', ml: 1, flexShrink: 0, cursor: 'copy', '&:hover': { color: 'text.primary' } }}>
                    {s.slug}
                  </Typography>
                </Tooltip>
              </Stack>
            ))}
            {filtered.length === 0 && <Typography variant="caption" color="text.disabled">No results</Typography>}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const router  = useRouter();
  const client  = createAxiosClient();
  const gridRef = useRef(null);

  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess,     setHasAccess]     = useState(false);
  const [meta,          setMeta]          = useState(null);
  const [tab,           setTab]           = useState(0);  // 0 = grid, 1 = CSV

  // Shared result state
  const [uploading,   setUploading]   = useState(false);
  const [result,      setResult]      = useState(null);
  const [asyncJob,    setAsyncJob]    = useState(null);
  const [uploadError, setUploadError] = useState('');

  // CSV-specific state
  const [file,        setFile]        = useState(null);
  const [csvHeaders,  setCsvHeaders]  = useState([]);
  const [csvRows,     setCsvRows]     = useState([]);
  const [missingCols, setMissingCols] = useState([]);

  const pollRef = useRef(null);

  // ── Load meta (also used as access check) ─────────────────────────────────
  useEffect(() => {
    client.get(`${API_BASE}/vendor/products/bulk-upload/meta/`)
      .then((res) => { setMeta(res.data); setHasAccess(true); })
      .catch(() => setHasAccess(false))
      .finally(() => setAccessChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Async job polling ──────────────────────────────────────────────────────
  const startPolling = useCallback((jobId) => {
    const poll = async () => {
      try {
        const res = await client.get(`${API_BASE}/vendor/products/bulk-upload/job/${jobId}/`);
        setAsyncJob(res.data);
        if (res.data.status === 'done' || res.data.status === 'failed') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setUploading(false);
          if (res.data.status === 'done') {
            setResult({ mode: 'async', total_rows: res.data.total_rows, success_count: res.data.success_count, failed_count: res.data.failed_count, created_product_ids: res.data.created_product_ids, errors: res.data.errors });
          }
        }
      } catch { /* ignore transient poll errors */ }
    };
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    poll();
  }, [client]);

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current); }, []);

  // ── Shared response handler ────────────────────────────────────────────────
  const handleAPIResponse = useCallback((data, httpStatus) => {
    if (data.mode === 'async') {
      setAsyncJob({ ...data, success_count: 0, failed_count: 0 });
      startPolling(data.job_id);
    } else {
      setResult(data);
      setUploading(false);
    }
  }, [startPolling]);

  const handleAPIError = useCallback((err) => {
    setUploading(false);
    setUploadError(
      err?.response?.data?.detail ||
      err?.response?.data?.error  ||
      'Upload failed. Please try again.'
    );
  }, []);

  // ── Grid mode submit ───────────────────────────────────────────────────────
  const handleGridSubmit = useCallback(async (rows) => {
    setUploading(true);
    setUploadError('');
    setResult(null);
    setAsyncJob(null);
    try {
      const res = await client.post(`${API_BASE}/vendor/products/bulk-upload/direct/`, { products: rows });
      handleAPIResponse(res.data);
    } catch (err) {
      // If server returned per-row validation errors, push them back to the grid
      if (err?.response?.data?.errors && gridRef.current?.applyServerErrors) {
        gridRef.current.applyServerErrors(err.response.data.errors);
      }
      handleAPIError(err);
    }
  }, [client, handleAPIResponse, handleAPIError]);

  // ── CSV mode ───────────────────────────────────────────────────────────────
  const parseCSV = useCallback((f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const lines = e.target.result.split(/\r?\n/).filter(Boolean);
      if (!lines.length) return;
      const delim   = f.name.endsWith('.tsv') ? '\t' : ',';
      const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows    = lines.slice(1, MAX_PREVIEW_ROWS + 1).map((line) => {
        const vals = line.split(delim).map((v) => v.trim().replace(/^"|"$/g, ''));
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
      });
      setCsvHeaders(headers);
      setCsvRows(rows);
      setMissingCols(REQUIRED_COLS.filter((c) => !headers.includes(c)));
    };
    reader.readAsText(f);
  }, []);

  const handleFile = useCallback((f) => {
    setFile(f); setResult(null); setAsyncJob(null); setUploadError(''); parseCSV(f);
  }, [parseCSV]);

  const handleCSVUpload = async () => {
    if (!file || missingCols.length > 0) return;
    setUploading(true); setUploadError(''); setResult(null); setAsyncJob(null);
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await client.post(`${API_BASE}/vendor/products/bulk-upload/`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      handleAPIResponse(res.data);
    } catch (err) { handleAPIError(err); }
  };

  const handleReset = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
    setFile(null); setCsvHeaders([]); setCsvRows([]); setMissingCols([]);
    setResult(null); setAsyncJob(null); setUploadError(''); setUploading(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await client.get(`${API_BASE}/vendor/products/bulk-upload/template/`, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'negromart_bulk_upload_template.csv'; a.click();
      URL.revokeObjectURL(url);
    } catch { alert('Failed to download template.'); }
  };

  const errorRows    = useMemo(() => new Set((result?.errors ?? []).map((e) => e.row)), [result]);
  const remainSlots  = meta?.remaining_slots;
  const showResult   = !!result;
  const showAsync    = asyncJob && !result;
  const asyncRunning = asyncJob && (asyncJob.status === 'queued' || asyncJob.status === 'processing');

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!accessChecked) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}><CircularProgress size={32} /></Box>;
  if (!hasAccess) return <UpgradeGate />;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>

      {/* Back */}
      <Button startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />} onClick={() => router.back()}
        sx={{ mb: 3, color: 'text.secondary', borderRadius: '8px', fontSize: 13, fontWeight: 600 }}>
        Back
      </Button>

      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} sx={{ mb: 1 }} spacing={2}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 32, md: 42 }, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1, mb: 0.75 }}>
            Add products in bulk
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Add multiple products at once.
            {remainSlots != null && (
              <Box component="span" sx={{ ml: 1, fontWeight: 600, color: remainSlots < 10 ? 'warning.main' : 'text.primary' }}>
                {remainSlots} slot{remainSlots !== 1 ? 's' : ''} remaining on your plan.
              </Box>
            )}
          </Typography>
        </Box>
      </Stack>

      {/* Mode tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tab} onChange={(_, v) => { setTab(v); handleReset(); }} sx={{ '& .MuiTab-root': { fontSize: 13, fontWeight: 600, textTransform: 'none', minHeight: 44 } }}>
          <Tab
            icon={<TableRowsOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Add products (recommended)"
            sx={{ gap: 0.75 }}
          />
          <Tab
            icon={<GridOnOutlinedIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Import from CSV / spreadsheet"
            sx={{ gap: 0.75 }}
          />
        </Tabs>
      </Box>

      {/* ── Tab 0: In-browser grid ─────────────────────────────────────────── */}
      {tab === 0 && (
        <Box>
          {/* Quick guide */}
          {!result && !showAsync && (
            <Alert severity="info" icon={false} sx={{ borderRadius: '10px', mb: 3, bgcolor: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 3 }} flexWrap="wrap">
                {[
                  ['1', 'Fill in the table', 'Type your product details below. Required fields are marked *.'],
                  ['2', 'Expand rows for more', 'Click the ❯ icon on any row to add brand, sizes, colours, description.'],
                  ['3', 'Click Upload', 'Products go into "In Review" — you\'ll see them in My Products.'],
                ].map(([n, title, desc]) => (
                  <Stack key={n} direction="row" spacing={1} sx={{ flex: 1, minWidth: 200 }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '6px', bgcolor: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800, color: 'info.main' }}>{n}</Typography>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'info.dark' }}>{title}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary', lineHeight: 1.4 }}>{desc}</Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Alert>
          )}

          {showResult && <Box sx={{ mb: 3 }}><UploadReport result={result} onReset={handleReset} /></Box>}
          {showAsync  && <Box sx={{ mb: 3 }}><AsyncJobPanel job={asyncJob} /></Box>}
          {asyncJob?.status === 'failed' && (
            <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '10px', borderColor: 'divider', fontWeight: 600, mb: 2 }}>Try again</Button>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ borderRadius: '10px', mb: 3 }}>
              <AlertTitle>Upload error</AlertTitle>
              {uploadError}
            </Alert>
          )}

          {!showResult && !showAsync && (
            <BulkProductGrid
              ref={gridRef}
              meta={meta}
              onSubmit={handleGridSubmit}
              submitting={uploading}
            />
          )}
        </Box>
      )}

      {/* ── Tab 1: CSV upload ─────────────────────────────────────────────── */}
      {tab === 1 && (
        <Grid container spacing={3}>

          {/* Left: workflow */}
          <Grid item xs={12} md={8}>
            <Stack spacing={3}>

              <Stack direction="row" justifyContent="flex-end">
                <Button startIcon={<DownloadIcon sx={{ fontSize: 15 }} />} variant="outlined" onClick={handleDownloadTemplate}
                  sx={{ borderRadius: '10px', borderColor: 'divider', fontWeight: 600, fontSize: 13, color: 'text.primary', '&:hover': { borderColor: 'text.primary' } }}>
                  Download template
                </Button>
              </Stack>

              {!file ? (
                <DropZone onFile={handleFile} disabled={uploading} />
              ) : (
                <Box sx={{ p: 2, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Box sx={{ width: 40, height: 40, borderRadius: '10px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CloudUploadIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{file.name}</Typography>
                        <Typography variant="caption" color="text.secondary">{(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; {csvRows.length} rows</Typography>
                      </Box>
                    </Stack>
                    {!uploading && !result && !asyncRunning && (
                      <Tooltip title="Remove file"><IconButton size="small" onClick={handleReset}><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton></Tooltip>
                    )}
                  </Stack>
                  {missingCols.length > 0 && (
                    <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
                      <AlertTitle>Missing required columns</AlertTitle>
                      <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                        {missingCols.map((c) => <Chip key={c} label={c} size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: 'error.main', borderRadius: '5px' }} />)}
                      </Stack>
                    </Alert>
                  )}
                </Box>
              )}

              {csvRows.length > 0 && !result && !showAsync && (
                <PreviewTable headers={csvHeaders} rows={csvRows} errorRows={errorRows} />
              )}

              {uploading && !asyncJob && (
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, mb: 0.75 }}>Uploading…</Typography>
                  <LinearProgress sx={{ borderRadius: 4, height: 6 }} />
                </Box>
              )}

              {showAsync  && <AsyncJobPanel job={asyncJob} />}
              {showResult && <UploadReport result={result} onReset={handleReset} />}
              {uploadError && <Alert severity="error" sx={{ borderRadius: '10px' }}><AlertTitle>Upload error</AlertTitle>{uploadError}</Alert>}

              {file && !result && !showAsync && (
                <Button variant="contained" disableElevation size="large" onClick={handleCSVUpload}
                  disabled={uploading || missingCols.length > 0}
                  sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '12px', fontWeight: 700, fontSize: 14, py: 1.5, '&:hover': { bgcolor: 'text.secondary' }, '&:disabled': { bgcolor: 'action.disabledBackground' } }}>
                  {uploading ? 'Uploading…' : `Upload ${csvRows.length} product${csvRows.length !== 1 ? 's' : ''}`}
                </Button>
              )}
              {asyncJob?.status === 'failed' && (
                <Button variant="outlined" onClick={handleReset} sx={{ borderRadius: '10px', borderColor: 'divider', fontWeight: 600 }}>Try again</Button>
              )}
            </Stack>
          </Grid>

          {/* Right: reference panels */}
          <Grid item xs={12} md={4}>
            <Stack spacing={2.5}>
              <Box sx={{ p: 2.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1.5 }}>How to use the CSV template</Typography>
                {[
                  ['1', 'Download the template above'],
                  ['2', 'Open it in Excel or Google Sheets'],
                  ['3', 'Fill in your products, one per row'],
                  ['4', 'Save as CSV and upload here'],
                ].map(([n, t]) => (
                  <Stack key={n} direction="row" spacing={1.5} sx={{ mb: 1.25, '&:last-child': { mb: 0 } }}>
                    <Box sx={{ width: 20, height: 20, borderRadius: '6px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{n}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13 }}>{t}</Typography>
                  </Stack>
                ))}
              </Box>

              <ColumnReference />

              <SlugLookupPanel title="Category slugs" items={meta?.sub_categories} />
              <SlugLookupPanel title="Brand slugs" items={meta?.brands} />
            </Stack>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
