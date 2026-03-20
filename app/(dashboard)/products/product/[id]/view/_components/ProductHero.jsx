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

export function ProductHero({ data }) {
  const st       = getStatus(data.status);
  const price    = parseFloat(data.price || 0);
  const oldPrice = parseFloat(data.old_price || 0);
  const hasDiscount = oldPrice > price && price > 0;
  const gallery  = data.gallery_images || [];

  return (
    <Box
      sx={{
        borderRadius: '20px', border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', overflow: 'hidden',
      }}
    >
      <Grid container>
        {/* Image */}
        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
          <Box
            sx={{
              aspectRatio: { xs: '16/9', sm: '1' },
              bgcolor: 'action.hover', position: 'relative', overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={data.image || '/logo-1.png'}
              alt={data.title}
              onError={(e) => { e.target.src = '/logo-1.png'; }}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            {/* Status */}
            <Box sx={{ position: 'absolute', top: 10, left: 10, px: 1.25, py: 0.4, borderRadius: '6px', bgcolor: st.bg, border: `1px solid ${st.color}33` }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', color: st.color }}>{st.label.toUpperCase()}</Typography>
            </Box>
          </Box>
          {/* Gallery strip */}
          {gallery.length > 0 && (
            <Stack direction="row" spacing={0.5} sx={{ p: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
              {gallery.slice(0, 6).map((img) => (
                <Box key={img.id} sx={{ width: 44, height: 44, borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid', borderColor: 'divider' }}>
                  <Box component="img" src={img.images} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Stack>
          )}
        </Grid>

        {/* Info */}
        <Grid size={{ xs: 12, sm: 8, md: 9 }}>
          <Box sx={{ p: { xs: 2.5, md: 3 } }}>
            {/* SKU + category */}
            <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: 'wrap', gap: 0.75 }}>
              {data.sku && <Chip label={data.sku} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, borderRadius: '5px', bgcolor: 'action.selected', color: 'text.secondary', letterSpacing: '0.06em' }} />}
              {data.sub_category_title && <Chip label={data.sub_category_title} size="small" sx={{ height: 20, fontSize: 10, borderRadius: '5px', bgcolor: 'action.hover', color: 'text.secondary' }} />}
              {data.brand_title && <Chip label={data.brand_title} size="small" sx={{ height: 20, fontSize: 10, borderRadius: '5px', bgcolor: 'action.hover', color: 'text.secondary' }} />}
              {data.product_type && <Chip label={data.product_type} size="small" sx={{ height: 20, fontSize: 10, borderRadius: '5px', bgcolor: 'action.hover', color: 'text.secondary', textTransform: 'capitalize' }} />}
            </Stack>

            <Typography
              sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 24, md: 30 }, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2, mb: 1.5 }}
              color="text.primary"
            >
              {data.title}
            </Typography>

            {/* Price */}
            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 700, color: 'text.primary' }}>
                {ghs(data.price)}
              </Typography>
              {hasDiscount && (
                <>
                  <Typography sx={{ fontSize: 14, textDecoration: 'line-through', color: 'text.disabled' }}>{ghs(data.old_price)}</Typography>
                  <Chip label={`-${Math.round(((oldPrice - price) / oldPrice) * 100)}%`} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, borderRadius: '5px', bgcolor: '#ef4444', color: '#ffffff' }} />
                </>
              )}
            </Stack>

            <Divider sx={{ mb: 2 }} />

            {/* Quick stats row */}
            <Grid container spacing={1.5}>
              {[
                { label: 'Total views',   value: (data.views || 0).toLocaleString(),         icon: <VisibilityOutlinedIcon sx={{ fontSize: 14 }} /> },
                { label: 'Units sold',    value: (data.total_units_sold || 0).toLocaleString(), icon: <ShoppingBagOutlinedIcon sx={{ fontSize: 14 }} /> },
                { label: 'Total revenue', value: ghs(data.total_revenue),                     icon: <TrendingUpIcon sx={{ fontSize: 14 }} /> },
                { label: 'In stock',      value: (data.total_stock || 0).toLocaleString(),     icon: <Inventory2OutlinedIcon sx={{ fontSize: 14 }} /> },
              ].map((s) => (
                <Grid key={s.label} size={{ xs: 6, sm: 3 }}>
                  <Box sx={{ p: '10px 14px', borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: 'text.disabled', mb: 0.4 }}>
                      {s.icon}
                      <Typography variant="caption" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                        {s.label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, lineHeight: 1 }} color="text.primary">
                      {s.value}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SalesKPIs.jsx — 6 metric cards
// ─────────────────────────────────────────────────────────────────────────────