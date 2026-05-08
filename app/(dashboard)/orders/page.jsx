'use client';

import { Suspense } from 'react';
import { Box, Skeleton, Paper, Stack } from '@mui/material';
import OrderList from './_components/OrderList';
import PageContainer from '@/components/PageContainer';

function OrderListSkeleton() {
  return (
    <Box>
      {/* Header skeleton */}
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" sx={{ mb: 3 }}>
        <Box>
          <Skeleton variant="rounded" width={160} height={36} sx={{ borderRadius: '6px', mb: 0.75 }} />
          <Skeleton variant="rounded" width={110} height={14} sx={{ borderRadius: '4px' }} />
        </Box>
        <Skeleton variant="rounded" width={230} height={36} sx={{ borderRadius: '10px' }} />
      </Stack>

      {/* Tabs skeleton */}
      <Stack direction="row" spacing={1} sx={{ mb: 2.5, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
        {[80, 68, 88, 68, 78, 68].map((w, i) => (
          <Skeleton key={i} variant="rounded" width={w} height={20} sx={{ borderRadius: '4px' }} />
        ))}
      </Stack>

      {/* Table skeleton */}
      <Paper variant="outlined" sx={{ borderRadius: '16px', overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" spacing={4}>
            {[80, 140, 80, 70, 80, 70, 70, 40].map((w, i) => (
              <Skeleton key={i} variant="rounded" width={w} height={12} sx={{ borderRadius: '3px' }} />
            ))}
          </Stack>
        </Box>
        {Array.from({ length: 6 }).map((_, i) => (
          <Box key={i} sx={{ px: 2, py: 2.25, borderBottom: i < 5 ? '1px solid' : 0, borderColor: 'divider' }}>
            <Stack direction="row" spacing={4} alignItems="center">
              {[120, 180, 110, 90, 100, 72, 72, 50].map((w, j) => (
                <Skeleton key={j} variant="rounded" width={w} height={j === 5 || j === 6 ? 22 : 16} sx={{ borderRadius: j === 5 || j === 6 ? '6px' : '4px' }} />
              ))}
            </Stack>
          </Box>
        ))}
      </Paper>
    </Box>
  );
}

export default function Page() {
  return (
    <PageContainer
      title=""
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: 'Orders' },
      ]}
    >
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList />
      </Suspense>
    </PageContainer>
  );
}
