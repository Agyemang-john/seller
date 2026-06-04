'use client';

import {
  Box, Typography, Stack, Chip
} from '@mui/material';


const ghs = (n) => `GHS ${parseFloat(n || 0).toLocaleString('en-GH', { minimumFractionDigits: 2 })}`;
const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

export function ProductMeta({ data }) {
  const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const rows = [
    { label: 'SKU',           value: data.sku },
    { label: 'Listed on',     value: fmt(data.date) },
    { label: 'Last updated',  value: fmt(data.last_activity) },
    { label: 'Variant type',  value: data.variant || 'None' },
    { label: 'Weight',        value: data.weight ? `${data.weight} kg` : '—' },
    { label: 'Return window', value: data.return_period_days ? `${data.return_period_days} days` : '—' },
    { label: 'Warranty',      value: data.warranty_period_days ? `${data.warranty_period_days} days` : '—' },
  ];
  const flags = [
    { label: 'Deal of the day',   on: data.deals_of_the_day     },
    { label: 'Recommended',       on: data.recommended_for_you  },
    { label: 'Popular product',   on: data.popular_product      },
    { label: 'Trending',          on: (data.trending_score || 0) > 0 },
  ].filter((f) => f.on);

  return (
    <Box sx={{ p: { xs: 2.5, md: 3 }, borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px', mb: 2 }} color="text.primary">Product Details</Typography>
      <Stack spacing={0.5} sx={{ mb: flags.length > 0 ? 2 : 0 }}>
        {rows.map((r) => (
          <Stack key={r.label} direction="row" justifyContent="space-between" sx={{ py: 0.6, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.disabled" fontWeight={600}>{r.label}</Typography>
            <Typography variant="caption" color="text.primary" fontWeight={500}>{r.value}</Typography>
          </Stack>
        ))}
      </Stack>
      {flags.length > 0 && (
        <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1.5 }}>
          {flags.map((f) => (
            <Chip key={f.label} label={f.label} size="small" sx={{ height: 20, fontSize: 10, fontWeight: 600, borderRadius: '6px', bgcolor: 'action.selected', color: 'text.primary' }} />
          ))}
        </Stack>
      )}
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProductDetailSkeleton.jsx
// ─────────────────────────────────────────────────────────────────────────────