'use client';

import StoreAnalyticsPage from './_components/StoreAnalyticsPage';


import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import PageContainer from '@/components/PageContainer';

export default function TrafficPage() {
  return (
    <PageContainer
      title=""
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: 'Traffic Analytics' },
      ]}
    >
      <Box sx={{ maxWidth: 9260 }}>
        <Stack spacing={4} divider={<Divider />}>
          <StoreAnalyticsPage />
        </Stack>
      </Box>
    </PageContainer>
  );
}
