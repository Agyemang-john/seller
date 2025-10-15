'use client'; 

import * as React from 'react';
import Logout from './_components/Logout';
import PageContainer from '@/components/PageContainer';

export default function CustomerSignOut() {
  const pageTitle = "Logout";

  return (
    <PageContainer
            title={pageTitle}
            breadcrumbs={[
              { title: 'Home', path: '/dashboard' },
              { title: pageTitle },
            ]}
          >
        <Logout />
    </PageContainer>
  );
}
