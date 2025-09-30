'use client';

import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography } from '@mui/material';

const OrderStatusChart = ({ data, isLoading, error }) => {
  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data || data.length === 0) return <Typography>No data available</Typography>;

  const pieData = data.map(item => ({
    id: item.status,
    value: item.count,
    label: item.status.charAt(0).toUpperCase() + item.status.slice(1),
  }));

  return (
    <Box className="p-4 mb-2 rounded-md border border-gray-200">
      <Typography variant="h5" className="text-2xl font-bold text-center mb-4" style={{ color: '#000' }}>
        Order Status Distribution
      </Typography>
      <PieChart
        series={[{ data: pieData, innerRadius: 30, outerRadius: 100, paddingAngle: 5, cornerRadius: 5 }]}
        height={300}
        margin={{ top: 20, right: 30, bottom: 50, left: 30 }}
      />
    </Box>
  );
};

export default OrderStatusChart;