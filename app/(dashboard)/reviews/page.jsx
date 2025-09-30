'use client';

import { Box } from '@mui/material';
import ProductReviews from './_components/ProductReviews';
import PageContainer from '@/components/PageContainer';
const pageTitle = "Product Reviews";

export default function Page() {

  return (
    <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Home', path: '/dashboard' },
          { title: pageTitle },
        ]}
      >
      <ProductReviews />
    </PageContainer>
  );
}
