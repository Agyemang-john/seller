'use client';

import React from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { Box, Typography } from '@mui/material';

const EngagementChart = ({ data, isLoading, error }) => {
  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return <Typography>No data available</Typography>;

  const xAxis = ['Views', 'Wishlists', 'Saves', 'Reviews', 'Avg Rating'];
  const series = [
    data.total_views,
    data.wishlist_count,
    data.saved_count,
    data.review_count,
    data.avg_rating * 20, // Scale rating (0-5) to match magnitude
  ];

  return (
    <Box className="p-4 border border-gray-200 rounded-md">
      <Typography variant="h5" className="text-2xl font-bold text-center mb-4">
        Customer Engagement
      </Typography>
      <BarChart
        xAxis={[{ scaleType: 'band', data: xAxis, label: 'Metric' }]}
        series={[{ data: series, label: 'Count', color: '#0375d3ff' }]}
        height={300}
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
      />
    </Box>
  );
};

export default EngagementChart;