'use client';

/**
 * Structured specifications for one product (backend: attributes/). The fields
 * come from the category chosen on this page; shoppers filter and compare by
 * them, and the words are searchable. State lives in form/useProductSpecs.js
 * and is saved with the product.
 */

import {
  Alert, Box, Chip, FormControlLabel, InputAdornment, MenuItem,
  Radio, RadioGroup, Skeleton, Stack, TextField, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { fieldSx, NumberField } from './form/fields';

function Field({ def, value, onChange, missing }) {
  const label = def.name;
  const helper = missing ? 'Required for this category.' : def.help_text;

  if (def.type === 'choice' && def.multi) {
    const selected = Array.isArray(value) ? value : [];
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.75 }}>{label}{def.required ? ' *' : ''}</Typography>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
          {def.options.map((o) => {
            const on = selected.includes(o.id);
            return (
              <Chip key={o.id} label={o.value} clickable color={on ? 'primary' : 'default'} variant={on ? 'filled' : 'outlined'}
                sx={{ minHeight: 36, borderRadius: '10px', fontWeight: 600 }}
                onClick={() => onChange(on ? selected.filter((x) => x !== o.id) : [...selected, o.id])} />
            );
          })}
        </Stack>
        {helper && <Typography variant="caption" color={missing ? 'error' : 'text.secondary'}>{helper}</Typography>}
      </Box>
    );
  }
  if (def.type === 'choice') {
    return (
      <TextField select fullWidth size="small" sx={fieldSx} label={label} required={def.required} value={value ?? ''}
        error={missing} helperText={helper}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}>
        <MenuItem value=""><em>Not set</em></MenuItem>
        {def.options.map((o) => <MenuItem key={o.id} value={o.id}>{o.value}</MenuItem>)}
      </TextField>
    );
  }
  if (def.type === 'number') {
    return (
      <NumberField label={label} required={def.required} value={value == null ? '' : String(value)} decimals={4}
        error={missing} helperText={helper}
        onChange={(v) => onChange(v === '' ? null : v)}
        InputProps={def.unit ? { endAdornment: <InputAdornment position="end">{def.unit}</InputAdornment> } : undefined} />
    );
  }
  if (def.type === 'boolean') {
    return (
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}{def.required ? ' *' : ''}</Typography>
        <RadioGroup row value={value === true ? 'yes' : value === false ? 'no' : ''}
          onChange={(e) => onChange(e.target.value === 'yes')}>
          <FormControlLabel value="yes" control={<Radio />} label="Yes" />
          <FormControlLabel value="no" control={<Radio />} label="No" />
        </RadioGroup>
        {helper && <Typography variant="caption" color={missing ? 'error' : 'text.secondary'}>{helper}</Typography>}
      </Box>
    );
  }
  return (
    <TextField fullWidth size="small" sx={fieldSx} label={label} required={def.required} value={value ?? ''}
      error={missing} helperText={helper} inputProps={{ maxLength: 255 }} onChange={(e) => onChange(e.target.value)} />
  );
}

export default function ProductSpecs({ specs, hasCategory }) {
  const { definitions, values, setValue, missing, loading, error, editable } = specs;

  if (!hasCategory) {
    return <Alert severity="info" sx={{ borderRadius: '10px' }}>Choose a category in Basics, and the details shoppers filter by appear here.</Alert>;
  }
  if (error) return <Alert severity="error" sx={{ borderRadius: '10px' }}>{error}</Alert>;
  if (loading || !editable) {
    return <Stack spacing={1.5}>{[0, 1, 2].map((i) => <Skeleton key={i} variant="rounded" height={40} />)}</Stack>;
  }
  if (!definitions.length) {
    return (
      <Alert severity="info" sx={{ borderRadius: '10px' }}>
        This category has no specification fields yet. Describe the details in the Description section instead.
      </Alert>
    );
  }

  // Wide fields (chips, yes/no) take the full row; the rest pair up on wider screens.
  const wide = (d) => d.type === 'boolean' || (d.type === 'choice' && d.multi);

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Shoppers filter, compare and search by these. Fill in as many as you can.
      </Typography>
      {missing.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: '10px' }}>
          Still needed: {definitions.filter((d) => missing.includes(d.slug)).map((d) => d.name).join(', ')}.
        </Alert>
      )}
      <Grid container spacing={2}>
        {definitions.map((d) => (
          <Grid key={d.slug} size={{ xs: 12, md: wide(d) ? 12 : 6 }}>
            <Field def={d} value={values[d.slug]} missing={missing.includes(d.slug)} onChange={(v) => setValue(d.slug, v)} />
          </Grid>
        ))}
      </Grid>
    </Stack>
  );
}
