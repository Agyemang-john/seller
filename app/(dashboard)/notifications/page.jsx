'use client';

import NotificationsList from './_components/NotificationsList';
import PageContainer from '@/components/PageContainer';

export default function Page() {
    const pageTitle = "Notifications";

  return (
    <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Home', path: '/dashboard' },
          { title: pageTitle },
        ]}
      >
      <NotificationsList />
    </PageContainer>
  );
}