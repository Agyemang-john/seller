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

export function ProductDetailError({ message, onRetry }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 12, px: 3, borderRadius: '20px', border: '1px dashed', borderColor: 'error.light', bgcolor: 'background.paper' }}>
      <Box sx={{ width: 56, height: 56, borderRadius: '14px', bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2.5 }}>
        <ErrorOutlineIcon sx={{ fontSize: 26, color: 'error.main' }} />
      </Box>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 24, fontWeight: 700, letterSpacing: '-0.5px', mb: 1 }} color="text.primary">Failed to load analytics</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, lineHeight: 1.7, mb: 3.5 }}>{message}</Typography>
      <Button variant="contained" disableElevation startIcon={<RefreshIcon />} onClick={onRetry}
        sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '10px', fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
        Try again
      </Button>
    </Box>
  );
}