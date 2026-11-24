'use client';

/** API & stock sync (backend tools/seller_api.py, tools/webhooks.py): keys, webhooks, a short reference. */

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, IconButton, Stack, Switch, TextField,
  Tooltip, Typography,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const card = { p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' };
const darkBtn = { borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' };
const code = { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 12.5 };
const API_BASE = `${process.env.NEXT_PUBLIC_HOST || ''}/api/v1/tools/api`;
const when = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : 'Never');

function Copy({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  return (
    <Tooltip title={done ? 'Copied' : label}>
      <IconButton size="small" aria-label={label}
        onClick={async () => { try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1500); } catch { /* no clipboard */ } }}>
        <ContentCopyRoundedIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );
}

function Keys({ data, onChange }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [name, setName] = useState('');
  const [canWrite, setCanWrite] = useState(true);
  const [fresh, setFresh] = useState(null);        // the full key, shown once
  const [error, setError] = useState('');
  const create = async () => {
    setError('');
    try {
      const res = await client.post('/api/v1/tools/api-setup/', { name, can_write: canWrite });
      setFresh(res.data.key); setName(''); onChange();
    } catch (err) { setError(apiError(err)); }
  };
  const revoke = async (id) => { await client.delete(`/api/v1/tools/api-setup/keys/${id}/`).catch(() => {}); onChange(); };
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5 }}>API keys</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        A key lets one of your systems (a POS, a stock sheet, another shop) use your store&apos;s data. Keep it secret, like a password.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {fresh && (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: '10px', '& .MuiAlert-message': { minWidth: 0, flex: 1 } }} onClose={() => setFresh(null)}>
          Copy this key now. It won&apos;t be shown again.
          <Stack direction="row" alignItems="center" sx={{ mt: 1, p: 1, bgcolor: 'background.paper', borderRadius: '8px' }}>
            <Typography sx={{ ...code, flex: 1, wordBreak: 'break-all' }}>{fresh}</Typography>
            <Copy text={fresh} label="Copy key" />
          </Stack>
        </Alert>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
        <TextField size="small" label="Key name" placeholder="e.g. Warehouse sheet" value={name}
          onChange={(e) => setName(e.target.value.slice(0, 60))} sx={{ ...fieldSx, flex: 1 }} />
        <FormControlLabel control={<Switch checked={canWrite} onChange={(e) => setCanWrite(e.target.checked)} />}
          label={canWrite ? 'Can change stock & prices' : 'Read only'} sx={{ mr: 0 }} />
        <Button variant="contained" disableElevation onClick={create} disabled={!name.trim() || data.keys.length >= data.max_keys} sx={darkBtn}>
          Create key
        </Button>
      </Stack>
      <Stack spacing={1}>
        {data.keys.map((k) => (
          <Stack key={k.id} direction="row" alignItems="center" spacing={1} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700} noWrap>{k.name} {!k.can_write && <Chip size="small" label="Read only" sx={{ ml: 0.5 }} />}</Typography>
              <Typography variant="caption" color="text.secondary"><span style={code}>{k.prefix}</span> · last used {when(k.last_used_at)}</Typography>
            </Box>
            <Button color="error" size="small" onClick={() => revoke(k.id)}>Revoke</Button>
          </Stack>
        ))}
        {!data.keys.length && <Typography color="text.secondary" sx={{ py: 1 }}>No keys yet.</Typography>}
      </Stack>
    </Box>
  );
}

function Hook({ hook, events, onChange }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [test, setTest] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const put = async (body) => { await client.put(`/api/v1/tools/api-setup/webhooks/${hook.id}/`, body).catch(() => {}); onChange(); };
  const ping = async () => {
    setBusy(true); setTest(null);
    try { setTest((await client.post(`/api/v1/tools/api-setup/webhooks/${hook.id}/`)).data); }
    catch (err) { setTest({ ok: false, message: apiError(err) }); } finally { setBusy(false); }
  };
  const remove = async () => { await client.delete(`/api/v1/tools/api-setup/webhooks/${hook.id}/`).catch(() => {}); onChange(); };
  return (
    <Box sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography sx={{ ...code, flex: 1, minWidth: 0, wordBreak: 'break-all', fontWeight: 700 }}>{hook.url}</Typography>
        <Switch checked={hook.is_active} onChange={(e) => put({ is_active: e.target.checked })} inputProps={{ 'aria-label': 'Webhook on' }} />
        <Tooltip title="Delete"><IconButton aria-label="Delete webhook" onClick={remove}><DeleteOutlineIcon /></IconButton></Tooltip>
      </Stack>
      {hook.disabled_reason && !hook.is_active && <Alert severity="warning" sx={{ my: 1, borderRadius: '10px' }}>{hook.disabled_reason}</Alert>}
      <Stack direction="row" sx={{ gap: 0.5, flexWrap: 'wrap', my: 1 }}>
        {Object.entries(events).map(([key, label]) => (
          <FormControlLabel key={key} label={<span><span style={code}>{key}</span> · {label}</span>}
            control={<Checkbox size="small" checked={hook.events.includes(key)}
              onChange={(e) => put({ events: e.target.checked ? [...hook.events, key] : hook.events.filter((x) => x !== key) })} />} />
        ))}
      </Stack>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">Signing secret:</Typography>
        <Typography sx={code}>{showSecret ? hook.secret : 'whsec_••••••••'}</Typography>
        <Button size="small" onClick={() => setShowSecret((v) => !v)}>{showSecret ? 'Hide' : 'Show'}</Button>
        {showSecret && <Copy text={hook.secret} label="Copy secret" />}
        <Button size="small" onClick={() => put({ roll_secret: true })}>New secret</Button>
        <Box sx={{ flex: 1 }} />
        <Button size="small" variant="outlined" onClick={ping} disabled={busy} sx={{ borderRadius: '10px' }}>Send test</Button>
      </Stack>
      {test && <Alert severity={test.ok ? 'success' : 'error'} sx={{ mt: 1, borderRadius: '10px' }}>{test.message}</Alert>}
      {hook.recent.length > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary">Recent deliveries</Typography>
          {hook.recent.map((d) => (
            <Stack key={d.id} direction="row" spacing={1} alignItems="center" sx={{ py: 0.5, borderTop: '1px solid', borderColor: 'divider' }}>
              <Chip size="small" label={d.status} color={d.status === 'sent' ? 'success' : d.status === 'failed' ? 'error' : 'default'} variant="outlined" />
              <Typography sx={{ ...code, flex: 1 }} noWrap>{d.event}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {d.error || (d.response_code ? `${d.response_code}` : '')}{d.attempts > 1 ? ` · ${d.attempts} tries` : ''} · {when(d.created_at)}
              </Typography>
            </Stack>
          ))}
        </Box>
      )}
    </Box>
  );
}

