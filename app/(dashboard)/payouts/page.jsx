'use client';

import Earnings from './_components/Earnings';
import PageContainer from '@/components/PageContainer';

export default function Page() {
    const pageTitle = "Earnings & payouts";

  return (
    <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Home', path: '/dashboard' },
          { title: pageTitle },
        ]}
      >
      <Earnings />
    </PageContainer>
  );
}