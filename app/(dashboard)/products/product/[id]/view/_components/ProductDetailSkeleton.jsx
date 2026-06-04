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

const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export function ProductDetailSkeleton() {
  return (
    <Box>
      <Skeleton variant="rectangular" height={220} sx={{ borderRadius: '20px', mb: 4 }} />
      <Grid container spacing={1.5} sx={{ mb: 4 }}>
        {[...Array(6)].map((_, i) => <Grid key={i} size={{ xs: 6, sm: 4, md: 2 }}><Skeleton height={80} sx={{ borderRadius: '14px' }} /></Grid>)}
      </Grid>
      <Skeleton height={300} sx={{ borderRadius: '20px', mb: 3 }} />
      <Grid container spacing={2.5}>
        <Grid size={{ xs: 12, md: 8 }}><Skeleton height={260} sx={{ borderRadius: '20px' }} /></Grid>
        <Grid size={{ xs: 12, md: 4 }}><Skeleton height={260} sx={{ borderRadius: '20px' }} /></Grid>
      </Grid>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductDetailError.jsx
// ─────────────────────────────────────────────────────────────────────────────