function Webhooks({ data, onChange }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const add = async () => {
    setError('');
    try { await client.post('/api/v1/tools/api-setup/webhooks/', { url, events: Object.keys(data.events) }); setUrl(''); onChange(); }
    catch (err) { setError(apiError(err)); }
  };
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5 }}>Webhooks</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        We send your system a message the moment an order comes in or changes. Each message is signed so you can check it&apos;s from us.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
        <TextField size="small" fullWidth label="Your https address" placeholder="https://your-system.example/negromart" value={url}
          onChange={(e) => setUrl(e.target.value.slice(0, 300))} sx={fieldSx} />
        <Button variant="contained" disableElevation onClick={add} disabled={!url.startsWith('https://') || data.webhooks.length >= data.max_webhooks}
          sx={{ ...darkBtn, flexShrink: 0 }}>Add webhook</Button>
      </Stack>
      <Stack spacing={1.5}>
        {data.webhooks.map((h) => <Hook key={h.id} hook={h} events={data.events} onChange={onChange} />)}
        {!data.webhooks.length && <Typography color="text.secondary" sx={{ py: 1 }}>No webhooks yet.</Typography>}
      </Stack>
    </Box>
  );
}

const EXAMPLES = [
  { title: 'List your products and stock', body: `curl ${API_BASE}/products/?page=1 \\\n  -H "Authorization: Bearer nm_..."`,
    note: 'One row per product, or per version for products with versions. Filters: updated_since, seller_sku, status. 100 rows a page.' },
  { title: 'Update stock and prices (up to 500 at once)', body: `curl -X POST ${API_BASE}/stock/ \\\n  -H "Authorization: Bearer nm_..." \\\n  -H "Content-Type: application/json" \\\n  -d '{"items": [{"seller_sku": "KET-1", "stock": 12, "price": "61.00"}]}'`,
    note: 'Match by seller_sku, or product_id (+ variant_id). Rows that fail are listed by index; the rest are saved.' },
  { title: 'Read your orders', body: `curl "${API_BASE}/orders/?updated_since=2026-11-20T00:00:00Z" \\\n  -H "Authorization: Bearer nm_..."`,
    note: 'Newest change first, with only your items and the delivery address. 50 a page.' },
  { title: 'Check a webhook signature', body: `# Header: X-Negromart-Signature: t=1763900000,v1=<hex>\nexpected = HMAC_SHA256(secret, t + "." + raw_body)  # compare with v1\n# Reject messages where t is more than 5 minutes old.`,
    note: 'Answer with any 2xx within 10 seconds. Failed deliveries are retried for about 9 hours.' },
];

function Reference() {
  return (
    <Box sx={card}>
      <Typography sx={{ fontWeight: 700, fontSize: 17, mb: 0.5 }}>Quick reference</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Up to 120 calls a minute per key. Errors come back as {'{"error": "..."}'}.
      </Typography>
      <Stack spacing={2}>
        {EXAMPLES.map((e) => (
          <Box key={e.title}>
            <Typography fontWeight={700} sx={{ mb: 0.5 }}>{e.title}</Typography>
            <Box sx={{ position: 'relative', p: 1.5, pr: 5, borderRadius: '10px', bgcolor: 'action.hover', overflowX: 'auto' }}>
              <Box component="pre" sx={{ ...code, m: 0, whiteSpace: 'pre' }}>{e.body}</Box>
              <Box sx={{ position: 'absolute', top: 4, right: 4 }}><Copy text={e.body} /></Box>
            </Box>
            <Typography variant="caption" color="text.secondary">{e.note}</Typography>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

function ApiTool() {
  const { data, mutate, isLoading } = useSWR('/api/v1/tools/api-setup/', fetcher);
  if (isLoading || !data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  return (
    <Stack spacing={2.5}>
      <Keys data={data} onChange={() => mutate()} />
      <Webhooks data={data} onChange={() => mutate()} />
      <Reference />
    </Stack>
  );
}

export default function ApiToolPage() {
  return (
    <PageContainer title="API & stock sync" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'API & stock sync' }]}>
      <ToolGate toolKey="api"><ApiTool /></ToolGate>
    </PageContainer>
  );
}
