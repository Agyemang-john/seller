'use client';

import { Suspense } from 'react';
import SellerReviews from './_components/SellerReviews';
import PageContainer from '@/components/PageContainer';

const pageTitle = 'Product reviews';

export default function Page() {
  return (
    <PageContainer title={pageTitle} breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: pageTitle }]}>
      <Suspense fallback={null}>
        <SellerReviews />
      </Suspense>
    </PageContainer>
  );
}
