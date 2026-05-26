'use client';

import Community from './_components/Community';
import PageContainer from '@/components/PageContainer';

export default function CommunityPage() {
  return (
    <PageContainer
      title="Community"
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: 'Community' },
      ]}
    >
      <Community />
    </PageContainer>
  );
}
