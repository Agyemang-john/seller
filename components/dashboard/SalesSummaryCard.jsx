'use client';

import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { FaDollarSign, FaShoppingCart, FaStar, FaEye, FaHeart } from 'react-icons/fa';

const SalesSummaryCard = ({ data, isLoading, error }) => {
  if (isLoading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!data) return null;

  const metrics = [
    { label: 'Total Revenue', value: `GHS ${data?.total_revenue?.toFixed(2)}`, icon: <FaDollarSign size={24} /> },
    { label: 'Total Orders', value: data?.total_orders, icon: <FaShoppingCart size={24} /> },
    { label: 'Units Sold', value: data?.total_units_sold, icon: <FaShoppingCart size={24} /> },
    { label: 'Avg Order Value', value: `GHS ${data?.avg_order_value?.toFixed(2)}`, icon: <FaDollarSign size={24} /> },
    { label: 'Cancellation Rate', value: `${data?.cancellation_rate?.toFixed(1)}%`, icon: <FaShoppingCart size={24} /> },
    { label: 'Refund Rate', value: `${data?.refund_rate?.toFixed(1)}%`, icon: <FaDollarSign size={24} /> },
    { label: 'On-Time Delivery', value: `${data?.on_time_delivery_rate?.toFixed(1)}%`, icon: <FaStar size={24} /> },
    { label: 'Avg Rating', value: `${data?.avg_rating?.toFixed(1)}/5.0`, icon: <FaStar size={24} /> },
    { label: 'Total Views', value: data?.total_views, icon: <FaEye size={24} /> },
    { label: 'Wishlist Count', value: data?.wishlist_count, icon: <FaHeart size={24} /> },
  ];

  return (
    <Box className="p-4 border border-gray-200 rounded-md">
      <Typography variant="h5" className="text-2xl font-bold text-center mb-6" >
        Sales summary
      </Typography>
      <Grid container spacing={2}>
        {metrics.map((metric, index) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
            <Card className="hover:shadow-xl transition-shadow">
              <CardContent className="flex items-center space-x-4">
                <Box className="">{metric.icon}</Box>
                <Box>
                  <Typography variant="h6" className="font-semibold" >
                    {metric.label}
                  </Typography>
                  <Typography variant="body1">
                    {metric.value}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default SalesSummaryCard;