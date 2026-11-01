'use client';

/**
 * Shopper questions about the store's products (backend: qa/).
 * Answers are public and show a "Seller" badge on the product page. Quick
 * answers lift conversion, so unanswered questions are the default view.
 */

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Alert, Box, Button, Card, Chip, Pagination, Skeleton, Tab, Tabs, TextField, Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError, formatDate } from '@/libs/seller-ops';

const PAGE_SIZE = 10;

function QuestionCard({ q, onAnswered, onDeleted }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const mine = q.answers.filter((a) => a.is_seller);

  const submit = async () => {
    setBusy(true);
    try {
      const { data } = await createAxiosClient().post(`/api/v1/qa/questions/${q.id}/answers/`, { text });
      onAnswered(q.id, data);
      setText('');
      toast.success('Answer posted');
    } catch (err) {
      toast.error(apiError(err, 'Could not post your answer.'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (answerId) => {
    try {
      await createAxiosClient().delete(`/api/v1/qa/answers/${answerId}/`);
      onDeleted(q.id, answerId);
    } catch (err) {
      toast.error(apiError(err, 'Could not delete the answer.'));
    }
  };

  return (
    <Card variant="outlined" sx={{ p: 2, mb: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1.5 }}>
        {q.product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={q.product.image} alt="" width={56} height={56} style={{ objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary" noWrap component="div">{q.product.title}</Typography>
          <Typography sx={{ fontWeight: 600, fontSize: 15 }}>{q.text}</Typography>
          <Typography variant="caption" color="text.secondary">
            {q.author} · {formatDate(q.created_at)}
          </Typography>
        </Box>
      </Box>

      {q.answers.length > 0 && (
        <Box sx={{ mt: 1.5, pl: 2, borderLeft: '3px solid', borderColor: 'divider' }}>
          {q.answers.map((a) => (
            <Box key={a.id} sx={{ mb: 1 }}>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{a.text}</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary">{a.author} · {formatDate(a.created_at)}</Typography>
                {a.is_seller && <Chip size="small" label="Your store" color="primary" variant="outlined" sx={{ height: 18, fontSize: 10.5 }} />}
                {a.is_verified_buyer && <Chip size="small" label="Verified buyer" sx={{ height: 18, fontSize: 10.5 }} />}
                {a.is_seller && a.is_mine && (
                  <Button size="small" color="error" onClick={() => remove(a.id)} sx={{ textTransform: 'none', minWidth: 0, fontSize: 12 }}>
                    Delete
                  </Button>
                )}
              </Box>
            </Box>
          ))}
        </Box>
      )}

      {mine.length === 0 && (
        <Box sx={{ mt: 1.5 }}>
          <TextField fullWidth multiline minRows={2} size="small" value={text} onChange={(e) => setText(e.target.value)}
                     placeholder="Write a public answer" inputProps={{ maxLength: 1000 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary">
              Everyone can see this. Don&apos;t share phone numbers, links or payment details.
            </Typography>
            <Button variant="contained" size="small" disableElevation disabled={busy || text.trim().length < 2} onClick={submit}>
              Answer
            </Button>
          </Box>
        </Box>
      )}
    </Card>
  );
}

export default function SellerQuestions() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter = params.get('filter') || 'unanswered';
  const page = Math.max(1, Number(params.get('page') || 1));
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const navigate = (next) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v === '' || v == null ? q.delete(k) : q.set(k, v)));
    router.replace(`${pathname}?${q.toString()}`, { scroll: false });
  };

  const load = useCallback(async () => {
    setError('');
    try {
      const { data: res } = await createAxiosClient().get('/api/v1/qa/seller/questions/', {
        params: { filter, page, page_size: PAGE_SIZE },
      });
      setData(res);
    } catch (err) {
      setError(apiError(err, 'Could not load questions.'));
    }
  }, [filter, page]);

  useEffect(() => { load(); }, [load]);

  const onAnswered = (qid, answer) => setData((d) => ({
    ...d,
    unanswered_total: Math.max(0, (d.unanswered_total || 0) - 1),
    results: d.results.map((q) => (q.id === qid ? { ...q, answers: [answer, ...q.answers], seller_answered: true } : q)),
  }));
  const onDeleted = (qid, aid) => setData((d) => ({
    ...d,
    results: d.results.map((q) => (q.id === qid ? { ...q, answers: q.answers.filter((a) => a.id !== aid) } : q)),
  }));

  const pages = data ? Math.max(1, Math.ceil(data.count / PAGE_SIZE)) : 1;

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Shoppers ask questions on your product pages. Your answer is shown first, with a Seller badge, and the
        shopper is notified. Shoppers who bought the item can answer too.
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={filter} onChange={(_, v) => navigate({ filter: v, page: '' })}
              sx={{ minHeight: 42, '& .MuiTab-root': { minHeight: 42, textTransform: 'none', fontWeight: 600 } }}>
          <Tab value="unanswered" label={`Needs your answer${data?.unanswered_total ? ` (${data.unanswered_total})` : ''}`} />
          <Tab value="answered" label="Answered" />
          <Tab value="all" label="All" />
        </Tabs>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!data && !error && [0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={120} sx={{ mb: 1.5 }} />)}

      {data && data.results.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
          {filter === 'unanswered' ? "You're all caught up." : 'No questions yet.'}
        </Typography>
      )}

      {data?.results.map((q) => (
        <QuestionCard key={q.id} q={q} onAnswered={onAnswered} onDeleted={onDeleted} />
      ))}

      {pages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={pages} page={page} onChange={(_, p) => navigate({ page: p })} />
        </Box>
      )}
    </Box>
  );
}
