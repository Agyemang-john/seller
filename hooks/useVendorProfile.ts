'use client';
import { useState, useEffect } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';

export interface VendorProfile {
  vendor_name: string;
  address: string;
  about: string;
  profile_image: string;
  cover_image: string;
}

export function useVendorProfile() {
  const [profile, setProfile] = useState<VendorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const axiosClient = createAxiosClient();
    axiosClient
      .get<VendorProfile>('/api/v1/vendor/about/management/')
      .then((res) => setProfile(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { profile, loading };
}
