'use client';

import { Box } from '@mui/material';
import MyProfile from './_components/MyProfile';
import PageContainer from '@/components/PageContainer';
const pageTitle = "Store Profile";

export default function Page() {

  return (
     <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: pageTitle },
      ]}
    >
        <MyProfile />
    </PageContainer>
  );
}
