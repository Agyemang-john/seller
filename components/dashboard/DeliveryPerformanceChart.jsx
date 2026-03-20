'use client';

import React from 'react';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Typography, Stack, useTheme } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

export default function DeliveryPerformanceChart({ data }) {
  if (!data) {
    return (
      <Box sx={{
        p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', minHeight: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }} color="text.primary">Delivery</Typography>
        <Typography variant="body2" color="text.disabled">No delivery data yet.</Typography>
      </Box>
    );
  }

  const onTimeRate  = Number(data.on_time_delivery_rate ?? 0);
  const overdueRate = 100 - onTimeRate;

  const pieData = [
    { id: 'on_time', value: onTimeRate,  label: 'On-Time', color: '#22c55e' },
    { id: 'overdue', value: overdueRate, label: 'Overdue', color: '#ef4444' },
  ];

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
          Delivery
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em' }}>
          PERFORMANCE
        </Typography>
      </Stack>

      <Box sx={{ position: 'relative' }}>
        <PieChart
          series={[{
            data: pieData,
            innerRadius: 52,
            outerRadius: 88,
            paddingAngle: 3,
            cornerRadius: 4,
            startAngle: -90,
          }]}
          height={200}
          margin={{ top: 8, right: 0, bottom: 8, left: 0 }}
          slotProps={{ legend: { hidden: true } }}
        />
        {/* Centre stat */}
        <Box sx={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <Typography
            sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 700, lineHeight: 1 }}
            color="text.primary"
          >
            {onTimeRate.toFixed(0)}%
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>on-time</Typography>
        </Box>
      </Box>

      {/* Stats row */}
      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <StatBadge
          icon={<LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />}
          label="Delivered"
          value={data.total_delivered?.toLocaleString() ?? '0'}
          color="text.secondary"
        />
        <StatBadge
          icon={<CheckCircleOutlineIcon sx={{ fontSize: 14 }} />}
          label="On-Time"
          value={`${onTimeRate.toFixed(1)}%`}
          color="#22c55e"
        />
        <StatBadge
          icon={<WarningAmberIcon sx={{ fontSize: 14 }} />}
          label="Overdue"
          value={data.overdue_deliveries?.toLocaleString() ?? '0'}
          color="#ef4444"
        />
      </Stack>
    </Box>
  );
}

function StatBadge({ icon, label, value, color }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: '10px 12px',
        borderRadius: '10px',
        bgcolor: 'action.hover',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color, mb: 0.25 }}>
        {icon}
        <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', color }}>
          {label}
        </Typography>
      </Stack>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, lineHeight: 1 }} color="text.primary">
        {value}
      </Typography>
    </Box>
  );
}