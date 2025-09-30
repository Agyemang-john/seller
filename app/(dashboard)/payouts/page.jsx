
import PayoutList from './_components/PayoutList';
import PageContainer from '@/components/PageContainer';

export default function Page() {
    const pageTitle = "Payouts";

  return (
    <PageContainer
        title={pageTitle}
        breadcrumbs={[
          { title: 'Home', path: '/dashboard' },
          { title: pageTitle },
        ]}
      >
      <PayoutList />
    </PageContainer>
  );
}