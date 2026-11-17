'use client';

import React, { useEffect, useCallback } from 'react';
import {
  Box, TextField, MenuItem, IconButton, Tooltip, Button, InputAdornment,
  Typography, Stack, Chip, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import useSWR from 'swr';
import { validateImage, squareifyImage } from './fileValidators';
import { newVariantKey } from './galleryUploads';
import VariantGallery from './VariantGallery';
import { fieldSx, NumberField } from './form/fields';
import { fetcher } from '@/components/dashboard/DashboardUI';
import Swal from 'sweetalert2';

const VARIANT_TYPES = [
  { value: 'None', label: 'No' },
  { value: 'Size', label: 'Size' },
  { value: 'Color', label: 'Colour' },
  { value: 'Size-Color', label: 'Size + colour' },
];

// ── Single variant card ────────────────────────────────────────────────────────
function VariantCard({ variant, index, variantType, sizes, colors, imagePreview, galleryLimit, error, onFieldChange, onImageChange, onGalleryChange, onRemove }) {
  const inputId = `variant-img-${variant.key || index}`;
  const showSize  = ['Size', 'Size-Color'].includes(variantType);
  const showColor = ['Color', 'Size-Color'].includes(variantType);

  const selectedSize  = sizes.find((s) => Number(s.id) === Number(variant.size));
  const selectedColor = colors.find((c) => Number(c.id) === Number(variant.color));

  return (
    <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: error ? 'error.light' : 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, flexWrap: 'wrap', rowGap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', color: 'text.secondary', fontSize: 11 }}>
            VARIANT {index + 1}
          </Typography>
          {selectedSize && <Chip label={selectedSize.name} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 600, borderRadius: '6px' }} />}
          {selectedColor && (
            <Chip label={selectedColor.name} size="small"
              avatar={<Box component="span" sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: selectedColor.code || '#ccc', border: '1px solid rgba(0,0,0,0.15)' }} />}
              sx={{ height: 20, fontSize: 11, fontWeight: 600, borderRadius: '6px' }} />
          )}
        </Stack>
        <Tooltip title="Remove variant">
          <IconButton aria-label={`Remove variant ${index + 1}`} onClick={() => onRemove(index)}
            sx={{ width: 36, height: 36, borderRadius: '8px', color: 'text.secondary', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          {/* Photo: a thumbnail beside the fields on every screen size */}
          <Grid size={{ xs: 4, sm: 3 }}>
            <input type="file" accept="image/*" onChange={(e) => onImageChange(index, e.target.files[0])} hidden id={inputId} />
            <Box component="label" htmlFor={inputId}
              sx={{ aspectRatio: '1', borderRadius: '12px', border: '2px dashed', borderColor: 'divider', overflow: 'hidden',
                cursor: 'pointer', bgcolor: 'action.hover', position: 'relative', display: 'flex', alignItems: 'center',
                justifyContent: 'center', '&:hover': { borderColor: 'text.primary' } }}>
              {imagePreview ? (
                <Box component="img" src={imagePreview} alt={`Variant ${index + 1}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
              ) : (
                <Stack alignItems="center" spacing={0.25} sx={{ textAlign: 'center', px: 0.5 }}>
                  <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11, fontWeight: 600, lineHeight: 1.2 }}>Photo</Typography>
                </Stack>
              )}
            </Box>
          </Grid>

          <Grid size={{ xs: 8, sm: 9 }}>
            <Grid container spacing={1.5}>
              {showSize && (
                <Grid size={{ xs: 12, md: showColor ? 6 : 12 }}>
                  <TextField select label="Size" size="small" fullWidth sx={fieldSx}
                    error={!!error?.size} helperText={error?.size}
                    value={variant.size || ''} onChange={(e) => onFieldChange(index, 'size', e.target.value)}>
                    <MenuItem value="">— No size —</MenuItem>
                    {sizes.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', gap: 2 }}>
                          <span>{s.name}</span>
                          {s.code && <Typography variant="caption" color="text.disabled">{s.code}</Typography>}
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              {showColor && (
                <Grid size={{ xs: 12, md: showSize ? 6 : 12 }}>
                  <TextField select label="Colour" size="small" fullWidth sx={fieldSx}
                    error={!!error?.color} helperText={error?.color}
                    value={variant.color || ''} onChange={(e) => onFieldChange(index, 'color', e.target.value)}>
                    <MenuItem value="">— No colour —</MenuItem>
                    {colors.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: c.code || '#ccc', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
                          <span>{c.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
              <Grid size={{ xs: 12, sm: 6 }}>
                <NumberField label="Price" required value={variant.price ?? ''}
                  onChange={(v) => onFieldChange(index, 'price', v)}
                  InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }}
                  error={!!error?.price} helperText={error?.price} />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <NumberField decimals={false} label="Quantity" value={variant.quantity ?? ''}
                  onChange={(v) => onFieldChange(index, 'quantity', v)} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField label="SKU (optional)" size="small" fullWidth sx={fieldSx}
                  value={variant.seller_sku ?? ''} onChange={(e) => onFieldChange(index, 'seller_sku', e.target.value)}
                  inputProps={{ maxLength: 64, autoCapitalize: 'characters' }} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <VariantGallery index={index} gallery={variant.gallery} limit={galleryLimit} onChange={onGalleryChange} />
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const VariantRow = ({
  formData, setFormData, formErrors = {},
  variants: localVariants, setVariants: setLocalVariants,
  sizes = [], colors = [],
  variantImagePreviews = {}, setVariantImagePreviews,
}) => {
  // Extra photos per variant are a paid feature (payments/entitlements.py).
  const { data: plan } = useSWR('/api/v1/vendor/plan/', fetcher, { revalidateOnFocus: false });
  const galleryLimit = plan ? (plan.max_images_per_variant ?? 0) : null;
  const variantErrors = formErrors.variantRows || {};

  // Parent `variants` state is the single source of truth; mirror it one-way into formData.
  // (Two-way syncing with a local copy ping-ponged into an infinite update loop — React #185.)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      variants: localVariants.map((v) => ({ ...v, image: v.image instanceof File ? v.image : null })),
    }));
  }, [localVariants, setFormData]);

  const handleFieldChange = useCallback((index, field, value) => {
    setLocalVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value === '' && (field === 'size' || field === 'color') ? null : value };
      return updated;
    });
  }, [setLocalVariants]);

  const handleGalleryChange = useCallback((index, update) => {
    setLocalVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], gallery: update(updated[index].gallery || []) };
      return updated;
    });
  }, [setLocalVariants]);

  const handleImageChange = useCallback(async (index, file) => {
    if (!file) return;
    const squaredFile = await squareifyImage(file, 'pad', '#FFFFFF');
    const validation = await validateImage(squaredFile, { maxSizeMB: 2, minResolution: 400, maxResolution: 1800, checkBackground: true });
    if (!validation.valid) {
      Swal.fire({ icon: 'error', title: 'Invalid image', html: validation.errors.join('<br/>') });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setVariantImagePreviews((prev) => ({ ...prev, [index]: reader.result }));
      setLocalVariants((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: squaredFile };
        return updated;
      });
    };
    reader.readAsDataURL(squaredFile);
  }, [setVariantImagePreviews, setLocalVariants]);

  const handleAdd = () => {
    // Starts at the product's price: a variant price is what the shopper pays,
    // and an untouched 0 would sell it for free.
    setLocalVariants((prev) => [...prev, {
      id: null, key: newVariantKey(), size: null, color: null, image: null, title: '',
      quantity: '1', price: formData.price || '', seller_sku: '', gallery: [],
    }]);
  };

  const handleRemove = (index) => {
    setLocalVariants((prev) => prev.filter((_, i) => i !== index));
    setVariantImagePreviews((prev) => {
      const next = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k, 10);
        if (ki < index) next[ki] = v;
        else if (ki > index) next[ki - 1] = v;
      });
      return next;
    });
  };

  const setType = (_, value) => {
    if (!value) return;
    setFormData((prev) => ({ ...prev, variant: value }));
    if (value !== 'None' && localVariants.length === 0) handleAdd();
  };

  const isDisabled = formData.variant === 'None';

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Does this item come in different versions?</Typography>
      <ToggleButtonGroup exclusive value={formData.variant || 'None'} onChange={setType} size="small"
        sx={{ flexWrap: 'wrap', gap: 1, mb: 2.5, '& .MuiToggleButtonGroup-grouped': {
          border: '1px solid !important', borderColor: 'divider', borderRadius: '10px !important', mx: 0,
          px: 2, minHeight: 40, textTransform: 'none', fontWeight: 600,
          '&.Mui-selected': { bgcolor: 'text.primary', color: 'background.paper', borderColor: 'text.primary', '&:hover': { bgcolor: 'text.secondary' } },
        } }}>
        {VARIANT_TYPES.map((t) => <ToggleButton key={t.value} value={t.value}>{t.label}</ToggleButton>)}
      </ToggleButtonGroup>

      {isDisabled ? (
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: '16px', p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <InventoryOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>One version only</Typography>
          <Typography variant="caption" color="text.secondary">
            {localVariants.length
              ? `Your ${localVariants.length} saved variant${localVariants.length === 1 ? ' is' : 's are'} hidden. Pick Size or Colour to see ${localVariants.length === 1 ? 'it' : 'them'} again.`
              : 'If shoppers choose a size or colour, pick one above.'}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            {localVariants.length} variant{localVariants.length === 1 ? '' : 's'}. Each has its own price and stock.
          </Typography>
          <Stack spacing={1.5}>
            {localVariants.map((variant, i) => (
              <VariantCard
                key={variant.key || i}
                variant={variant}
                index={i}
                variantType={formData.variant}
                sizes={sizes}
                colors={colors}
                imagePreview={variantImagePreviews[i]}
                galleryLimit={galleryLimit}
                error={variantErrors[i]}
                onFieldChange={handleFieldChange}
                onImageChange={handleImageChange}
                onGalleryChange={handleGalleryChange}
                onRemove={handleRemove}
              />
            ))}
          </Stack>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} fullWidth
            sx={{ mt: 1.5, minHeight: 44, borderRadius: '10px', borderColor: 'divider', borderStyle: 'dashed', color: 'text.primary', fontWeight: 600,
              '&:hover': { borderColor: 'text.primary', borderStyle: 'dashed' } }}>
            Add a variant
          </Button>
        </>
      )}
    </Box>
  );
};

export default VariantRow;
