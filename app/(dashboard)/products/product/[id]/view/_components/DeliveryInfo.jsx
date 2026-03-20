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

export function DeliveryInfo({ options = [] }) {
  if (!options || options.length === 0) return null;
  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', mb: 2 }} color="text.primary">Delivery Options</Typography>
      <Stack spacing={1}>
        {options.map((opt) => (
          <Stack key={opt.id} direction="row" alignItems="center" spacing={1.5} sx={{ p: '10px 14px', borderRadius: '10px', bgcolor: opt.default ? 'action.selected' : 'action.hover', border: '1px solid', borderColor: opt.default ? 'text.disabled' : 'transparent' }}>
            <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography variant="body2" fontWeight={600} color="text.primary">{opt.name}</Typography>
                {opt.default && <Chip label="Default" size="small" sx={{ height: 16, fontSize: 9, fontWeight: 700, borderRadius: '4px', bgcolor: 'text.primary', color: 'background.paper', '& .MuiChip-label': { px: 0.75 } }} />}
              </Stack>
              <Typography variant="caption" color="text.secondary">{opt.min_days}–{opt.max_days} days</Typography>
            </Box>
            <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ flexShrink: 0 }}>
              {opt.cost ? `GHS ${parseFloat(opt.cost).toFixed(2)}` : 'Free'}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductMeta.jsx — dates, flags, variant type
// ─────────────────────────────────────────────────────────────────────────────