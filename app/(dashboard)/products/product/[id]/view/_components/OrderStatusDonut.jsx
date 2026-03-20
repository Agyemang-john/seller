'use client';

import {
  Box, Grid, Typography, Stack, Chip, Divider, Tooltip, Button,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const STATUS = {
  published: { label: 'Live',       color: '#22c55e', bg: 'rgba(34,197,94,0.12)'   },
  in_review: { label: 'In Review',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)'  },
  draft:     { label: 'Draft',      color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
  disabled:  { label: 'Disabled',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)'   },
  rejected:  { label: 'Rejected',   color: '#dc2626', bg: 'rgba(220,38,38,0.12)'   },
};
function getStatus(s) { return STATUS[s] ?? { label: s, color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' }; }
const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
const STATUS_COLORS = { delivered: '#22c55e', pending: '#f59e0b', processing: '#3b82f6', shipped: '#8b5cf6', canceled: '#ef4444', refunded: '#ec4899' };
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export function OrderStatusChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <ShoppingBagOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700 }} color="text.primary">Order Status</Typography>
        <Typography variant="body2" color="text.disabled">No orders yet</Typography>
      </Box>
    );
  }

  const total   = data.reduce((s, d) => s + d.count, 0);
  const pieData = data.map((d, i) => ({ id: d.status, value: d.count, label: cap(d.status), color: STATUS_COLORS[d.status] || `hsl(${i * 60},60%,55%)` }));

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">Order Status</Typography>
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>{total} total</Typography>
      </Stack>
      <Box sx={{ position: 'relative' }}>
        <PieChart series={[{ data: pieData, innerRadius: 50, outerRadius: 85, paddingAngle: 3, cornerRadius: 4 }]}
          height={200} margin={{ top: 8, right: 0, bottom: 8, left: 0 }} slotProps={{ legend: { hidden: true } }} />
        <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, lineHeight: 1 }} color="text.primary">{total}</Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>orders</Typography>
        </Box>
      </Box>
      <Stack spacing={0.75} sx={{ mt: 1 }}>
        {pieData.map((d) => (
          <Stack key={d.id} direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ width: 8, height: 8, borderRadius: '3px', bgcolor: d.color, flexShrink: 0 }} />
              <Typography variant="caption" color="text.secondary">{d.label}</Typography>
            </Stack>
            <Typography variant="caption" fontWeight={600} color="text.primary">
              {d.value} <Typography component="span" variant="caption" color="text.disabled">({total ? ((d.value / total) * 100).toFixed(0) : 0}%)</Typography>
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EngagementTiles.jsx
// ─────────────────────────────────────────────────────────────────────────────