'use client';

import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, FormControl, Select, MenuItem } from '@mui/material';

const SalesTrendChart = ({ data, isLoading, error, period, setPeriod }) => {
  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data || data.length === 0) return <Typography>No data available</Typography>;

  // Validate and filter data
  const validData = data.filter(
    item =>
      item.date &&
      !isNaN(new Date(item.date).getTime()) && // Ensure valid date
      typeof item.revenue === 'number' && // Ensure revenue is a number
      typeof item.orders === 'number' // Ensure orders is a number
  );

  if (validData.length === 0) return <Typography>No valid data available</Typography>;

  const xAxis = validData.map(item => new Date(item.date));
  const revenueSeries = validData.map(item => item.revenue);
  const ordersSeries = validData.map(item => item.orders);

  return (
    <Box className="p-4 rounded-md mb-2 border border-gray-200">
      <Box className="flex justify-between items-center mb-4">
        <Typography variant="h5" className="text-2xl font-bold">
          Sales Trends
        </Typography>
        <FormControl size="small">
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="text-black"
          >
            <MenuItem value="day">Daily</MenuItem>
            <MenuItem value="week">Weekly</MenuItem>
            <MenuItem value="month">Monthly</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <LineChart
        xAxis={[{ data: xAxis, scaleType: 'time', label: 'Date' }]}
        series={[
          { data: revenueSeries, label: 'Revenue (GHS)', color: '#3540daff' },
          { data: ordersSeries, label: 'Orders', color: '#bae02fff', yAxisId: 'rightAxis' },
        ]}
        height={400}
        yAxis={[{ id: 'leftAxis', label: 'Revenue (GHS)' }, { id: 'rightAxis', label: 'Orders' }]}
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
      />
    </Box>
  );
};

export default SalesTrendChart;