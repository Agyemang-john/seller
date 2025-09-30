'use client';

import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';

const TopProductsChart = ({ data, isLoading, error }) => {
  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data || data.length === 0) return <Typography>No data available</Typography>;

  const xAxis = data.map(item => item.title);
  const revenueSeries = data.map(item => item.revenue);

  return (
    <Box className="p-4 rounded-md border border-gray-200">
      <Typography variant="h5" className="text-2xl font-bold text-center mb-4" style={{ color: '#000' }}>
        Top Products by Revenue
      </Typography>
      <BarChart
        xAxis={[{ scaleType: 'band', data: xAxis, label: 'Product' }]}
        series={[{ data: revenueSeries, label: 'Revenue (GHS)', color: '#a15252ff' }]}
        height={400}
        margin={{ top: 20, right: 30, bottom: 100, left: 60 }}
        // xAxisLabelStyle={{ transform: 'rotate(45deg)' }}
      />
    </Box>
  );
};

export default TopProductsChart;