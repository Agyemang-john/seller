'use client';

import React from 'react';
import { Box, Typography, Stack, useTheme } from '@mui/material';

// Lightweight custom horizontal bar — avoids BarChart rotation quirks
function HorizontalBar({ label, value, maxValue, rank }) {
  const theme  = useTheme();
  const pct    = maxValue > 0 ? (value / maxValue) * 100 : 0;
  const isTop  = rank === 0;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 0.75 }}>
      {/* Rank */}
      <Typography
        sx={{
          width: 20, flexShrink: 0, fontSize: 11, fontWeight: 700,
          color: isTop ? 'text.primary' : 'text.disabled',
          textAlign: 'right',
        }}
      >
        {rank + 1}
      </Typography>

      {/* Label */}
      <Typography
        variant="body2"
        sx={{
          width: 140, flexShrink: 0, fontWeight: isTop ? 600 : 400,
          color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}
        title={label}
      >
        {label}
      </Typography>

      {/* Bar track */}
      <Box sx={{ flex: 1, height: 8, borderRadius: '4px', bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: '4px',
            bgcolor: isTop ? 'text.primary' : 'text.disabled',
            transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)',
            opacity: isTop ? 1 : 0.45 + (1 - rank / 10) * 0.4,
          }}
        />
      </Box>

      {/* Value */}
      <Typography
        variant="caption"
        sx={{ width: 80, flexShrink: 0, textAlign: 'right', fontWeight: 600, color: 'text.secondary', fontSize: 11 }}
      >
        GHS {Number(value).toLocaleString('en-GH', { maximumFractionDigits: 0 })}
      </Typography>
    </Stack>
  );
}

export default function TopProductsChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{
        p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', minHeight: 200,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }} color="text.primary">Top Products</Typography>
        <Typography variant="body2" color="text.disabled">No product revenue data yet.</Typography>
      </Box>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.revenue || 0));

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
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
        <Typography
          sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}
          color="text.primary"
        >
          Top Products
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em' }}>
          BY REVENUE
        </Typography>
      </Stack>

      <Stack spacing={0.25}>
        {data.map((item, i) => (
          <HorizontalBar
            key={item.product__id || i}
            label={item.product__title || item.title || `Product ${i + 1}`}
            value={item.revenue || 0}
            maxValue={maxValue}
            rank={i}
          />
        ))}
      </Stack>
    </Box>
  );
}