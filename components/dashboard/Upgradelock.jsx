'use client';

import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from 'next/navigation';

const TIER_LABELS = {
  basic:      'Basic',
  pro:        'Pro',
  enterprise: 'Enterprise',
};

/**
 * UpgradeLock
 *
 * Two modes:
 *   compact={false} (default) — full card, used inside chart areas
 *   compact={true}            — slim inline banner, used in page headers/toolbars
 *
 * Props:
 *   feature      — name of the locked feature, e.g. "Analytics"
 *   requiredTier — "basic" | "pro" | "enterprise"
 *   currentTier  — vendor's current tier, e.g. "free"
 *   compact      — render the slim inline variant
 */
export default function UpgradeLock({
  feature      = 'Analytics',
  requiredTier = 'basic',
  currentTier  = 'free',
  compact      = false,
}) {
  const router     = useRouter();
  const tierLabel  = TIER_LABELS[requiredTier] ?? requiredTier;
  const goToPlans  = () => router.push('/subscrice');

  // ── Compact / inline variant ──────────────────────────────────────────────
  if (compact) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2.5,
          py: 1.25,
          borderRadius: '10px',
          bgcolor: 'action.hover',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 15, color: 'text.disabled', flexShrink: 0 }} />

        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
          <strong style={{ fontWeight: 600 }}>{feature}</strong> requires the{' '}
          <strong style={{ fontWeight: 600 }}>{tierLabel}</strong> plan or higher
        </Typography>

        <Button
          size="small"
          variant="outlined"
          onClick={goToPlans}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 12 }} />}
          sx={{
            ml: 'auto',
            flexShrink: 0,
            fontSize: 11,
            fontWeight: 600,
            py: 0.4,
            px: 1.5,
            borderRadius: '6px',
            borderColor: 'text.primary',
            color: 'text.primary',
            '&:hover': { bgcolor: 'text.primary', color: 'background.paper', borderColor: 'text.primary' },
          }}
        >
          Upgrade
        </Button>
      </Box>
    );
  }

  // ── Full card variant ─────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: 8,
        px: 4,
        minHeight: 280,
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Dot-grid background */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute', inset: 0,
          opacity: 0.035,
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '22px 22px',
          color: 'text.primary',
          pointerEvents: 'none',
        }}
      />

      {/* Lock icon */}
      <Box
        sx={{
          width: 56, height: 56,
          borderRadius: '16px',
          bgcolor: 'text.primary',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          mb: 3,
          position: 'relative',
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 22, color: 'background.paper' }} />
      </Box>

      {/* Heading */}
      <Typography
        sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: '-0.5px',
          mb: 1,
        }}
        color="text.primary"
      >
        {feature} is locked
      </Typography>

      {/* Body */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 340, lineHeight: 1.75, mb: 4 }}
      >
        You're on the{' '}
        <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {currentTier}
        </Box>{' '}
        plan. Upgrade to{' '}
        <Box component="strong" sx={{ color: 'text.primary', fontWeight: 600 }}>
          {tierLabel}
        </Box>{' '}
        or higher to unlock {feature.toLowerCase()}, trends, delivery
        performance, and more.
      </Typography>

      {/* CTAs */}
      <Stack direction="row" spacing={1.5}>
        <Button
          variant="contained"
          disableElevation
          onClick={goToPlans}
          endIcon={<ArrowForwardIcon />}
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            borderRadius: '10px',
            fontWeight: 600,
            fontSize: 13,
            px: 3,
            py: 1.25,
            '&:hover': { bgcolor: 'text.secondary' },
          }}
        >
          Upgrade plan
        </Button>
        <Button
          variant="outlined"
          onClick={goToPlans}
          sx={{
            borderRadius: '10px',
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: 13,
            px: 2.5,
            py: 1.25,
            '&:hover': { borderColor: 'text.primary', color: 'text.primary', bgcolor: 'transparent' },
          }}
        >
          View plans
        </Button>
      </Stack>
    </Box>
  );
}