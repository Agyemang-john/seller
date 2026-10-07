'use client';

import { Suspense } from 'react';
import PageContainer from '@/components/PageContainer';
import ReturnsManager from './_components/ReturnsManager';

// Route is /order-returns: /returns is the public "Returns" information page.
export default function ReturnsPage() {
  return (
    <PageContainer title="Returns" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Returns' }]}>
      <Suspense fallback={null}>
        <ReturnsManager />
      </Suspense>
    </PageContainer>
  );
}
