'use client';

/** Store link & page (backend tools/storefront.py): short link, QR code, branded store page. */

import { useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { QRCodeCanvas } from 'qrcode.react';
import {
  Alert, Autocomplete, Box, Button, CircularProgress, InputAdornment, Stack, TextField, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const card = { p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' };
const darkBtn = { borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' };
const SWATCHES = ['#111827', '#1E88E5', '#2E7D32', '#C62828', '#6A1B9A', '#EF6C00', '#00897B', '#AD1457'];

function LinkCard({ data, onSaved }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [handle, setHandle] = useState(data.handle || '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const qrWrap = useRef(null);
  const site = (data.short_url || data.store_url).replace(/\/(s|seller)\/.*$/, '');
  const qrUrl = data.short_url ? `${data.short_url}?src=qr` : data.store_url;

  const save = async () => {
    setBusy(true); setError('');
    try { await client.put('/api/v1/tools/store/', { handle }); onSaved(); }
    catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(data.short_url || data.store_url); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* no clipboard */ }
  };
  const download = () => {
    const canvas = qrWrap.current?.querySelector('canvas');
    if (!canvas) return;
    const a = document.createElement('a');
    a.href = canvas.toDataURL('image/png');
    a.download = `${data.handle || 'store'}-qr.png`;
    a.click();
  };

  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5 }}>Your store link</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A short, easy link for WhatsApp, Instagram and business cards. The QR code goes on posters, flyers and packaging.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      <Grid container spacing={2.5} alignItems="center">
        <Grid size={{ xs: 12, md: 8 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField size="small" fullWidth label="Link name" value={handle}
              onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30))}
              InputProps={{ startAdornment: <InputAdornment position="start">{site.replace(/^https?:\/\//, '')}/s/</InputAdornment> }}
              sx={fieldSx} helperText="3–30 letters, numbers or dashes" />
            <Button variant="contained" disableElevation onClick={save} disabled={busy || handle.length < 3 || handle === data.handle}
              sx={{ ...darkBtn, minHeight: 40, alignSelf: { sm: 'flex-start' }, flexShrink: 0 }}>
              {data.handle ? 'Change' : 'Create link'}
            </Button>
          </Stack>
          {data.handle && (
            <Alert severity="info" sx={{ mt: 1.5, borderRadius: '10px' }}>
              Changing it stops the old link (and printed QR codes) from working.
            </Alert>
          )}
          <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button variant="outlined" startIcon={<ContentCopyRoundedIcon />} onClick={copy} sx={{ borderRadius: '10px' }}>
              {copied ? 'Copied' : 'Copy link'}
            </Button>
            <Button variant="outlined" startIcon={<OpenInNewRoundedIcon />} href={data.short_url || data.store_url} target="_blank" rel="noopener" sx={{ borderRadius: '10px' }}>
              Open
            </Button>
            <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={download} sx={{ borderRadius: '10px' }}>
              QR code (PNG)
            </Button>
          </Stack>
          {data.handle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              <b>{data.visits.toLocaleString()}</b> visit{data.visits === 1 ? '' : 's'} through your link and QR code
            </Typography>
          )}
        </Grid>
        <Grid size={{ xs: 12, md: 4 }} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box ref={qrWrap} sx={{ p: 1.5, bgcolor: '#fff', borderRadius: '12px', border: '1px solid', borderColor: 'divider', textAlign: 'center' }}>
            <QRCodeCanvas value={qrUrl} size={512} marginSize={2} level="M" style={{ width: 168, height: 168, display: 'block' }} />
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#111', mt: 0.5, maxWidth: 168 }} noWrap>{data.store_name}</Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

function BrandingCard({ data, onSaved }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [b, setB] = useState(data.branding);
  const [search, setSearch] = useState('');
  const [titles, setTitles] = useState({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const { data: products } = useSWR(`/api/v1/tools/products/?all=1&search=${encodeURIComponent(search)}`, fetcher, { keepPreviousData: true });
  const set = (patch) => { setSaved(false); setB((prev) => ({ ...prev, ...patch })); };
  const picked = useMemo(() => {
    const known = Object.fromEntries((products?.results || []).map((p) => [p.id, p]));
    return (b.featured_product_ids || []).map((id) => known[id] || titles[id] || { id, title: `Product #${id}` });
  }, [b.featured_product_ids, products, titles]);
  const accent = /^#[0-9a-f]{6}$/i.test(b.accent_color) ? b.accent_color : '#111827';

  const save = async () => {
    setBusy(true); setError('');
    try { await client.put('/api/v1/tools/store/', { branding: b }); setSaved(true); onSaved(); }
    catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };

  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5 }}>Your store page</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Make your page on Negromart yours: a colour, a line about your store, news at the top, and the products you want seen first.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setSaved(false)}>Saved. Your store page shows it now.</Alert>}
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary">Colour</Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.5, alignItems: 'center' }}>
            {SWATCHES.map((c) => (
              <Box key={c} component="button" type="button" aria-label={`Colour ${c}`} onClick={() => set({ accent_color: c })}
                sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: c, cursor: 'pointer', border: '3px solid',
                  borderColor: b.accent_color.toLowerCase() === c.toLowerCase() ? 'primary.main' : 'background.paper', boxShadow: '0 0 0 1px rgba(0,0,0,0.15)' }} />
            ))}
            <TextField size="small" label="Custom" value={b.accent_color} placeholder="#1E88E5"
              onChange={(e) => set({ accent_color: e.target.value.slice(0, 7) })} sx={{ ...fieldSx, width: 120 }} />
          </Stack>
        </Box>
        <TextField size="small" fullWidth label="Tagline" value={b.tagline} placeholder="e.g. Kitchen things that last"
          onChange={(e) => set({ tagline: e.target.value.slice(0, 80) })} sx={fieldSx} helperText={`${b.tagline.length}/80`} />
        <TextField size="small" fullWidth label="Announcement bar" value={b.announcement} placeholder="e.g. Free delivery in Accra this week"
          onChange={(e) => set({ announcement: e.target.value.slice(0, 140) })} sx={fieldSx}
          helperText={`${b.announcement.length}/140 · shown across the top of your page. Leave empty to hide.`} />
        <Autocomplete multiple size="small" options={products?.results || []} value={picked}
          getOptionLabel={(o) => o.title} isOptionEqualToValue={(o, v) => o.id === v.id}
          onInputChange={(_, v) => setSearch(v)} filterOptions={(x) => x}
          onChange={(_, v) => {
            if (v.length > data.max_featured) return;
            setTitles((prev) => ({ ...prev, ...Object.fromEntries(v.map((p) => [p.id, p])) }));
            set({ featured_product_ids: v.map((p) => p.id) });
          }}
          renderInput={(params) => <TextField {...params} label={`Featured products (up to ${data.max_featured})`} sx={fieldSx} />} />

        {/* Preview */}
        <Box sx={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', px: 1.5, py: 0.75, bgcolor: 'action.hover' }}>Preview</Typography>
          {b.announcement && (
            <Box sx={{ bgcolor: accent, color: '#fff', textAlign: 'center', py: 1, px: 2, fontWeight: 600, fontSize: 14 }}>{b.announcement}</Box>
          )}
          <Box sx={{ p: 2 }}>
            <Typography fontWeight={800}>{data.store_name}</Typography>
            {b.tagline && <Typography sx={{ mt: 1, pl: 1.5, borderLeft: `4px solid ${accent}`, fontWeight: 700 }}>{b.tagline}</Typography>}
            {picked.length > 0 && <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>Featured: {picked.map((p) => p.title).join(' · ')}</Typography>}
          </Box>
        </Box>

        <Box>
          <Button variant="contained" disableElevation onClick={save} disabled={busy} sx={darkBtn}>Save</Button>
        </Box>
      </Stack>
    </Box>
  );
}

function StoreTool() {
  const { data, mutate, isLoading } = useSWR('/api/v1/tools/store/', fetcher);
  if (isLoading || !data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  return (
    <Stack spacing={2.5}>
      <LinkCard key={`link-${data.handle}`} data={data} onSaved={() => mutate()} />
      <BrandingCard data={data} onSaved={() => mutate()} />
    </Stack>
  );
}

export default function StoreToolPage() {
  return (
    <PageContainer title="Store link & page" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Store link & page' }]}>
      <ToolGate toolKey="store_link"><StoreTool /></ToolGate>
    </PageContainer>
  );
}
