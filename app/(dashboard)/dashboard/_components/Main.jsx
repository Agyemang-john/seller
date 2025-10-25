'use client';

import React, { useState } from 'react';
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

const fetcher = async (url) => {
  const axiosClient = createAxiosClient();
  const response = await axiosClient.get(url);
  return response.data;
};

function ErrorBoundary({ children }) {
  return (
    <React.Fragment>
      {children}
    </React.Fragment>
  );
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [period, setPeriod] = useState('day');
  const [refreshKey, setRefreshKey] = useState(0);

  // Construct salesTrendUrl with proper query parameter concatenation
  const salesTrendUrl = `/api/v1/vendor/sales-trend/?period=${period}${
    startDate && endDate
      ? `&start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}&refresh=${refreshKey}`
      : `&refresh=${refreshKey}`
  }`;

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

  const isAnyLoading = salesSummaryLoading || salesTrendLoading || topProductsLoading || orderStatusLoading || engagementLoading || deliveryLoading;

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <>
      <Box className="py-5 relative">
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
          <Button variant="contained" onClick={handleRefresh} disabled={isAnyLoading}>
            {isAnyLoading ? <CircularProgress size={24} /> : 'Refresh Data'}
          </Button>
        </Box>

        {isAnyLoading && (
          <Box display="flex" justifyContent="center" my={4}>
            <CircularProgress />
          </Box>
        )}

        <SalesSummaryCard data={salesSummary} isLoading={salesSummaryLoading} error={salesSummaryError} />
        <Grid container spacing={2}>
          <Grid sx={{ my: 2 }} size={{ xs: 12, sm: 12, md: 8, lg: 8 }}>
            <SalesTrendChart
              data={salesTrend}
              isLoading={salesTrendLoading}
              error={salesTrendError}
              period={period}
              setPeriod={setPeriod}
            />
            <TopProductsChart data={topProducts} isLoading={topProductsLoading} error={topProductsError} />
          </Grid>
          <Grid sx={{ my: 2 }} size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
            <OrderStatusChart data={orderStatus} isLoading={orderStatusLoading} error={orderStatusError} />
            <DeliveryPerformanceChart data={delivery} isLoading={deliveryLoading} error={deliveryError} />
          </Grid>
        </Grid>

        <EngagementChart data={engagement} isLoading={engagementLoading} error={engagementError} />

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