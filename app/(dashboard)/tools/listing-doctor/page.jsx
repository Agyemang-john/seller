'use client';

/**
 * Listing doctor (backend tools/listing_doctor.py): a score for every listing
 * with what to fix, and AI rewrites of title, description and features that
 * the seller reviews before anything is saved.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle,
  FormControlLabel, LinearProgress, Pagination, Stack, TextField, Typography,
} from '@mui/material';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import PageContainer from '@/components/PageContainer';
import ToolGate, { apiError } from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { fieldSx } from '@/components/products/form/fields';
import { createAxiosClient } from '@/utils/clientFetch';

const scoreColor = (s) => (s >= 85 ? '#2E7D32' : s >= 70 ? '#B26A00' : '#C62828');

function ScoreBadge({ score }) {
  return (
    <Box sx={{ width: 52, height: 52, borderRadius: '50%', border: '3px solid', borderColor: scoreColor(score), flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Typography sx={{ fontWeight: 800, color: scoreColor(score) }}>{score}</Typography>
    </Box>
  );
}

function RewriteDialog({ product, onClose, onApplied }) {
  const client = useMemo(() => createAxiosClient(), []);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [pick, setPick] = useState({ title: true, description: true, features: true });

  const generate = async () => {
    setBusy(true); setError('');
    try {
      const { data } = await client.post(`/api/v1/tools/listing-doctor/${product.product_id}/suggest/`, { notes });
      setSuggestion(data);
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };
  const apply = async () => {
    setBusy(true); setError('');
    try {
      await client.post(`/api/v1/tools/listing-doctor/${product.product_id}/apply/`, {
        ...(pick.title && { title: suggestion.title }),
        ...(pick.description && { description: suggestion.description }),
        ...(pick.features && suggestion.features && { features: suggestion.features }),
      });
      onApplied();
    } catch (err) { setError(apiError(err)); } finally { setBusy(false); }
  };

  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 700 }}>Rewrite “{product.title}”</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>{error}</Alert>}
        {!suggestion ? (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              The assistant rewrites the title, description and key features using only what your listing already says. Add anything it
              should know (materials, what&apos;s in the box, who it&apos;s for). Nothing changes until you choose what to keep.
            </Typography>
            <TextField multiline minRows={3} label="Notes for the assistant (optional)" value={notes} sx={fieldSx}
              onChange={(e) => setNotes(e.target.value.slice(0, 500))} placeholder="e.g. 100% cotton, comes with a carry bag" />
          </Stack>
        ) : (
          <Stack spacing={2} sx={{ pt: 1 }}>
            <FormControlLabel control={<Checkbox checked={pick.title} onChange={(e) => setPick({ ...pick, title: e.target.checked })} />}
              label={<Box><Typography variant="caption" color="text.secondary">Title</Typography><Typography fontWeight={700}>{suggestion.title}</Typography></Box>} />
            <FormControlLabel sx={{ alignItems: 'flex-start' }} control={<Checkbox checked={pick.description} onChange={(e) => setPick({ ...pick, description: e.target.checked })} />}
              label={<Box><Typography variant="caption" color="text.secondary">Description</Typography>
                <Box sx={{ '& p': { m: 0, mb: 1 }, fontSize: 14 }} dangerouslySetInnerHTML={{ __html: suggestion.description }} /></Box>} />
            {suggestion.features && (
              <FormControlLabel sx={{ alignItems: 'flex-start' }} control={<Checkbox checked={pick.features} onChange={(e) => setPick({ ...pick, features: e.target.checked })} />}
                label={<Box><Typography variant="caption" color="text.secondary">Key features</Typography>
                  <Box sx={{ '& ul': { m: 0, pl: 2.5 }, fontSize: 14 }} dangerouslySetInnerHTML={{ __html: suggestion.features }} /></Box>} />
            )}
            <Typography variant="caption" color="text.secondary">AI rewrites used this month: {suggestion.used} of {suggestion.allowance}. Check the facts before saving.</Typography>
          </Stack>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        {!suggestion ? (
          <Button variant="contained" disableElevation onClick={generate} disabled={busy}
            startIcon={busy ? <CircularProgress size={14} color="inherit" /> : <AutoAwesomeOutlinedIcon />}
            sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>
            {busy ? 'Writing…' : 'Write it'}
          </Button>
        ) : (
          <>
            <Button onClick={generate} disabled={busy}>Try again</Button>
            <Button variant="contained" disableElevation onClick={apply} disabled={busy || !(pick.title || pick.description || pick.features)}
              sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>Save selected</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function Doctor() {
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState('');
  const { data, mutate, isLoading } = useSWR(`/api/v1/tools/listing-doctor/?page=${page}`, fetcher, { keepPreviousData: true });
  const pages = data ? Math.max(Math.ceil(data.count / data.page_size), 1) : 1;
  const left = data ? Math.max(data.allowance - data.used, 0) : 0;

  return (
    <Box>
      {/* One row on every screen, so the listings stay in view on a phone. */}
      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1.25, sm: 2 }, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">Store average</Typography>
          <Typography sx={{ fontSize: { xs: 22, sm: 30 }, fontWeight: 800, color: data?.average != null ? scoreColor(data.average) : 'text.primary' }}>{data?.average ?? '—'}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1.25, sm: 2 }, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">Listings that need work</Typography>
          <Typography sx={{ fontSize: { xs: 22, sm: 30 }, fontWeight: 800 }}>{data?.needs_work ?? '—'}</Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, p: { xs: 1.25, sm: 2 }, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">AI rewrites left this month</Typography>
          <Typography sx={{ fontSize: { xs: 22, sm: 30 }, fontWeight: 800 }}>{data ? left : '—'}</Typography>
          {data?.allowance > 0 && <LinearProgress variant="determinate" value={Math.min((data.used / data.allowance) * 100, 100)} sx={{ height: 6, borderRadius: 3 }} />}
        </Box>
      </Stack>
      {notice && <Alert severity="success" onClose={() => setNotice('')} sx={{ mb: 2, borderRadius: '10px' }}>{notice}</Alert>}
      {isLoading && !data ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box> : (
        <Stack spacing={1.25}>
          {(data?.results || []).map((r) => (
            <Box key={r.product_id} sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <ScoreBadge score={r.score} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography fontWeight={700} sx={{ mb: 0.75 }}>{r.title}</Typography>
                  {r.issues.length === 0
                    ? <Typography variant="body2" color="success.main">Great listing: nothing to fix.</Typography>
                    : (
                      <Stack spacing={0.5}>
                        {r.issues.slice(0, 4).map((i) => (
                          <Typography key={i.message} variant="body2" color="text.secondary">
                            <Chip size="small" label={`-${i.points}`} sx={{ height: 18, fontSize: 11, mr: 1, fontWeight: 700 }} />{i.message}
                          </Typography>
                        ))}
                        {r.issues.length > 4 && <Typography variant="caption" color="text.secondary">+{r.issues.length - 4} more</Typography>}
                      </Stack>
                    )}
                  <Stack direction="row" spacing={1} sx={{ mt: 1.25, flexWrap: 'wrap', rowGap: 1 }}>
                    <Button size="small" variant="outlined" component={Link} href={`/products/product/${r.product_id}${r.issues[0] ? `#${r.issues[0].section}` : ''}`} sx={{ borderRadius: '8px' }}>Fix in the form</Button>
                    <Button size="small" variant="contained" disableElevation startIcon={<AutoAwesomeOutlinedIcon />} disabled={!left}
                      onClick={() => setEditing(r)} sx={{ borderRadius: '8px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper' }}>
                      Rewrite with AI
                    </Button>
                  </Stack>
                </Box>
              </Stack>
            </Box>
          ))}
          {!data?.results?.length && <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>No listings yet.</Typography>}
        </Stack>
      )}
      {pages > 1 && <Stack alignItems="center" sx={{ mt: 2 }}><Pagination page={page} count={pages} onChange={(_, p) => setPage(p)} shape="rounded" /></Stack>}
      {editing && (
        <RewriteDialog product={editing} onClose={() => { setEditing(null); mutate(); }}
          onApplied={() => { setEditing(null); setNotice('Saved. The score below is updated.'); mutate(); }} />
      )}
    </Box>
  );
}

export default function ListingDoctorPage() {
  return (
    <PageContainer title="Listing doctor" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'Listing doctor' }]}>
      <ToolGate toolKey="listing_doctor"><Doctor /></ToolGate>
    </PageContainer>
  );
}
