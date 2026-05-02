'use client';

/**
 * /app/products/bulk-upload/page.jsx  (or .tsx)
 *
 * Full-featured bulk product upload page.
 * - Checks subscription plan gate (can_access_bulk_upload)
 * - Drag-and-drop CSV upload with live preview table
 * - Column validation, row-level error highlighting
 * - Download template button
 * - Upload progress + detailed result report
 */

import {
  useState, useCallback, useRef, useEffect, useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Typography, Stack, Button, Chip, Alert, AlertTitle,
  LinearProgress, Table, TableHead, TableBody, TableRow, TableCell,
  TableContainer, Tooltip, IconButton, Paper, Collapse,
  CircularProgress, Divider, Grid,
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
import { createAxiosClient } from '@/utils/clientFetch';

// ── Constants ─────────────────────────────────────────────────────────────────
const API_BASE = '/api/v1';
const MAX_PREVIEW_ROWS = 50;
const MAX_FILE_MB = 5;

const REQUIRED_COLS = [
  'title', 'price', 'old_price',
  'sub_category_slug', 'product_type', 'total_quantity',
];

const ALL_COLS = [
  'title', 'price', 'old_price', 'sub_category_slug', 'brand_slug',
  'product_type', 'total_quantity', 'weight', 'volume', 'life',
  'variant', 'description', 'features', 'specifications',
  'delivery_returns', 'size_names', 'color_names', 'color_codes',
  'variant_prices', 'variant_quantities',
];

// ── Small helper components ────────────────────────────────────────────────────

function StatCard({ icon, label, value, color = 'text.primary' }) {
  return (
    <Box sx={{
      p: 2.5, borderRadius: '12px', border: '1px solid',
      borderColor: 'divider', bgcolor: 'background.paper', textAlign: 'center',
    }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography sx={{ fontSize: 28, fontWeight: 800, lineHeight: 1, color }} color={color}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
        {label}
      </Typography>
    </Box>
  );
}

function ColBadge({ name, required }) {
  return (
    <Chip
      label={name}
      size="small"
      sx={{
        fontSize: 10, fontWeight: 700, borderRadius: '5px',
        bgcolor: required ? 'rgba(239,68,68,0.08)' : 'action.hover',
        color: required ? '#ef4444' : 'text.secondary',
        border: '1px solid', borderColor: required ? 'rgba(239,68,68,0.3)' : 'divider',
      }}
    />
  );
}

// ── Locked / upgrade prompt ───────────────────────────────────────────────────
function UpgradeGate() {
  const router = useRouter();
  return (
    <Box sx={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center', px: 3,
    }}>
      <Box sx={{
        width: 72, height: 72, borderRadius: '20px',
        bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3,
      }}>
        <LockOutlinedIcon sx={{ fontSize: 32, color: '#f59e0b' }} />
      </Box>
      <Typography sx={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: { xs: 28, md: 36 }, fontWeight: 700,
        letterSpacing: '-0.5px', mb: 1.5,
      }}>
        Pro Feature
      </Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 380, lineHeight: 1.75, mb: 4 }}>
        Bulk product upload is available on the <strong>Pro plan</strong> and above.
        Upload up to 500 products at once with a single CSV file.
      </Typography>
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="outlined"
          onClick={() => router.back()}
          sx={{ borderRadius: '10px', borderColor: 'divider' }}
        >
          Go back
        </Button>
        <Button
          variant="contained"
          disableElevation
          href="/vendor/subscription"
          sx={{
            bgcolor: '#f59e0b', color: '#fff', borderRadius: '10px',
            fontWeight: 700, '&:hover': { bgcolor: '#d97706' },
          }}
        >
          Upgrade to Pro
        </Button>
      </Stack>
    </Box>
  );
}

