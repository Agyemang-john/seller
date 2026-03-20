'use client';

import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import {
  Box, Typography, Stack, ToggleButtonGroup, ToggleButton, useTheme,
} from '@mui/material';

export default function SalesTrendChart({ data, period, setPeriod }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <EmptyState label="Sales Trends" message="No trend data for the selected period." />
    );
  }

  const valid = data.filter(
    (item) =>
      item.date &&
      !isNaN(new Date(item.date).getTime()) &&
      typeof item.revenue === 'number' &&
      typeof item.orders === 'number',
  );

  if (valid.length === 0) {
    return <EmptyState label="Sales Trends" message="No valid data points found." />;
  }

  const xAxis     = valid.map((item) => new Date(item.date));
  const revenues  = valid.map((item) => item.revenue);
  const orders    = valid.map((item) => item.orders);

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography
            sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}
            color="text.primary"
          >
            Sales Trends
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em' }}>
            REVENUE &amp; ORDER VOLUME
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={period}
          exclusive
          onChange={(_, v) => v && setPeriod(v)}
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2, py: 0.6, fontSize: 12, fontWeight: 600, borderRadius: '8px !important',
              border: '1px solid', borderColor: 'divider', color: 'text.secondary',
              '&.Mui-selected': { bgcolor: 'text.primary', color: 'background.paper', borderColor: 'text.primary' },
            },
            '& .MuiToggleButtonGroup-grouped': { mx: 0.25 },
          }}
        >
          <ToggleButton value="day">Daily</ToggleButton>
          <ToggleButton value="week">Weekly</ToggleButton>
          <ToggleButton value="month">Monthly</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      <LineChart
        xAxis={[{ data: xAxis, scaleType: 'time', tickMinStep: 3600 * 1000 * 24 }]}
        yAxis={[
          { id: 'revenue', label: 'Revenue (GHS)' },
          { id: 'orders',  label: 'Orders' },
        ]}
        series={[
          {
            data: revenues,
            label: 'Revenue (GHS)',
            color: theme.palette.text.primary,
            yAxisId: 'revenue',
            curve: 'monotoneX',
            area: true,
          },
          {
            data: orders,
            label: 'Orders',
            color: theme.palette.text.disabled,
            yAxisId: 'orders',
            curve: 'monotoneX',
          },
        ]}
        height={320}
        margin={{ top: 16, right: 24, bottom: 48, left: 60 }}
        sx={{
          '& .MuiAreaElement-root': { opacity: 0.06 },
          '& .MuiLineElement-root': { strokeWidth: 2 },
          '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 11 },
        }}
      />
    </Box>
  );
}

function EmptyState({ label, message }) {
  return (
    <Box sx={{
      p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', minHeight: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
    }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }} color="text.primary">{label}</Typography>
      <Typography variant="body2" color="text.disabled">{message}</Typography>
    </Box>
  );
}