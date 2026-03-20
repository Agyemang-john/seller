'use client';

import React from 'react';
import { Box, Typography, Skeleton, Stack } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import UpgradeLock from './Upgradelock';

// Shape returned by Django when a plan gate is hit
interface GateError {
  error: string;
  detail: string;
  current_tier?: string;
  required_tier?: string;
  action?: string;
}

function parseAxiosError(err: unknown): GateError | string | null {
  if (!err) return null;
  const axiosErr = err as { response?: { data?: GateError; status?: number } };
  if (axiosErr?.response?.data?.error) return axiosErr.response.data;
  if (axiosErr?.response?.status === 403) {
    return {
      error: 'plan_upgrade_required',
      detail: 'This feature requires a higher plan.',
      action: 'upgrade',
    };
  }
  const e = err as Error;
  return e?.message ?? 'An unexpected error occurred.';
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  isLoading?: boolean;
  error?: unknown;
  skeletonHeight?: number;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
}

export default function ChartCard({
  title,
  subtitle,
  isLoading = false,
  error,
  skeletonHeight = 300,
  headerAction,
  children,
}: ChartCardProps) {
  const parsedError = parseAxiosError(error);

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: '16px',
        overflow: 'hidden',
        height: '100%',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          pt: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '-0.3px',
              lineHeight: 1.2,
            }}
            color='text.primary'
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='caption' color='text.disabled' sx={{ mt: 0.25, display: 'block' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {headerAction && <Box sx={{ flexShrink: 0 }}>{headerAction}</Box>}
      </Box>

      {/* Body */}
      <Box sx={{ p: 3 }}>
        {/* Loading skeleton */}
        {isLoading && (
          <Stack spacing={1.5}>
            <Skeleton variant='rectangular' height={skeletonHeight} sx={{ borderRadius: '8px' }} />
          </Stack>
        )}

        {/* Error — upgrade gate */}
        {!isLoading && parsedError && typeof parsedError === 'object' &&
          (parsedError.action === 'upgrade' || parsedError.error === 'plan_upgrade_required') && (
          <UpgradeLock
            feature={title}
            requiredTier={parsedError.required_tier ?? 'basic'}
            currentTier={parsedError.current_tier ?? 'free'}
          />
        )}

        {/* Error — generic */}
        {!isLoading && parsedError && !(typeof parsedError === 'object' &&
          (parsedError.action === 'upgrade' || parsedError.error === 'plan_upgrade_required')) && (
          <Box
            sx={{
              display: 'flex', alignItems: 'flex-start', gap: 1.5,
              px: 2.5, py: 2,
              bgcolor: 'error.lighter',
              border: '1px solid', borderColor: 'error.light',
              borderRadius: '10px',
            }}
          >
            <ErrorOutlineIcon sx={{ fontSize: 18, color: 'error.main', mt: '1px', flexShrink: 0 }} />
            <Box>
              <Typography variant='body2' color='error.main' fontWeight={600}>
                Failed to load {title.toLowerCase()}
              </Typography>
              <Typography variant='caption' color='error.main' sx={{ opacity: 0.8 }}>
                {typeof parsedError === 'string' ? parsedError : parsedError.detail}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Content */}
        {!isLoading && !parsedError && children}
      </Box>
    </Box>
  );
}