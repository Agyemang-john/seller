'use client';

import * as React from 'react';
import { useState, useCallback, useMemo, Component } from 'react';
import {
  Box, Button, CircularProgress, Typography, Stack, Chip,
  Divider, Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import useSWR from 'swr';
import { createAxiosClient } from '@/utils/clientFetch';
import SalesSummaryCard from '@/components/dashboard/SalesSummaryCard';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import OrderStatusChart from '@/components/dashboard/OrderStatusChart';
import EngagementChart from '@/components/dashboard/EngagementChart';
import DeliveryPerformanceChart from '@/components/dashboard/DeliveryPerformanceChart';

// ─────────────────────────────────────────────────────────────────────────────
// SWR CONFIG
// keepPreviousData:   true  — hold stale data while revalidating → no blank flash
// revalidateOnFocus:  false — don't refetch on tab focus (main blink cause)
// shouldRetryOnError: false — don't retry 403s (won't resolve without plan change)
// ─────────────────────────────────────────────────────────────────────────────
const SWR_CONFIG = {
  keepPreviousData:      true,
  revalidateOnFocus:     false,
  revalidateOnReconnect: false,
  dedupingInterval:      15_000,
  shouldRetryOnError:    false,
};

// ─────────────────────────────────────────────────────────────────────────────
// FETCHER
// ─────────────────────────────────────────────────────────────────────────────
const fetcher = async (url) => {
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

// ─────────────────────────────────────────────────────────────────────────────
// ERROR BOUNDARY
// ─────────────────────────────────────────────────────────────────────────────
class ErrorBoundary extends Component {
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

// ─────────────────────────────────────────────────────────────────────────────
// UPGRADE GATE
// ─────────────────────────────────────────────────────────────────────────────
function UpgradeGate({ featureName, upgradeUrl = '/subscribe', requiredTier = 'Basic' }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function ChartSkeleton({ height = 260 }) {
  return (
    <Box sx={{ height, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover', position: 'relative', overflow: 'hidden', '&::after': { content: '""', position: 'absolute', inset: 0, background: 'linear-gradient(90deg,transparent 0%,rgba(255,255,255,0.07) 50%,transparent 100%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }, '@keyframes shimmer': { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } } }} />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CHART SECTION WRAPPER
// ─────────────────────────────────────────────────────────────────────────────
function ChartSection({ error, isLoading, skeletonHeight = 260, featureName, children }) {
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

// ─────────────────────────────────────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }) {
  return (
    <Stack direction="row" alignItems="baseline" spacing={1.25} sx={{ mb: 2.5 }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>{subtitle}</Typography>}
    </Stack>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PRO TEASER CARD
// ─────────────────────────────────────────────────────────────────────────────
function ProTeaser({ features, href = '/subscribe' }) {
  return (
    <Box sx={{ p: '18px 22px', borderRadius: '14px', border: '1px dashed', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
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

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [startDate,  setStartDate]  = useState(null);
  const [endDate,    setEndDate]    = useState(null);
  const [period,     setPeriod]     = useState('day');
  const [refreshKey, setRefreshKey] = useState(0);

  const toISO        = (d) => (d && d.isValid?.() ? d.toISOString() : null);
  const startISO     = toISO(startDate);
  const endISO       = toISO(endDate);
  const invalidRange = startISO && endISO && new Date(endISO) < new Date(startISO);
  const qs           = `refresh=${refreshKey}`;

  const salesTrendUrl = useMemo(() => {
    if (invalidRange) return null;
    let url = `/api/v1/vendor/sales-trend/?period=${period}&${qs}`;
    if (startISO && endISO) url += `&start_date=${encodeURIComponent(startISO)}&end_date=${encodeURIComponent(endISO)}`;
    return url;
  }, [period, qs, startISO, endISO, invalidRange]);

  const { data: salesSummary, error: salesSummaryError, isLoading: loadingSummary  } = useSWR(`/api/v1/vendor/sales-summary/?${qs}`,        fetcher, SWR_CONFIG);
  const { data: salesTrend,   error: salesTrendError,   isLoading: loadingTrend    } = useSWR(salesTrendUrl,                                fetcher, SWR_CONFIG);
  const { data: topProducts,  error: topProductsError,  isLoading: loadingProducts } = useSWR(`/api/v1/vendor/top-products/?${qs}`,         fetcher, SWR_CONFIG);
  const { data: orderStatus,  error: orderStatusError,  isLoading: loadingOrders   } = useSWR(`/api/v1/vendor/order-status/?${qs}`,         fetcher, SWR_CONFIG);
  const { data: engagement,   error: engagementError,   isLoading: loadingEngage   } = useSWR(`/api/v1/vendor/engagement/?${qs}`,           fetcher, SWR_CONFIG);
  const { data: delivery,     error: deliveryError,     isLoading: loadingDelivery } = useSWR(`/api/v1/vendor/delivery-performance/?${qs}`, fetcher, SWR_CONFIG);

  const isAnyLoading = loadingSummary || loadingTrend || loadingProducts || loadingOrders || loadingEngage || loadingDelivery;

  const handleRefresh = useCallback(() => {
    if (!isAnyLoading) setRefreshKey((k) => k + 1);
  }, [isAnyLoading]);

  // allLocked: only true AFTER loading finishes AND every error is a 403.
  // Using explicit check avoids false positive when errors are all undefined (initial state).
  const errors    = [salesSummaryError, salesTrendError, topProductsError, orderStatusError, engagementError, deliveryError];
  const allLocked = !isAnyLoading && errors.every((e) => e?.status === 403);
  const hasData   = !!salesSummary;

  // Read current tier from the first resolved error
  const currentTierRaw = errors.find((e) => e?.currentTier)?.currentTier || 'free';
  const currentTierLabel = currentTierRaw.charAt(0).toUpperCase() + currentTierRaw.slice(1);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ pb: 10 }}>

        {/* ── Page header ──────────────────────────────────────────────── */}
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 4 }}>
          <Box>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 30, md: 38 }, fontWeight: 700, letterSpacing: '-1.5px', lineHeight: 1, mb: 0.5 }} color="text.primary">
              Store Analytics
            </Typography>
            <Typography variant="body2" color="text.secondary">Everything about your store, in one place</Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <DatePicker label="From" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small', sx: { width: 148 } } }} />
            <DatePicker label="To"   value={endDate}   onChange={setEndDate}   slotProps={{ textField: { size: 'small', sx: { width: 148 } } }} />
            <Button variant="outlined" size="small" onClick={handleRefresh} disabled={isAnyLoading || !!invalidRange}
              startIcon={isAnyLoading ? <CircularProgress size={13} thickness={5} /> : <RefreshIcon />}
              sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary', fontWeight: 600, height: 40, '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}>
              Refresh
            </Button>
          </Stack>
        </Box>

        {/* Date range error */}
        {invalidRange && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>End date cannot be earlier than start date</Alert>
        )}

        {/* ── Full-page upgrade banner — only when ALL locked ──────────── */}
        {allLocked && (
          <Box sx={{ mb: 4, p: { xs: 3, md: '32px 40px' }, borderRadius: '20px', bgcolor: 'action.hover', display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box>
              <Chip label={`${currentTierLabel} plan`} size="small" sx={{ mb: 2, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em' }} />
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 26, md: 32 }, fontWeight: 700, letterSpacing: '-0.5px', mb: 1, lineHeight: 1.1 }}>
                Unlock your store analytics
              </Typography>
              <Typography sx={{  fontSize: 14, lineHeight: 1.7, maxWidth: 500, mb: 2.5 }}>
                Sales trends, revenue breakdowns, top products, delivery performance, and customer engagement
                are all available on the <strong >Basic plan</strong> and above.
              </Typography>
              <Grid container spacing={1} sx={{ maxWidth: 520 }}>
                {['📈 Revenue & order trends', '🏆 Top products by revenue', '🚚 Delivery performance', '⭐ Customer engagement', '💰 Avg order value', '📦 Refund & cancellation rates'].map((f) => (
                  <Grid key={f} size={{ xs: 12, sm: 6 }}>
                    <Typography variant="caption" >{f}</Typography>
                  </Grid>
                ))}
              </Grid>
            </Box>
            <Stack spacing={1.5} sx={{ flexShrink: 0 }}>
              <Button href="/subscribe" variant="contained" disableElevation endIcon={<ArrowForwardIcon />}
                sx={{ borderRadius: '12px', fontWeight: 700, fontSize: 14, px: 3.5, py: 1.5, }}>
                View plans
              </Button>
              <Typography variant="caption" sx={{ textAlign: 'center' }}>Starting at GHS 50 / month</Typography>
            </Stack>
          </Box>
        )}

        {/* ── SECTION 1 — KPI cards ────────────────────────────────────── */}
        <Box sx={{ mb: 3.5 }}>
          <ChartSection error={salesSummaryError} isLoading={loadingSummary} skeletonHeight={200} featureName="Sales Summary">
            <SalesSummaryCard data={salesSummary} />
          </ChartSection>
        </Box>

        <Divider sx={{ mb: 3.5 }} />

        {/* ── SECTION 2 — Trends + distribution ───────────────────────── */}
        <SectionHeader title="Revenue & Orders" subtitle="Over time" />
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Stack spacing={2.5}>
              <ChartSection error={salesTrendError} isLoading={loadingTrend} skeletonHeight={340} featureName="Sales Trends">
                <SalesTrendChart data={salesTrend} period={period} setPeriod={setPeriod} />
              </ChartSection>
              <ChartSection error={topProductsError} isLoading={loadingProducts} skeletonHeight={300} featureName="Top Products">
                <TopProductsChart data={topProducts} />
              </ChartSection>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Stack spacing={2.5}>
              <ChartSection error={orderStatusError} isLoading={loadingOrders} skeletonHeight={300} featureName="Order Status">
                <OrderStatusChart data={orderStatus} />
              </ChartSection>
              <ChartSection error={deliveryError} isLoading={loadingDelivery} skeletonHeight={300} featureName="Delivery Performance">
                <DeliveryPerformanceChart data={delivery} />
              </ChartSection>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mb: 3.5 }} />

        {/* ── SECTION 3 — Engagement ──────────────────────────────────── */}
        <SectionHeader title="Customer Engagement" subtitle="How shoppers interact" />
        <Box sx={{ mb: 3.5 }}>
          <ChartSection error={engagementError} isLoading={loadingEngage} skeletonHeight={220} featureName="Customer Engagement">
            <EngagementChart data={engagement} />
          </ChartSection>
        </Box>

        <Divider sx={{ mb: 3.5 }} />

        {/* ── SECTION 4 — Pro teasers (Basic vendors only) ─────────────── */}
        {!allLocked && hasData && (
          <>
            <SectionHeader title="More on Pro & Enterprise" subtitle="Unlock more" />
            <Grid container spacing={2} sx={{ mb: 3.5 }}>
              {[
                { features: ['Cohort analysis', 'Repeat customer rate', 'Customer lifetime value'] },
                { features: ['Storefront customisation', 'Featured product boosts', 'Discount codes'] },
                { features: ['Reduced commission rate', 'Priority support', 'Faster payouts'] },
              ].map((t, i) => (
                <Grid key={i} size={{ xs: 12, md: 4 }}>
                  <ProTeaser features={t.features} href="/subscribe" />
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* ── Footer plan bar ──────────────────────────────────────────── */}
        <Box sx={{ p: '14px 22px', borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Chip label={`${currentTierLabel} plan`} size="small" sx={{ bgcolor: 'text.primary', color: 'background.paper', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }} />
            <Typography variant="caption" color="text.secondary">
              {allLocked ? 'Upgrade to unlock analytics and grow your store.' : 'Analytics data refreshes every 15 minutes.'}
            </Typography>
          </Stack>
          <Button href="/subscribe" size="small" variant="outlined" endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
            sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
            {allLocked ? 'Upgrade plan' : 'Manage plan'}
          </Button>
        </Box>

      </Box>
    </LocalizationProvider>
  );
}