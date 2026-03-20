'use client';

import React from 'react';
import { Box, Typography, Stack, Grid } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import BookmarkBorderRoundedIcon from '@mui/icons-material/BookmarkBorderRounded';
import RateReviewOutlinedIcon from '@mui/icons-material/RateReviewOutlined';
import StarBorderRoundedIcon from '@mui/icons-material/StarBorderRounded';

function EngagementTile({ icon: Icon, label, value, subtext }) {
  return (
    <Box
      sx={{
        p: '20px 22px',
        borderRadius: '14px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 2,
        transition: 'box-shadow 0.18s, transform 0.18s',
        '&:hover': { boxShadow: '0 8px 32px rgba(0,0,0,0.07)', transform: 'translateY(-2px)' },
      }}
    >
      <Box
        sx={{
          width: 40, height: 40, borderRadius: '10px', bgcolor: 'action.selected',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, mt: 0.25,
        }}
      >
        <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />
      </Box>

      <Box>
        <Typography variant="caption" sx={{
          display: 'block', letterSpacing: '0.06em', textTransform: 'uppercase',
          fontWeight: 600, color: 'text.disabled', mb: 0.3, fontSize: 10,
        }}>
          {label}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1,
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
      label: 'Profile Views',
      value: Number(data.total_views ?? 0).toLocaleString(),
      subtext: 'All-time store visits',
    },
    {
      icon: FavoriteBorderRoundedIcon,
      label: 'Wishlisted',
      value: Number(data.wishlist_count ?? 0).toLocaleString(),
      subtext: 'Products added to wishlists',
    },
    {
      icon: BookmarkBorderRoundedIcon,
      label: 'Saved',
      value: Number(data.saved_count ?? 0).toLocaleString(),
      subtext: 'Products saved by shoppers',
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
      }}
    >
      <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 3 }}>
        <Typography
          sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}
          color="text.primary"
        >
          Customer Engagement
        </Typography>
        <Typography variant="caption" color="text.disabled" sx={{ letterSpacing: '0.06em' }}>
          HOW SHOPPERS INTERACT
        </Typography>
      </Stack>

      <Grid container spacing={1.5}>
        {tiles.map((tile) => (
          <Grid key={tile.label} size={{ xs: 12, sm: 6, md: 4, lg: 'auto' }} sx={{ flex: { lg: 1 } }}>
            <EngagementTile {...tile} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}