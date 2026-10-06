'use client';

import { useEffect, useState } from 'react';
import { createAxiosClient } from '@/utils/clientFetch';

/**
 * The signed-in team member's role and capabilities in their store
 * (owner / admin / staff), from GET /api/v1/vendor/my-status/.
 *
 * The UI uses this only to HIDE things a member can't use; the backend enforces
 * every capability itself (vendor/access.py), so a stale value is harmless.
 *
 * The request is shared across components for the page's lifetime: the sidebar
 * and the page asking at the same time cost one call.
 */
let pending = null;

function load() {
  if (!pending) {
    pending = createAxiosClient()
      .get('/api/v1/vendor/my-status/')
      .then((res) => res.data)
      .catch(() => {
        pending = null; // let the next mount retry
        return null;
      });
  }
  return pending;
}

/** Call after something that can change your own role (e.g. leaving a team). */
export function resetVendorAccess() {
  pending = null;
}

// Capability names mirror vendor/access.py → Capability.
export const CAP = {
  MANAGE_CATALOG: 'manage_catalog',
  MANAGE_ORDERS: 'manage_orders',
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_STORE: 'manage_store',
  VIEW_FINANCE: 'view_finance',
  MANAGE_FINANCE: 'manage_finance',
  MANAGE_TEAM: 'manage_team',
  CLOSE_STORE: 'close_store',
};

export default function useVendorAccess() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    load().then((data) => {
      if (!alive) return;
      setStatus(data);
      setLoading(false);
    });
    return () => { alive = false; };
  }, []);

  const capabilities = status?.capabilities || [];
  return {
    loading,
    role: status?.vendor_role || null,
    capabilities,
    // While loading (or if the call failed) report everything as allowed so
    // the owner never sees items flicker away; the API still says no.
    can: (capability) => loading || !status || capabilities.includes(capability),
  };
}
