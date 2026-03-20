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

export function RatingDistribution({ distribution = [], avgRating = 0, reviewCount = 0 }) {
  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="flex-start" spacing={3} sx={{ mb: 3 }}>
        {/* Big number */}
        <Box sx={{ textAlign: 'center', flexShrink: 0 }}>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: '-2px' }} color="text.primary">{avgRating.toFixed(1)}</Typography>
          <Stack direction="row" justifyContent="center" spacing={0.3} sx={{ my: 0.5 }}>
            {[1,2,3,4,5].map((s) => (
              <Box key={s} sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: s <= Math.round(avgRating) ? 'text.primary' : 'divider' }} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.disabled">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</Typography>
        </Box>

        {/* Bars */}
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          {[...distribution].reverse().map((d) => (
            <Stack key={d.rating} direction="row" alignItems="center" spacing={1}>
              <Typography variant="caption" color="text.disabled" sx={{ width: 12, textAlign: 'right', fontWeight: 600 }}>{d.rating}</Typography>
              <StarBorderRoundedIcon sx={{ fontSize: 12, color: '#f59e0b', flexShrink: 0 }} />
              <Box sx={{ flex: 1, height: 8, borderRadius: '4px', bgcolor: 'action.hover', overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${(d.count / maxCount) * 100}%`, borderRadius: '4px', bgcolor: d.rating >= 4 ? '#22c55e' : d.rating === 3 ? '#f59e0b' : '#ef4444', transition: 'width 0.6s ease' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ width: 20, textAlign: 'right', fontWeight: 600 }}>{d.count}</Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// DeliveryInfo.jsx
// ─────────────────────────────────────────────────────────────────────────────