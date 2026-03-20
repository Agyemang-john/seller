// hooks/useBilling.js — shared SWR hook for the billing overview
'use client';
import useSWR from 'swr';
import { createAxiosClient } from '@/utils/clientFetch';

const SWR_CONFIG = {
  revalidateOnFocus:     false,
  revalidateOnReconnect: false,
  dedupingInterval:      30_000,
  keepPreviousData:      true,
};

const fetcher = async (url) => {
  const client = createAxiosClient();
  const res    = await client.get(url);
  return res.data;
};

export function useBillingOverview() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/v1/payments/billing/overview/',
    fetcher,
    SWR_CONFIG,
  );
  return {
    overview: data,
    loading:  isLoading,
    error:    error?.response?.data?.detail || error?.message || null,
    refetch:  mutate,
  };
}

export function useBillingHistory(page = 1) {
  const { data, error, isLoading } = useSWR(
    `/api/v1/payments/billing/history/?page=${page}&page_size=20`,
    fetcher,
    SWR_CONFIG,
  );
  return { history: data, loading: isLoading, error };
}