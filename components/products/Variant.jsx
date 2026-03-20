'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, TextField, MenuItem, IconButton, Tooltip, Button,
  Typography, Stack, Chip, Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import { validateImage } from './fileValidators';
import Swal from 'sweetalert2';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '& fieldset': { borderColor: 'divider' },
  },
};

// ── Single variant card ────────────────────────────────────────────────────────
function VariantCard({ variant, index, formData, sizes, colors, imagePreview, onFieldChange, onImageChange, onRemove }) {
  const inputId = `variant-img-${index}`;
  const showSize  = ['Size', 'Size-Color'].includes(formData.variant);
  const showColor = ['Color', 'Size-Color'].includes(formData.variant);

  const selectedSize  = sizes.find((s) => Number(s.id) === Number(variant.size));
  const selectedColor = colors.find((c) => Number(c.id) === Number(variant.color));

  return (
    <Box
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        transition: 'box-shadow 0.18s',
        '&:hover': { boxShadow: '0 4px 20px rgba(0,0,0,0.07)' },
      }}
    >
      {/* Card header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1.25, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', color: 'text.disabled', fontSize: 10 }}>
            VARIANT {index + 1}
          </Typography>
          {selectedSize && (
            <Chip label={selectedSize.name} size="small" sx={{ height: 18, fontSize: 10, fontWeight: 600, borderRadius: '5px' }} />
          )}
          {selectedColor && (
            <Chip
              label={selectedColor.name}
              size="small"
              sx={{ height: 18, fontSize: 10, fontWeight: 600, borderRadius: '5px', bgcolor: selectedColor.code, color: '#ffffff' }}
            />
          )}
        </Stack>
        <Tooltip title="Remove variant">
          <IconButton size="small" onClick={() => onRemove(index)}
            sx={{ borderRadius: '6px', color: 'text.disabled', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
            <DeleteOutlineIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          {/* Image column */}
          <Grid size={{ xs: 12, sm: 3 }}>
            <input type="file" accept="image/*" onChange={(e) => onImageChange(index, e.target.files[0])}
              style={{ display: 'none' }} id={inputId} />
            <label htmlFor={inputId}>
              <Box
                sx={{
                  aspectRatio: '1', borderRadius: '12px', border: '2px dashed',
                  borderColor: 'divider', overflow: 'hidden', cursor: 'pointer',
                  bgcolor: 'action.hover', position: 'relative',
                  transition: 'border-color 0.18s',
                  '&:hover': { borderColor: 'text.primary' },
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {imagePreview ? (
                  <>
                    <Box component="img" src={imagePreview} alt={`Variant ${index + 1}`}
                      sx={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
                    <Box sx={{
                      position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'background-color 0.18s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.3)' },
                    }}>
                      <VisibilityOutlinedIcon sx={{ color: '#ffffff', opacity: 0, fontSize: 20, '&:hover': { opacity: 1 } }} />
                    </Box>
                  </>
                ) : (
                  <Stack alignItems="center" spacing={0.5}>
                    <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
                    <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
                      Add image
                    </Typography>
                  </Stack>
                )}
              </Box>
            </label>
          </Grid>

          {/* Fields */}
          <Grid size={{ xs: 12, sm: 9 }}>
            <Grid container spacing={1.5}>
              {showSize && (
                <Grid size={{ xs: 12, sm: showColor ? 6 : 12 }}>
                  <TextField select label="Size" size="small" fullWidth sx={fieldSx}
                    value={variant.size || ''}
                    onChange={(e) => onFieldChange(index, 'size', e.target.value)}>
                    <MenuItem value="">— No size —</MenuItem>
                    {sizes.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%' }}>
                          <span>{s.name}</span>
                          {s.code && <Typography variant="caption" color="text.disabled">{s.code}</Typography>}
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              {showColor && (
                <Grid size={{ xs: 12, sm: showSize ? 6 : 12 }}>
                  <TextField select label="Colour" size="small" fullWidth sx={fieldSx}
                    value={variant.color || ''}
                    onChange={(e) => onFieldChange(index, 'color', e.target.value)}>
                    <MenuItem value="">— No colour —</MenuItem>
                    {colors.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: c.code || '#ccc', border: '1px solid', borderColor: 'divider', flexShrink: 0 }} />
                          <span>{c.name}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              <Grid size={{ xs: 6 }}>
                <TextField label="Quantity" type="number" size="small" fullWidth sx={fieldSx}
                  value={variant.quantity ?? 1}
                  onChange={(e) => onFieldChange(index, 'quantity', parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }} />
              </Grid>

              <Grid size={{ xs: 6 }}>
                <TextField label="Price (GHS)" type="number" size="small" fullWidth sx={fieldSx}
                  value={variant.price ?? 0}
                  onChange={(e) => onFieldChange(index, 'price', parseFloat(e.target.value) || 0)}
                  inputProps={{ min: 0, step: '0.01' }} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const VariantRow = ({
  formData, setFormData,
  variants: propVariants = [], setVariants,
  sizes = [], colors = [],
  variantImagePreviews = {}, setVariantImagePreviews,
}) => {
  const [localVariants, setLocalVariants] = useState(propVariants);

  useEffect(() => { setLocalVariants(propVariants); }, [propVariants]);

  // Sync up to parent
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      variants: localVariants.map((v) => ({ ...v, image: v.image instanceof File ? v.image : null })),
    }));
    if (setVariants) setVariants(localVariants);
  }, [localVariants]);

  const handleFieldChange = useCallback((index, field, value) => {
    setLocalVariants((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value === '' ? null : value };
      return updated;
    });
  }, []);

  const handleImageChange = useCallback(async (index, file) => {
    if (!file) return;
    const validation = await validateImage(file, { maxSizeMB: 2, minResolution: 700, maxResolution: 1200, mustBeSquare: true, checkBackground: true });
    if (!validation.valid) {
      Swal.fire({ icon: 'error', title: 'Invalid image', html: validation.errors.join('<br/>') });
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setVariantImagePreviews((prev) => ({ ...prev, [index]: reader.result }));
      setLocalVariants((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], image: file };
        return updated;
      });
    };
    reader.readAsDataURL(file);
  }, [setVariantImagePreviews]);

  const handleAdd = () => {
    setLocalVariants((prev) => [...prev, { id: null, size: null, color: null, image: null, title: '', quantity: 1, price: 0 }]);
  };

  const handleRemove = (index) => {
    setLocalVariants((prev) => prev.filter((_, i) => i !== index));
    setVariantImagePreviews((prev) => {
      const newPrev = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki < index) newPrev[ki] = v;
        else if (ki > index) newPrev[ki - 1] = v;
      });
      return newPrev;
    });
  };

  const isDisabled = formData.variant === 'None';

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }} color="text.primary">
            Product variants
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {isDisabled
              ? 'Set a variant type in General to enable variants'
              : `${formData.variant} variants · ${localVariants.length} added`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={isDisabled}
          sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '8px', fontWeight: 600, fontSize: 12, '&:hover': { bgcolor: 'text.secondary' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground' } }}
        >
          Add variant
        </Button>
      </Stack>

      {localVariants.length === 0 ? (
        <Box sx={{
          border: '2px dashed', borderColor: 'divider', borderRadius: '16px',
          p: 6, textAlign: 'center',
          ...(isDisabled ? {} : { cursor: 'pointer', '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' } }),
        }}
          onClick={isDisabled ? undefined : handleAdd}
        >
          <InventoryOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            {isDisabled ? 'No variant type selected' : 'No variants added yet'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {isDisabled
              ? 'Go to the General tab and select a variant type first'
              : 'Click "Add variant" or tap here to get started'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {localVariants.map((variant, i) => (
            <VariantCard
              key={i}
              variant={variant}
              index={i}
              formData={formData}
              sizes={sizes}
              colors={colors}
              imagePreview={variantImagePreviews[i]}
              onFieldChange={handleFieldChange}
              onImageChange={handleImageChange}
              onRemove={handleRemove}
            />
          ))}
        </Stack>
      )}

      {localVariants.length > 0 && (
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={isDisabled}
          fullWidth
          sx={{
            mt: 2, borderRadius: '10px', borderColor: 'divider',
            color: 'text.secondary', fontWeight: 600, fontSize: 13,
            '&:hover': { borderColor: 'text.primary', color: 'text.primary' },
          }}
        >
          Add another variant
        </Button>
      )}
    </Box>
  );
};

export default VariantRow;