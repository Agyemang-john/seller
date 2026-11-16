'use client';

import useSWR from 'swr';
import { createAxiosClient } from '@/utils/clientFetch';
import useVendorAccess, { CAP } from '@/hooks/useVendorAccess';
import useUnreadChats from '@/components/chat/useUnreadChats';
import useMessagingPlan from '@/components/chat/useMessagingPlan';

const get = (url: string) => createAxiosClient().get(url).then((res) => res.data);

/**
 * Counters for things waiting on the seller, shared by the sidebar, the phone
 * bottom bar and the header. SWR keys are fixed here so every consumer shares
 * one request.
 *
 * Keyed by nav link id (see components/navConfig.tsx).
 */
export default function useNavCounts() {
  const { can } = useVendorAccess();
  const canOrders = can(CAP.MANAGE_ORDERS);

  // Chat is a Basic-and-up feature: free stores see the item with an "Upgrade" tag.
  const messagingPlan = useMessagingPlan();
  const unreadChats = useUnreadChats('vendor', can(CAP.MANAGE_MESSAGES) && messagingPlan.allowed);

  // "To ship" is the queue a seller has to act on.
  const { data: toShip } = useSWR(
    canOrders ? '/api/v1/vendor/orders/?filter=to_ship&page_size=1' : null,
    (url: string) => get(url).then((d) => (d?.count ?? 0) as number),
    { refreshInterval: 60_000, revalidateOnFocus: true, shouldRetryOnError: false },
  );

  // Imported items behind schedule (backend order/sourcing.py), so long waits aren't forgotten.
  const { data: sourced } = useSWR(
    canOrders ? '/api/v1/vendor/sourced-items/' : null, get,
    { refreshInterval: 10 * 60 * 1000, revalidateOnFocus: false, shouldRetryOnError: false },
  );
  const importsBehind = sourced?.counts ? (sourced.counts.late || 0) + (sourced.counts.overdue || 0) : 0;

  const badges: Record<string, number> = {
    orders: toShip ?? 0,
    'imported-orders': importsBehind,
    messages: unreadChats,
  };
  const tags: Record<string, string> = {};
  if (messagingPlan.known && !messagingPlan.allowed) tags.messages = 'Upgrade';

  return { badges, tags, toShip: toShip ?? 0, unreadChats };
}
