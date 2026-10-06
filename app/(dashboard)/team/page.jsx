'use client';

import PageContainer from '@/components/PageContainer';
import TeamManager from './_components/TeamManager';

const pageTitle = 'Team';

export default function TeamPage() {
  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home', path: '/dashboard' },
        { title: pageTitle },
      ]}
    >
      <TeamManager />
    </PageContainer>
  );
}
