'use client';

import { Suspense } from 'react';
import SellerQuestions from './_components/SellerQuestions';
import PageContainer from '@/components/PageContainer';

const pageTitle = 'Customer questions';

export default function Page() {
  return (
    <PageContainer title={pageTitle} breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: pageTitle }]}>
      <Suspense fallback={null}>
        <SellerQuestions />
      </Suspense>
    </PageContainer>
  );
}
