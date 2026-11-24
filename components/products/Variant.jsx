'use client';

/**
 * Versions of one product, Amazon/Walmart style: the seller picks what changes
 * between them (up to 3 options: Colour, Size, Flavour, Scent, Pack size... or
 * one they name), types the values once to create every combination, then sets
 * each version's price, stock, photo and SKU.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Autocomplete, Box, Button, Chip, Collapse, IconButton, InputAdornment, Stack, TextField,
  ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import useSWR from 'swr';
import { validateImage, squareifyImage } from './fileValidators';
import { newVariantKey } from './galleryUploads';
import VariantGallery from './VariantGallery';
import { fieldSx, NumberField } from './form/fields';
import {
  FALLBACK_VARIATIONS, cleanValue, combinations, comboKey, customKey, optionLabel, orderedTypes,
} from './form/variationOptions';
import { fetcher } from '@/components/dashboard/DashboardUI';
import Swal from 'sweetalert2';

const chipSx = { height: 36, borderRadius: '10px', fontWeight: 600, fontSize: 14 };
const SHOWN_TYPES = 8;

const Swatch = ({ code }) => (
  <Box component="span" sx={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, bgcolor: code || '#ccc',
    border: '1px solid rgba(0,0,0,0.15)', display: 'inline-block' }} />
);

// ── 1. What changes between versions ─────────────────────────────────────────
export function OptionPicker({ axes, types, maxAxes, onAdd, onRemove }) {
  const [showAll, setShowAll] = useState(false);
  const [custom, setCustom] = useState('');
  const chosen = new Set(axes.map((a) => a.key));
  const free = types.filter((t) => !chosen.has(t.key));
  const shown = showAll ? free : free.slice(0, SHOWN_TYPES);
  const full = axes.length >= maxAxes;

  const addCustom = () => {
    const label = cleanValue(custom).slice(0, 30);
    if (!label) return;
    onAdd({ key: customKey(label), label });
    setCustom('');
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>What changes between versions?</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Pick up to {maxAxes}, in the order shoppers should choose them (e.g. Flavour, then Pack size).{' '}
        <Box component={Link} href="/help/selling-guide#versions" target="_blank"
          sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>
          How versions work
        </Box>
      </Typography>

      {axes.length > 0 && (
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mb: 1.5 }}>
          {axes.map((a, i) => (
            <Chip key={a.key} label={`${i + 1}. ${a.label}`} onDelete={() => onRemove(a.key)}
              deleteIcon={<CloseIcon aria-label={`Remove ${a.label}`} />}
              sx={{ ...chipSx, bgcolor: 'text.primary', color: 'background.paper',
                '& .MuiChip-deleteIcon': { color: 'background.paper', opacity: 0.8 } }} />
          ))}
        </Stack>
      )}

      {full ? (
        <Typography variant="caption" color="text.secondary">
          That&apos;s the most a product can have. Remove one to choose another.
        </Typography>
      ) : (
        <>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {shown.map((t) => (
              <Chip key={t.key} label={t.label} icon={<AddIcon />} variant="outlined" onClick={() => onAdd({ key: t.key, label: t.label })}
                sx={{ ...chipSx, borderColor: 'divider' }} />
            ))}
            {free.length > SHOWN_TYPES && (
              <Chip label={showAll ? 'Fewer' : `More (${free.length - SHOWN_TYPES})`} variant="outlined"
                onClick={() => setShowAll((s) => !s)} sx={{ ...chipSx, borderStyle: 'dashed' }} />
            )}
          </Stack>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5, maxWidth: 420 }}>
            <TextField size="small" fullWidth sx={fieldSx} value={custom} placeholder="Or name your own, e.g. Roast level"
              onChange={(e) => setCustom(e.target.value)} inputProps={{ maxLength: 30, 'aria-label': 'Your own option name' }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }} />
            <Button variant="outlined" onClick={addCustom} disabled={!cleanValue(custom)}
              sx={{ borderRadius: '10px', flexShrink: 0, minHeight: 40, fontWeight: 600 }}>Add</Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

// ── 2. Quick add: type the values once, get every combination ────────────────
export function QuickAdd({ axes, suggestionsFor, existing, onCreate }) {
  const [values, setValues] = useState({});
  const rows = combinations(axes, values);
  const have = new Set(existing.map((v) => comboKey(v.options, axes)));
  const fresh = rows.filter((r) => !have.has(comboKey(r, axes)));

  const create = () => {
    onCreate(fresh);
    setValues({});
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: '14px', bgcolor: 'action.hover' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AutoAwesomeOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
        <Typography variant="subtitle2" fontWeight={700}>Add versions quickly</Typography>
      </Stack>
      <Stack spacing={1.5}>
        {axes.map((a) => (
          <Autocomplete key={a.key} multiple freeSolo size="small" options={suggestionsFor(a.key)}
            value={values[a.key] || []}
            onChange={(_, next) => setValues((prev) => ({ ...prev, [a.key]: [...new Set(next.map(cleanValue).filter(Boolean))] }))}
            renderInput={(params) => (
              <TextField {...params} label={`${a.label} values`} sx={{ ...fieldSx, bgcolor: 'background.paper', borderRadius: '10px' }}
                placeholder={(values[a.key] || []).length ? '' : 'Type a value and press Enter'} />
            )} />
        ))}
      </Stack>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between" sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary">
          {rows.length === 0 ? `Add at least one value for each option.`
            : fresh.length === 0 ? 'You already have all these versions.'
              : `${fresh.length} new version${fresh.length === 1 ? '' : 's'}${rows.length > fresh.length ? ` (${rows.length - fresh.length} already added)` : ''}. `
                + (axes.length > 1 ? 'This makes every combination: delete any you don\'t sell afterwards.' : '')}
        </Typography>
        <Button variant="contained" disableElevation onClick={create} disabled={!fresh.length}
          sx={{ borderRadius: '10px', minHeight: 40, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper',
            '&:hover': { bgcolor: 'text.secondary' } }}>
          {fresh.length ? `Add ${fresh.length} version${fresh.length === 1 ? '' : 's'}` : 'Add versions'}
        </Button>
      </Stack>
    </Box>
  );
}

// ── 3. One version ───────────────────────────────────────────────────────────
function VariantCard({ variant, index, axes, colorCode, suggestionsFor, imagePreview, galleryLimit, error,
  onFieldChange, onOptionChange, onImageChange, onGalleryChange, onRemove }) {
  const inputId = `variant-img-${variant.key || index}`;
  const label = optionLabel(variant, axes);

  return (
    <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: error ? 'error.light' : 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          {axes.some((a) => a.key === 'color') && colorCode(variant.options?.color) && <Swatch code={colorCode(variant.options?.color)} />}
          <Typography variant="body2" noWrap sx={{ fontWeight: 700 }}>
            {label || `Version ${index + 1}`}
          </Typography>
        </Stack>
        <Tooltip title="Remove version">
          <IconButton aria-label={`Remove ${label || `version ${index + 1}`}`} onClick={() => onRemove(index)}
            sx={{ width: 36, height: 36, borderRadius: '8px', color: 'text.secondary', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
            <DeleteOutlineIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>
      </Stack>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 4, sm: 3 }}>
            <input type="file" accept="image/*" onChange={(e) => onImageChange(index, e.target.files[0])} hidden id={inputId} />
            <Box component="label" htmlFor={inputId}
              sx={{ aspectRatio: '1', borderRadius: '12px', border: '2px dashed', borderColor: 'divider', overflow: 'hidden',
                cursor: 'pointer', bgcolor: 'action.hover', position: 'relative', display: 'flex', alignItems: 'center',
                justifyContent: 'center', '&:hover': { borderColor: 'text.primary' } }}>
              {imagePreview ? (
                <Box component="img" src={imagePreview} alt={label || `Version ${index + 1}`}
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
              {axes.map((a) => (
                <Grid key={a.key} size={{ xs: 12, md: axes.length === 1 ? 12 : 6 }}>
                  <Autocomplete freeSolo size="small" options={suggestionsFor(a.key)}
                    inputValue={variant.options?.[a.key] ?? ''}
                    onInputChange={(_, next) => onOptionChange(index, a.key, next)}
                    renderOption={(props, option) => {
                      const { key, ...rest } = props;
                      return (
                        <li key={key} {...rest}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {a.key === 'color' && <Swatch code={colorCode(option)} />}
                            <span>{option}</span>
                          </Stack>
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField {...params} label={a.label} required sx={fieldSx}
                        error={!!error?.options?.[a.key]} helperText={error?.options?.[a.key]}
                        inputProps={{ ...params.inputProps, maxLength: 40 }} />
                    )} />
                </Grid>
              ))}
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

// ── Main component ───────────────────────────────────────────────────────────
const VariantRow = ({
  formData, setFormData, formErrors = {},
  variants: localVariants, setVariants: setLocalVariants,
  sizes = [], colors = [], variationOptions,
  variantImagePreviews = {}, setVariantImagePreviews,
}) => {
  // Extra photos per variant are a paid feature (payments/entitlements.py).
  const { data: plan } = useSWR('/api/v1/vendor/plan/', fetcher, { revalidateOnFocus: false });
  const galleryLimit = plan ? (plan.max_images_per_variant ?? 0) : null;
  const variantErrors = formErrors.variantRows || {};
  const variations = variationOptions || FALLBACK_VARIATIONS;
  const axes = useMemo(() => formData.variation_axes || [], [formData.variation_axes]);
  const hasVersions = formData.variant !== 'None';
  const types = useMemo(() => orderedTypes(variations, formData.product_type), [variations, formData.product_type]);
  const [quickOpen, setQuickOpen] = useState(localVariants.length === 0);

  // Parent `variants` state is the single source of truth; mirror it one-way into formData.
  // (Two-way syncing with a local copy ping-ponged into an infinite update loop — React #185.)
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      variants: localVariants.map((v) => ({ ...v, image: v.image instanceof File ? v.image : null })),
    }));
  }, [localVariants, setFormData]);

  const colorCodes = useMemo(() => {
    const map = new Map();
    colors.forEach((c) => { if (c.code) map.set(c.name.toLowerCase(), c.code); });
    return map;
  }, [colors]);
  const colorCode = useCallback((name) => colorCodes.get(cleanValue(name).toLowerCase()), [colorCodes]);

  // Suggestions: values already used on this product, then the usual ones.
  const suggestionsFor = useCallback((key) => {
    const used = localVariants.map((v) => cleanValue(v.options?.[key])).filter(Boolean);
    const known = key === 'color' ? colors.map((c) => c.name)
      : key === 'size' ? sizes.map((s) => s.name)
        : (variations.types.find((t) => t.key === key)?.examples || []);
    return [...new Set([...used, ...known])];
  }, [localVariants, colors, sizes, variations.types]);

  const update = (index, patch) => setLocalVariants((prev) => {
    const next = [...prev];
    next[index] = { ...next[index], ...patch(next[index]) };
    return next;
  });

  const handleFieldChange = useCallback((index, field, value) => update(index, () => ({ [field]: value })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setLocalVariants]);

  const handleOptionChange = useCallback((index, key, value) =>
    update(index, (v) => ({ options: { ...(v.options || {}), [key]: value } })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [setLocalVariants]);

  const handleGalleryChange = useCallback((index, change) =>
    update(index, (v) => ({ gallery: change(v.gallery || []) })),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [setLocalVariants]);

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
      update(index, () => ({ image: squaredFile }));
    };
    reader.readAsDataURL(squaredFile);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setVariantImagePreviews, setLocalVariants]);

  // New versions start at the product's price: a variant price is what the
  // shopper pays, and an untouched 0 would sell it for free.
  const blank = (options = {}) => ({
    id: null, key: newVariantKey(), options, image: null, title: '',
    quantity: '1', price: formData.price || '', seller_sku: '', gallery: [],
  });

  const handleAdd = () => setLocalVariants((prev) => [...prev, blank()]);
  const handleCreate = (rows) => {
    setLocalVariants((prev) => [...prev, ...rows.map((options) => blank(options))]);
    setQuickOpen(false);
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

  const setAxes = (next) => setFormData((prev) => ({ ...prev, variation_axes: next }));
  const addAxis = (a) => {
    if (axes.some((x) => x.key === a.key) || axes.length >= variations.max_axes) return;
    setAxes([...axes, a]);
  };
  const removeAxis = (key) => setAxes(axes.filter((a) => a.key !== key));

  const setHasVersions = (_, value) => {
    if (value == null) return;
    setFormData((prev) => ({
      ...prev,
      // The server works out the exact type from the options (Size, Color, Options...).
      variant: value ? (prev.variant !== 'None' ? prev.variant : 'Options') : 'None',
    }));
  };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Does this item come in different versions?</Typography>
      <ToggleButtonGroup exclusive value={hasVersions} onChange={setHasVersions} size="small"
        sx={{ gap: 1, mb: 2.5, '& .MuiToggleButtonGroup-grouped': {
          border: '1px solid !important', borderColor: 'divider', borderRadius: '10px !important', mx: 0,
          px: 2.5, minHeight: 40, textTransform: 'none', fontWeight: 600,
          '&.Mui-selected': { bgcolor: 'text.primary', color: 'background.paper', borderColor: 'text.primary', '&:hover': { bgcolor: 'text.secondary' } },
        } }}>
        <ToggleButton value={false}>No, just one</ToggleButton>
        <ToggleButton value>Yes</ToggleButton>
      </ToggleButtonGroup>

      {!hasVersions ? (
        <Box sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: '16px', p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <InventoryOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>One version only</Typography>
          <Typography variant="caption" color="text.secondary">
            {localVariants.length
              ? `Your ${localVariants.length} saved version${localVariants.length === 1 ? ' is' : 's are'} hidden. Choose Yes to see ${localVariants.length === 1 ? 'it' : 'them'} again.`
              : 'Choose Yes if shoppers pick a colour, size, flavour, scent, pack size or anything else.'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2.5}>
          <OptionPicker axes={axes} types={types} maxAxes={variations.max_axes} onAdd={addAxis} onRemove={removeAxis} />

          {axes.length > 0 && (
            <>
              <Box>
                <Button size="small" onClick={() => setQuickOpen((o) => !o)} startIcon={<AutoAwesomeOutlinedIcon />}
                  sx={{ borderRadius: '8px', fontWeight: 600, color: 'text.primary', mb: quickOpen ? 1 : 0 }}>
                  {quickOpen ? 'Hide quick add' : 'Add several versions at once'}
                </Button>
                <Collapse in={quickOpen} unmountOnExit>
                  <QuickAdd axes={axes} suggestionsFor={suggestionsFor} existing={localVariants} onCreate={handleCreate} />
                </Collapse>
              </Box>

              {localVariants.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    {localVariants.length} version{localVariants.length === 1 ? '' : 's'}. Each has its own price and stock.
                  </Typography>
                  <Stack spacing={1.5}>
                    {localVariants.map((variant, i) => (
                      <VariantCard
                        key={variant.key || i}
                        variant={variant}
                        index={i}
                        axes={axes}
                        colorCode={colorCode}
                        suggestionsFor={suggestionsFor}
                        imagePreview={variantImagePreviews[i]}
                        galleryLimit={galleryLimit}
                        error={variantErrors[i]}
                        onFieldChange={handleFieldChange}
                        onOptionChange={handleOptionChange}
                        onImageChange={handleImageChange}
                        onGalleryChange={handleGalleryChange}
                        onRemove={handleRemove}
                      />
                    ))}
                  </Stack>
                </Box>
              )}
              <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} fullWidth
                sx={{ minHeight: 44, borderRadius: '10px', borderColor: 'divider', borderStyle: 'dashed', color: 'text.primary', fontWeight: 600,
                  '&:hover': { borderColor: 'text.primary', borderStyle: 'dashed' } }}>
                Add one version
              </Button>
            </>
          )}
        </Stack>
      )}
    </Box>
  );
};

export default VariantRow;
