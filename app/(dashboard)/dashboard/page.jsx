'use client';

import Main from './_components/Main';
import PageContainer from '@/components/PageContainer';

export default function Page() {
  const pageTitle = 'Seller Dashboard';

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: pageTitle },
      ]}
    >
      <Main />
    </PageContainer>
  );
}