'use client';

/**
 * Structured specifications (backend: attributes/) for the product form.
 *
 * The fields follow the category chosen in the form, saved or not, so a new
 * product gets its specs on the same page. Values are sent with the product
 * itself as `attributes` (see vendor/product_serializers.py), never on their
 * own, so the product and its specs save together.
 */

import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { createAxiosClient } from '@/utils/clientFetch';

const definitionsFetcher = (url) => createAxiosClient().get(url).then((r) => r.data.results || []);

const isEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

export function useProductSpecs(productId, subCategoryId) {
  const [values, setValues] = useState({});
  // Edits are only sent once the saved values are known, so a failed load
  // can never be mistaken for "the seller cleared everything".
  const [loaded, setLoaded] = useState(!productId);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!productId) return;
    let alive = true;
    createAxiosClient().get(`/api/v1/attributes/seller/products/${productId}/`)
      .then(({ data }) => { if (alive) { setValues(data.values || {}); setLoaded(true); } })
      .catch(() => { if (alive) setLoadError('Your saved specifications could not be loaded. Refresh the page to edit them.'); });
    return () => { alive = false; };
  }, [productId]);

  const { data: definitions = [], error: defsError, isLoading } = useSWR(
    subCategoryId ? `/api/v1/attributes/sub-category/${subCategoryId}/` : null,
    definitionsFetcher,
    { revalidateOnFocus: false },
  );

  const missing = useMemo(
    () => definitions.filter((d) => d.required && isEmpty(values[d.slug])).map((d) => d.slug),
    [definitions, values],
  );

  const setValue = (slug, value) => setValues((prev) => ({ ...prev, [slug]: value }));

  /** {slug: value} for the current category only, or null when nothing should be sent. */
  const payload = () => {
    if (!loaded || !definitions.length) return null;
    const out = {};
    definitions.forEach((d) => { out[d.slug] = isEmpty(values[d.slug]) ? null : values[d.slug]; });
    return out;
  };

  return {
    definitions,
    values,
    setValue,
    missing,
    payload,
    loading: !!subCategoryId && isLoading,
    error: loadError || (defsError ? 'Specification fields could not be loaded.' : ''),
    editable: loaded,
  };
}
