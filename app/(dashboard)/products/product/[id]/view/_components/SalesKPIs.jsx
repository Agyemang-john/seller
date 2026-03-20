'use client';

import {
  Box, Grid, Typography, Stack, Chip, Divider, Tooltip, Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import ReplayOutlinedIcon from '@mui/icons-material/ReplayOutlined';

const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export function SalesKPIs({ data }) {
  const metrics = [
    { label: 'Total Revenue',     value: ghs(data.total_revenue),                        icon: TrendingUpIcon,          accent: true  },
    { label: 'Total Orders',      value: (data.total_orders || 0).toLocaleString(),       icon: ShoppingBagOutlinedIcon, accent: false },
    { label: 'Units Sold',        value: (data.total_units_sold || 0).toLocaleString(),   icon: Inventory2OutlinedIcon,  accent: false },
    { label: 'Avg Order Value',   value: ghs(data.avg_order_value),                       icon: ReceiptLongOutlinedIcon, accent: false },
    { label: 'Cancellation Rate', value: `${data.cancellation_rate ?? 0}%`,               icon: CancelOutlinedIcon,      accent: false },
    { label: 'Refund Rate',       value: `${data.refund_rate ?? 0}%`,                     icon: ReplayOutlinedIcon,      accent: false },
  ];

  return (
    <Grid container spacing={1.5}>
      {metrics.map(({ label, value, icon: Icon, accent }) => (
        <Grid key={label} size={{ xs: 6, sm: 4, md: 2 }}>
          <Box sx={{
            p: '16px 18px', borderRadius: '14px', border: '1px solid',
            borderColor: accent ? 'text.primary' : 'divider',
            bgcolor:     accent ? 'text.primary' : 'background.paper',
            display: 'flex', alignItems: 'center', gap: 1.5,
            transition: 'box-shadow 0.18s, transform 0.18s',
            '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
          }}>
            <Box sx={{
              width: 34, height: 34, borderRadius: '9px', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              bgcolor: accent ? 'rgba(255,255,255,0.12)' : 'action.selected',
            }}>
              <Icon sx={{ fontSize: 16, color: accent ? '#ffffff' : 'text.secondary' }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="caption" sx={{
                display: 'block', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                color: accent ? 'rgba(255,255,255,0.5)' : 'text.disabled',
                mb: 0.2,
              }}>
                {label}
              </Typography>
              <Typography sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 18, fontWeight: 700, lineHeight: 1,
                color: accent ? '#ffffff' : 'text.primary',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {value}
              </Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}