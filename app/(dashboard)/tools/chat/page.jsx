'use client';

/** Chat helpers (backend tools/chat_tools.py): away message, saved replies, response times. */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Alert, Box, Button, Chip, CircularProgress, IconButton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const MODES = [
  { key: 'off', label: 'Off' },
  { key: 'outside_hours', label: 'Outside opening hours' },
  { key: 'always', label: 'Always (holiday)' },
];

function Stat({ label, value, hint }) {
  return (
    <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography sx={{ fontSize: 26, fontWeight: 800 }}>{value}</Typography>
      {hint && <Typography variant="caption" color="text.secondary">{hint}</Typography>}
    </Box>
  );
}

function Away({ data, onSaved }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [mode, setMode] = useState(data.mode);
  const [message, setMessage] = useState(data.message || 'Thanks for your message! We are away right now and will reply as soon as we are back.');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const save = async () => {
    setBusy(true); setError(''); setSaved(false);
    try { await client.put('/api/v1/tools/chat/away/', { mode, message }); setSaved(true); onSaved(); }
    catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };
  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17 }}>Away message</Typography>
        {data.away_now && <Chip size="small" color="warning" label="Away now" />}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Sent automatically when a shopper writes while you&apos;re away, at most once per chat every 12 hours. Shoppers see it&apos;s automatic.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      {saved && <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setSaved(false)}>Saved.</Alert>}
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mb: 2 }}>
        {MODES.map((m) => (
          <Chip key={m.key} clickable label={m.label} onClick={() => setMode(m.key)} variant={mode === m.key ? 'filled' : 'outlined'}
            sx={{ fontWeight: 600, ...(mode === m.key && { bgcolor: 'text.primary', color: 'background.paper' }) }} />
        ))}
      </Stack>
      {mode === 'outside_hours' && !data.has_hours && (
        <Alert severity="info" sx={{ mb: 2, borderRadius: '10px' }}
          action={<Button component={Link} href="/working-hours" size="small">Set hours</Button>}>
          Set your opening hours first; until then this won&apos;t send.
        </Alert>
      )}
      <TextField multiline minRows={3} fullWidth label="Message" value={message} onChange={(e) => setMessage(e.target.value.slice(0, 500))}
        sx={fieldSx} disabled={mode === 'off'} helperText={`${message.length}/500`} />
      <Button variant="contained" disableElevation onClick={save} disabled={busy}
        sx={{ mt: 1.5, borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>Save</Button>
    </Box>
  );
}

function Replies() {
  const client = useMemo(() => createAxiosClient(), []);
  const { data, mutate } = useSWR('/api/v1/tools/chat/replies/', fetcher);
  const [editing, setEditing] = useState(null);       // null | {id?, title, body}
  const [error, setError] = useState('');
  const save = async () => {
    setError('');
    try {
      if (editing.id) await client.put(`/api/v1/tools/chat/replies/${editing.id}/`, editing);
      else await client.post('/api/v1/tools/chat/replies/', editing);
      setEditing(null);
      mutate();
    } catch (err) { setError(apiError(err)); }
  };
  const remove = async (id) => { await client.delete(`/api/v1/tools/chat/replies/${id}/`).catch(() => {}); mutate(); };
  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17 }}>Saved replies</Typography>
        <Button size="small" onClick={() => setEditing({ title: '', body: '' })} disabled={!!editing || (data && data.results.length >= data.max)}>Add</Button>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Answers to questions you get often. In a chat, tap the quick-reply button next to the message box to use one.
      </Typography>
      {editing && (
        <Box sx={{ p: 1.5, mb: 2, borderRadius: '12px', bgcolor: 'action.hover' }}>
          {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
          <Stack spacing={1.5}>
            <TextField size="small" label="Name" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value.slice(0, 40) })}
              sx={{ ...fieldSx, bgcolor: 'background.paper', borderRadius: '10px' }} placeholder="e.g. Delivery times" />
            <TextField multiline minRows={3} label="Reply" value={editing.body} onChange={(e) => setEditing({ ...editing, body: e.target.value.slice(0, 1000) })}
              sx={{ ...fieldSx, bgcolor: 'background.paper', borderRadius: '10px' }} />
            <Stack direction="row" spacing={1}>
              <Button variant="contained" disableElevation onClick={save} sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>Save</Button>
              <Button onClick={() => { setEditing(null); setError(''); }}>Cancel</Button>
            </Stack>
          </Stack>
        </Box>
      )}
      <Stack spacing={1}>
        {(data?.results || []).map((r) => (
          <Stack key={r.id} direction="row" spacing={1} alignItems="flex-start" sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography fontWeight={700}>{r.title}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>{r.body}</Typography>
              <Typography variant="caption" color="text.disabled">Used {r.use_count} time{r.use_count === 1 ? '' : 's'}</Typography>
            </Box>
            <Tooltip title="Edit"><IconButton aria-label={`Edit ${r.title}`} onClick={() => setEditing(r)}><EditOutlinedIcon /></IconButton></Tooltip>
            <Tooltip title="Delete"><IconButton aria-label={`Delete ${r.title}`} onClick={() => remove(r.id)}><DeleteOutlineIcon /></IconButton></Tooltip>
          </Stack>
        ))}
        {data && !data.results.length && !editing && <Typography color="text.secondary" sx={{ py: 2 }}>No saved replies yet.</Typography>}
      </Stack>
    </Box>
  );
}

function ChatTools() {
  const { data, mutate, isLoading } = useSWR('/api/v1/tools/chat/away/', fetcher);
  if (isLoading || !data) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box>;
  const s = data.stats;
  const median = s.median_minutes == null ? '—' : s.median_minutes < 60 ? `${s.median_minutes} min` : `${(s.median_minutes / 60).toFixed(1)} h`;
  return (
    <Stack spacing={2.5}>
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Typical first reply" value={median} hint={`last ${s.days} days`} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Answered within 1 hour" value={s.within_hour_percent == null ? '—' : `${s.within_hour_percent}%`} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Chats answered" value={s.answered} hint={`last ${s.days} days`} /></Grid>
        <Grid size={{ xs: 6, md: 3 }}><Stat label="Waiting for you" value={s.waiting_now} hint={s.waiting_now ? <Link href="/messages">Open messages</Link> : 'All caught up'} /></Grid>
      </Grid>
      <Away data={data} onSaved={() => mutate()} />
      <Replies />
    </Stack>
  );
}

export default function ChatToolsPage() {
  return (
    <PageContainer title="Chat helpers" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Chat helpers' }]}>
      <ToolGate toolKey="chat_tools"><ChatTools /></ToolGate>
    </PageContainer>
  );
}
