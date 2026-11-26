'use client';

/**
 * Add many products in the browser, no spreadsheet needed. One card per
 * product, laid out for phones, tablets and laptops alike:
 *  - the essentials on the card (name, category, price, stock, weight, photos);
 *  - "Versions" for colour / size / flavour / pack size... (the same option
 *    picker as the product form);
 *  - "More details" for brand, cost, description, features, SKU, barcode, return
 *    days, stock type (in stock / ships from abroad / made to order), ships-to,
 *    delivery and the category's specs: everything the product form has, so a
 *    product added here is the same as one added on its own.
 * Ships-to and delivery start as the store's own (from its latest product).
 *
 * Backend: vendor/bulk_upload.py. onSubmit receives { products, files }:
 * products in the upload format, files keyed photos_<i> / version_photo_<i>_<v>
 * (several per version: its photo, then its gallery).
 */

import { forwardRef, memo, useCallback, useImperativeHandle, useMemo, useState } from 'react';
import {
  Alert, Autocomplete, Box, Button, Chip, Collapse, IconButton, InputAdornment, MenuItem, Stack,
  TextField, Tooltip, Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Swal from 'sweetalert2';
import useSWR from 'swr';
import ProductSpecs from './ProductSpecs';
import { createAxiosClient } from '@/utils/clientFetch';
import { checkPhotos, imagesOnly, overLimitNote, reportOrFix, useBatchProgress, useDropPhotos } from './photoBatch';
import { usePhotoStudio } from '@/components/studio/usePhotoStudio';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import { OptionPicker, QuickAdd } from './Variant';
import { fieldSx, NumberField } from './form/fields';
import { MAX_SECTIONS, MAX_TITLE, newSection, suggestedTitles } from './form/infoSectionRules';
import {
  FALLBACK_VARIATIONS, cleanValue, comboKey, optionLabel, orderedTypes,
} from './form/variationOptions';

const FIELD_LABELS = {
  title: 'Name', category: 'Category', price: 'Price', stock: 'Stock', weight_kg: 'Weight',
  compare_at_price: 'Old price', condition: 'Condition', brand: 'Brand', options: 'Versions',
  seller_sku: 'SKU', barcode: 'Barcode', ships_to: 'Ships to', delivery_methods: 'Delivery',
  image_url: 'Photo', more_image_urls: 'Photos', return_days: 'Return days', plan: 'Plan', product: 'Product',
  unit_cost: 'Your cost', stock_type: 'Stock type', sourcing_days: 'Time to get it', sourced_from: 'Ordered from',
  specs: 'Specs', sections: 'Product information',
};
// Fields kept under "More details": open it when the server flags one of them.
const MORE_FIELDS = ['ships_to', 'delivery_methods', 'seller_sku', 'barcode', 'brand', 'unit_cost', 'stock_type',
  'sourcing_days', 'sourced_from', 'specs', 'sections', 'return_days'];

// Like the product form: imported items in weeks, made to order in days.
const SOURCING = {
  imported: { unit: 'weeks', min: '4', max: '6' },
  made_to_order: { unit: 'days', min: '7', max: '14' },
};
const MAX_SOURCING_DAYS = 70;

const definitionsFetcher = (url) => createAxiosClient().get(url).then((r) => r.data.results || []);
const isEmptySpec = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

let nextId = 1;
const newKey = () => `k${nextId++}`;

function makeProduct(meta) {
  return {
    _id: newKey(), _more: false, _versionsOpen: false, _errors: {},
    title: '', category: null, price: '', compare_at_price: '', stock: '', weight_kg: '', condition: 'new',
    brand: null, description: '', features: '', seller_sku: '', barcode: '', return_days: '', unit_cost: '',
    stock_type: 'in_stock', sourcing_min: '', sourcing_max: '', sourced_from: null, specs: {}, sections: [],
    ships_to: meta?.defaults?.ships_to || [],
    delivery: (meta?.defaults?.delivery_methods || []).map((d) => d.id),
    photos: [], axes: [], versions: [],
  };
}

const positive = (v) => v !== '' && Number(v) > 0;
const isBlank = (p) => !p.title.trim() && !p.price && !p.category && !p.photos.length;

/** Same checks as the server, so most mistakes are caught before uploading. */
function validate(p) {
  const e = {};
  if (!p.title.trim()) e.title = 'Add a name.';
  if (!p.category) e.category = 'Choose a category.';
  if (!positive(p.weight_kg)) e.weight_kg = 'Packed weight in kg.';
  if (!p.ships_to.length) e.ships_to = 'Choose at least one country.';
  if (!p.delivery.length) e.delivery_methods = 'Choose a delivery method.';
  if (p.stock_type !== 'in_stock') {
    const per = SOURCING[p.stock_type]?.unit === 'weeks' ? 7 : 1;
    const low = Number(p.sourcing_min) * per;
    const high = Number(p.sourcing_max) * per;
    if (!(low > 0) || !(high > 0)) e.sourcing_days = 'Say how long it takes to get the item.';
    else if (low > high) e.sourcing_days = "The shortest time can't be longer than the longest.";
    else if (high > MAX_SOURCING_DAYS) e.sourcing_days = `The longest time can be at most ${MAX_SOURCING_DAYS / 7} weeks.`;
  }
  if (p.axes.length) {
    if (!p.versions.length) e.options = 'Add the versions, or remove the options.';
    const seen = new Set();
    p.versions.forEach((v) => {
      if (e.options) return;
      const missing = p.axes.find((a) => !cleanValue(v.options?.[a.key]));
      const name = optionLabel(v, p.axes) || 'A version';
      if (missing) e.options = `${name}: enter a ${missing.label.toLowerCase()}.`;
      else if (!positive(v.price)) e.options = `${name}: enter a price.`;
      else if (v.stock === '' || Number(v.stock) < 0) e.options = `${name}: enter the stock (0 or more).`;
      const key = comboKey(v.options, p.axes);
      if (!e.options && seen.has(key)) e.options = `${name} is listed twice.`;
      seen.add(key);
    });
  } else {
    if (!positive(p.price)) e.price = 'Enter the price.';
    if (p.stock === '' || Number(p.stock) < 0) e.stock = 'Enter the stock.';
  }
  return e;
}

/** The product in the upload format (vendor/bulk_upload.py COLUMNS). */
function toPayload(p, index, meta, files) {
  const deliveryNames = p.delivery
    .map((id) => meta?.delivery_methods?.find((d) => d.id === id)?.name)
    .filter(Boolean);
  const base = {
    title: p.title.trim(), category: p.category?.slug || '', price: p.price, stock: p.stock,
    weight_kg: p.weight_kg, compare_at_price: p.compare_at_price, condition: p.condition,
    brand: p.brand?.slug || '', description: p.description, features: p.features, seller_sku: p.seller_sku,
    barcode: p.barcode, return_days: p.return_days, unit_cost: p.unit_cost,
    ships_to: p.ships_to.map((c) => c.code || c.name).join(';'), delivery_methods: deliveryNames.join(';'),
    stock_type: p.stock_type,
  };
  if (p.stock_type !== 'in_stock') {
    base.sourcing_days = `${p.sourcing_min}-${p.sourcing_max} ${SOURCING[p.stock_type]?.unit || 'days'}`;
    if (p.stock_type === 'imported' && p.sourced_from) base.sourced_from = p.sourced_from.code || p.sourced_from.name;
  }
  // Specs go as the product form sends them ({slug: value}); only filled ones.
  const specs = Object.fromEntries(Object.entries(p.specs || {}).filter(([, v]) => !isEmptySpec(v)));
  if (Object.keys(specs).length) base.specs = specs;
  // Product information sections, as the form sends them (body here is plain text).
  const sections = (p.sections || []).map((x) => ({ title: x.title.trim(), body: x.body.trim() }))
    .filter((x) => x.title || x.body);
  if (sections.length) base.sections = sections;
  p.photos.forEach((ph) => files.push([`photos_${index}`, ph.file]));
  if (!p.axes.length) return base;
  return {
    rows: p.versions.map((v, vi) => {
      (v.photos || []).forEach((ph) => files.push([`version_photo_${index}_${vi}`, ph.file]));
      const row = vi === 0 ? { ...base } : { title: base.title, unit_cost: v.unit_cost || '' };
      row.price = v.price;
      row.stock = v.stock;
      row.seller_sku = v.seller_sku || '';
      p.axes.forEach((a, n) => {
        row[`option${n + 1}_name`] = a.label;
        row[`option${n + 1}_value`] = cleanValue(v.options?.[a.key]);
      });
      return row;
    }),
  };
}

// ── Pieces ───────────────────────────────────────────────────────────────────

function FieldError({ message }) {
  if (!message) return null;
  return <Typography sx={{ fontSize: 12, color: 'error.main', mt: 0.5 }}>{message}</Typography>;
}

/**
 * Photos of a product or a version, added like on the product form
 * (photoBatch.js): pick several at once or drag them in from the computer;
 * each is squared on white and checked, a few at a time with progress, and the
 * plan's limit decides how many fit. onAdd gets [{ file, url }] in the order picked.
 */
function PhotoStrip({ photos, limit, onAdd, onRemove, onMakeMain, onReplace, openStudio, inputId, mainLabel = 'MAIN', limitNote }) {
  const { busy, label, run } = useBatchProgress();
  const full = limit != null && photos.length >= limit;
  const asItem = (file) => ({ file, url: URL.createObjectURL(file) });

  const add = async (fileList) => {
    const files = imagesOnly(fileList);
    if (!files.length || busy) return;
    const room = limit == null ? files.length : Math.max(limit - photos.length, 0);
    const accepted = files.slice(0, room);
    const problems = [];
    if (files.length > accepted.length) problems.push(limitNote(files.length - accepted.length));
    let good = [];
    let failed = [];
    if (accepted.length) {
      const checked = await run(accepted.length, (onProgress) => checkPhotos(accepted, onProgress));
      ({ good, failed } = checked);
      problems.push(...checked.problems);
      if (good.length) onAdd(good.map(asItem));
    }
    // Photos that didn't pass: offer the Photo studio (its photos always pass).
    const fixed = await reportOrFix(problems, failed, openStudio ? { open: openStudio } : null);
    const left = limit == null ? fixed.length : Math.max(limit - photos.length - good.length, 0);
    if (fixed.length) onAdd(fixed.slice(0, left).map(asItem));
  };

  const edit = async (i) => {
    const [file] = (await openStudio([{ source: photos[i].file, name: photos[i].file.name }])) || [];
    if (file) onReplace(i, asItem(file));
  };
  const { dragging, dropProps } = useDropPhotos(add, busy || full);

  return (
    <Box {...dropProps}
      sx={{ p: 0.75, m: -0.75, borderRadius: '12px', border: '2px dashed', borderColor: dragging ? 'text.primary' : 'transparent',
        bgcolor: dragging ? 'action.hover' : 'transparent', transition: 'background-color .15s, border-color .15s' }}>
      <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        {photos.map((ph, i) => (
          <Box key={ph.url} sx={{ position: 'relative', width: 64, height: 64, borderRadius: '10px', overflow: 'hidden',
            border: '1px solid', borderColor: i === 0 ? 'text.primary' : 'divider' }}>
            <Box component="img" src={ph.url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {openStudio && onReplace && (
              <IconButton size="small" aria-label="Edit in the Photo studio" onClick={() => edit(i)}
                sx={{ position: 'absolute', top: 2, left: 2, width: 22, height: 22, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}>
                <AutoFixHighOutlinedIcon sx={{ fontSize: 13 }} />
              </IconButton>
            )}
            <IconButton size="small" aria-label="Remove photo" onClick={() => onRemove(i)}
              sx={{ position: 'absolute', top: 2, right: 2, width: 22, height: 22, bgcolor: 'rgba(0,0,0,0.55)', color: '#fff',
                '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}>
              <CloseIcon sx={{ fontSize: 14 }} />
            </IconButton>
            {i === 0 ? (
              <Typography sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: 9, fontWeight: 700,
                textAlign: 'center', bgcolor: 'rgba(255,255,255,0.9)', color: '#111' }}>{mainLabel}</Typography>
            ) : onMakeMain && (
              <Box component="button" type="button" onClick={() => onMakeMain(i)} aria-label="Make this the main photo"
                sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, border: 0, py: '1px', fontSize: 9, fontWeight: 700, cursor: 'pointer',
                  bgcolor: 'rgba(0,0,0,0.55)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' } }}>
                Make main
              </Box>
            )}
          </Box>
        ))}
        {!full && (
          <Box component="label" htmlFor={inputId} aria-busy={busy}
            sx={{ width: 64, height: 64, borderRadius: '10px', border: '2px dashed', borderColor: 'divider', cursor: busy ? 'wait' : 'pointer',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'text.secondary',
              '&:hover': { borderColor: 'text.primary' } }}>
            <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20 }} />
            <Typography sx={{ fontSize: 10, fontWeight: 600 }}>{photos.length ? 'Add' : 'Photos'}</Typography>
            <input id={inputId} type="file" accept="image/*" multiple hidden disabled={busy}
              onChange={(e) => { const files = [...e.target.files]; e.target.value = ''; add(files); }} />
          </Box>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ flexBasis: { xs: '100%', sm: 'auto' } }}>
          {busy ? label : dragging ? 'Drop to add' : full ? '' : (
            <>Select several at once<Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}> or drag them here</Box></>
          )}
        </Typography>
      </Stack>
    </Box>
  );
}

