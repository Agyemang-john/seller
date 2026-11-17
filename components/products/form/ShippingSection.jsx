'use client';

import React from 'react';
import { Autocomplete, Box, Chip, TextField, Typography } from '@mui/material';
import DeliveryOptions from '../DeliveryOptions';
import { fieldSx } from './fields';

export default function ShippingSection({ formData, setField, formErrors, regions, fieldOptions, deliveryOptions, handleDeliveryOptionsChange }) {
  const selected = regions.filter((r) => (formData.available_in_regions || []).map(String).includes(String(r.id)));

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>Ships to</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Countries you deliver this item to. Shoppers elsewhere see that it doesn&apos;t ship to them.
        </Typography>
        <Autocomplete
          multiple
          options={regions}
          value={selected}
          disableCloseOnSelect
          getOptionLabel={(o) => o.name || ''}
          isOptionEqualToValue={(a, b) => String(a.id) === String(b.id)}
          onChange={(_, v) => setField('available_in_regions', v.map((r) => r.id))}
          renderTags={(value, getTagProps) => value.map((r, i) => {
            const { key, ...tagProps } = getTagProps({ index: i });
            return <Chip key={key} {...tagProps} label={r.name} size="small" sx={{ borderRadius: '8px' }} />;
          })}
          renderInput={(params) => (
            <TextField {...params} size="small" sx={fieldSx} label="Countries" required={!selected.length}
              placeholder={selected.length ? '' : 'Search countries'}
              error={!!formErrors.available_in_regions} helperText={formErrors.available_in_regions} />
          )}
        />
      </Box>

      <DeliveryOptions
        fieldOptions={fieldOptions}
        onOptionsChange={handleDeliveryOptionsChange}
        deliveryOptions={deliveryOptions}
        error={formErrors.delivery_options}
      />
    </Box>
  );
}
