'use client';

/**
 * BulkProductGrid.jsx
 *
 * An in-browser spreadsheet for adding products in bulk without any CSV knowledge.
 * Sellers fill in a simple table — categories and brands are searchable dropdowns,
 * variants use plain comma-separated text (we convert behind the scenes).
 *
 * Props:
 *   meta          object   — data from /bulk-upload/meta/ (categories, brands, types)
 *   onSubmit      fn       — called with the cleaned rows array ready for the API
 *   submitting    bool     — disables form while upload is in progress
 */

import { useState, useCallback, useRef, memo, forwardRef, useImperativeHandle } from 'react';
import {
  Box, Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
  TextField, Select, MenuItem, Autocomplete, Button, IconButton,
  Typography, Stack, Tooltip, Chip, Collapse, FormControl, Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// ── Field configuration ────────────────────────────────────────────────────────

const PRODUCT_TYPE_OPTIONS = [
  { value: 'new',         label: 'New' },
  { value: 'used',        label: 'Used' },
  { value: 'book',        label: 'Book' },
  { value: 'grocery',     label: 'Grocery / Food' },
  { value: 'refurbished', label: 'Refurbished' },
];

const VARIANT_OPTIONS = [
  { value: 'None',       label: 'No variants' },
  { value: 'Size',       label: 'By size  (S, M, L …)' },
  { value: 'Color',      label: 'By color' },
  { value: 'Size-Color', label: 'By size & color' },
];

// Maps backend field name → friendly label for error display
const FIELD_LABELS = {
  title:            'Product name',
  price:            'Selling price',
  old_price:        'Original / compare-at price',
  sub_category_slug:'Category',
  product_type:     'Product type',
  total_quantity:   'Stock quantity',
  brand_slug:       'Brand',
  variant:          'Variants',
  size_names:       'Sizes',
  color_names:      'Colors',
  weight:           'Weight (kg)',
  description:      'Description',
};

let _nextId = 1;
function makeRow() {
  return {
    _id:          _nextId++,
    _expanded:    false,
    _errors:      {},
    title:        '',
    price:        '',
    old_price:    '',
    sub_category: null,   // full option object { slug, label, ... }
    product_type: 'new',
    total_quantity: '',
    brand:        null,   // full option object { slug, title, ... }
    variant:      'None',
    size_names:   '',
    color_names:  '',
    weight:       '',
    description:  '',
  };
}

function makeRows(n) {
  return Array.from({ length: n }, makeRow);
}

// ── Client-side validation ─────────────────────────────────────────────────────

function validateRow(row) {
  const e = {};
  if (!row.title.trim())                          e.title = 'Required';
  if (!row.price || isNaN(+row.price) || +row.price <= 0) e.price = 'Enter a positive number';
  if (!row.old_price || isNaN(+row.old_price))    e.old_price = 'Required (use same as price if no discount)';
  if (!row.sub_category)                          e.sub_category_slug = 'Select a category';
  if (!row.total_quantity || isNaN(+row.total_quantity) || +row.total_quantity < 0)
    e.total_quantity = 'Enter 0 or more';
  if ((row.variant === 'Size' || row.variant === 'Size-Color') && !row.size_names.trim())
    e.size_names = 'Add at least one size, e.g. S, M, L';
  if ((row.variant === 'Color' || row.variant === 'Size-Color') && !row.color_names.trim())
    e.color_names = 'Add at least one color, e.g. Red, Blue';
  return e;
}

// Convert a grid row into the flat dict the backend serializer expects
function rowToPayload(row, index) {
  return {
    title:            row.title.trim(),
    price:            row.price,
    old_price:        row.old_price,
    sub_category_slug: row.sub_category?.slug ?? '',
    brand_slug:       row.brand?.slug ?? '',
    product_type:     row.product_type,
    total_quantity:   row.total_quantity,
    weight:           row.weight || '1.0',
    volume:           '1.0',
    life:             '',
    variant:          row.variant,
    // Accept commas OR semicolons — normalise to semicolons for the backend
    size_names:       row.size_names.replace(/,\s*/g, ';').trim(),
    color_names:      row.color_names.replace(/,\s*/g, ';').trim(),
    color_codes:      '',
    variant_prices:   '',
    variant_quantities: '',
    description:      row.description.trim(),
    features:         '',
    specifications:   '',
    delivery_returns: '',
  };
}

// ── Tiny reusable cell text field ──────────────────────────────────────────────

const CellInput = memo(function CellInput({ value, onChange, placeholder, type = 'text', error, width = 140 }) {
  return (
    <Box sx={{ minWidth: width }}>
      <TextField
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        size="small"
        error={!!error}
        inputProps={{ style: { fontSize: 13 } }}
        sx={{
          width: '100%',
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            '& fieldset': { borderColor: error ? '#ef4444' : 'divider' },
          },
        }}
      />
      {error && (
        <Typography sx={{ fontSize: 10, color: '#ef4444', mt: 0.25, pl: 0.5, lineHeight: 1.3 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
});

// ── Searchable autocomplete for categories / brands ────────────────────────────

const SearchableSelect = memo(function SearchableSelect({ value, onChange, options, placeholder, error, width = 200 }) {
  return (
    <Box sx={{ minWidth: width }}>
      <Autocomplete
        value={value}
        onChange={(_, v) => onChange(v)}
        options={options}
        getOptionLabel={(o) => o.label ?? o.title ?? ''}
        isOptionEqualToValue={(o, v) => o.slug === v?.slug}
        size="small"
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            error={!!error}
            inputProps={{ ...params.inputProps, style: { fontSize: 13 } }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                '& fieldset': { borderColor: error ? '#ef4444' : 'divider' },
              },
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props} sx={{ fontSize: 12, py: '4px !important' }}>
            {option.label ?? option.title}
          </Box>
        )}
        sx={{ width: '100%' }}
        noOptionsText="No matches"
        clearOnBlur={false}
      />
      {error && (
        <Typography sx={{ fontSize: 10, color: '#ef4444', mt: 0.25, pl: 0.5, lineHeight: 1.3 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
});

// ── Single grid row ────────────────────────────────────────────────────────────

const GridRow = memo(function GridRow({ row, index, meta, onUpdate, onDelete, submitting }) {
  const e = row._errors;
  const showSizes  = row.variant === 'Size'  || row.variant === 'Size-Color';
  const showColors = row.variant === 'Color' || row.variant === 'Size-Color';
  const hasErrors  = Object.keys(e).length > 0;

  const upd = useCallback((field, value) => {
    onUpdate(row._id, { [field]: value, _errors: {} });
  }, [onUpdate, row._id]);

  const catOptions   = meta?.sub_categories ?? [];
  const brandOptions = meta?.brands?.map((b) => ({ ...b, label: b.title })) ?? [];

  return (
    <>
      {/* ── Main row ── */}
      <TableRow
        sx={{
          bgcolor: hasErrors ? 'rgba(239,68,68,0.03)' : 'transparent',
          '&:hover': { bgcolor: hasErrors ? 'rgba(239,68,68,0.05)' : 'action.hover' },
          verticalAlign: 'top',
        }}
      >
        {/* Row number */}
        <TableCell sx={{ py: 1, px: 1, width: 36, textAlign: 'center' }}>
          <Typography sx={{ fontSize: 11, color: hasErrors ? '#ef4444' : 'text.disabled', fontWeight: 600, pt: 0.75 }}>
            {index}
            {hasErrors && <WarningAmberIcon sx={{ fontSize: 10, ml: 0.25, verticalAlign: 'middle' }} />}
          </Typography>
        </TableCell>

        {/* Product name */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <CellInput
            value={row.title}
            onChange={(v) => upd('title', v)}
            placeholder="e.g. Men's White Polo"
            error={e.title}
            width={200}
          />
        </TableCell>

        {/* Selling price */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <CellInput
            value={row.price}
            onChange={(v) => upd('price', v)}
            placeholder="49.99"
            type="number"
            error={e.price}
            width={100}
          />
        </TableCell>

        {/* Original price */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <CellInput
            value={row.old_price}
            onChange={(v) => upd('old_price', v)}
            placeholder="69.99"
            type="number"
            error={e.old_price}
            width={100}
          />
        </TableCell>

        {/* Category */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <SearchableSelect
            value={row.sub_category}
            onChange={(v) => upd('sub_category', v)}
            options={catOptions}
            placeholder="Search category…"
            error={e.sub_category_slug}
            width={220}
          />
        </TableCell>

        {/* Product type */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <Select
            value={row.product_type}
            onChange={(ev) => upd('product_type', ev.target.value)}
            size="small"
            sx={{ fontSize: 13, borderRadius: '8px', minWidth: 130,
              '& fieldset': { borderColor: 'divider' } }}
          >
            {PRODUCT_TYPE_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </TableCell>

        {/* Stock */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <CellInput
            value={row.total_quantity}
            onChange={(v) => upd('total_quantity', v)}
            placeholder="100"
            type="number"
            error={e.total_quantity}
            width={80}
          />
        </TableCell>

        {/* Variant type */}
        <TableCell sx={{ py: 1, px: 0.75 }}>
          <Select
            value={row.variant}
            onChange={(ev) => upd('variant', ev.target.value)}
            size="small"
            sx={{ fontSize: 13, borderRadius: '8px', minWidth: 150,
              '& fieldset': { borderColor: 'divider' } }}
          >
            {VARIANT_OPTIONS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ fontSize: 13 }}>{o.label}</MenuItem>
            ))}
          </Select>
        </TableCell>

        {/* More / Less toggle */}
        <TableCell sx={{ py: 1, px: 0.5, width: 36 }}>
          <Tooltip title={row._expanded ? 'Hide extra fields' : 'Add brand, sizes, description…'}>
            <IconButton
              size="small"
              onClick={() => onUpdate(row._id, { _expanded: !row._expanded })}
              sx={{ color: row._expanded ? 'text.primary' : 'text.disabled' }}
            >
              {row._expanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </IconButton>
          </Tooltip>
        </TableCell>

        {/* Delete */}
        <TableCell sx={{ py: 1, px: 0.5, width: 36 }}>
          <Tooltip title="Remove this row">
            <IconButton
              size="small"
              onClick={() => onDelete(row._id)}
              disabled={submitting}
              sx={{ color: 'text.disabled', '&:hover': { color: '#ef4444' } }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {/* ── Expanded optional fields ── */}
      <TableRow sx={{ bgcolor: 'transparent' }}>
        <TableCell colSpan={10} sx={{ p: 0, border: 'none' }}>
          <Collapse in={row._expanded} unmountOnExit>
            <Box sx={{
              mx: 2, mb: 1.5, mt: 0.5, p: 2, borderRadius: '10px',
              bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider',
            }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>

                {/* Brand */}
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                    Brand <Typography component="span" sx={{ fontSize: 10, fontWeight: 400 }}>(optional)</Typography>
                  </Typography>
                  <SearchableSelect
                    value={row.brand}
                    onChange={(v) => upd('brand', v)}
                    options={brandOptions}
                    placeholder="Search brand…"
                    width={180}
                  />
                </Box>

                {/* Sizes */}
                {showSizes && (
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                      Sizes <Typography component="span" sx={{ fontSize: 10, fontWeight: 400 }}>e.g. S, M, L, XL</Typography>
                    </Typography>
                    <CellInput
                      value={row.size_names}
                      onChange={(v) => upd('size_names', v)}
                      placeholder="S, M, L, XL"
                      error={e.size_names}
                      width={180}
                    />
                  </Box>
                )}

                {/* Colors */}
                {showColors && (
                  <Box>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                      Colors <Typography component="span" sx={{ fontSize: 10, fontWeight: 400 }}>e.g. Red, Blue, Black</Typography>
                    </Typography>
                    <CellInput
                      value={row.color_names}
                      onChange={(v) => upd('color_names', v)}
                      placeholder="Red, Blue, Black"
                      error={e.color_names}
                      width={180}
                    />
                  </Box>
                )}

                {/* Weight */}
                <Box>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                    Weight (kg) <Typography component="span" sx={{ fontSize: 10, fontWeight: 400 }}>(optional)</Typography>
                  </Typography>
                  <CellInput
                    value={row.weight}
                    onChange={(v) => upd('weight', v)}
                    placeholder="0.5"
                    type="number"
                    width={100}
                  />
                </Box>

                {/* Description */}
                <Box sx={{ flex: 1, minWidth: 220 }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>
                    Description <Typography component="span" sx={{ fontSize: 10, fontWeight: 400 }}>(optional)</Typography>
                  </Typography>
                  <TextField
                    value={row.description}
                    onChange={(e) => upd('description', e.target.value)}
                    placeholder="Short product description…"
                    size="small"
                    multiline
                    rows={2}
                    fullWidth
                    inputProps={{ style: { fontSize: 13 } }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', '& fieldset': { borderColor: 'divider' } } }}
                  />
                </Box>

              </Stack>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
});

// ── Column header cell ─────────────────────────────────────────────────────────

function TH({ children, required, tip }) {
  return (
    <TableCell sx={{ py: 1, px: 0.75, whiteSpace: 'nowrap', bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" spacing={0.5}>
        <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', color: 'text.secondary' }}>
          {children}
          {required && <Box component="span" sx={{ color: '#ef4444', ml: 0.25 }}>*</Box>}
        </Typography>
        {tip && (
          <Tooltip title={tip} placement="top" arrow>
            <InfoOutlinedIcon sx={{ fontSize: 12, color: 'text.disabled', cursor: 'help' }} />
          </Tooltip>
        )}
      </Stack>
    </TableCell>
  );
}

// ── Server error translator ────────────────────────────────────────────────────

function friendlyErrors(serverErrors) {
  if (!serverErrors) return {};
  const out = {};
  Object.entries(serverErrors).forEach(([field, msgs]) => {
    const label = FIELD_LABELS[field] ?? field;
    out[field]  = `${label}: ${Array.isArray(msgs) ? msgs.join(' ') : JSON.stringify(msgs)}`;
  });
  return out;
}

// ── Main grid ──────────────────────────────────────────────────────────────────

const BulkProductGrid = forwardRef(function BulkProductGrid({ meta, onSubmit, submitting }, ref) {
  const [rows, setRows] = useState(() => makeRows(5));

  const updateRow = useCallback((id, updates) => {
    setRows((prev) => prev.map((r) => r._id === id ? { ...r, ...updates } : r));
  }, []);

  const deleteRow = useCallback((id) => {
    setRows((prev) => prev.length > 1 ? prev.filter((r) => r._id !== id) : prev);
  }, []);

  const addRows = useCallback((n = 5) => {
    setRows((prev) => [...prev, ...makeRows(n)]);
  }, []);

  const filledRows = rows.filter((r) =>
    r.title.trim() || r.price || r.sub_category
  );

  // Expose applyServerErrors to the parent via ref
  useImperativeHandle(ref, () => ({
    applyServerErrors(apiErrors) {
      if (!Array.isArray(apiErrors)) return;
      setRows((prev) => {
        const updated = [...prev];
        apiErrors.forEach(({ row, errors }) => {
          const idx = row - 2; // API row numbers start at 2
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], _errors: friendlyErrors(errors) };
          }
        });
        return updated;
      });
    },
  }), []);

  const handleSubmit = useCallback(() => {
    if (filledRows.length === 0) return;

    // Validate all filled rows
    let valid = true;
    const updated = rows.map((r) => {
      if (!r.title.trim() && !r.price && !r.sub_category) return r; // blank row — skip
      const errors = validateRow(r);
      if (Object.keys(errors).length) valid = false;
      return { ...r, _errors: errors };
    });
    setRows(updated);
    if (!valid) return;

    const payload = updated
      .filter((r) => r.title.trim() || r.price || r.sub_category)
      .map((r, i) => rowToPayload(r, i + 2));

    onSubmit(payload);
  }, [rows, filledRows, onSubmit]);

  return (
    <Box>
      {/* Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: '12px', mb: 2 }}>
        <Table size="small" stickyHeader sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 36, bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider' }} />
              <TH required tip="The name customers will see on the product page">Product name</TH>
              <TH required tip="The price you want customers to pay (GHS)">Price (GHS)</TH>
              <TH required tip="The original / market price — shown crossed out. Use same as price if no discount.">Original price</TH>
              <TH required tip="Which part of the shop this product belongs to">Category</TH>
              <TH required tip="Condition of the product">Type</TH>
              <TH required tip="How many units you have available right now">Stock</TH>
              <TH tip="Does this product come in different sizes or colours?">Variants</TH>
              <TableCell sx={{ width: 36, bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider' }} />
              <TableCell sx={{ width: 36, bgcolor: 'background.paper', borderBottom: '2px solid', borderColor: 'divider' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, i) => (
              <GridRow
                key={row._id}
                row={row}
                index={i + 1}
                meta={meta}
                onUpdate={updateRow}
                onDelete={deleteRow}
                submitting={submitting}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Footer actions */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 15 }} />}
            onClick={() => addRows(5)}
            disabled={submitting}
            sx={{ borderRadius: '8px', fontSize: 12, fontWeight: 600, color: 'text.secondary', bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
          >
            Add 5 rows
          </Button>
          <Button
            size="small"
            onClick={() => addRows(10)}
            disabled={submitting}
            sx={{ borderRadius: '8px', fontSize: 12, fontWeight: 600, color: 'text.secondary', bgcolor: 'action.hover', '&:hover': { bgcolor: 'action.selected' } }}
          >
            Add 10 rows
          </Button>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="caption" color="text.disabled">
            {filledRows.length} product{filledRows.length !== 1 ? 's' : ''} ready to upload
          </Typography>
          <Button
            variant="contained"
            disableElevation
            onClick={handleSubmit}
            disabled={submitting || filledRows.length === 0}
            sx={{
              bgcolor: 'text.primary', color: 'background.paper',
              borderRadius: '10px', fontWeight: 700, fontSize: 14, px: 3, py: 1.25,
              '&:hover': { bgcolor: 'text.secondary' },
              '&:disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            {submitting
              ? 'Uploading…'
              : `Upload ${filledRows.length} product${filledRows.length !== 1 ? 's' : ''}`}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
});

export default BulkProductGrid;