/** Move photo i to the front (it becomes the main photo). */
const toFront = (list, i) => [list[i], ...list.filter((_, j) => j !== i)];

function VersionsEditor({ product, variations, types, suggestionsFor, onChange, setProduct, extraPhotos, openStudio }) {
  const { axes, versions } = product;
  const setVersion = (i, patch) => onChange({ versions: versions.map((v, j) => (j === i ? { ...v, ...patch } : v)) });
  const addVersions = (rows) => onChange({
    versions: [...versions, ...rows.map((options) => ({ key: newKey(), options, price: product.price || '', stock: '', seller_sku: '', unit_cost: '', photos: [] }))],
  });
  // The version's photo plus, on plans that include it, more photos of that version.
  const photoLimit = 1 + (extraPhotos || 0);
  // Photos are checked asynchronously: add them to the version as it is then, by key.
  const addVersionPhotos = (key, items) => setProduct((cur) => ({
    versions: cur.versions.map((v) => (v.key === key ? { ...v, photos: [...(v.photos || []), ...items] } : v)),
  }));
  const versionLimitNote = (skipped) => (extraPhotos
    ? overLimitNote(skipped, photoLimit, 'photos per version')
    : 'Each version has one photo on your plan; more photos per version come with paid plans. '
      + '<a href="/subscribe" target="_blank" rel="noopener">Upgrade</a> to add them.');

  return (
    <Stack spacing={2}>
      <OptionPicker axes={axes} types={types} maxAxes={variations.max_axes}
        onAdd={(a) => !axes.some((x) => x.key === a.key) && axes.length < variations.max_axes && onChange({ axes: [...axes, a] })}
        onRemove={(key) => onChange({ axes: axes.filter((a) => a.key !== key) })} />
      {axes.length > 0 && <QuickAdd axes={axes} suggestionsFor={suggestionsFor} existing={versions} onCreate={addVersions} />}
      {axes.length > 0 && versions.map((v, i) => (
        <Box key={v.key} sx={{ p: 1.5, borderRadius: '12px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={700}>{optionLabel(v, axes) || `Version ${i + 1}`}</Typography>
            <IconButton size="small" aria-label="Remove version" onClick={() => onChange({ versions: versions.filter((_, j) => j !== i) })}>
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
          <Grid container spacing={1.25}>
            {axes.map((a) => (
              <Grid key={a.key} size={{ xs: 6, md: 3 }}>
                <TextField size="small" fullWidth label={a.label} sx={fieldSx} value={v.options?.[a.key] ?? ''}
                  inputProps={{ maxLength: 40 }}
                  onChange={(e) => setVersion(i, { options: { ...v.options, [a.key]: e.target.value } })} />
              </Grid>
            ))}
            <Grid size={{ xs: 6, md: 2 }}>
              <NumberField label="Price" value={v.price} onChange={(val) => setVersion(i, { price: val })}
                InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 6, md: 2 }}>
              <NumberField decimals={false} label="Stock" value={v.stock} onChange={(val) => setVersion(i, { stock: val })} />
            </Grid>
            <Grid size={{ xs: 6, md: 3 }}>
              <TextField size="small" fullWidth label="SKU (optional)" sx={fieldSx} value={v.seller_sku}
                inputProps={{ maxLength: 64 }} onChange={(e) => setVersion(i, { seller_sku: e.target.value })} />
            </Grid>
            {i > 0 && (
              <Grid size={{ xs: 6, md: 2 }}>
                <NumberField label="Your cost (optional)" value={v.unit_cost} onChange={(val) => setVersion(i, { unit_cost: val })}
                  InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }} />
              </Grid>
            )}
            <Grid size={{ xs: 12 }}>
              <PhotoStrip photos={v.photos || []} limit={photoLimit} inputId={`bulk-vphotos-${v.key}`} mainLabel="VERSION"
                limitNote={versionLimitNote} onAdd={(items) => addVersionPhotos(v.key, items)} openStudio={openStudio}
                onReplace={(j, item) => setVersion(i, { photos: (v.photos || []).map((x, k) => (k === j ? item : x)) })}
                onMakeMain={(j) => setVersion(i, { photos: toFront(v.photos || [], j) })}
                onRemove={(j) => setVersion(i, { photos: (v.photos || []).filter((_, k) => k !== j) })} />
            </Grid>
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}

/** In stock, ships from abroad or made to order: the same choice as the product form. */
function StockType({ product: p, meta, errors, set }) {
  const unit = SOURCING[p.stock_type]?.unit;
  const setKind = (kind) => set({
    stock_type: kind, sourcing_min: SOURCING[kind]?.min || '', sourcing_max: SOURCING[kind]?.max || '',
    sourced_from: kind === 'imported' ? p.sourced_from : null,
    _errors: { ...errors, stock_type: undefined, sourcing_days: undefined },
  });
  return (
    <Grid container spacing={1.5}>
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField select size="small" fullWidth label="Stock type" sx={fieldSx} value={p.stock_type} onChange={(ev) => setKind(ev.target.value)}
          error={!!errors.stock_type} helperText={errors.stock_type}>
          <MenuItem value="in_stock">I have it in stock</MenuItem>
          <MenuItem value="imported">I order it from abroad after a sale</MenuItem>
          <MenuItem value="made_to_order">I make it after a sale</MenuItem>
        </TextField>
      </Grid>
      {p.stock_type === 'imported' && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <Autocomplete size="small" options={meta?.countries || []} value={p.sourced_from}
            getOptionLabel={(o) => o.name} isOptionEqualToValue={(o, v) => o.id === v?.id}
            onChange={(_, v) => set({ sourced_from: v })}
            renderInput={(params) => <TextField {...params} label="Ordered from (optional)" sx={fieldSx} />} />
        </Grid>
      )}
      {unit && (
        <>
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumberField decimals={false} label={`Shortest (${unit})`} value={p.sourcing_min}
              onChange={(v) => set({ sourcing_min: v, _errors: { ...errors, sourcing_days: undefined } })} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumberField decimals={false} label={`Longest (${unit})`} value={p.sourcing_max}
              onChange={(v) => set({ sourcing_max: v, _errors: { ...errors, sourcing_days: undefined } })} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <Typography variant="caption" color="text.secondary">
              How long until the item is in your hands. Shoppers see &ldquo;{p.stock_type === 'imported' ? 'Ships from abroad' : 'Made to order'}&rdquo; and the extra time.
            </Typography>
          </Grid>
          <Grid size={{ xs: 12 }}><FieldError message={errors.sourcing_days} /></Grid>
        </>
      )}
    </Grid>
  );
}

/** Product information sections the seller names (the form's InfoSections, as plain text). */
function CardSections({ product: p, set, error }) {
  const sections = p.sections || [];
  const used = new Set(sections.map((x) => x.title.trim().toLowerCase()));
  const unused = suggestedTitles(p.category, p.condition).filter((t) => !used.has(t.toLowerCase()));
  const full = sections.length >= MAX_SECTIONS;
  const put = (next) => set({ sections: next });
  const update = (key, patch) => put(sections.map((x) => (x.key === key ? { ...x, ...patch } : x)));
  const add = (title = '') => { if (!full) put([...sections, newSection(title)]); };
  return (
    <Box sx={{ mt: 0.5, p: { xs: 1.5, sm: 2 }, borderRadius: '14px', border: '1px solid', borderColor: error ? 'error.light' : 'divider' }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14 }}>Product information (optional)</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.25 }}>
        Your own sections, named for this product: Ingredients, Display, Size &amp; fit… You can format them later in the product form.
      </Typography>
      {error && <Alert severity="error" sx={{ borderRadius: '10px', mb: 1.5 }}>{error}</Alert>}
      <Stack spacing={1.25}>
        {sections.map((x) => (
          <Stack key={x.key} direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'flex-start' } }}>
            <Autocomplete freeSolo size="small" options={unused} inputValue={x.title} sx={{ width: { xs: '100%', sm: 220 }, flexShrink: 0 }}
              onInputChange={(_, v) => update(x.key, { title: v.slice(0, MAX_TITLE) })}
              renderInput={(params) => <TextField {...params} label="Title" placeholder="e.g. Ingredients" sx={fieldSx} />} />
            <TextField size="small" fullWidth multiline minRows={2} label="Text" sx={fieldSx} value={x.body}
              placeholder="A blank line starts a new paragraph."
              onChange={(ev) => update(x.key, { body: ev.target.value })} />
            <Tooltip title="Remove section">
              <IconButton size="small" aria-label="Remove section" onClick={() => put(sections.filter((y) => y.key !== x.key))}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ))}
      </Stack>
      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, mt: sections.length ? 1.25 : 0 }}>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => add()} disabled={full}
          sx={{ borderRadius: '8px', textTransform: 'none' }}>Add a section</Button>
        {!full && unused.slice(0, 6).map((t) => (
          <Chip key={t} size="small" variant="outlined" label={`+ ${t}`} onClick={() => add(t)} sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
    </Box>
  );
}

/** The category's specs (attributes/), the same fields as the product form's Specs section. */
function CardSpecs({ product: p, set, error }) {
  const { data: definitions = [], error: loadError, isLoading } = useSWR(
    p.category?.id ? `/api/v1/attributes/sub-category/${p.category.id}/` : null, definitionsFetcher, { revalidateOnFocus: false });
  if (!p.category || (!isLoading && !loadError && !definitions.length)) return null;
  const values = p.specs || {};
  const specs = {
    definitions, values, editable: true, loading: isLoading,
    error: loadError ? 'Specification fields could not be loaded.' : '',
    missing: definitions.filter((d) => d.required && isEmptySpec(values[d.slug])).map((d) => d.slug),
    setValue: (slug, value) => set({ specs: { ...values, [slug]: value } }),
  };
  return (
    <Box sx={{ mt: 0.5, p: { xs: 1.5, sm: 2 }, borderRadius: '14px', border: '1px solid', borderColor: error ? 'error.light' : 'divider' }}>
      <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 1 }}>Specs</Typography>
      {error && <Alert severity="error" sx={{ borderRadius: '10px', mb: 1.5 }}>{error}</Alert>}
      <ProductSpecs specs={specs} hasCategory />
    </Box>
  );
}

