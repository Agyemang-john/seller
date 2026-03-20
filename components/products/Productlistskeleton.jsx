'use client';

import { Box, Grid, Stack, Skeleton } from '@mui/material';

function SkeletonCard() {
  return (
    <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper' }}>
      <Skeleton variant="rectangular" height={176} sx={{ transform: 'none' }} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="80%" height={18} sx={{ mb: 0.75 }} />
        <Skeleton width="55%" height={14} sx={{ mb: 1.5 }} />
        <Stack direction="row" justifyContent="space-between">
          <Skeleton width={60} height={22} />
          <Skeleton width={48} height={22} />
        </Stack>
      </Box>
      <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between">
          <Skeleton width={52} height={28} />
          <Skeleton width={52} height={28} />
        </Stack>
      </Box>
    </Box>
  );
}

export default function ProductListSkeleton() {
  return (
    <Box>
      {/* Header skeleton */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 4 }}>
        <Box>
          <Skeleton width={180} height={40} sx={{ mb: 0.5 }} />
          <Skeleton width={120} height={16} />
        </Box>
        <Skeleton width={160} height={44} sx={{ borderRadius: '10px', mt: { xs: 2, sm: 0 } }} />
      </Stack>

      {/* Filter bar skeleton */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }}>
        <Skeleton height={44} sx={{ flex: 1, borderRadius: '10px' }} />
        <Skeleton width={100} height={44} sx={{ borderRadius: '10px' }} />
        <Skeleton width={100} height={44} sx={{ borderRadius: '10px', display: { xs: 'none', sm: 'block' } }} />
      </Stack>

      {/* Grid skeleton */}
      <Grid container spacing={2}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Grid key={i} size={{ xs: 6, sm: 4, md: 3, lg: 3 }}>
            <SkeletonCard />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}