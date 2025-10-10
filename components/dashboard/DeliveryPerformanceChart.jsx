'use client';

import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography } from '@mui/material';

const DeliveryPerformanceChart = ({ data, isLoading, error }) => {
  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return <Typography>No data available</Typography>;

  const pieData = [
    { id: 'on_time', value: data.on_time_delivery_rate, label: 'On-Time', color: '#dfdc57ff' },
    { id: 'overdue', value: 100 - data.on_time_delivery_rate, label: 'Overdue', color: '#c790faff' },
  ];

  return (
    <Box className="p-4 rounded-md border border-gray-200">
      <Typography variant="h5" className="text-2xl font-bold text-center mb-4">
        Delivery Performance
      </Typography>
      <PieChart
        series={[{ data: pieData, innerRadius: 30, outerRadius: 100, paddingAngle: 5, cornerRadius: 5 }]}
        height={300}
        margin={{ top: 20, right: 30, bottom: 50, left: 30 }}
      />
    </Box>
  );
};

export default DeliveryPerformanceChart;