// ── One product ──────────────────────────────────────────────────────────────

const ProductCard = memo(function ProductCard({ product: p, index, meta, variations, types, onUpdate, onDelete, onDuplicate, submitting, openStudio }) {
  const e = p._errors;
  const set = useCallback((patch) => onUpdate(p._id, patch), [onUpdate, p._id]);
  const field = (name) => (value) => set({ [name]: value, _errors: { ...e, [name]: undefined } });
  const brandOptions = useMemo(() => (meta?.brands || []).map((b) => ({ ...b, label: b.title })), [meta]);
  // Like the product form: a main photo plus max_images_per_product more.
  const limit = meta?.max_images_per_product == null ? null : meta.max_images_per_product + 1;
  const hasVersions = p.axes.length > 0;
  const errorCount = Object.values(e).filter(Boolean).length;

  const suggestionsFor = useCallback((key) => {
    const used = p.versions.map((v) => cleanValue(v.options?.[key])).filter(Boolean);
    const known = variations.types.find((t) => t.key === key)?.examples || [];
    return [...new Set([...used, ...known])];
  }, [p.versions, variations.types]);

  // Checked asynchronously: add to the product as it is by then.
  const addPhotos = (items) => set((cur) => ({ photos: [...cur.photos, ...items] }));
  const photoLimitNote = (skipped) => overLimitNote(skipped, limit, 'photos per product');

  return (
    <Box component="section" aria-label={`Product ${index + 1}`}
      sx={{ borderRadius: '16px', border: '1px solid', borderColor: errorCount ? 'error.light' : 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: 2, py: 1, bgcolor: 'action.hover', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ minWidth: 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: '0.06em', whiteSpace: 'nowrap', flexShrink: 0 }}>
            #{index + 1}
          </Typography>
          {p.title && <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>{p.title}</Typography>}
          {errorCount > 0 && <Chip size="small" color="error" variant="outlined" icon={<ErrorOutlineIcon />} label={`${errorCount} to fix`} sx={{ height: 22 }} />}
        </Stack>
        <Stack direction="row">
          <Tooltip title="Duplicate (same details, new name)">
            <IconButton aria-label="Duplicate product" onClick={() => onDuplicate(p._id)} disabled={submitting}><ContentCopyOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
          <Tooltip title="Remove">
            <IconButton aria-label="Remove product" onClick={() => onDelete(p._id)} disabled={submitting}><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Box sx={{ p: 2 }}>
        <Grid container spacing={1.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField size="small" fullWidth required label="Product name" sx={fieldSx} value={p.title}
              inputProps={{ maxLength: 150 }} error={!!e.title} onChange={(ev) => field('title')(ev.target.value)} />
            <FieldError message={e.title} />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <Autocomplete size="small" options={meta?.sub_categories || []} value={p.category}
              getOptionLabel={(o) => o.label || o.title || ''} isOptionEqualToValue={(o, v) => o.slug === v?.slug}
              onChange={(_, v) => set({ category: v, specs: {}, _errors: { ...e, category: undefined, specs: undefined } })}
              renderInput={(params) => <TextField {...params} required label="Category" placeholder="Search…" sx={fieldSx} error={!!e.category} />} />
            <FieldError message={e.category} />
          </Grid>

          {!hasVersions && (
            <>
              <Grid size={{ xs: 6, sm: 3 }}>
                <NumberField required label="Price" value={p.price} onChange={field('price')} error={!!e.price}
                  InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }} />
                <FieldError message={e.price} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <NumberField decimals={false} required label="Stock" value={p.stock} onChange={field('stock')} error={!!e.stock} />
                <FieldError message={e.stock} />
              </Grid>
            </>
          )}
          <Grid size={{ xs: 6, sm: 3 }}>
            <NumberField required label="Weight" decimals={3} value={p.weight_kg} onChange={field('weight_kg')} error={!!e.weight_kg}
              InputProps={{ endAdornment: <InputAdornment position="end">kg</InputAdornment> }} />
            <FieldError message={e.weight_kg} />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <TextField select size="small" fullWidth label="Condition" sx={fieldSx} value={p.condition}
              onChange={(ev) => field('condition')(ev.target.value)}>
              {(meta?.conditions || [{ value: 'new', label: 'New' }]).map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
              Photos {limit != null && `(up to ${limit})`} · the first is the main photo
            </Typography>
            <PhotoStrip photos={p.photos} limit={limit} inputId={`bulk-photos-${p._id}`} onAdd={addPhotos}
              limitNote={photoLimitNote} onMakeMain={(i) => set({ photos: toFront(p.photos, i) })} openStudio={openStudio}
              onReplace={(i, item) => set((cur) => ({ photos: cur.photos.map((x, j) => (j === i ? item : x)) }))}
              onRemove={(i) => set({ photos: p.photos.filter((_, j) => j !== i) })} />
            {!p.photos.length && !p.versions.some((v) => v.photos?.length) && (
              <Typography variant="caption" color="text.secondary">No photo: it will be saved as a draft you can finish later.</Typography>
            )}
          </Grid>
        </Grid>

        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', rowGap: 1 }}>
          <Button size="small" startIcon={<TuneOutlinedIcon />} onClick={() => set({ _versionsOpen: !p._versionsOpen })}
            variant={hasVersions ? 'contained' : 'outlined'} disableElevation
            sx={{ borderRadius: '10px', fontWeight: 600, minHeight: 40, ...(hasVersions && { bgcolor: 'text.primary', color: 'background.paper' }) }}>
            {hasVersions ? `${p.versions.length} version${p.versions.length === 1 ? '' : 's'} · ${p.axes.map((a) => a.label).join(', ')}` : 'Comes in versions? (colour, size, flavour…)'}
          </Button>
          <Button size="small" onClick={() => set({ _more: !p._more })} endIcon={p._more ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ borderRadius: '10px', fontWeight: 600, minHeight: 40, color: 'text.primary' }}>
            More details
          </Button>
        </Stack>
        <FieldError message={e.options} />

        <Collapse in={p._versionsOpen} unmountOnExit>
          <Box sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, borderRadius: '14px', bgcolor: 'action.hover' }}>
            <VersionsEditor product={p} variations={variations} types={types} suggestionsFor={suggestionsFor}
              extraPhotos={meta?.max_images_per_variant || 0} setProduct={set} openStudio={openStudio}
              onChange={(patch) => set({ ...patch, _errors: { ...e, options: undefined } })} />
          </Box>
        </Collapse>

        <Collapse in={p._more} unmountOnExit>
          <Grid container spacing={1.5} sx={{ mt: 1 }}>
            <Grid size={{ xs: 6, sm: 4 }}>
              <NumberField label="Old price (optional)" value={p.compare_at_price} onChange={field('compare_at_price')}
                helperText="Shown crossed out" InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <NumberField decimals={false} label="Return days" value={p.return_days} onChange={field('return_days')} helperText="Empty = no returns" />
            </Grid>
            <Grid size={{ xs: 6, sm: 4 }}>
              <NumberField label={hasVersions ? 'Your cost (first version)' : 'Your cost (optional)'} value={p.unit_cost} onChange={field('unit_cost')}
                helperText="Only you see it: for profit reports" InputProps={{ startAdornment: <InputAdornment position="start">GHS</InputAdornment> }} />
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Autocomplete size="small" options={brandOptions} value={p.brand} getOptionLabel={(o) => o.title || ''}
                isOptionEqualToValue={(o, v) => o.slug === v?.slug} onChange={(_, v) => field('brand')(v)}
                renderInput={(params) => <TextField {...params} label="Brand (optional)" sx={fieldSx} />} />
            </Grid>
            {!hasVersions && (
              <Grid size={{ xs: 6, sm: 4 }}>
                <TextField size="small" fullWidth label="SKU (optional)" sx={fieldSx} value={p.seller_sku}
                  inputProps={{ maxLength: 64 }} onChange={(ev) => field('seller_sku')(ev.target.value)} />
              </Grid>
            )}
            <Grid size={{ xs: 6, sm: 4 }}>
              <TextField size="small" fullWidth label="Barcode (optional)" sx={fieldSx} value={p.barcode}
                inputProps={{ inputMode: 'numeric', maxLength: 14 }} onChange={(ev) => field('barcode')(ev.target.value.replace(/\D/g, ''))} />
            </Grid>
            <Grid size={{ xs: 12, sm: hasVersions ? 8 : 4 }}>
              <Autocomplete multiple size="small" options={meta?.countries || []} value={p.ships_to}
                getOptionLabel={(o) => o.name} isOptionEqualToValue={(o, v) => o.id === v.id}
                onChange={(_, v) => field('ships_to')(v)}
                renderInput={(params) => <TextField {...params} label="Ships to" sx={fieldSx} error={!!e.ships_to} />} />
              <FieldError message={e.ships_to} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                Delivery methods · the first one you pick is the default
              </Typography>
              <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>
                {(meta?.delivery_methods || []).map((d) => {
                  const pos = p.delivery.indexOf(d.id);
                  return (
                    <Chip key={d.id} clickable label={`${d.name}${pos === 0 ? ' · default' : ''}`}
                      variant={pos >= 0 ? 'filled' : 'outlined'}
                      onClick={() => field('delivery')(pos >= 0 ? p.delivery.filter((x) => x !== d.id) : [...p.delivery, d.id])}
                      sx={{ height: 36, borderRadius: '10px', fontWeight: 600,
                        ...(pos >= 0 && { bgcolor: 'text.primary', color: 'background.paper' }) }} />
                  );
                })}
              </Stack>
              <FieldError message={e.delivery_methods} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <StockType product={p} meta={meta} errors={e} set={set} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField size="small" fullWidth multiline minRows={3} label="Description" sx={fieldSx} value={p.description}
                placeholder="What shoppers should know. A blank line starts a new paragraph."
                onChange={(ev) => field('description')(ev.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField size="small" fullWidth multiline minRows={2} label="Key features (optional)" sx={fieldSx} value={p.features}
                placeholder="One per line, e.g. Gluten free" helperText="Shown as a bullet list"
                onChange={(ev) => field('features')(ev.target.value)} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CardSpecs product={p} set={set} error={e.specs} />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CardSections product={p} set={set} error={e.sections} />
            </Grid>
          </Grid>
        </Collapse>
      </Box>
    </Box>
  );
});

