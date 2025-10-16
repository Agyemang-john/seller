'use client';

import OrderList from './_components/OrderList';
import PageContainer from '@/components/PageContainer';
import { Suspense } from 'react';

export default function Page() {
  const pageTitle = 'Orders';


  return (
    <PageContainer
          title={pageTitle}
          breadcrumbs={[
            { title: 'Home', path: '/dashboard' },
            { title: pageTitle },
          ]}
        >
          <Suspense fallback={<div>...</div>}>
            <OrderList />
          </Suspense>
    </PageContainer>
  );
}