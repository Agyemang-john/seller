'use client';

import SellerDashboardGuide from './_components/Help';
import PageContainer from '@/components/PageContainer';

export default function Page() {
    const pageTitle = "Help & Support";

  return (
    <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Home', path: '/dashboard' },
          { title: pageTitle },
        ]}
      >
      <SellerDashboardGuide />
    </PageContainer>
  );
}