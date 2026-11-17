'use client';

import React from 'react';
import { Box, FormHelperText, InputAdornment, MenuItem, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { fieldSx, FieldGroup, NumberField } from './fields';

// Imported items are entered in weeks, made-to-order in days; both are stored in days.
const SOURCING_UNIT = { imported: 7, made_to_order: 1 };

function Sourcing({ formData, setFormData, formErrors, regions }) {
  const kind = formData.fulfilment_type || 'in_stock';
  const unit = SOURCING_UNIT[kind] || 1;
  const unitLabel = unit === 7 ? 'weeks' : 'days';
  const shown = (days) => (days ? String(Math.round(days / unit)) : '');
  const setSpan = (field) => (text) => {
    const n = parseInt(text, 10);
    setFormData((prev) => ({ ...prev, [field]: Number.isFinite(n) && n > 0 ? n * unit : 0 }));
  };
  const setKind = (e) => {
    const next = e.target.value;
    setFormData((prev) => ({
      ...prev,
      fulfilment_type: next,
      // A sensible starting point when switching; the seller edits it.
      sourcing_min_days: next === 'imported' ? 28 : next === 'made_to_order' ? 7 : 0,
      sourcing_max_days: next === 'imported' ? 42 : next === 'made_to_order' ? 14 : 0,
      sourced_from: next === 'imported' ? prev.sourced_from : '',
    }));
  };

  return (
    <FieldGroup title="How you get it">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <TextField select fullWidth size="small" sx={fieldSx} label="Stock type" value={kind} onChange={setKind}>
            <MenuItem value="in_stock">I have it in stock</MenuItem>
            <MenuItem value="imported">I order it from abroad after a sale</MenuItem>
            <MenuItem value="made_to_order">I make it after a sale</MenuItem>
          </TextField>
        </Grid>
        {kind === 'imported' && (
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select fullWidth size="small" sx={fieldSx} label="Ordered from" value={formData.sourced_from || ''}
              onChange={(e) => setFormData((prev) => ({ ...prev, sourced_from: e.target.value }))}>
              <MenuItem value=""><em>Not shown</em></MenuItem>
              {regions.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
            </TextField>
          </Grid>
        )}
        {kind !== 'in_stock' && (
          <>
            <Grid size={{ xs: 6, md: 3 }}>
              <NumberField decimals={false} label={`Shortest (${unitLabel})`}
                value={shown(formData.sourcing_min_days)} onChange={setSpan('sourcing_min_days')} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <NumberField decimals={false} label={`Longest (${unitLabel})`}
                value={shown(formData.sourcing_max_days)} onChange={setSpan('sourcing_max_days')}
                error={!!formErrors.sourcing_max_days} helperText={formErrors.sourcing_max_days} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormHelperText sx={{ mx: 0 }}>
                How long until the item is in your hands, before you ship it. Shoppers see
                &ldquo;{kind === 'imported' ? 'Ships from abroad' : 'Made to order'}&rdquo; and the extra time, and
                accept it at checkout. Your ship-by date moves by the longest time; past it, the shopper can cancel
                for a full refund.
              </FormHelperText>
            </Grid>
          </>
        )}
      </Grid>
    </FieldGroup>
  );
}

export default function PriceStockSection({ formData, setField, setFormData, formErrors, regions }) {
  const price = parseFloat(formData.price);
  const was = parseFloat(formData.old_price);
  const discount = price > 0 && was > price ? Math.round((1 - price / was) * 100) : 0;
  const ghs = { startAdornment: <InputAdornment position="start">GHS</InputAdornment> };

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <FieldGroup title="Price">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberField label="Selling price" required value={formData.price}
              onChange={(v) => setField('price', v)} InputProps={ghs}
              error={!!formErrors.price} helperText={formErrors.price || 'What the shopper pays.'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <NumberField label="Was (optional)" value={formData.old_price}
              onChange={(v) => setField('old_price', v)} InputProps={ghs}
              error={!!formErrors.old_price || (was > 0 && price > 0 && was <= price)}
              helperText={formErrors.old_price
                || (was > 0 && price > 0 && was <= price ? 'Should be higher than the selling price, or leave empty.'
                  : discount ? `Shoppers see ${discount}% off.` : 'Shown crossed out, to show a saving.')} />
          </Grid>
        </Grid>
      </FieldGroup>

      <FieldGroup title="Stock & package">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <NumberField decimals={false} label="Quantity in stock" required value={formData.total_quantity}
              onChange={(v) => setField('total_quantity', v)}
              error={!!(formErrors.totalQuantity || formErrors.total_quantity)}
              helperText={formErrors.totalQuantity || formErrors.total_quantity || (formData.variant !== 'None' ? 'Total across all variants.' : ' ')} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <NumberField label="Weight" value={formData.weight} onChange={(v) => setField('weight', v)}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }}
              error={!!formErrors.weight} helperText={formErrors.weight || 'Packed, for delivery.'} />
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <NumberField label="Volume" decimals={3} value={formData.volume} onChange={(v) => setField('volume', v)}
              InputProps={{ endAdornment: <InputAdornment position="end">m³</InputAdornment> }}
              error={!!formErrors.volume} helperText={formErrors.volume || ' '} />
          </Grid>
        </Grid>
        <Typography variant="caption" color="text.secondary">
          Weight decides the courier&apos;s price, so weigh the parcel as you&apos;d send it.
        </Typography>
      </FieldGroup>

      <Sourcing formData={formData} setFormData={setFormData} formErrors={formErrors} regions={regions} />
    </Box>
  );
}
