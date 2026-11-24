'use client';

/**
 * Wraps a paid seller tool page. Reads /api/v1/tools/ (backend tools/registry.py):
 * when the store's plan includes the tool, renders it; otherwise shows what the
 * tool does and the cheapest plan that unlocks it.
 */

import Link from 'next/link';
import useSWR from 'swr';
import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { fetcher } from '@/components/dashboard/DashboardUI';
import ToolGuide, { GuideSteps } from './ToolGuide';
import GUIDES from './guides';

export function useTools() {
  const { data, error, mutate } = useSWR('/api/v1/tools/', fetcher, { revalidateOnFocus: false });
  const tools = data?.tools || [];
  return { tools, byKey: Object.fromEntries(tools.map((t) => [t.key, t])), loading: !data && !error, mutate };
}

export function LockedTool({ tool }) {
  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', textAlign: 'center', py: { xs: 6, md: 10 }, px: 2 }}>
      <Box sx={{ width: 64, height: 64, borderRadius: '18px', mx: 'auto', mb: 2.5, display: 'flex', alignItems: 'center',
        justifyContent: 'center', bgcolor: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
        <LockOutlinedIcon sx={{ color: 'warning.main', fontSize: 30 }} />
      </Box>
      <Typography component="h2" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 24, md: 30 }, fontWeight: 700, mb: 1 }}>
        {tool?.name || 'This tool'} isn&apos;t in your plan
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>{tool?.summary}</Typography>
      {GUIDES[tool?.key] && (
        <Box sx={{ textAlign: 'left', mb: 3, p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider' }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>What you get</Typography>
          <GuideSteps guide={GUIDES[tool.key]} />
        </Box>
      )}
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Button component={Link} href="/tools" variant="outlined" sx={{ borderRadius: '10px', fontWeight: 600 }}>All tools</Button>
        <Button component={Link} href="/subscribe" variant="contained" disableElevation
          sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }}>
          {tool?.upgrade_plan ? `Get it with ${tool.upgrade_plan}` : 'See plans'}
        </Button>
      </Stack>
    </Box>
  );
}

export default function ToolGate({ toolKey, children }) {
  const { byKey, loading } = useTools();
  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress size={28} /></Box>;
  const tool = byKey[toolKey];
  if (!tool?.included) return <LockedTool tool={tool} />;
  return (
    <>
      <ToolGuide toolKey={toolKey} name={tool.name} />
      {children}
    </>
  );
}

/** Turns an API error into a sentence (403 upgrade replies included). */
export function apiError(err, fallback = 'Something went wrong. Please try again.') {
  const d = err?.response?.data;
  return d?.error || d?.detail || (typeof d === 'string' ? d : '') || fallback;
}

export const money = (v) => {
  if (v === null || v === undefined || v === '') return '—';
  const n = Number(v);
  const text = Math.abs(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `${n < 0 ? '-' : ''}₵${text}`;   // -₵199.00, not ₵-199.00
};
