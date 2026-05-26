'use client';
// Shared dashboard UI primitives used by Main.jsx, StoreAnalyticsPage.jsx, etc.

import { Component } from 'react';
import { Box, Button, Typography, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon   from '@mui/icons-material/TrendingUp';
import { createAxiosClient } from '@/utils/clientFetch';

// ── SWR config ────────────────────────────────────────────────────────────────
export const SWR_CONFIG = {
  keepPreviousData:      true,
  revalidateOnFocus:     false,
  revalidateOnReconnect: false,
  dedupingInterval:      15_000,
  shouldRetryOnError:    false,
};

// ── SWR fetcher ───────────────────────────────────────────────────────────────
export const fetcher = async (url) => {
  if (!url) return null;
  const client = createAxiosClient();
  try {
    const res = await client.get(url);
    return res.data;
  } catch (err) {
    const body  = err?.response?.data ?? {};
    const error = new Error(body.detail || body.error || 'Failed to load data');
    error.status       = err?.response?.status;
    error.errorCode    = body.error;
    error.upgradeUrl   = body.upgrade_url   || '/subscribe';
    error.currentTier  = body.current_tier  || 'free';
    error.requiredTier = body.required_tier || 'basic';
    throw error;
  }
};

// ── Error boundary ─────────────────────────────────────────────────────────────
export class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(e, info) { console.error('Dashboard render error:', e, info); }
  render() {
    if (this.state.hasError) return (
      <Box sx={{ p: 3, borderRadius: '12px', border: '1px solid', borderColor: 'error.light', bgcolor: 'error.lighter' }}>
        <Typography variant="body2" color="error.main" fontWeight={600}>Something went wrong rendering this chart.</Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>{this.state.error?.message}</Typography>
      </Box>
    );
    return this.props.children;
  }
}

// ── Upgrade gate ──────────────────────────────────────────────────────────────
export function UpgradeGate({ featureName, upgradeUrl = '/subscribe', requiredTier = 'Basic' }) {
  return (
    <Box sx={{ position: 'relative', borderRadius: '20px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover' }}>
      <Box aria-hidden sx={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(0deg,currentColor 0,currentColor 1px,transparent 1px,transparent 36px),repeating-linear-gradient(90deg,currentColor 0,currentColor 1px,transparent 1px,transparent 56px)', color: 'text.primary', pointerEvents: 'none' }} />
      <Stack alignItems="center" spacing={2} sx={{ position: 'relative', p: 4, textAlign: 'center', maxWidth: 300 }}>
        <Box sx={{ width: 52, height: 52, borderRadius: '14px', bgcolor: 'text.primary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LockOutlinedIcon sx={{ color: 'background.paper', fontSize: 22 }} />
        </Box>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', mb: 0.75 }} color="text.primary">{featureName}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.65 }}>
            Available on the{' '}<Box component="strong" sx={{ color: 'text.primary' }}>{requiredTier} plan</Box>{' '}and above.
          </Typography>
        </Box>
        <Button href={upgradeUrl} variant="contained" disableElevation endIcon={<ArrowForwardIcon />}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, fontSize: 13, px: 3, py: 1.25, '&:hover': { bgcolor: 'text.secondary' } }}>
          Upgrade plan
        </Button>
      </Stack>
    </Box>
  );
}

// ── Chart skeleton ─────────────────────────────────────────────────────────────
export function ChartSkeleton({ height = 260 }) {
  return (
    <Box sx={{
      height, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
      bgcolor: 'action.hover', position: 'relative', overflow: 'hidden',
      '&::after': {
        content: '""', position: 'absolute', inset: 0,
        background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)',
        backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
      },
      '@keyframes shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
    }} />
  );
}

// ── Chart section wrapper ──────────────────────────────────────────────────────
export function ChartSection({ error, isLoading, skeletonHeight = 260, featureName, children }) {
  if (isLoading) return <ChartSkeleton height={skeletonHeight} />;
  if (error) {
    if (error.status === 403 && error.errorCode === 'plan_upgrade_required') {
      return <UpgradeGate featureName={featureName} upgradeUrl={error.upgradeUrl} requiredTier={error.requiredTier || 'Basic'} />;
    }
    return (
      <Box sx={{ minHeight: skeletonHeight, borderRadius: '20px', border: '1px solid', borderColor: 'error.light', bgcolor: 'background.paper', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1, p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="error.main" fontWeight={600}>{featureName} unavailable</Typography>
        <Typography variant="caption" color="text.disabled">{error.message || 'Could not load data. Please refresh.'}</Typography>
      </Box>
    );
  }
  return <ErrorBoundary>{children}</ErrorBoundary>;
}

// ── Section header ─────────────────────────────────────────────────────────────
export function SectionHeader({ title, subtitle }) {
  return (
    <Stack direction="row" alignItems="baseline" spacing={1.25} sx={{ mb: 2.5 }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 16, md: 20 }, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
          {subtitle}
        </Typography>
      )}
    </Stack>
  );
}

// ── Pro teaser ─────────────────────────────────────────────────────────────────
export function ProTeaser({ features, href = '/subscribe' }) {
  return (
    <Box sx={{ p: { xs: '14px 16px', md: '18px 22px' }, borderRadius: '14px', border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
      <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <TrendingUpIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ display: 'block', mb: 0.25, letterSpacing: '0.04em' }}>Unlock on Pro</Typography>
        <Typography variant="caption" color="text.secondary">{features.join(' · ')}</Typography>
      </Box>
      <Button href={href} size="small" variant="outlined" endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
        sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', flexShrink: 0, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
        Upgrade
      </Button>
    </Box>
  );
}