// ── All products ─────────────────────────────────────────────────────────────

const BulkProductGrid = forwardRef(function BulkProductGrid({ meta, onSubmit, submitting }, ref) {
  const [products, setProducts] = useState(() => [makeProduct(meta), makeProduct(meta), makeProduct(meta)]);
  const variations = meta?.variation_options || FALLBACK_VARIATIONS;
  const types = useMemo(() => orderedTypes(variations, 'new'), [variations]);
  const studio = usePhotoStudio();

  // patch: an object, or a function of the product as it is now (for photo checks that finish later).
  const update = useCallback((id, patch) => setProducts((prev) => prev.map((p) => (
    p._id === id ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch) } : p))), []);
  const remove = useCallback((id) => setProducts((prev) => (prev.length > 1 ? prev.filter((p) => p._id !== id) : [makeProduct(meta)])), [meta]);
  const duplicate = useCallback((id) => setProducts((prev) => {
    const i = prev.findIndex((p) => p._id === id);
    const copy = { ...prev[i], _id: newKey(), _errors: {}, title: '', seller_sku: '', photos: [],
      versions: prev[i].versions.map((v) => ({ ...v, key: newKey(), seller_sku: '', photos: [] })) };
    return [...prev.slice(0, i + 1), copy, ...prev.slice(i + 1)];
  }), []);
  const add = (n) => setProducts((prev) => [...prev, ...Array.from({ length: n }, () => makeProduct(meta))]);

  const filled = products.filter((p) => !isBlank(p));

  useImperativeHandle(ref, () => ({
    // Server errors: row = position among the products sent (1-based).
    applyServerErrors(apiErrors, sentIds) {
      if (!Array.isArray(apiErrors)) return;
      setProducts((prev) => prev.map((p) => {
        const hit = apiErrors.find((err) => sentIds?.[err.row - 1] === p._id);
        if (!hit) return p;
        const errors = {};
        Object.entries(hit.errors || {}).forEach(([k, msg]) => {
          const key = k === 'compare_at_price' ? 'price' : k;
          errors[key] = `${FIELD_LABELS[k] ? `${FIELD_LABELS[k]}: ` : ''}${Array.isArray(msg) ? msg.join(' ') : msg}`;
        });
        return { ...p, _errors: errors, _more: p._more || MORE_FIELDS.some((k) => errors[k]) };
      }));
    },
    // Products that were saved leave the list; the ones with problems stay to be fixed.
    keepOnly(ids) {
      setProducts((prev) => {
        const left = prev.filter((p) => ids.includes(p._id));
        return left.length ? left : [makeProduct(meta)];
      });
    },
  }), [meta]);

  const submit = () => {
    let ok = true;
    const checked = products.map((p) => {
      if (isBlank(p)) return p;
      const errors = validate(p);
      if (Object.keys(errors).length) ok = false;
      return { ...p, _errors: errors, _versionsOpen: p._versionsOpen || !!errors.options,
        _more: p._more || MORE_FIELDS.some((k) => errors[k]) };
    });
    setProducts(checked);
    if (!ok) {
      Swal.fire({ icon: 'warning', title: 'A few things to fix', text: 'The products with problems are marked in red.' });
      return;
    }
    const toSend = checked.filter((p) => !isBlank(p));
    const files = [];
    const payload = toSend.map((p, i) => toPayload(p, i, meta, files));
    onSubmit({ products: payload, files, ids: toSend.map((p) => p._id) });
  };

  return (
    <Box>
      {!meta?.defaults?.delivery_methods?.length && (
        <Alert severity="info" sx={{ borderRadius: '10px', mb: 2 }}>
          Choose ships-to countries and delivery methods under “More details” on each product.
        </Alert>
      )}
      <Stack spacing={2}>
        {products.map((p, i) => (
          <ProductCard key={p._id} product={p} index={i} meta={meta} variations={variations} types={types}
            onUpdate={update} onDelete={remove} onDuplicate={duplicate} submitting={submitting} openStudio={studio.open} />
        ))}
      </Stack>

      {/* Sticky footer: always reachable on a phone */}
      <Box sx={{ position: 'sticky', bottom: 0, zIndex: 3, mt: 2, mx: { xs: -2, md: 0 }, px: { xs: 2, md: 2 }, py: 1.5,
        bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', borderRadius: { md: '12px' },
        boxShadow: '0 -4px 16px rgba(0,0,0,0.06)' }}>
        {/* One row on every screen: on a phone the cards keep most of the height. */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
          <Stack direction="row" spacing={1}>
            <Button size="small" startIcon={<AddIcon />} onClick={() => add(1)} disabled={submitting}
              sx={{ borderRadius: '10px', fontWeight: 600, minHeight: 44, bgcolor: 'action.hover', whiteSpace: 'nowrap' }}>
              Add<Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>&nbsp;product</Box>
            </Button>
            <Button size="small" onClick={() => add(5)} disabled={submitting}
              sx={{ display: { xs: 'none', sm: 'inline-flex' }, borderRadius: '10px', fontWeight: 600, minHeight: 44, bgcolor: 'action.hover' }}>Add 5</Button>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {filled.length} product{filled.length === 1 ? '' : 's'} ready
            </Typography>
            {/* Outlined while there is nothing to upload: a disabled dark button reads as a blank block. */}
            <Button variant={filled.length ? 'contained' : 'outlined'} disableElevation onClick={submit} disabled={submitting || !filled.length}
              sx={{ borderRadius: '12px', fontWeight: 700, minHeight: 48, px: { xs: 2, sm: 3 }, whiteSpace: 'nowrap',
                ...(filled.length && { bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }) }}>
              {submitting ? 'Uploading…' : filled.length ? `Upload ${filled.length} product${filled.length === 1 ? '' : 's'}` : 'Upload'}
            </Button>
          </Stack>
        </Stack>
      </Box>
      {studio.element}
    </Box>
  );
});

export default BulkProductGrid;
