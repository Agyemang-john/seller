'use client';

/**
 * "Buy it with" (backend: recommendation PinnedComplement). Up to three of your
 * own products shown first in "Frequently bought together" on this product's page.
 * Picked on the form and saved right after the product (usePinnedComplements).
 */

import { useEffect, useRef, useState } from 'react';
import { Autocomplete, Box, TextField, Typography } from '@mui/material';
import { createAxiosClient } from '@/utils/clientFetch';
import { fieldSx } from './form/fields';

const MAX = 3;

export function usePinnedComplements(productId) {
  const [value, setValue] = useState([]);
  const [loaded, setLoaded] = useState(!productId);
  const touched = useRef(false);

  useEffect(() => {
    if (!productId) return;
    createAxiosClient().get(`/api/v1/recommendations/seller/pinned/${productId}/`)
      .then(({ data }) => { setValue(data.others || []); setLoaded(true); })
      .catch(() => {});
  }, [productId]);

  const change = (next) => { touched.current = true; setValue(next.slice(0, MAX)); };

  /** Save for `savedId` if the seller changed anything. Never throws; returns an error message or ''. */
  const save = async (savedId) => {
    if (!touched.current || !loaded || !savedId) return '';
    try {
      await createAxiosClient().put(`/api/v1/recommendations/seller/pinned/${savedId}/`, { others: value.map((v) => v.id) });
      touched.current = false;
      return '';
    } catch {
      return '"Buy it with" could not be saved. Open the product again to retry.';
    }
  };

  return { value, change, save, loaded };
}

export default function PinnedComplements({ productId, pinned }) {
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const t = setTimeout(() => {
      createAxiosClient().get('/api/v1/vendor/products/', { params: { search: input, page_size: 20 } })
        .then(({ data }) => setOptions((data.results || []).filter((p) => String(p.id) !== String(productId))
          .map((p) => ({ id: p.id, title: p.title }))))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [input, productId]);

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>Buy it with</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Up to three of your products that go with this one (a case for a phone, batteries for a toy). They&apos;re
        shown first in &quot;Frequently bought together&quot; with an &quot;Add all to cart&quot; button.
      </Typography>
      <Autocomplete multiple options={options} value={pinned.value} filterSelectedOptions disabled={!pinned.loaded}
        getOptionLabel={(o) => o.title} isOptionEqualToValue={(a, b) => a.id === b.id}
        getOptionDisabled={() => pinned.value.length >= MAX}
        onChange={(_, v) => pinned.change(v)} onInputChange={(_, v) => setInput(v)}
        renderInput={(params) => (
          <TextField {...params} size="small" sx={fieldSx} label="Your products"
            placeholder={pinned.value.length >= MAX ? '' : 'Search your products'}
            helperText={`${pinned.value.length} of ${MAX}`} />
        )} />
    </Box>
  );
}
