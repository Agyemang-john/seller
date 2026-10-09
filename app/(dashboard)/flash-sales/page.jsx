'use client';

import PageContainer from '@/components/PageContainer';
import FlashSalesManager from './_components/FlashSalesManager';

export default function FlashSalesPage() {
  return (
    <PageContainer title="Flash Sales" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Flash Sales' }]}>
      <FlashSalesManager />
    </PageContainer>
  );
}
