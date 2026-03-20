'use client';

import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography, Stack, useTheme } from '@mui/material';

// Status → colour mapping using theme-aware colours
const STATUS_COLORS = {
  delivered:  '#22c55e',
  pending:    '#f59e0b',
  processing: '#3b82f6',
  shipped:    '#8b5cf6',
  canceled:   '#ef4444',
  refunded:   '#ec4899',
};

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export default function OrderStatusChart({ data }) {
  if (!data || data.length === 0) {
    return <EmptyCard />;
  }

  const pieData = data.map((item, i) => ({
    id:    item.status,
    value: item.count,
    label: capitalize(item.status),
    color: STATUS_COLORS[item.status] || `hsl(${(i * 60) % 360}, 60%, 55%)`,
  }));

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0);

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
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
        <Typography
          sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}
          color="text.primary"
        >
          Order Status
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em' }}>
          {total.toLocaleString()} TOTAL
        </Typography>
      </Stack>

      <Box sx={{ position: 'relative' }}>
        <PieChart
          series={[{
            data: pieData,
            innerRadius: 52,
            outerRadius: 90,
            paddingAngle: 3,
            cornerRadius: 4,
            highlightScope: { faded: 'global', highlighted: 'item' },
          }]}
          height={220}
          margin={{ top: 8, right: 0, bottom: 8, left: 0 }}
          slotProps={{ legend: { hidden: true } }}
        />
        {/* Centre label */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, lineHeight: 1 }}
            color="text.primary"
          >
            {total.toLocaleString()}
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
            orders
          </Typography>
        </Box>
      </Box>

      {/* Custom legend */}
      <Stack spacing={0.75} sx={{ mt: 1.5 }}>
        {pieData.map((item) => (
          <Stack key={item.id} direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 10, height: 10, borderRadius: '3px', bgcolor: item.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
            </Stack>
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {item.value.toLocaleString()}
              <Typography component="span" variant="caption" color="text.disabled" sx={{ ml: 0.5 }}>
                ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
              </Typography>
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

function EmptyCard() {
  return (
    <Box sx={{
      p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.paper', minHeight: 200,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
    }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }} color="text.primary">Order Status</Typography>
      <Typography variant="body2" color="text.disabled">No orders yet.</Typography>
    </Box>
  );
}