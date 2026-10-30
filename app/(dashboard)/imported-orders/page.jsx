'use client';

import { Suspense } from 'react';
import PageContainer from '@/components/PageContainer';
import ImportedOrders from './_components/ImportedOrders';

// Its own route (not /orders/imports) so the sidebar highlights one item.
export default function ImportedOrdersPage() {
  return (
    <PageContainer title="" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Orders', path: '/orders' }, { title: 'Imported orders' }]}>
      <Suspense fallback={null}>
        <ImportedOrders />
      </Suspense>
    </PageContainer>
  );
}
