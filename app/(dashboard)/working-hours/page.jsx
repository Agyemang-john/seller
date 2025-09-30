'use client';

import { Box } from '@mui/material';
import HourFormList from './_components/HourList';
import PageContainer from '@/components/PageContainer';
const pageTitle = "Working Hours";

export default function Page() {

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: pageTitle },
      ]}
    >
      <HourFormList />
    </PageContainer>
  );
}
