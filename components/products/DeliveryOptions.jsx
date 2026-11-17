'use client';

import { Box, Typography, Stack, MenuItem, TextField, IconButton, Button, Radio, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { fieldSx } from './form/fields';

const money = (cost) => (Number(cost) > 0 ? `GHS ${Number(cost).toFixed(2)}` : 'Free');

export function deliveryOptionsError(options) {
  if (!options.length) return 'Add at least one delivery method.';
  if (options.some((o) => !o.deliveryOptionId)) return 'Choose a delivery method in every row, or remove the empty row.';
  const defaults = options.filter((o) => o.default).length;
  if (defaults !== 1) return 'Mark one method as the default.';
  return '';
}

// ── One delivery method ────────────────────────────────────────────────────────
function DeliveryOptionCard({ option, index, deliveryOptions, takenIds, onSetDefault, onChangeOption, onRemove, canRemove }) {
  const selected = deliveryOptions.find((d) => d.id === option.deliveryOptionId);
  const choices = deliveryOptions.filter((d) => d.id === option.deliveryOptionId || !takenIds.includes(d.id));

  return (
    <Box sx={{ borderRadius: '14px', border: '2px solid', borderColor: option.default ? 'text.primary' : 'divider', p: { xs: 1.5, sm: 2 } }}>
      <Stack direction="row" alignItems="flex-start" spacing={1}>
        <Radio checked={!!option.default} onChange={() => onSetDefault(index)} inputProps={{ 'aria-label': 'Default delivery method' }}
          sx={{ mt: -0.25, ml: -0.75 }} />
        <TextField select fullWidth size="small" sx={fieldSx} label="Delivery method"
          value={option.deliveryOptionId || ''} onChange={(e) => onChangeOption(index, e.target.value)}
          SelectProps={{ renderValue: (id) => deliveryOptions.find((d) => d.id === id)?.name || '' }}>
          {choices.map((d) => (
            <MenuItem key={d.id} value={d.id} sx={{ py: 1.25 }}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="body2" fontWeight={600}>{d.name}</Typography>
                <Typography variant="caption" color="text.secondary">{d.min_days}–{d.max_days} days · {money(d.cost)}</Typography>
              </Box>
            </MenuItem>
          ))}
        </TextField>
        <IconButton aria-label="Remove delivery method" onClick={() => onRemove(index)} disabled={!canRemove}
          sx={{ width: 40, height: 40, borderRadius: '10px', color: 'text.secondary', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' } }}>
          <DeleteOutlineIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>

      {selected && (
        <Box sx={{ pl: { xs: 0, sm: 5 }, pt: 1.5, display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'auto auto 1fr' }, gap: { xs: 1, sm: 3 } }}>
          <Box>
            <Typography variant="caption" color="text.secondary">Shopper pays</Typography>
            <Typography variant="body2" fontWeight={700}>{money(selected.cost)}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Arrives in</Typography>
            <Typography variant="body2" fontWeight={700}>{selected.min_days}–{selected.max_days} days</Typography>
          </Box>
          {selected.description && (
            <Box sx={{ gridColumn: { xs: '1 / -1', sm: 'auto' } }}>
              <Typography variant="body2" color="text.secondary">{selected.description}</Typography>
            </Box>
          )}
        </Box>
      )}
      {option.default && (
        <Typography variant="caption" sx={{ display: 'block', pl: { xs: 0, sm: 5 }, pt: 1, fontWeight: 700 }}>
          Default · pre-selected at checkout
        </Typography>
      )}
    </Box>
  );
}

// ── All delivery methods ───────────────────────────────────────────────────────
const EMPTY_ROW = [{ id: null, deliveryOptionId: '', default: true }];

// Controlled by the form (fieldOptions), so it shows a saved product's methods
// even when they arrive after this renders.
const DeliveryOptions = ({ fieldOptions, onOptionsChange, deliveryOptions, error: submitError }) => {
  const options = fieldOptions.length ? fieldOptions : EMPTY_ROW;

  const push = (next) => onOptionsChange(next, deliveryOptionsError(next));

  const takenIds = options.map((o) => o.deliveryOptionId).filter(Boolean);
  const canAdd = options.length < deliveryOptions.length;
  const problem = deliveryOptionsError(options);

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.25 }}>Delivery methods</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        How shoppers can get this item. The one you mark as default is pre-selected at checkout.
      </Typography>

      {(submitError || (problem && options.some((o) => o.deliveryOptionId))) && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: '10px' }}>{submitError || problem}</Alert>
      )}

      <Stack spacing={1.5}>
        {options.map((option, i) => (
          <DeliveryOptionCard
            key={option.id || `row-${i}`}
            option={option}
            index={i}
            deliveryOptions={deliveryOptions}
            takenIds={takenIds}
            onSetDefault={(index) => push(options.map((o, j) => ({ ...o, default: j === index })))}
            onChangeOption={(index, value) => push(options.map((o, j) => (j === index ? { ...o, deliveryOptionId: value } : o)))}
            onRemove={(index) => {
              const rest = options.filter((_, j) => j !== index);
              // Removing the default hands it to the first remaining method.
              if (options[index].default && rest.length) rest[0] = { ...rest[0], default: true };
              push(rest);
            }}
            canRemove={options.length > 1}
          />
        ))}
      </Stack>

      {canAdd && (
        <Button variant="outlined" startIcon={<AddIcon />} fullWidth
          onClick={() => push([...options, { id: null, deliveryOptionId: '', default: options.length === 0 }])}
          sx={{ mt: 1.5, minHeight: 44, borderRadius: '10px', borderColor: 'divider', borderStyle: 'dashed', color: 'text.primary', fontWeight: 600,
            '&:hover': { borderColor: 'text.primary', borderStyle: 'dashed' } }}>
          Add another method
        </Button>
      )}
    </Box>
  );
};

export default DeliveryOptions;
