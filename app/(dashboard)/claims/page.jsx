'use client';

/**
 * Buyer-protection claims against the store (backend: protection/).
 * Respond before the deadline: offer a refund or explain. Unanswered claims
 * go to Negromart, and earnings for a claimed item are held until it's settled.
 */

import { Suspense, useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Alert, Box, Card, Chip, Pagination, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError, formatDate } from '@/libs/seller-ops';

const STATUS_COLOR = {
  open: 'warning', seller_offered: 'info', escalated: 'secondary',
  resolved_buyer: 'error', resolved_seller: 'success', withdrawn: 'default',
};

function Claims() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const filter = params.get('filter') || 'active';
  const page = Math.max(1, Number(params.get('page') || 1));
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    createAxiosClient().get('/api/v1/protection/seller/claims/', { params: { filter, page } })
      .then(({ data: d }) => setData(d)).catch((err) => setError(apiError(err, 'Could not load claims.')));
  }, [filter, page]);
  useEffect(() => { load(); }, [load]);

  const go = (next) => {
    const q = new URLSearchParams(params.toString());
    Object.entries(next).forEach(([k, v]) => (v ? q.set(k, v) : q.delete(k)));
    router.replace(`${pathname}?${q}`, { scroll: false });
  };

  return (
    <Box sx={{ maxWidth: 960 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        When a shopper reports that an item didn&apos;t arrive or wasn&apos;t as described, you have 48 hours to respond.
        Offering a full refund closes the claim straight away. Earnings for a claimed item are held until it&apos;s settled.
      </Typography>
      {data?.needs_response > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>{data.needs_response} claim(s) need your response.</Alert>
      )}
      <Tabs value={filter} onChange={(_, v) => go({ filter: v, page: '' })} sx={{ mb: 2 }}>
        <Tab value="active" label="Open" />
        <Tab value="closed" label="Closed" />
        <Tab value="all" label="All" />
      </Tabs>
      {error && <Alert severity="error">{error}</Alert>}
      {!data && !error && [0, 1].map((i) => <Skeleton key={i} variant="rounded" height={72} sx={{ mb: 1 }} />)}
      {data && data.results.length === 0 && <Typography color="text.secondary" sx={{ py: 4 }}>No claims here.</Typography>}
      {data?.results.map((c) => (
        <Card key={c.reference} variant="outlined" component={Link} href={`/claims/${c.reference}`}
              sx={{ p: 1.5, mb: 1, display: 'flex', gap: 1.5, alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          {c.item.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.item.image} alt="" width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} />
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 600 }}>{c.item.title}</Typography>
            <Typography variant="caption" color="text.secondary">
              {c.reference} · {c.reason_label} · GHS {c.amount_claimed}
              {c.status === 'open' ? ` · respond by ${formatDate(c.seller_respond_by, true)}` : ''}
            </Typography>
          </Box>
          <Chip size="small" label={c.status_label} color={STATUS_COLOR[c.status] || 'default'} />
        </Card>
      ))}
      {data && data.count > 20 && (
        <Pagination sx={{ mt: 2 }} count={Math.ceil(data.count / 20)} page={page} onChange={(_, p) => go({ page: String(p) })} />
      )}
    </Box>
  );
}

export default function Page() {
  return (
    <PageContainer title="Claims" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Claims' }]}>
      <Suspense fallback={null}><Claims /></Suspense>
    </PageContainer>
  );
}
