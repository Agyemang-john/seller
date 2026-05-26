'use client';

import React from 'react';
import Link from 'next/link';
import { Box, Typography, Stack, Grid } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

function EngagementTile({ icon: Icon, label, value, subtext }) {
  return (
    <Box
      sx={{
        p: { xs: '12px 14px', md: '20px 22px' },
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'flex-start',
        gap: { xs: 1.25, md: 2 },
        transition: 'box-shadow 0.18s, transform 0.18s',
        '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 }, borderRadius: '10px', bgcolor: 'action.selected',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25,
        }}
      >
        <Icon sx={{ fontSize: { xs: 15, md: 18 }, color: 'text.secondary' }} />
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="caption" sx={{
          display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase',
          fontWeight: 600, color: 'text.disabled', mb: 0.3, fontSize: 10,
        }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: { xs: 20, md: 28 }, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1,
          }}
          color="text.primary"
        >
          {value ?? '—'}
        </Typography>
        {subtext && (
          <Typography variant="caption" color="text.disabled" sx={{ mt: 0.4, display: 'block' }}>
            {subtext}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// Rating stars display
function RatingStars({ rating }) {
  const r = Number(rating ?? 0);
  return (
    <Stack direction="row" alignItems="center" spacing={0.25} sx={{ mt: 0.5 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Box
          key={star}
          sx={{
            width: 8, height: 8, borderRadius: '50%',
            bgcolor: star <= Math.round(r) ? 'text.primary' : 'divider',
          }}
        />
      ))}
      <Typography variant="caption" color="text.disabled" sx={{ ml: 0.5, fontSize: 10 }}>
        {r.toFixed(1)} / 5.0
      </Typography>
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
        <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700 }} color="text.primary">Engagement</Typography>
        <Typography variant="body2" color="text.disabled">No engagement data yet.</Typography>
      </Box>
    );
  }

  const tiles = [
    {
      icon: VisibilityOutlinedIcon,
      label: 'Store Views',
      value: Number(data.total_views ?? 0).toLocaleString(),
      subtext: 'Total store visits',
    },
    {
      icon: FavoriteBorderRoundedIcon,
      label: 'Wishlisted',
      value: Number(data.wishlist_count ?? 0).toLocaleString(),
      subtext: 'Products added to wishlists',
    },
    {
      icon: ShoppingCartOutlinedIcon,
      label: 'In Cart',
      value: Number(data.cart_quantity ?? 0).toLocaleString(),
      subtext: 'Items in shoppers\' carts',
    },
    {
      icon: RateReviewOutlinedIcon,
      label: 'Reviews',
      value: Number(data.review_count ?? 0).toLocaleString(),
      subtext: 'Customer reviews received',
    },
    {
      icon: StarBorderRoundedIcon,
      label: 'Avg Rating',
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
            sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 16, md: 22 }, fontWeight: 700, letterSpacing: '-0.5px' }}
            color="text.primary"
          >
            Customer Engagement
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em', display: { xs: 'none', sm: 'block' } }}>
            HOW SHOPPERS INTERACT
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

      <Grid container spacing={1.5}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 6, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <EngagementTile {...tile} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}