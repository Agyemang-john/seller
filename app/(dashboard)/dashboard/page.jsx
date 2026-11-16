'use client';

import Main from './_components/Main';
import PageContainer from '@/components/PageContainer';

export default function Page() {
  // Home is the root of the dashboard: no breadcrumb trail, the greeting is the heading.
  return (
    <PageContainer>
      <Main />
    </PageContainer>
  );
}