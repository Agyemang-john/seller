'use client';

import * as React from 'react';
import { useState, useCallback } from 'react';
import { Component } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import useSWR from 'swr';
import { createAxiosClient } from '@/utils/clientFetch';
import SalesSummaryCard from '@/components/dashboard/SalesSummaryCard';
import SalesTrendChart from '@/components/dashboard/SalesTrendChart';
import TopProductsChart from '@/components/dashboard/TopProductsChart';
import OrderStatusChart from '@/components/dashboard/OrderStatusChart';
import EngagementChart from '@/components/dashboard/EngagementChart';
import DeliveryPerformanceChart from '@/components/dashboard/DeliveryPerformanceChart';
import Grid from '@mui/material/Grid';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

// ----------------------------
// Safe Fetcher (No Crashes)
// ----------------------------
const fetcher = async (url) => {
  if (!url) return null; // prevent SWR crash

  const axiosClient = createAxiosClient();
  try {
    const response = await axiosClient.get(url);
    return response.data;
  } catch (err) {
    console.error("Fetcher Error:", err?.response || err);
    throw err; // SWR will handle
  }
};

// ----------------------------
// REAL ERROR BOUNDARY
// ----------------------------
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("Component Error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={3} bgcolor="#fee" borderRadius={2}>
          <strong>Error loading component.</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </pre>
        </Box>
      );
    }
    return this.props.children;
  }
}

// ----------------------------
// MAIN DASHBOARD
// ----------------------------
export default function Dashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [period, setPeriod] = useState('day');
  const [refreshKey, setRefreshKey] = useState(0);

  // -----------------------------------
  // SAFE DATE → ISO STRING
  // -----------------------------------
  const toISO = (d) => {
    if (!d || !d.isValid?.()) return null;
    return d.toISOString();
  };

  const startISO = toISO(startDate);
  const endISO = toISO(endDate);

  // Prevent invalid date range
  const invalidRange = startISO && endISO && new Date(endISO) < new Date(startISO);

  // -----------------------------------
  // BUILD URL SAFELY
  // -----------------------------------
  const salesTrendUrl = invalidRange
    ? null // prevent backend error
    : `/api/v1/vendor/sales-trend/?period=${period}` +
      `&refresh=${refreshKey}` +
      (startISO && endISO ? `&start_date=${startISO}&end_date=${endISO}` : "");

  // -----------------------------------
  // SWR CALLS (Safe)
  // -----------------------------------
  const { data: salesSummary, error: salesSummaryError, isLoading: salesSummaryLoading } = useSWR(
    `/api/v1/vendor/sales-summary/?refresh=${refreshKey}`,
    fetcher
  );

  const { data: salesTrend, error: salesTrendError, isLoading: salesTrendLoading } = useSWR(
    salesTrendUrl,
    fetcher
  );

  const { data: topProducts, error: topProductsError, isLoading: topProductsLoading } = useSWR(
    `/api/v1/vendor/top-products/?refresh=${refreshKey}`,
    fetcher
  );

  const { data: orderStatus, error: orderStatusError, isLoading: orderStatusLoading } = useSWR(
    `/api/v1/vendor/order-status/?refresh=${refreshKey}`,
    fetcher
  );

  const { data: engagement, error: engagementError, isLoading: engagementLoading } = useSWR(
    `/api/v1/vendor/engagement/?refresh=${refreshKey}`,
    fetcher
  );

  const { data: delivery, error: deliveryError, isLoading: deliveryLoading } = useSWR(
    `/api/v1/vendor/delivery-performance/?refresh=${refreshKey}`,
    fetcher
  );

  const isAnyLoading =
    salesSummaryLoading ||
    salesTrendLoading ||
    topProductsLoading ||
    orderStatusLoading ||
    engagementLoading ||
    deliveryLoading;

  // -----------------------------------
  // SAFE REFRESH
  // Prevent spam clicking
  // -----------------------------------
  const handleRefresh = useCallback(() => {
    if (!isAnyLoading) {
      setRefreshKey((prev) => prev + 1);
    }
  }, [isAnyLoading]);

  return (
    <>
      <Box className="py-5 relative">
        
        {/* FILTERS + REFRESH */}
        <Box justifyContent="space-between" mb={4}>
          <Box display="flex" gap={2} sx={{ mb: 1 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={setStartDate}
                slotProps={{ textField: { size: 'small' } }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={setEndDate}
                slotProps={{ textField: { size: 'small' } }}
              />
            </LocalizationProvider>
          </Box>

          <Button variant="contained" onClick={handleRefresh} disabled={isAnyLoading || invalidRange}>
            {isAnyLoading ? <CircularProgress size={24} /> : 'Refresh Data'}
          </Button>

          {invalidRange && (
            <Box color="error.main" mt={1}>End date cannot be earlier than start date</Box>
          )}
        </Box>

        {/* GLOBAL LOADER */}
        {isAnyLoading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        {/* DASHBOARD SECTIONS */}
        <ErrorBoundary>
          <SalesSummaryCard data={salesSummary} isLoading={salesSummaryLoading} error={salesSummaryError} />
        </ErrorBoundary>

        <Grid container spacing={2}>
          <Grid sx={{ my: 2 }} size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
            <ErrorBoundary>
              <SalesTrendChart
                data={salesTrend}
                isLoading={salesTrendLoading}
                error={salesTrendError}
                period={period}
                setPeriod={setPeriod}
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <TopProductsChart data={topProducts} isLoading={topProductsLoading} error={topProductsError} />
            </ErrorBoundary>
          </Grid>

          <Grid sx={{ my: 2 }} size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
            <ErrorBoundary>
              <OrderStatusChart data={orderStatus} isLoading={orderStatusLoading} error={orderStatusError} />
            </ErrorBoundary>

            <ErrorBoundary>
              <DeliveryPerformanceChart data={delivery} isLoading={deliveryLoading} error={deliveryError} />
            </ErrorBoundary>
          </Grid>
        </Grid>

        <ErrorBoundary>
          <EngagementChart data={engagement} isLoading={engagementLoading} error={engagementError} />
        </ErrorBoundary>

        {/* BACKGROUND EFFECT */}
        <Box
          className="absolute top-0 left-0 w-full h-full -z-10 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle, #000 3px, transparent 3px)',
            backgroundSize: '30px 30px',
          }}
        />
      </Box>
    </>
  );
}