// ── Drop zone ─────────────────────────────────────────────────────────────────
function DropZone({ onFile, disabled }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const handle = (file) => {
    if (!file) return;
    const isCSV = file.name.endsWith('.csv') || file.name.endsWith('.tsv')
      || file.type === 'text/csv' || file.type === 'text/tab-separated-values';
    if (!isCSV) { alert('Please upload a .csv or .tsv file.'); return; }
    if (file.size > MAX_FILE_MB * 1024 * 1024) {
      alert(`File is too large. Maximum size is ${MAX_FILE_MB} MB.`); return;
    }
    onFile(file);
  };

  return (
    <Box
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
      onClick={() => !disabled && inputRef.current?.click()}
      sx={{
        border: '2px dashed',
        borderColor: dragging ? 'text.primary' : 'divider',
        borderRadius: '16px',
        p: { xs: 4, md: 7 },
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: dragging ? 'action.selected' : 'action.hover',
        transition: 'all 0.2s',
        '&:hover': { borderColor: disabled ? 'divider' : 'text.disabled', bgcolor: 'action.selected' },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.tsv,text/csv"
        style={{ display: 'none' }}
        onChange={(e) => handle(e.target.files[0])}
        disabled={disabled}
      />
      <CloudUploadIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.75 }} color="text.primary">
        Drop your CSV file here
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        or click to browse &nbsp;·&nbsp; .csv / .tsv &nbsp;·&nbsp; max {MAX_FILE_MB} MB &nbsp;·&nbsp; max 500 rows
      </Typography>
      <Button
        variant="outlined"
        size="small"
        sx={{ borderRadius: '8px', borderColor: 'divider', fontWeight: 600, fontSize: 12 }}
        disabled={disabled}
      >
        Choose file
      </Button>
    </Box>
  );
}

