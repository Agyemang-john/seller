'use client';

/** Messages to followers (backend tools/broadcasts.py): news and sales to followers and past buyers, by app, email and SMS. */

import { useMemo, useState } from 'react';
import useSWR from 'swr';
import {
  Alert, Autocomplete, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, LinearProgress, Stack, TextField, Typography,
} from '@mui/material';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
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
const plural = (n, one, many = `${one}s`) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

function Compose({ data, onSent }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [audience, setAudience] = useState('everyone');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [withSms, setWithSms] = useState(false);
  const [busy, setBusy] = useState('');                 // '' | 'send' | 'preview'
  const [error, setError] = useState('');
  const [previewed, setPreviewed] = useState(null);
  const { data: options } = useSWR(`/api/v1/tools/products/?all=1&search=${encodeURIComponent(search)}`, fetcher, { keepPreviousData: true });

  const left = Math.max((data.allowance || 0) - (data.used || 0), 0);
  const smsLeft = Math.max((data.sms_allowance || 0) - (data.sms_used || 0), 0);
  const blockedUntil = data.next_allowed_at ? new Date(data.next_allowed_at) : null;
  const size = data.audience_sizes?.[audience] || { people: 0, sms: 0 };
  const sms = withSms ? size.sms : 0;
  const body = { audience, subject, message, product_ids: products.map((p) => p.id) };
  const written = subject.trim().length >= 4 && message.trim().length >= 10;

  // Why Send is off, in words (a greyed-out button alone leaves sellers guessing).
  const reason =
    !left ? `You've used all ${data.allowance} messages for this month. They renew on the 1st.`
    : blockedUntil ? `One message a day keeps shoppers listening. You can send the next one from ${blockedUntil.toLocaleString()}.`
    : !size.people ? 'Nobody in this audience yet. Shoppers join when they follow your store or buy from you. Your own team never gets your messages, so use "Send me a preview" to see one.'
    : withSms && !size.sms ? 'Nobody in this audience has a verified Ghana phone number for SMS yet. Turn SMS off to send by app and email.'
    : withSms && sms > smsLeft ? `This needs ${plural(sms, 'SMS', 'SMS')} and you have ${smsLeft} left this month. Turn SMS off or pick a smaller audience.`
    : !written ? 'Write a subject (4+ characters) and a message (10+ characters).'
    : '';

  const send = async () => {
    setBusy('send'); setError('');
    try {
      await client.post('/api/v1/tools/broadcasts/', { ...body, with_sms: withSms });
      setSubject(''); setMessage(''); setProducts([]); setPreviewed(null);
      onSent();
    } catch (err) { setError(apiError(err)); } finally { setBusy(''); }
  };
  const preview = async () => {
    setBusy('preview'); setError(''); setPreviewed(null);
    try { setPreviewed((await client.post('/api/v1/tools/broadcasts/', { ...body, preview: true })).data); }
    catch (err) { setError(apiError(err)); } finally { setBusy(''); }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, gap: 1, flexWrap: 'wrap' }}>
        <Typography sx={{ fontWeight: 700, fontSize: 17 }}>New message</Typography>
        <Typography variant="caption" color="text.secondary">
          {left} of {data.allowance} messages left{data.sms_allowance ? ` · ${smsLeft} of ${data.sms_allowance} SMS` : ''} this month
        </Typography>
      </Stack>
      <LinearProgress variant="determinate" value={data.allowance ? Math.min((data.used / data.allowance) * 100, 100) : 0} sx={{ height: 5, borderRadius: 3, mb: 2 }} />
      {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
      <Stack spacing={2}>
        <Box>
          <Typography variant="caption" color="text.secondary">Send to</Typography>
          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', mt: 0.5 }}>
            {AUDIENCES.map((a) => (
              <Chip key={a.key} clickable label={`${a.label} (${data.audience_sizes?.[a.key]?.people ?? 0})`} onClick={() => setAudience(a.key)}
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

        {data.sms_allowance > 0 ? (
          <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'action.hover' }}>
            <FormControlLabel control={<Checkbox checked={withSms} onChange={(e) => setWithSms(e.target.checked)} />}
              label={<span><b>Also send by SMS</b> · reaches {plural(size.sms, 'person', 'people')} with a verified Ghana number</span>} />
            {withSms && (
              <Typography variant="caption" color="text.secondary" component="div" sx={{ pl: 4 }}>
                Uses {plural(size.sms, 'SMS', 'SMS')} of your {smsLeft} left. The text is made from your subject and message, with a link
                to your store and how to stop store texts. {previewed?.sms_text ? '' : 'Send yourself a preview to see it.'}
              </Typography>
            )}
            {withSms && previewed?.sms_text && (
              <Box sx={{ mt: 1, ml: 4, p: 1.25, borderRadius: '12px', bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', maxWidth: 420 }}>
                <Typography variant="caption" color="text.secondary">SMS preview · {previewed.sms_text.length} characters</Typography>
                <Typography sx={{ fontSize: 14, whiteSpace: 'pre-wrap' }}>{previewed.sms_text}</Typography>
              </Box>
            )}
          </Box>
        ) : (
          <Typography variant="caption" color="text.secondary">SMS isn&apos;t in your plan. Messages go out in the app and by email.</Typography>
        )}

        {previewed && (
          <Alert severity="success" sx={{ borderRadius: '10px' }} onClose={() => setPreviewed(null)}>
            Preview sent to you in the app{previewed.emailed ? ` and to ${previewed.email}` : ''}. It doesn&apos;t count toward your messages.
          </Alert>
        )}
        {reason && <Alert severity="info" sx={{ borderRadius: '10px' }}>{reason}</Alert>}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
          <Button variant="contained" disableElevation onClick={send} disabled={!!busy || !!reason}
            startIcon={busy === 'send' ? <CircularProgress size={14} color="inherit" /> : <SendOutlinedIcon />}
            sx={{ borderRadius: '10px', fontWeight: 700, minHeight: 44, bgcolor: 'text.primary', color: 'background.paper',
              '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'text.disabled' } }}>
            Send to {plural(size.people, 'person', 'people')}{sms ? ` (+${sms} SMS)` : ''}
          </Button>
          <Button variant="outlined" onClick={preview} disabled={!!busy || !written}
            startIcon={busy === 'preview' ? <CircularProgress size={14} color="inherit" /> : <VisibilityOutlinedIcon />}
            sx={{ borderRadius: '10px', fontWeight: 600, minHeight: 44 }}>
            Send me a preview
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary">
          Shoppers get it in the Negromart app, by email unless they turned off offers from stores{data.sms_allowance ? ', and by SMS if you tick it' : ''}.
        </Typography>
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
              {b.status === 'sent' && ` · ${b.recipients} reached, ${b.emailed} by email${b.with_sms ? `, ${b.sms_sent} by SMS` : ''}`}
              {b.status === 'queued' && ' · waiting to go out (usually a few seconds)'}
            </Typography>
            {b.error && <Alert severity={b.status === 'failed' ? 'error' : 'warning'} sx={{ mt: 1, py: 0, borderRadius: '10px' }}>{b.error}</Alert>}
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
