'use client';

import React from 'react';
import {
  Box, TextField, Autocomplete, MenuItem, Select, InputLabel,
  FormControl, Stack, FormHelperText, Typography,
  Chip, OutlinedInput, Divider,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import dynamic from 'next/dynamic';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

// ── Field section wrapper ─────────────────────────────────────────────────────
function FieldGroup({ title, children }) {
  return (
    <Box sx={{ mb: 3.5 }}>
      <Typography
        variant="caption"
        sx={{ display: 'block', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'text.disabled', fontSize: 10, mb: 1.75 }}
      >
        {title}
      </Typography>
      <Stack spacing={2}>
        {children}
      </Stack>
    </Box>
  );
}

// ── Image upload zone ─────────────────────────────────────────────────────────
function ImageUploadZone({ preview, onFileChange, label = 'Main product image', error }) {
  const inputId = `img-upload-${label.replace(/\s/g, '-')}`;
  return (
    <Box>
      <input accept="image/*" type="file" onChange={(e) => onFileChange(e, 'image')} style={{ display: 'none' }} id={inputId} />
      <label htmlFor={inputId}>
        <Box
          sx={{
            border: '2px dashed',
            borderColor: error ? 'error.main' : 'divider',
            borderRadius: '14px',
            p: 3,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.18s',
            bgcolor: 'action.hover',
            '&:hover': { borderColor: 'text.primary', bgcolor: 'action.selected' },
          }}
        >
          {preview ? (
            <Box>
              <Box
                component="img"
                src={preview}
                alt="Product preview"
                sx={{ maxHeight: 200, maxWidth: '100%', borderRadius: '8px', objectFit: 'contain', mb: 1.5 }}
              />
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Click to replace image
              </Typography>
            </Box>
          ) : (
            <Stack alignItems="center" spacing={1}>
              <Box sx={{ width: 44, height: 44, borderRadius: '12px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CloudUploadOutlinedIcon sx={{ fontSize: 22, color: 'text.secondary' }} />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {label}
                </Typography>
                <Typography variant="caption" color="text.disabled">
                  JPG, PNG · 400–1800px · max 2 MB · auto-cropped to square
                </Typography>
              </Box>
            </Stack>
          )}
        </Box>
      </label>
      {error && <FormHelperText error sx={{ mt: 0.75 }}>{error}</FormHelperText>}
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
// Imported items are entered in weeks, made-to-order in days; both are stored in days.
const SOURCING_UNIT = { imported: 7, made_to_order: 1 };

function SourcingFields({ formData, setFormData, formErrors, regions, fieldSx }) {
  const kind = formData.fulfilment_type || 'in_stock';
  const unit = SOURCING_UNIT[kind] || 1;
  const unitLabel = unit === 7 ? 'weeks' : 'days';
  const shown = (days) => (days ? Math.round(days / unit) : '');
  const setSpan = (field) => (e) => {
    const n = parseInt(e.target.value, 10);
    setFormData({ ...formData, [field]: Number.isFinite(n) && n > 0 ? n * unit : 0 });
  };
  const setKind = (e) => {
    const next = e.target.value;
    setFormData({
      ...formData,
      fulfilment_type: next,
      // Sensible starting point when switching type; the seller edits it.
      sourcing_min_days: next === 'imported' ? 28 : next === 'made_to_order' ? 7 : 0,
      sourcing_max_days: next === 'imported' ? 42 : next === 'made_to_order' ? 14 : 0,
      sourced_from: next === 'imported' ? formData.sourced_from : '',
    });
  };

  return (
    <FieldGroup title="Stock & sourcing">
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small" sx={fieldSx}>
            <InputLabel>How do you get this item?</InputLabel>
            <Select value={kind} onChange={setKind} label="How do you get this item?">
              <MenuItem value="in_stock">I have it in stock</MenuItem>
              <MenuItem value="imported">I order it from abroad after a sale</MenuItem>
              <MenuItem value="made_to_order">I make it after a sale</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        {kind === 'imported' && (
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Ordered from</InputLabel>
              <Select value={formData.sourced_from || ''} label="Ordered from"
                onChange={(e) => setFormData({ ...formData, sourced_from: e.target.value })}>
                <MenuItem value=""><em>Not shown</em></MenuItem>
                {regions.map((r) => <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        )}
        {kind !== 'in_stock' && (
          <>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label={`Shortest (${unitLabel})`} type="number" size="small" sx={fieldSx} fullWidth
                value={shown(formData.sourcing_min_days)} onChange={setSpan('sourcing_min_days')}
                inputProps={{ min: 1 }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <TextField label={`Longest (${unitLabel})`} type="number" size="small" sx={fieldSx} fullWidth
                value={shown(formData.sourcing_max_days)} onChange={setSpan('sourcing_max_days')}
                inputProps={{ min: 1, max: unit === 7 ? 10 : 70 }}
                error={!!formErrors.sourcing_max_days} helperText={formErrors.sourcing_max_days} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <FormHelperText sx={{ mx: 0 }}>
                How long it takes to have the item in hand, before you ship it. Shoppers see
                &ldquo;{kind === 'imported' ? 'Ships from abroad' : 'Made to order'}&rdquo; and the extra time, and
                must accept it at checkout. Your ship-by date is extended by the longest time. If you go past
                it, the shopper can cancel for a full refund.
              </FormHelperText>
            </Grid>
          </>
        )}
      </Grid>
    </FieldGroup>
  );
}

const ProductGeneralInfo = ({
  formData, setFormData, formErrors,
  categories, handleCategoryChange,
  brands, handleBrandChange,
  regions, MenuProps,
  handleDateChange, handleEditorChange, handleFileChange,
  imagePreview, selectedCategory, selectedBrand,
}) => {
  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '10px',
      '& fieldset': { borderColor: 'divider' },
    },
  };

  return (
    <Box>
      {/* ── Identity ─────────────────────────────────────────────────── */}
      <FieldGroup title="Product identity">
        <TextField label="Product title" value={formData.title || ''} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={!!formErrors.title} helperText={formErrors.title} fullWidth size="small" sx={fieldSx}
          placeholder="e.g. Premium Leather Wallet — Brown" />

        <TextField label="Your SKU (optional)" value={formData.seller_sku || ''}
          onChange={(e) => setFormData({ ...formData, seller_sku: e.target.value })}
          error={!!formErrors.seller_sku} helperText={formErrors.seller_sku || 'Your own stock code. Must be unique in your store.'}
          size="small" sx={{ ...fieldSx, maxWidth: { sm: 360 } }} inputProps={{ maxLength: 64 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete
              options={[...categories].sort((a, b) => {
                const ga = `${a.category?.main_category?.title ?? ''}\x00${a.category?.title ?? ''}\x00${a.title ?? ''}`;
                const gb = `${b.category?.main_category?.title ?? ''}\x00${b.category?.title ?? ''}\x00${b.title ?? ''}`;
                return ga.localeCompare(gb);
              })}
              groupBy={(o) => `${o.category?.main_category?.title ?? 'Other'}\x00${o.category?.title ?? 'Other'}`}
              getOptionLabel={(o) => o.title || ''}
              isOptionEqualToValue={(o, v) => o.id === v?.id}
              value={selectedCategory}
              onChange={handleCategoryChange}
              renderGroup={(params) => {
                const [mainCat, cat] = params.group.split('\x00');
                return (
                  <li key={params.key}>
                    <Box sx={{ px: 2, pt: 1.25, pb: 0.5, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider', position: 'sticky', top: -8, zIndex: 1 }}>
                      <Typography sx={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'text.disabled', lineHeight: 1.2 }}>
                        {mainCat}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                        <Typography sx={{ fontSize: 11, color: 'text.disabled', lineHeight: 1 }}>↳</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', lineHeight: 1.4 }}>{cat}</Typography>
                      </Box>
                    </Box>
                    <ul style={{ padding: 0, margin: 0 }}>{params.children}</ul>
                  </li>
                );
              }}
              renderOption={({ key, ...props }, option) => (
                <Box key={key} component="li" {...props} sx={{ pl: '28px !important', fontSize: 13 }}>
                  {option.title}
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} label="Category" size="small" sx={fieldSx}
                  error={!!formErrors.category} helperText={formErrors.category} />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete options={brands} getOptionLabel={(o) => o.title || ''} value={selectedBrand}
              onChange={handleBrandChange}
              renderInput={(params) => (
                <TextField {...params} label="Brand" size="small" sx={fieldSx}
                  error={!!formErrors.brand} helperText={formErrors.brand} />
              )} />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Product type</InputLabel>
              <Select value={formData.product_type || ''} onChange={(e) => setFormData({ ...formData, product_type: e.target.value })} label="Product type">
                <MenuItem value="new">New</MenuItem>
                <MenuItem value="used">Used</MenuItem>
                <MenuItem value="refurbished">Refurbished</MenuItem>
                <MenuItem value="book">Book</MenuItem>
                <MenuItem value="grocery">Grocery</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl fullWidth size="small" sx={fieldSx}>
              <InputLabel>Variants</InputLabel>
              <Select value={formData.variant || 'None'} onChange={(e) => setFormData({ ...formData, variant: e.target.value })} label="Variants">
                <MenuItem value="None">No variants</MenuItem>
                <MenuItem value="Size">Size only</MenuItem>
                <MenuItem value="Color">Colour only</MenuItem>
                <MenuItem value="Size-Color">Size + Colour</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </FieldGroup>

      <Divider sx={{ mb: 3.5 }} />

      {/* ── Pricing ──────────────────────────────────────────────────── */}
      <FieldGroup title="Pricing & stock">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Price (GHS)" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.price || ''} onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={!!formErrors.price} helperText={formErrors.price}
              inputProps={{ min: 0, step: '0.01' }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Old price (GHS)" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.old_price || ''} onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
              inputProps={{ min: 0, step: '0.01' }}
              helperText="Optional — used to show a strikethrough discount" />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Total quantity" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.total_quantity || ''} onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
              error={!!formErrors.totalQuantity} helperText={formErrors.totalQuantity}
              inputProps={{ min: 0 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Weight (kg)" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.weight || ''} onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              inputProps={{ min: 0, step: '0.01' }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Volume (m³)" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.volume || ''} onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              inputProps={{ min: 0, step: '0.001' }} />
          </Grid>
        </Grid>
      </FieldGroup>

      <Divider sx={{ mb: 3.5 }} />

      {/* ── Shipping region ───────────────────────────────────────────── */}
      <FieldGroup title="Availability">
        <FormControl fullWidth size="small" sx={fieldSx} error={!!formErrors.available_in_regions}>
          <InputLabel>Ships to</InputLabel>
          <Select
            multiple
            value={formData.available_in_regions || []}
            onChange={(e) => setFormData({ ...formData, available_in_regions: e.target.value })}
            input={<OutlinedInput label="Ships to" />}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((id) => {
                  const r = regions.find((r) => r.id === id);
                  return r ? <Chip key={id} label={r.name} size="small" sx={{ borderRadius: '6px', height: 22, fontSize: 11 }} /> : null;
                })}
              </Box>
            )}
            MenuProps={MenuProps}
          >
            {regions.map((r) => (
              <MenuItem key={r.id} value={r.id}
                sx={{ fontWeight: formData.available_in_regions?.includes(r.id) ? 600 : 400 }}>
                {r.name}
              </MenuItem>
            ))}
          </Select>
          {formErrors.available_in_regions && <FormHelperText>{formErrors.available_in_regions}</FormHelperText>}
        </FormControl>
      </FieldGroup>

      <Divider sx={{ mb: 3.5 }} />

      {/* ── Stock & sourcing (backend product/sourcing.py) ─────────────── */}
      <SourcingFields formData={formData} setFormData={setFormData} formErrors={formErrors}
        regions={regions} fieldSx={fieldSx} />

      <Divider sx={{ mb: 3.5 }} />

      {/* ── Product dates ─────────────────────────────────────────────── */}
      <FieldGroup title="Dates & shelf life">
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker label="Manufacture date" value={formData.mfd ? dayjs(formData.mfd) : null}
                onChange={handleDateChange}
                slotProps={{ textField: { size: 'small', fullWidth: true, sx: fieldSx, error: !!formErrors.mfd, helperText: formErrors.mfd } }} />
            </LocalizationProvider>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField label="Life span (months)" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.life || ''} onChange={(e) => setFormData({ ...formData, life: e.target.value })}
              inputProps={{ min: 0 }} />
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <TextField label="Return window (days)" type="number" size="small" sx={fieldSx} fullWidth
              value={formData.return_period_days || ''} onChange={(e) => setFormData({ ...formData, return_period_days: e.target.value })}
              inputProps={{ min: 0 }} />
          </Grid>
        </Grid>
      </FieldGroup>

      <Divider sx={{ mb: 3.5 }} />

      {/* ── Main image ────────────────────────────────────────────────── */}
      <FieldGroup title="Main image">
        <ImageUploadZone preview={imagePreview} onFileChange={handleFileChange} error={formErrors.image} />
      </FieldGroup>

      <Divider sx={{ mb: 3.5 }} />

      {/* ── Rich text sections ────────────────────────────────────────── */}
      <FieldGroup title="Product content">
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>Features</Typography>
          <Editor value={formData.features} onChange={handleEditorChange('features')} placeholder="List key product features…" />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>Description</Typography>
          <Editor value={formData.description} onChange={handleEditorChange('description')} placeholder="Describe the product in detail…" />
          {formErrors.description && <FormHelperText error>{formErrors.description}</FormHelperText>}
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>Specifications</Typography>
          <Editor value={formData.specifications} onChange={handleEditorChange('specifications')} placeholder="Technical specifications…" />
        </Box>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.75 }}>Delivery & Returns</Typography>
          <Editor value={formData.delivery_returns} onChange={handleEditorChange('delivery_returns')} placeholder="Shipping and return policy…" />
        </Box>
      </FieldGroup>
    </Box>
  );
};

export default ProductGeneralInfo;