'use client';

import { Suspense } from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ChatInbox from '@/components/chat/ChatInbox';
import useMessagingPlan from '@/components/chat/useMessagingPlan';
import PageContainer from '@/components/PageContainer';
import MessagingUpsell from './_components/MessagingUpsell';

// Shopper chats for this store (backend: chat/). Every team member whose role
// includes customer messages shares one inbox; replies show who answered.
// Basic plan and up; Free stores get the upgrade pitch instead.
const STOREFRONT = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://www.negromart.com';

export default function Page() {
  const plan = useMessagingPlan();

  if (!plan.known) {
    return <Box sx={{ flex: 1, display: 'grid', placeItems: 'center' }}><CircularProgress size={28} /></Box>;
  }

  if (!plan.allowed) {
    return (
      <PageContainer title="Messages" breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Messages' }]}>
        <MessagingUpsell planName={plan.planName} minTier={plan.minTier} />
      </PageContainer>
    );
  }

  return (
    // <main> is a flex column; fill it edge to edge like a messaging app.
    <Box sx={{ flex: 1, minHeight: 420, position: 'relative' }}>
      <Box sx={{ position: 'absolute', inset: 0 }}>
        <Suspense fallback={null}>
          <ChatInbox
            side="vendor"
            title="Messages"
            emptyHint="When shoppers contact your store from your store page, their messages appear here."
            productHref={(p) => `${STOREFRONT}/${p.sku}/${p.slug}`}
          />
        </Suspense>
      </Box>
    </Box>
  );
}
