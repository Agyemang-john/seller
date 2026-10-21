'use client';

import useSWR from 'swr';
import { createAxiosClient } from '@/utils/clientFetch';

// Same key as the other plan-aware pages (flash sales, orders), so SWR shares one request.
const fetcher = (url: string) => createAxiosClient().get(url).then((res) => res.data);

/**
 * Whether this store's plan includes customer messaging (Basic and up;
 * backend payments/entitlements.py → can_use_messaging). Seller dashboard only.
 */
export default function useMessagingPlan() {
  const { data, isLoading, error } = useSWR('/api/v1/vendor/plan/', fetcher, {
    revalidateOnFocus: true, shouldRetryOnError: false,
  });
  return {
    loading: isLoading,
    allowed: !!data?.can_use_messaging,
    // Unknown (still loading, or the call failed): don't flash the upgrade screen.
    known: !!data || !!error,
    planName: (data?.name as string | undefined) ?? 'Free',
    minTier: (data?.messaging_min_tier as string | undefined) ?? 'basic',
  };
}
