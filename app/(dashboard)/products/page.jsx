// app/vendor/products/page.jsx
'use client';

import { Suspense } from 'react';
import { Box } from '@mui/material';
import PageContainer from '@/components/PageContainer';
import ProductList from '@/components/products/ProductList';
import ProductListSkeleton from '@/components/products/Productlistskeleton';
import { useCurrentSubscription } from '@/hooks/useSubscription';

const PAGE_TITLE = 'My Products';

export default function ProductsPage() {
  // Subscription data drives the BulkUploadButton visibility
  const { subscription } = useCurrentSubscription();
  const canBulkUpload = subscription?.plan?.can_access_bulk_upload ?? false;

  return (
    <PageContainer
      title={''}
      breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: PAGE_TITLE }]}
    >
      <Box sx={{ pb: 8 }}>
        {/* Suspense is required because ProductList reads useSearchParams */}
        <Suspense fallback={<ProductListSkeleton />}>
          <ProductList canBulkUpload={canBulkUpload} />
        </Suspense>
      </Box>
    </PageContainer>
  );
}
