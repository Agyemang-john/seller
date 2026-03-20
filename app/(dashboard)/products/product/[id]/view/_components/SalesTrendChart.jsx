'use client';

import { Box, Typography, Stack } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { LineChart } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;

export function SalesTrendChart({ data = [] }) {
  const theme = useTheme();

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minHeight: 240, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <TrendingUpIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700 }} color="text.primary">Sales Trend</Typography>
        <Typography variant="body2" color="text.disabled">No sales in the last 30 days</Typography>
      </Box>
    );
  }

  const xAxis   = data.map((d) => new Date(d.date));
  const revenue = data.map((d) => d.revenue);
  const units   = data.map((d) => d.units);

  // Summary stats
  const totalRevenue = revenue.reduce((a, b) => a + b, 0);
  const totalUnits   = units.reduce((a, b) => a + b, 0);
  const peakRevenue  = Math.max(...revenue);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={1.5} sx={{ mb: 2.5 }}>
        <Stack direction="row" alignItems="baseline" spacing={1}>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
            Sales Trend
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
            Last 30 days
          </Typography>
        </Stack>
        {/* Mini summary */}
        <Stack direction="row" spacing={2}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>Revenue</Typography>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, lineHeight: 1 }} color="text.primary">{ghs(totalRevenue)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block' }}>Units</Typography>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, fontWeight: 700, lineHeight: 1 }} color="text.primary">{totalUnits.toLocaleString()}</Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Chart — single y-axis to avoid MUI Charts yAxisId mismatch error */}
      <LineChart
        xAxis={[{ data: xAxis, scaleType: 'time', tickMinStep: 3600 * 1000 * 24 }]}
        series={[
          {
            data: revenue,
            label: 'Revenue (GHS)',
            color: theme.palette.text.primary,
            curve: 'monotoneX',
            area: true,
            showMark: false,
          },
          {
            data: units,
            label: 'Units sold',
            color: theme.palette.action.disabled,
            curve: 'monotoneX',
            showMark: false,
          },
        ]}
        height={280}
        margin={{ top: 16, right: 24, bottom: 48, left: 60 }}
        sx={{
          '& .MuiAreaElement-root': { opacity: 0.07 },
          '& .MuiLineElement-root': { strokeWidth: 2 },
          '& .MuiChartsAxis-tickLabel': {
            fill: theme.palette.text.secondary,
            fontSize: 11,
          },
        }}
      />
    </Box>
  );
}