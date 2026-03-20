'use client';

import React from 'react';
import { Box, Typography, Grid, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';

function MetricCard({ label, value, icon: Icon, accent = false }) {
  return (
    <Box
      sx={{
        p: '20px 22px',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: accent ? 'text.primary' : 'divider',
        bgcolor: accent ? 'action.hover' : 'background.paper',
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        transition: 'box-shadow 0.18s, transform 0.18s',
        '&:hover': {
          boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '10px',
          bgcolor: accent ? 'rgba(255,255,255,0.12)' : 'action.selected',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon sx={{ fontSize: 18, color: accent ? 'text.secondary' : 'text.secondary' }} />
      </Box>

      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: 'block',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: accent ? 'text.primary' : 'text.disabled',
            mb: 0.3,
            fontSize: 10,
          }}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.5px',
            lineHeight: 1,
            color: accent ? 'text.secondary' : 'text.primary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {value ?? '—'}
        </Typography>
      </Box>
    </Box>
  );
}

export default function SalesSummaryCard({ data }) {
  if (!data) return null;

  const fmt = (n, prefix = '') =>
    n != null ? `${prefix}${Number(n).toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

  const fmtPct = (n) => (n != null ? `${Number(n).toFixed(1)}%` : '—');
  const fmtRating = (n) => (n != null ? `${Number(n).toFixed(1)} / 5.0` : '—');

  const metrics = [
    { label: 'Total Revenue',     value: fmt(data.total_revenue, 'GHS '),      icon: TrendingUpIcon,               accent: true  },
    { label: 'Total Orders',      value: data.total_orders?.toLocaleString(),   icon: ShoppingBagOutlinedIcon,      accent: false },
    { label: 'Units Sold',        value: data.total_units_sold?.toLocaleString(), icon: Inventory2OutlinedIcon,     accent: false },
    { label: 'Avg Order Value',   value: fmt(data.avg_order_value, 'GHS '),     icon: ReceiptLongOutlinedIcon,      accent: false },
    { label: 'Cancellation Rate', value: fmtPct(data.cancellation_rate),        icon: CancelOutlinedIcon,           accent: false },
    { label: 'Refund Rate',       value: fmtPct(data.refund_rate),              icon: ReplayOutlinedIcon,           accent: false },
    { label: 'On-Time Delivery',  value: fmtPct(data.on_time_delivery_rate),    icon: LocalShippingOutlinedIcon,    accent: false },
    { label: 'Avg Rating',        value: fmtRating(data.avg_rating),            icon: StarBorderRoundedIcon,        accent: false },
    { label: 'Total Views',       value: data.total_views?.toLocaleString(),    icon: VisibilityOutlinedIcon,       accent: false },
    { label: 'Wishlist Count',    value: data.wishlist_count?.toLocaleString(), icon: FavoriteBorderRoundedIcon,    accent: false },
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
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22,
            fontWeight: 700,
            letterSpacing: '-0.5px',
          }}
          color="text.primary"
        >
          Sales Summary
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em' }}>
          ALL TIME
        </Typography>
      </Stack>

      <Grid container spacing={1.5}>
        {metrics.map((m) => (
          <Grid key={m.label} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <MetricCard {...m} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}