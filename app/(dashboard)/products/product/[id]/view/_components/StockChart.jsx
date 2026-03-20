'use client';

import { Box, Typography, Stack } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { BarChart } from '@mui/x-charts/BarChart';
import { useTheme } from '@mui/material/styles';

export function StockChart({ data = [], variantType = 'None', totalStock = 0 }) {
  const theme = useTheme();

  // No-variant product: just show a big number
  if (variantType === 'None') {
    return (
      <Box sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', display: 'flex', alignItems: 'center', gap: 3 }}>
        <Box sx={{ width: 72, height: 72, borderRadius: '18px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Inventory2OutlinedIcon sx={{ fontSize: 30, color: 'text.secondary' }} />
        </Box>
        <Box>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', mb: 0.25 }}>Total stock</Typography>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 42, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1 }} color="text.primary">{totalStock.toLocaleString()}</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>units available · no variants</Typography>
        </Box>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', minHeight: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="body2" color="text.disabled">No variant data available</Typography>
      </Box>
    );
  }

  const labels = data.map((d) => d.label);
  const stocks = data.map((d) => d.quantity);
  const sold   = data.map((d) => d.units_sold);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2.5 }}>
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }} color="text.primary">
          Stock by Variant
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
          {data.length} variant{data.length !== 1 ? 's' : ''}
        </Typography>
      </Stack>

      {/* Colour swatches */}
      <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
        {data.map((v) => (
          <Stack key={v.label} direction="row" alignItems="center" spacing={0.6}>
            <Box sx={{ width: 10, height: 10, borderRadius: v.color_code ? '50%' : '3px', bgcolor: v.color_code || 'action.selected', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{v.label}</Typography>
          </Stack>
        ))}
      </Stack>

      <BarChart
        xAxis={[{ scaleType: 'band', data: labels }]}
        series={[
          { data: stocks, label: 'In stock',   color: theme.palette.text.primary  },
          { data: sold,   label: 'Units sold', color: theme.palette.text.disabled },
        ]}
        height={260}
        margin={{ top: 16, right: 16, bottom: 56, left: 48 }}
        sx={{
          '& .MuiChartsAxis-tickLabel': { fill: theme.palette.text.secondary, fontSize: 11 },
        }}
      />
    </Box>
  );
}