'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Stack } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';

function EngagementTile({ icon: Icon, label, value, subtext }) {
  // Label row on top, then the number, then one line of context: reads
  // cleanly even when five tiles share a row.
  return (
    <Box
      sx={{
        p: { xs: 1.75, md: 2.25 },
        height: '100%',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, minWidth: 0 }}>
        <Box
          sx={{
            width: 30, height: 30, borderRadius: '8px', bgcolor: 'action.selected',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}
        >
          <Icon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </Box>
        <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {label}
        </Typography>
      </Stack>
      <Typography
        sx={{
          fontFamily: "var(--font-figtree), system-ui, sans-serif",
          fontSize: { xs: 22, md: 26 }, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1,
          fontVariantNumeric: 'tabular-nums',
        }}
        color="text.primary"
      >
        {value ?? '—'}
      </Typography>
      {subtext && (
        <Box sx={{ mt: 0.5, fontSize: 12, color: 'text.secondary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {subtext}
        </Box>
      )}
    </Box>
  );
}

// Rating stars display
function RatingStars({ rating }) {
  const r = Number(rating ?? 0);
  return (
    <Stack direction="row" alignItems="center" spacing={0.25} aria-label={`${r.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <StarRoundedIcon key={star} sx={{ fontSize: 15, color: star <= Math.round(r) ? 'warning.main' : 'divider' }} />
      ))}
    </Stack>
  );
}

export default function EngagementChart({ data }) {
  if (!data) {
    return (
      <Box sx={{
        p: 3, borderRadius: '20px', border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', minHeight: 160,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1,
      }}>
        <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: 22, fontWeight: 700 }} color="text.primary">Engagement</Typography>
        <Typography variant="body2" color="text.disabled">No engagement data yet.</Typography>
      </Box>
    );
  }

  const tiles = [
    {
      icon: VisibilityOutlinedIcon,
      label: 'Store views',
      value: Number(data.total_views ?? 0).toLocaleString(),
      subtext: 'Store visits',
    },
    {
      icon: FavoriteBorderRoundedIcon,
      label: 'Wishlisted',
      value: Number(data.wishlist_count ?? 0).toLocaleString(),
      subtext: 'Saved to wishlists',
    },
    {
      icon: ShoppingCartOutlinedIcon,
      label: 'In carts',
      value: Number(data.cart_quantity ?? 0).toLocaleString(),
      subtext: 'Waiting to be bought',
    },
    {
      icon: RateReviewOutlinedIcon,
      label: 'Reviews',
      value: Number(data.review_count ?? 0).toLocaleString(),
      subtext: 'From customers',
    },
    {
      icon: StarBorderRoundedIcon,
      label: 'Avg rating',
      value: Number(data.avg_rating ?? 0).toFixed(1),
      subtext: <RatingStars rating={data.avg_rating} />,
    },
  ];

  return (
    <Box
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 2.5 }} flexWrap="wrap">
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ minWidth: 0 }}>
          <Typography
            sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: { xs: 16, md: 22 }, fontWeight: 700, letterSpacing: '-0.5px' }}
            color="text.primary"
          >
            Customer engagement
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            How shoppers interact with your store
          </Typography>
        </Stack>
        <Link href="/store-analytics" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, fontWeight: 600, color: 'inherit', opacity: 0.55, transition: 'opacity 0.15s' }}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.55')}
        >
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: '0.02em', fontSize: 11 }} color="text.secondary">
            Full traffic report
          </Typography>
          <ArrowForwardRoundedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
        </Link>
      </Stack>

      {/* Tiles never get narrower than 150px: five in a row on wide screens,
          wrapping to fewer columns as space runs out. */}
      <Box sx={{ display: 'grid', gap: 1.5, gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', sm: 'repeat(auto-fit, minmax(150px, 1fr))' } }}>
        {tiles.map((tile) => (
          <EngagementTile key={tile.label} {...tile} />
        ))}
      </Box>
    </Box>
  );
}