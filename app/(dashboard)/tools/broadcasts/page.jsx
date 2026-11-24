'use client';

/** Messages to followers (backend tools/broadcasts.py): news and sales to followers and past buyers. */

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Autocomplete, Box, Button, Chip, CircularProgress, LinearProgress, Stack, TextField, Typography,
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const AUDIENCES = [
  { key: 'everyone', label: 'Followers and past buyers' },
  { key: 'followers', label: 'Followers' },
  { key: 'buyers', label: 'Past buyers (last 12 months)' },
];
const STATUS = { queued: 'Queued', sending: 'Sending…', sent: 'Sent', failed: 'Failed' };

function Compose({ data, onSent }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [audience, setAudience] = useState('everyone');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { data: options } = useSWR(`/api/v1/tools/products/?search=${encodeURIComponent(search)}`, fetcher, { keepPreviousData: true });
  const left = Math.max((data.allowance || 0) - (data.used || 0), 0);
  const blockedUntil = data.next_allowed_at ? new Date(data.next_allowed_at) : null;
  const size = data.audience_sizes?.[audience] ?? 0;

  const send = async () => {
    setBusy(true); setError('');
    try {
      await client.post('/api/v1/tools/broadcasts/', { audience, subject, message, product_ids: products.map((p) => p.id) });
      setSubject(''); setMessage(''); setProducts([]);
      onSent();
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17 }}>New message</Typography>
        <Typography variant="caption" color="text.secondary">{left} of {data.allowance} left this month</Typography>
      </Stack>
      <LinearProgress variant="determinate" value={data.allowance ? Math.min((data.used / data.allowance) * 100, 100) : 0} sx={{ height: 5, borderRadius: 3, mb: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {blockedUntil && <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}>One message a day keeps shoppers listening. Next one from {blockedUntil.toLocaleString()}.</Alert>}
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary">Send to</Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {AUDIENCES.map((a) => (
              <Chip key={a.key} clickable label={`${a.label} (${data.audience_sizes?.[a.key] ?? 0})`} onClick={() => setAudience(a.key)}
                variant={audience === a.key ? 'filled' : 'outlined'}
                sx={{ fontWeight: 600, ...(audience === a.key && { bgcolor: 'text.primary', color: 'background.paper' }) }} />
            ))}
          </Stack>
        </Box>
        <TextField size="small" label="Subject" value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 80))} sx={fieldSx}
          helperText={`${subject.length}/80 · e.g. "New arrivals: kitchen essentials"`} />
        <TextField multiline minRows={4} label="Message" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 1000))} sx={fieldSx}
          helperText={`${message.length}/1000 · Keep it to what's new. Phone numbers, emails and outside links aren't allowed.`} />
        <Autocomplete multiple size="small" options={options?.results || []} value={products} filterOptions={(x) => x}
          getOptionLabel={(o) => o.title} isOptionEqualToValue={(o, v) => o.id === v.id} onInputChange={(_, v) => setSearch(v)}
          onChange={(_, v) => setProducts(v.slice(0, 4))}
          renderInput={(params) => <TextField {...params} label="Feature products (optional, up to 4)" sx={fieldSx} />} />
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Button variant="contained" disableElevation onClick={send}
            disabled={busy || !left || !!blockedUntil || !size || subject.trim().length < 4 || message.trim().length < 10}
            startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon />}
            sx={{ borderRadius: '10px', fontWeight: 700, minHeight: 44, bgcolor: 'text.primary', color: 'background.paper',
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' } }}>
            Send to {size} {size === 1 ? 'person' : 'people'}
          </Button>
          <Typography variant="caption" color="text.secondary">
            They get it in the Negromart app, and by email unless they turned off offers from stores.
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
}

function Broadcasts() {
  const { data, mutate, isLoading } = useSWR('/api/v1/tools/broadcasts/', fetcher, { refreshInterval: (d) => (d?.results?.some((b) => ['queued', 'sending'].includes(b.status)) ? 4000 : 0) });
  if (isLoading || !data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  return (
    <Box>
      <Compose data={data} onSent={() => mutate()} />
      <Typography fontWeight={700} sx={{ mb: 1 }}>Sent</Typography>
      <Stack spacing={1}>
        {data.results.map((b) => (
          <Box key={b.id} sx={{ p: 1.75, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" justifyContent="space-between" spacing={1}>
              <Typography fontWeight={700} sx={{ minWidth: 0 }} noWrap>{b.subject}</Typography>
              <Chip size="small" label={STATUS[b.status]} color={b.status === 'sent' ? 'success' : b.status === 'failed' ? 'error' : 'default'} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, whiteSpace: 'pre-line' }}>{b.message}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(b.created_at).toLocaleString()} · {AUDIENCES.find((a) => a.key === b.audience)?.label}
              {b.status === 'sent' && ` · ${b.recipients} reached, ${b.emailed} by email`}
            </Typography>
          </Box>
        ))}
        {!data.results.length && <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>Nothing sent yet.</Typography>}
      </Stack>
    </Box>
  );
}

export default function BroadcastsPage() {
  return (
    <PageContainer title="Messages to followers" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Messages to followers' }]}>
      <ToolGate toolKey="broadcasts"><Broadcasts /></ToolGate>
    </PageContainer>
  );
}
