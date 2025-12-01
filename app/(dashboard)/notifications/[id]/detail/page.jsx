'use client';

import { useParams } from 'next/navigation';
import NotificationDetail from './_components/NotificationDetail';
import PageContainer from '@/components/PageContainer';
import ErrorBoundary from './_components/ErrorBoundary';


export default function Page() {
    const { id } = useParams();
    
  const pageTitle = `Notification ${id}`;


  return (
    <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Notifications', path: '/notifications' },
          { title: pageTitle },
        ]}
      >
        <ErrorBoundary>
          <NotificationDetail/>
        </ErrorBoundary>
    </PageContainer>
  );
}