// ── CSV preview table ─────────────────────────────────────────────────────────
function PreviewTable({ headers, rows, errorRows = new Set() }) {
  const [expanded, setExpanded] = useState(true);
  const visibleRows = rows.slice(0, MAX_PREVIEW_ROWS);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.25, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', cursor: 'pointer' }}
        onClick={() => setExpanded((p) => !p)}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
          Preview — {rows.length} row{rows.length !== 1 ? 's' : ''} detected
          {rows.length > MAX_PREVIEW_ROWS && ` (showing first ${MAX_PREVIEW_ROWS})`}
        </Typography>
        <IconButton size="small">
          {expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
        </IconButton>
      </Stack>
      <Collapse in={expanded}>
        <TableContainer sx={{ maxHeight: 340 }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: 11, letterSpacing: '0.05em', bgcolor: 'background.paper' }}>#</TableCell>
                {headers.map((h) => (
                  <TableCell key={h} sx={{
                    fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
                    bgcolor: 'background.paper',
                    color: REQUIRED_COLS.includes(h) ? '#ef4444' : 'text.secondary',
                    whiteSpace: 'nowrap',
                  }}>
                    {h}{REQUIRED_COLS.includes(h) ? ' *' : ''}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleRows.map((row, i) => (
                <TableRow
                  key={i}
                  sx={{
                    bgcolor: errorRows.has(i + 2) ? 'rgba(239,68,68,0.04)' : 'transparent',
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <TableCell sx={{ fontSize: 11, color: 'text.disabled', fontWeight: 600 }}>
                    {i + 2}
                    {errorRows.has(i + 2) && (
                      <ErrorOutlineIcon sx={{ fontSize: 12, color: '#ef4444', ml: 0.5, verticalAlign: 'middle' }} />
                    )}
                  </TableCell>
                  {headers.map((h) => (
                    <TableCell key={h} sx={{ fontSize: 12, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row[h] ?? ''}
                    </TableCell>
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

// ── Upload result report ──────────────────────────────────────────────────────
function UploadReport({ result, onReset }) {
  const [showErrors, setShowErrors] = useState(true);
  const allPassed = result.failed_count === 0;

  return (
    <Box>
      {/* Stats row */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={4}>
          <StatCard
            icon={<InfoOutlinedIcon />}
            label="Total rows"
            value={result.total_rows}
          />
        </Grid>
        <Grid item xs={4}>
          <StatCard
            icon={<CheckCircleOutlineIcon />}
            label="Uploaded"
            value={result.success_count}
            color="#22c55e"
          />
        </Grid>
        <Grid item xs={4}>
          <StatCard
            icon={<ErrorOutlineIcon />}
            label="Failed"
            value={result.failed_count}
            color={result.failed_count > 0 ? '#ef4444' : 'text.disabled'}
          />
        </Grid>
      </Grid>

      {allPassed ? (
        <Alert severity="success" sx={{ borderRadius: '10px', mb: 3 }}>
          <AlertTitle>All products uploaded successfully!</AlertTitle>
          {result.success_count} product{result.success_count !== 1 ? 's' : ''} added
          to your catalog and sent for review.
        </Alert>
      ) : (
        <Alert severity={result.success_count > 0 ? 'warning' : 'error'} sx={{ borderRadius: '10px', mb: 3 }}>
          <AlertTitle>
            {result.success_count > 0
              ? `Partial success — ${result.failed_count} row${result.failed_count !== 1 ? 's' : ''} failed`
              : 'Upload failed — no products were created'}
          </AlertTitle>
          Fix the errors below and re-upload only the failed rows.
        </Alert>
      )}

      {/* Error detail */}
      {result.errors?.length > 0 && (
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden', mb: 3 }}>
          <Stack
            direction="row" alignItems="center" justifyContent="space-between"
            sx={{ px: 2, py: 1.25, bgcolor: 'rgba(239,68,68,0.05)', cursor: 'pointer', borderBottom: showErrors ? '1px solid' : 'none', borderColor: 'divider' }}
            onClick={() => setShowErrors((p) => !p)}
          >
            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#ef4444' }}>
              {result.errors.length} error{result.errors.length !== 1 ? 's' : ''} to fix
            </Typography>
            <IconButton size="small">
              {showErrors ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Stack>
          <Collapse in={showErrors}>
            {result.errors.map((err, i) => (
              <Box
                key={i}
                sx={{
                  px: 2, py: 1.5,
                  borderBottom: i < result.errors.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  <Chip label={`Row ${err.row}`} size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '5px' }} />
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
        <Button
          variant="outlined"
          onClick={onReset}
          sx={{ borderRadius: '10px', borderColor: 'divider', fontWeight: 600 }}
        >
          Upload another file
        </Button>
        <Button
          variant="contained"
          disableElevation
          href="/products"
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}
        >
          View my products
        </Button>
      </Stack>
    </Box>
  );
}

// ── Column reference panel ─────────────────────────────────────────────────────
function ColumnReference({ meta }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.5, cursor: 'pointer' }}
        onClick={() => setOpen((p) => !p)}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Column reference</Typography>
        <IconButton size="small">{open ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
            {ALL_COLS.map((c) => (
              <ColBadge key={c} name={c} required={REQUIRED_COLS.includes(c)} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.5 }}>
            <Box component="span" sx={{ color: '#ef4444', fontWeight: 700 }}>Red * = required.</Box>
            {' '}Semicolon-separate multiple values (e.g. <code>S;M;L</code> for sizes).
          </Typography>

          {/* Product types */}
          {meta && (
            <Stack spacing={1.5}>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  product_type values
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {meta.product_types?.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ fontSize: 10, borderRadius: '5px', bgcolor: 'action.hover' }} />
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  variant values
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {meta.variant_types?.map((t) => (
                    <Chip key={t} label={t} size="small" sx={{ fontSize: 10, borderRadius: '5px', bgcolor: 'action.hover' }} />
                  ))}
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Sub-category lookup panel ─────────────────────────────────────────────────
function SubCategoryLookup({ meta }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    if (!meta?.sub_categories) return [];
    const lower = q.toLowerCase();
    return meta.sub_categories.filter(
      (s) => s.title.toLowerCase().includes(lower) || s.slug.includes(lower),
    );
  }, [meta, q]);

  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: '12px', overflow: 'hidden' }}>
      <Stack
        direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.5, cursor: 'pointer' }}
        onClick={() => setOpen((p) => !p)}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>
          Sub-category slugs ({meta?.sub_categories?.length ?? 0})
        </Typography>
        <IconButton size="small">{open ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}</IconButton>
      </Stack>
      <Collapse in={open}>
        <Divider />
        <Box sx={{ p: 2 }}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sub-categories…"
            style={{
              width: '100%', padding: '6px 10px', fontSize: 12,
              border: '1px solid #e2e8f0', borderRadius: 6,
              outline: 'none', marginBottom: 10, boxSizing: 'border-box',
            }}
          />
          <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.map((s) => (
              <Stack key={s.id} direction="row" alignItems="center" justifyContent="space-between"
                sx={{ py: 0.75, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Typography sx={{ fontSize: 12 }}>{s.title}</Typography>
                <Typography sx={{ fontSize: 11, fontFamily: 'monospace', color: 'text.disabled', ml: 1, flexShrink: 0 }}>
                  {s.slug}
                </Typography>
              </Stack>
            ))}
            {filtered.length === 0 && (
              <Typography variant="caption" color="text.disabled">No results</Typography>
            )}
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function BulkUploadPage() {
  const router = useRouter();
  const [accessChecked, setAccessChecked] = useState(false);
  const [hasAccess, setHasAccess] = useState(false);
  const [meta, setMeta] = useState(null);

  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [missingCols, setMissingCols] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const client = createAxiosClient();

  // ── Check access + load meta ───────────────────────────────────────────────
  useEffect(() => {
    client.get(`${API_BASE}/vendor/products/bulk-upload/meta/`)
      .then((res) => {
        setMeta(res.data);
        setHasAccess(true);
      })
      .catch((err) => {
        if (err?.response?.status === 403) setHasAccess(false);
        else setHasAccess(false); // treat any error as no access for safety
      })
      .finally(() => setAccessChecked(true));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Parse CSV client-side for preview ─────────────────────────────────────
  const parseCSV = useCallback((f) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length === 0) return;

      const delim = f.name.endsWith('.tsv') ? '\t' : ',';
      const headers = lines[0].split(delim).map((h) => h.trim().replace(/^"|"$/g, ''));
      const rows = lines.slice(1, MAX_PREVIEW_ROWS + 1).map((line) => {
        const vals = line.split(delim).map((v) => v.trim().replace(/^"|"$/g, ''));
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? '']));
      });

      const missing = REQUIRED_COLS.filter((c) => !headers.includes(c));
      setCsvHeaders(headers);
      setCsvRows(rows);
      setMissingCols(missing);
    };
    reader.readAsText(f);
  }, []);

  const handleFile = useCallback((f) => {
    setFile(f);
    setResult(null);
    setUploadError('');
    parseCSV(f);
  }, [parseCSV]);

  const handleReset = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setMissingCols([]);
    setResult(null);
    setUploadError('');
    setProgress(0);
  };

  // ── Upload ─────────────────────────────────────────────────────────────────
  const handleUpload = async () => {
    if (!file || missingCols.length > 0) return;
    setUploading(true);
    setUploadError('');
    setProgress(0);

    const form = new FormData();
    form.append('file', file);

    try {
      // Fake progress ticks while waiting (real server-side processing)
      const tick = setInterval(() => {
        setProgress((p) => Math.min(p + 8, 85));
      }, 400);

      const res = await client.post(`${API_BASE}/vendor/products/bulk-upload/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearInterval(tick);
      setProgress(100);
      setResult(res.data);
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        'Upload failed. Please try again.';
      setUploadError(msg);
    } finally {
      setUploading(false);
    }
  };

  // ── Download template ──────────────────────────────────────────────────────
  const handleDownloadTemplate = async () => {
    try {
      const res = await client.get(`${API_BASE}/vendor/products/bulk-upload/template/`, {
        responseType: 'blob',
      });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'negromart_bulk_upload_template.csv';
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Failed to download template.');
    }
  };

  // ── Error row set for preview highlighting ─────────────────────────────────
  const errorRows = useMemo(() => new Set((result?.errors ?? []).map((e) => e.row)), [result]);

  // ── Render ─────────────────────────────────────────────────────────────────
  if (!accessChecked) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 12 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!hasAccess) return <UpgradeGate />;

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 3, md: 5 } }}>

      {/* Back nav */}
      <Button
        startIcon={<ArrowBackIcon sx={{ fontSize: 16 }} />}
        onClick={() => router.back()}
        sx={{ mb: 3, color: 'text.secondary', borderRadius: '8px', fontSize: 13, fontWeight: 600 }}
      >
        Back
      </Button>

      {/* Page header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} sx={{ mb: 4 }} spacing={2}>
        <Box>
          <Typography sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: 32, md: 42 }, fontWeight: 700,
            letterSpacing: '-1px', lineHeight: 1, mb: 0.75,
          }}>
            Bulk Upload
          </Typography>
          <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
            Add up to 500 products at once using a CSV file.
            Download the template, fill it in, then upload.
          </Typography>
        </Box>
        <Button
          startIcon={<DownloadIcon sx={{ fontSize: 16 }} />}
          variant="outlined"
          onClick={handleDownloadTemplate}
          sx={{
            borderRadius: '10px', borderColor: 'divider', fontWeight: 600,
            fontSize: 13, flexShrink: 0, color: 'text.primary',
            '&:hover': { borderColor: 'text.primary' },
          }}
        >
          Download template
        </Button>
      </Stack>

      <Grid container spacing={3}>

        {/* ── Left column: main workflow ─────────────────────────────────── */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3}>

            {/* Drop zone or file selected */}
            {!file ? (
              <DropZone onFile={handleFile} disabled={uploading} />
            ) : (
              <Box sx={{
                p: 2, borderRadius: '12px', border: '1px solid',
                borderColor: 'divider', bgcolor: 'background.paper',
              }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{
                      width: 40, height: 40, borderRadius: '10px',
                      bgcolor: 'action.selected', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CloudUploadIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{file.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {(file.size / 1024).toFixed(1)} KB &nbsp;·&nbsp; {csvRows.length} rows detected
                      </Typography>
                    </Box>
                  </Stack>
                  {!uploading && !result && (
                    <Tooltip title="Remove file">
                      <IconButton size="small" onClick={handleReset}>
                        <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Stack>

                {/* Missing column warnings */}
                {missingCols.length > 0 && (
                  <Alert severity="error" sx={{ mt: 2, borderRadius: '8px' }}>
                    <AlertTitle>Missing required columns</AlertTitle>
                    <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                      {missingCols.map((c) => (
                        <Chip key={c} label={c} size="small" sx={{ fontSize: 10, fontWeight: 700, bgcolor: 'rgba(239,68,68,0.1)', color: '#ef4444', borderRadius: '5px' }} />
                      ))}
                    </Stack>
                  </Alert>
                )}
              </Box>
            )}

            {/* CSV preview */}
            {csvRows.length > 0 && !result && (
              <PreviewTable headers={csvHeaders} rows={csvRows} errorRows={errorRows} />
            )}

            {/* Upload progress */}
            {uploading && (
              <Box>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Uploading and validating…</Typography>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{progress}%</Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progress} sx={{ borderRadius: 4, height: 6 }} />
              </Box>
            )}

            {/* Upload error */}
            {uploadError && (
              <Alert severity="error" sx={{ borderRadius: '10px' }}>
                <AlertTitle>Upload error</AlertTitle>
                {uploadError}
              </Alert>
            )}

            {/* Result report */}
            {result && <UploadReport result={result} onReset={handleReset} />}

            {/* Upload button */}
            {file && !result && (
              <Button
                variant="contained"
                disableElevation
                size="large"
                onClick={handleUpload}
                disabled={uploading || missingCols.length > 0}
                sx={{
                  bgcolor: 'text.primary', color: 'background.paper',
                  borderRadius: '12px', fontWeight: 700, fontSize: 14, py: 1.5,
                  '&:hover': { bgcolor: 'text.secondary' },
                  '&:disabled': { bgcolor: 'action.disabledBackground' },
                }}
              >
                {uploading ? 'Uploading…' : `Upload ${csvRows.length} product${csvRows.length !== 1 ? 's' : ''}`}
              </Button>
            )}

          </Stack>
        </Grid>

        {/* ── Right column: reference panels ────────────────────────────── */}
        <Grid item xs={12} md={4}>
          <Stack spacing={2.5}>

            {/* How it works */}
            <Box sx={{
              p: 2.5, borderRadius: '12px', border: '1px solid',
              borderColor: 'divider', bgcolor: 'background.paper',
            }}>
              <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 2 }}>How it works</Typography>
              {[
                ['1', 'Download', 'Get the CSV template with all required and optional columns.'],
                ['2', 'Fill in', 'Add your products. Use slugs for sub-category and brand.'],
                ['3', 'Upload', 'Drop the completed file here and click Upload.'],
                ['4', 'Review', 'Products go into "In Review" status on the marketplace.'],
              ].map(([num, title, desc]) => (
                <Stack key={num} direction="row" spacing={1.5} sx={{ mb: 1.75, '&:last-child': { mb: 0 } }}>
                  <Box sx={{
                    width: 22, height: 22, borderRadius: '6px', bgcolor: 'action.selected',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.1,
                  }}>
                    <Typography sx={{ fontSize: 10, fontWeight: 800 }}>{num}</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.25 }}>{title}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>{desc}</Typography>
                  </Box>
                </Stack>
              ))}
            </Box>

            <ColumnReference meta={meta} />
            <SubCategoryLookup meta={meta} />

            {/* Tips */}
            <Box sx={{
              p: 2.5, borderRadius: '12px', bgcolor: 'rgba(59,130,246,0.05)',
              border: '1px solid rgba(59,130,246,0.2)',
            }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#3b82f6', mb: 1.5 }}>
                💡 Tips
              </Typography>
              {[
                'Prefix currency amounts with numbers only — no GHS symbol.',
                'For Size-Color variants, variant_prices follow size×color order (row-major).',
                'Leave brand_slug blank if no brand applies.',
                'Failed rows won\'t create products — fix and re-upload just those rows.',
                'Max 500 rows per upload. Split large catalogs into batches.',
              ].map((tip, i) => (
                <Typography key={i} variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75, pl: 0.5, lineHeight: 1.5 }}>
                  · {tip}
                </Typography>
              ))}
            </Box>

          </Stack>
        </Grid>

      </Grid>
    </Box>
  );
}