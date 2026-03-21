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
                  JPG, PNG · 500–1200px · max 2 MB · auto-cropped to square
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

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Autocomplete options={categories} getOptionLabel={(o) => o.title || ''} value={selectedCategory}
              onChange={handleCategoryChange}
              renderInput={(params) => (
                <TextField {...params} label="Category" size="small" sx={fieldSx}
                  error={!!formErrors.category} helperText={formErrors.category} />
              )} />
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