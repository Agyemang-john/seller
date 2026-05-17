'use client';

import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import {
  Box, Button, CircularProgress, Typography, Stack,
  Divider, Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Grid from '@mui/material/Grid';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import useSWR from 'swr';
import {
  SWR_CONFIG, fetcher,
  ChartSection, SectionHeader, ProTeaser,
} from '@/components/dashboard/DashboardUI';
import SalesSummaryCard from '@/components/dashboard/SalesSummaryCard';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import OrderStatusChart from '@/components/dashboard/OrderStatusChart';
import EngagementChart from '@/components/dashboard/EngagementChart';
import DeliveryPerformanceChart from '@/components/dashboard/DeliveryPerformanceChart';

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
  const hasData      = !!salesSummary;

  const handleRefresh = useCallback(() => {
    if (!isAnyLoading) setRefreshKey((k) => k + 1);
  }, [isAnyLoading]);

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

        {/* ── SECTION 4 — Store Traffic entry point ───────────────────── */}
        <Box sx={{ mb: 3.5, p: '20px 24px', borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box sx={{ width: 42, height: 42, borderRadius: '11px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUpIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
            </Box>
            <Box>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.4px', lineHeight: 1.2, mb: 0.3 }} color="text.primary">
                Store Traffic
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                Unique visitors · Device breakdown · Return rate · 30-day trend
              </Typography>
            </Box>
          </Stack>
          <Button href="/store-analytics" variant="outlined" size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
            sx={{ fontSize: 12, fontWeight: 600, borderRadius: '9px', borderColor: 'divider', color: 'text.primary', flexShrink: 0, '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}>
            View Report
          </Button>
        </Box>

        <Divider sx={{ mb: 3.5 }} />

        {/* ── SECTION 5 — Pro teasers ──────────────────────────────────── */}
        {hasData && (
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

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <Box sx={{ p: '14px 22px', borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1.5 }}>
          <Typography variant="caption" color="text.secondary">
            Analytics data refreshes every 15 minutes.
          </Typography>
          <Button href="/subscribe" size="small" variant="outlined" endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
            sx={{ fontSize: 11, fontWeight: 600, borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
            Manage plan
          </Button>
        </Box>

      </Box>
    </LocalizationProvider>
  );
}