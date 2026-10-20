'use client';

import { Suspense } from 'react';
import Box from '@mui/material/Box';
import ChatInbox from '@/components/chat/ChatInbox';

// Shopper chats for this store (backend: chat/). Every team member whose role
// includes customer messages shares one inbox; replies show who answered.
const STOREFRONT = process.env.NEXT_PUBLIC_STOREFRONT_URL || 'https://www.negromart.com';

export default function Page() {
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
