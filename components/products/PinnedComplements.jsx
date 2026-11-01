'use client';

/**
 * "Buy it with" (backend: recommendation PinnedComplement). Up to three of your
 * own products shown first in "Frequently bought together" on this product's page.
 */

import { useEffect, useState } from 'react';
import { Autocomplete, Box, Button, TextField, Typography } from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError } from '@/libs/seller-ops';

export default function PinnedComplements({ id }) {
  const [value, setValue] = useState([]);
  const [options, setOptions] = useState([]);
  const [input, setInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    createAxiosClient().get(`/api/v1/recommendations/seller/pinned/${id}/`)
      .then(({ data }) => setValue(data.others)).catch(() => {});
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => {
      createAxiosClient().get('/api/v1/vendor/products/', { params: { search: input, page_size: 20 } })
        .then(({ data }) => setOptions((data.results || []).filter((p) => String(p.id) !== String(id))
          .map((p) => ({ id: p.id, title: p.title }))))
        .catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [input, id]);

  if (!id) return null;

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await createAxiosClient().put(`/api/v1/recommendations/seller/pinned/${id}/`,
        { others: value.map((v) => v.id) });
      setValue(data.others);
      toast.success('Saved');
    } catch (err) {
      toast.error(apiError(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Buy it with</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Pick up to three of your products that go with this one (a case for a phone, batteries for a toy). They&apos;re
        shown first in &quot;Frequently bought together&quot; with an &quot;Add all to cart&quot; button.
      </Typography>
      <Autocomplete multiple options={options} value={value} filterSelectedOptions
                    getOptionLabel={(o) => o.title} isOptionEqualToValue={(a, b) => a.id === b.id}
                    onChange={(_, v) => setValue(v.slice(0, 3))} onInputChange={(_, v) => setInput(v)}
                    renderInput={(params) => <TextField {...params} size="small" label="Your products" />} />
      <Button sx={{ mt: 1.5 }} variant="outlined" onClick={save} disabled={saving}>Save</Button>
    </Box>
  );
}
