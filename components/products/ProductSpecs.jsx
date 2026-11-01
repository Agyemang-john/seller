'use client';

/**
 * Structured specifications for one product (backend: attributes/).
 * The fields come from the product's saved category; shoppers filter and
 * compare by them, and the words are searchable. Saved on their own button,
 * separately from the main product form.
 */

import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Checkbox, Chip, CircularProgress, FormControlLabel, InputAdornment, MenuItem,
  Radio, RadioGroup, Stack, TextField, Typography,
} from '@mui/material';
import toast from 'react-hot-toast';
import { createAxiosClient } from '@/utils/clientFetch';
import { apiError } from '@/libs/seller-ops';

function Field({ def, value, onChange }) {
  const label = `${def.name}${def.required ? ' *' : ''}`;
  if (def.type === 'choice' && def.multi) {
    const selected = Array.isArray(value) ? value : [];
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>{label}</Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {def.options.map((o) => {
            const on = selected.includes(o.id);
            return (
              <Chip key={o.id} label={o.value} clickable color={on ? 'primary' : 'default'} variant={on ? 'filled' : 'outlined'}
                    onClick={() => onChange(on ? selected.filter((x) => x !== o.id) : [...selected, o.id])} />
            );
          })}
        </Stack>
        {def.help_text && <Typography variant="caption" color="text.secondary">{def.help_text}</Typography>}
      </Box>
    );
  }
  if (def.type === 'choice') {
    return (
      <TextField select fullWidth size="small" label={label} value={value ?? ''} helperText={def.help_text}
                 onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
        <MenuItem value=""><em>Not set</em></MenuItem>
        {def.options.map((o) => <MenuItem key={o.id} value={o.id}>{o.value}</MenuItem>)}
      </TextField>
    );
  }
  if (def.type === 'number') {
    return (
      <TextField fullWidth size="small" type="number" label={label} value={value ?? ''} helperText={def.help_text}
                 onChange={(e) => onChange(e.target.value === '' ? null : e.target.value)}
                 InputProps={def.unit ? { endAdornment: <InputAdornment position="end">{def.unit}</InputAdornment> } : undefined} />
    );
  }
  if (def.type === 'boolean') {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <RadioGroup row value={value === true ? 'yes' : value === false ? 'no' : ''}
                    onChange={(e) => onChange(e.target.value === 'yes')}>
          <FormControlLabel value="yes" control={<Radio size="small" />} label="Yes" />
          <FormControlLabel value="no" control={<Radio size="small" />} label="No" />
        </RadioGroup>
      </Box>
    );
  }
  return (
    <TextField fullWidth size="small" label={label} value={value ?? ''} helperText={def.help_text}
               inputProps={{ maxLength: 255 }} onChange={(e) => onChange(e.target.value)} />
  );
}

export default function ProductSpecs({ id }) {
  const [form, setForm] = useState(null);
  const [values, setValues] = useState({});
  const [dirty, setDirty] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    createAxiosClient().get(`/api/v1/attributes/seller/products/${id}/`)
      .then(({ data }) => { setForm(data); setValues(data.values || {}); })
      .catch((err) => setError(apiError(err, 'Could not load specifications.')));
  }, [id]);

  if (!id) {
    return <Alert severity="info">Save the product first. Then you can add its specifications here.</Alert>;
  }
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!form) return <CircularProgress size={24} />;
  if (!form.definitions.length) {
    return (
      <Alert severity="info">
        There are no specification fields for this product&apos;s category yet. Use the Additional information
        box on the General step to describe it.
      </Alert>
    );
  }

  const change = (slug, v) => {
    setValues((prev) => ({ ...prev, [slug]: v }));
    setDirty((prev) => ({ ...prev, [slug]: true }));
  };

  const save = async () => {
    setSaving(true);
    const payload = {};
    Object.keys(dirty).forEach((slug) => { payload[slug] = values[slug] ?? null; });
    try {
      const { data } = await createAxiosClient().put(`/api/v1/attributes/seller/products/${id}/`, { values: payload });
      setForm(data);
      setValues(data.values || {});
      setDirty({});
      toast.success('Specifications saved');
    } catch (err) {
      toast.error(apiError(err, 'Could not save specifications.'));
    } finally {
      setSaving(false);
    }
  };

  const missing = form.missing_required || [];

  return (
    <Stack spacing={2.5}>
      <Typography variant="body2" color="text.secondary">
        Shoppers use these to filter, compare and search. Fields come from the product&apos;s saved category; if you
        just changed the category, save the product first.
      </Typography>
      {missing.length > 0 && (
        <Alert severity="warning">
          Please fill in: {form.definitions.filter((d) => missing.includes(d.slug)).map((d) => d.name).join(', ')}.
        </Alert>
      )}
      {form.definitions.map((d) => (
        <Field key={d.slug} def={d} value={values[d.slug]} onChange={(v) => change(d.slug, v)} />
      ))}
      <Box>
        <Button variant="contained" disableElevation onClick={save} disabled={saving || !Object.keys(dirty).length}>
          {saving ? 'Saving…' : 'Save specifications'}
        </Button>
      </Box>
    </Stack>
  );
}
