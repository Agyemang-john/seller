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

export function EngagementTiles({ data }) {
  const tiles = [
    { label: 'Profile Views',  value: (data.views || 0).toLocaleString(),         icon: VisibilityOutlinedIcon  },
    { label: 'Wishlisted',     value: (data.wishlist_count || 0).toLocaleString(), icon: FavoriteBorderRoundedIcon },
    { label: 'Saved',          value: (data.saved_count || 0).toLocaleString(),   icon: BookmarkBorderRoundedIcon },
    { label: 'Reviews',        value: (data.review_count || 0).toLocaleString(),  icon: StarBorderRoundedIcon  },
    { label: 'Average Rating', value: `${(data.avg_rating || 0).toFixed(1)} / 5`, icon: StarBorderRoundedIcon  },
  ];
  return (
    <Grid container spacing={1.5}>
      {tiles.map(({ label, value, icon: Icon }) => (
        <Grid key={label} size={{ xs: 6, sm: 4, md: 'auto' }} sx={{ flex: { md: 1 } }}>
          <Box sx={{ p: '18px 20px', borderRadius: '14px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'flex-start', gap: 1.5, transition: 'box-shadow 0.18s, transform 0.18s', '&:hover': { boxShadow: '0 6px 24px rgba(0,0,0,0.07)', transform: 'translateY(-1px)' } }}>
            <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'text.disabled', mb: 0.2 }}>{label}</Typography>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, lineHeight: 1 }} color="text.primary">{value}</Typography>
            </Box>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// RatingDistribution.jsx — horizontal bar chart for star ratings
// ─────────────────────────────────────────────────────────────────────────────