'use client';

/** "What shoppers want" (backend tools/demand.py): demand from on-site search in the store's categories. */

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { Box, Button, Chip, CircularProgress, Stack, Tab, Tabs, Typography } from '@mui/material';
import PageContainer from '@/components/PageContainer';
import ToolGate from '@/components/tools/ToolGate';
import { fetcher } from '@/components/dashboard/DashboardUI';

const TABS = [
  { key: 'opportunities', label: 'Opportunities', intro: 'Searched a lot, with few listings to choose from. Adding one of these gets seen.' },
  { key: 'nothing_found', label: 'Nothing found', intro: 'Shoppers searched for these and found nothing on Negromart. If you can stock them, you have no competition.' },
  { key: 'your_share', label: 'Your share', intro: 'The biggest searches in your categories, and how many of the matching listings are yours.' },
];

function TermRow({ r, tab }) {
  return (
    <Box sx={{ p: 1.75, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography fontWeight={700}>“{r.term}”</Typography>
          {r.category && <Typography variant="caption" color="text.secondary">{r.category}</Typography>}
        </Box>
        <Stack direction="row" spacing={2.5} alignItems="center" sx={{ flexWrap: 'wrap', rowGap: 0.5 }}>
          <Box><Typography variant="caption" color="text.secondary">Shoppers</Typography><Typography fontWeight={700}>{r.searchers}</Typography></Box>
          {tab === 'nothing_found'
            ? <Box><Typography variant="caption" color="text.secondary">Found nothing</Typography><Typography fontWeight={700}>{r.found_nothing}</Typography></Box>
            : <Box><Typography variant="caption" color="text.secondary">Listings</Typography><Typography fontWeight={700}>{r.live_results}</Typography></Box>}
          {tab === 'opportunities' && <Chip size="small" label={`${r.per_listing} shoppers per listing`} color="success" variant="outlined" />}
          {tab === 'your_share' && <Chip size="small" label={`${r.yours} yours`} variant="outlined" color={r.yours ? 'primary' : 'default'} />}
          <Button size="small" component={Link} href="/products/product" sx={{ borderRadius: '8px', fontWeight: 600 }}>Add product</Button>
        </Stack>
      </Stack>
    </Box>
  );
}

function Demand() {
  const [tab, setTab] = useState(0);
  const { data, isLoading } = useSWR('/api/v1/tools/demand/', fetcher);
  const current = TABS[tab];
  const rows = data?.[current.key] || [];
  return (
    <Box>
      <Typography color="text.secondary" sx={{ mb: 2, maxWidth: 720 }}>
        From searches on Negromart over the last {data?.window_days ?? 28} days, in the categories you sell in. Updated every night;
        a search only counts once several different shoppers have made it.
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider', '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 } }}>
        {TABS.map((t) => <Tab key={t.key} label={`${t.label}${data ? ` (${data[t.key].length})` : ''}`} />)}
      </Tabs>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{current.intro}</Typography>
      {isLoading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress size={28} /></Box> : (
        <Stack spacing={1}>
          {rows.map((r) => <TermRow key={r.term} r={r} tab={current.key} />)}
          {!rows.length && (
            <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              Not enough searches in your categories yet. Check back in a few days.
            </Typography>
          )}
        </Stack>
      )}
    </Box>
  );
}

export default function DemandPage() {
  return (
    <PageContainer title="What shoppers want" breadcrumbs={[{ title: 'Seller tools', path: '/tools' }, { title: 'What shoppers want' }]}>
      <ToolGate toolKey="demand_insights"><Demand /></ToolGate>
    </PageContainer>
  );
}
