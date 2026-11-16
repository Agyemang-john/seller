'use client';

/**
 * Seller Home. Laid out like Walmart Seller Center's home page:
 *   1. greeting, shop status and quick actions
 *   2. today's work (Action Center) beside the performance scorecard
 *   3. sales at a glance (all-time KPIs)
 *   4. sales & orders over time (date range + refresh live here, not in the page header)
 *   5. customer engagement + plan
 */
import * as React from 'react';
import { useState, useCallback, useMemo } from 'react';
import { Box, Button, CircularProgress, Stack, Alert, Grid, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import RefreshIcon from '@mui/icons-material/Refresh';
import useSWR from 'swr';
import ActivityHeartbeat from '@/components/dashboard/ActivityHeartbeat';
import InactivityBanner from '@/components/dashboard/InactivityBanner';
import ActionCenter from '@/components/operations/ActionCenter';
import { SWR_CONFIG, fetcher, ChartSection } from '@/components/dashboard/DashboardUI';
import {
  HomeHeader, HomeCard, CardLink, PerformanceScorecard, SalesKpis, PlanCard, HEADING_FONT,
} from '@/components/dashboard/HomeWidgets';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import OrderStatusChart from '@/components/dashboard/OrderStatusChart';
import EngagementChart from '@/components/dashboard/EngagementChart';
import DeliveryPerformanceChart from '@/components/dashboard/DeliveryPerformanceChart';
import { useVendorProfile } from '@/hooks/useVendorProfile';
import useNavCounts from '@/hooks/useNavCounts';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';

const PAID_UP = ['pro', 'enterprise'];

export default function Dashboard() {
  const [startDate,  setStartDate]  = useState(null);
  const [endDate,    setEndDate]    = useState(null);
  const [period,     setPeriod]     = useState('day');
  const [refreshKey, setRefreshKey] = useState(0);

  const { profile } = useVendorProfile();
  const { toShip } = useNavCounts();
  const { can } = useVendorAccess();
  const { data: vendorStatus } = useSWR('/api/v1/vendor/my-status/', fetcher, { revalidateOnFocus: false });
  const { data: plan } = useSWR(can(CAP.VIEW_FINANCE) ? '/api/v1/vendor/plan/' : null, fetcher, SWR_CONFIG);
  const showPlan = !!plan && !PAID_UP.includes(plan.tier);

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

  const rangeControls = (
    <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
      <DatePicker label="From" value={startDate} onChange={setStartDate} slotProps={{ textField: { size: 'small', sx: { flex: { xs: 1, sm: '0 0 150px' } } } }} />
      <DatePicker label="To"   value={endDate}   onChange={setEndDate}   slotProps={{ textField: { size: 'small', sx: { flex: { xs: 1, sm: '0 0 150px' } } } }} />
      <Button
        variant="outlined" onClick={handleRefresh} disabled={isAnyLoading || !!invalidRange} aria-label="Refresh data"
        sx={{ borderRadius: '10px', borderColor: 'divider', color: 'text.primary', height: 40, minWidth: 40, px: 1, flexShrink: 0, '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }}
      >
        {isAnyLoading ? <CircularProgress size={16} thickness={5} /> : <RefreshIcon fontSize="small" />}
      </Button>
    </Stack>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ pb: 6, minWidth: 0, maxWidth: '100%' }}>
        {/* Activity heartbeat (invisible) + inactivity banner */}
        <ActivityHeartbeat />
        <InactivityBanner />

        {/* 1 ── Greeting + quick actions */}
        <HomeHeader storeName={profile?.vendor_name} vendorStatus={vendorStatus} toShip={toShip} />

        {/* 2 ── Work to do + store health */}
        <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
          <Grid size={{ xs: 12, lg: 8 }}>
            <ActionCenter sx={{ mb: 0, height: '100%' }} />
          </Grid>
          <Grid size={{ xs: 12, lg: 4 }}>
            {loadingSummary
              ? <ChartSection isLoading skeletonHeight={320} />
              : <PerformanceScorecard data={salesSummary} />}
          </Grid>
        </Grid>

        {/* 3 ── Sales at a glance */}
        <HomeCard
          title="Sales at a glance"
          subtitle="All time"
          action={<CardLink href="/store-analytics">Traffic report</CardLink>}
          sx={{ mb: 2.5, height: 'auto' }}
        >
          <ChartSection error={salesSummaryError} isLoading={loadingSummary} skeletonHeight={96} featureName="Sales summary">
            <SalesKpis data={salesSummary} />
          </ChartSection>
        </HomeCard>

        {/* 4 ── Sales & orders over time */}
        <Box id="performance" sx={{ mb: 2.5, scrollMarginTop: 16 }}>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between', flexDirection: { xs: 'column', sm: 'row' }, gap: 1.5, mb: 2 }}>
            <Box>
              <Typography component="h2" sx={{ fontFamily: HEADING_FONT, fontWeight: 700, fontSize: 20, letterSpacing: '-0.4px' }}>Sales &amp; orders</Typography>
              <Typography variant="caption" color="text.secondary">Choose dates, or leave them empty for recent activity</Typography>
            </Box>
            {rangeControls}
          </Box>
          {invalidRange && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>End date cannot be earlier than start date</Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2.5}>
                <ChartSection error={salesTrendError} isLoading={loadingTrend} skeletonHeight={340} featureName="Sales trends">
                  <SalesTrendChart data={salesTrend} period={period} setPeriod={setPeriod} />
                </ChartSection>
                <ChartSection error={topProductsError} isLoading={loadingProducts} skeletonHeight={300} featureName="Top products">
                  <TopProductsChart data={topProducts} />
                </ChartSection>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2.5}>
                <ChartSection error={orderStatusError} isLoading={loadingOrders} skeletonHeight={300} featureName="Order status">
                  <OrderStatusChart data={orderStatus} />
                </ChartSection>
                <ChartSection error={deliveryError} isLoading={loadingDelivery} skeletonHeight={300} featureName="Delivery performance">
                  <DeliveryPerformanceChart data={delivery} />
                </ChartSection>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* 5 ── Customers + plan */}
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, lg: showPlan ? 8 : 12 }}>
            <ChartSection error={engagementError} isLoading={loadingEngage} skeletonHeight={220} featureName="Customer engagement">
              <EngagementChart data={engagement} />
            </ChartSection>
          </Grid>
          {showPlan && (
            <Grid size={{ xs: 12, lg: 4 }}>
              <PlanCard plan={plan} />
            </Grid>
          )}
        </Grid>
      </Box>
    </LocalizationProvider>
  );
}
