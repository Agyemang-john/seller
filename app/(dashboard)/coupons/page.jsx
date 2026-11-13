'use client';

import PageContainer from '@/components/PageContainer';
import CouponsManager from './_components/CouponsManager';

export default function CouponsPage() {
  return (
    <PageContainer title="Coupons" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Coupons' }]}>
      <CouponsManager />
    </PageContainer>
  );
}
