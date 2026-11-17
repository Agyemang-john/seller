'use client';

import React, { useMemo } from 'react';
import { Autocomplete, Box, MenuItem, TextField, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { fieldSx, FieldGroup } from './fields';

const TITLE_MAX = 150;

const CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'used', label: 'Used' },
  { value: 'refurbished', label: 'Refurbished' },
  { value: 'book', label: 'Book' },
  { value: 'grocery', label: 'Grocery' },
];

function CategoryPicker({ categories, value, onChange, error }) {
  const sorted = useMemo(() => [...categories].sort((a, b) => {
    const key = (o) => `${o.category?.main_category?.title ?? ''}\x00${o.category?.title ?? ''}\x00${o.title ?? ''}`;
    return key(a).localeCompare(key(b));
  }), [categories]);

  return (
    <Autocomplete
      options={sorted}
      groupBy={(o) => `${o.category?.main_category?.title ?? 'Other'}\x00${o.category?.title ?? 'Other'}`}
      getOptionLabel={(o) => o.title || ''}
      isOptionEqualToValue={(o, v) => o.id === v?.id}
      value={value}
      onChange={onChange}
      // Matches the department and aisle too, so "phone" finds every phone category.
      filterOptions={(options, { inputValue }) => {
        const q = inputValue.trim().toLowerCase();
        if (!q) return options;
        return options.filter((o) => [o.title, o.category?.title, o.category?.main_category?.title]
          .some((t) => (t || '').toLowerCase().includes(q)));
      }}
      renderGroup={(params) => {
        const [mainCat, cat] = params.group.split('\x00');
        return (
          <li key={params.key}>
            <Box sx={{ px: 2, pt: 1.25, pb: 0.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: -8, zIndex: 1 }}>
              <Typography sx={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', lineHeight: 1.2 }}>
                {mainCat}
              </Typography>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', lineHeight: 1.4 }}>{cat}</Typography>
            </Box>
            <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
          </li>
        );
      }}
      renderOption={({ key, ...props }, option) => (
        <Box key={key} component="li" {...props} sx={{ pl: '24px !important', minHeight: 44 }}>
          {option.title}
        </Box>
      )}
      renderInput={(params) => (
        <TextField {...params} label="Category" size="small" sx={fieldSx} required
          error={!!error} helperText={error || 'Search by name, e.g. "sneakers" or "phone case".'} />
      )}
    />
  );
}

export default function BasicsSection({
  formData, setField, formErrors, categories, brands,
  selectedCategory, selectedBrand, handleCategoryChange, handleBrandChange,
}) {
  const titleLength = (formData.title || '').length;

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <FieldGroup>
        <TextField
          label="Product title"
          required
          value={formData.title || ''}
          onChange={(e) => setField('title', e.target.value.slice(0, TITLE_MAX))}
          error={!!formErrors.title}
          helperText={formErrors.title || `Brand + what it is + key detail. ${titleLength}/${TITLE_MAX}`}
          placeholder="e.g. Crocs Unisex Classic Clog"
          fullWidth size="small" sx={fieldSx}
          inputProps={{ maxLength: TITLE_MAX, autoCapitalize: 'words' }}
        />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <CategoryPicker categories={categories} value={selectedCategory} onChange={handleCategoryChange}
              error={formErrors.sub_category || formErrors.category} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete
              options={brands}
              getOptionLabel={(o) => o.title || ''}
              isOptionEqualToValue={(o, v) => o.id === v?.id}
              value={selectedBrand}
              onChange={handleBrandChange}
              renderInput={(params) => (
                <TextField {...params} label="Brand" size="small" sx={fieldSx}
                  error={!!formErrors.brand} helperText={formErrors.brand || 'Leave empty if it has no brand.'} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField select label="Condition" size="small" fullWidth sx={fieldSx}
              value={formData.product_type || 'new'}
              onChange={(e) => setField('product_type', e.target.value)}
              error={!!formErrors.product_type} helperText={formErrors.product_type}>
              {CONDITIONS.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
          </Grid>
        </Grid>
      </FieldGroup>

      <FieldGroup title="Product codes" hint="Optional. They help you find the item in your stock, and let shoppers compare sellers of the same item.">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Your SKU" size="small" fullWidth sx={fieldSx}
              value={formData.seller_sku || ''}
              onChange={(e) => setField('seller_sku', e.target.value)}
              error={!!formErrors.seller_sku}
              helperText={formErrors.seller_sku || 'Your own stock code. Unique in your store.'}
              inputProps={{ maxLength: 64, autoCapitalize: 'characters' }} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField label="Barcode (GTIN / EAN / UPC)" size="small" fullWidth sx={fieldSx}
              value={formData.gtin || ''}
              onChange={(e) => setField('gtin', e.target.value.replace(/\D/g, ''))}
              error={!!formErrors.gtin}
              helperText={formErrors.gtin || 'The number under the barcode on the box.'}
              inputProps={{ maxLength: 20, inputMode: 'numeric' }} />
          </Grid>
        </Grid>
      </FieldGroup>
    </Box>
  );
}
