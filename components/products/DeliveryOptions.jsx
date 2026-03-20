'use client';

import { Box, Typography, Stack, Select, MenuItem, Chip, FormHelperText, IconButton, Button, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import { useState, useEffect, useMemo } from 'react';

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '& fieldset': { borderColor: 'divider' },
  },
};

// ── Single delivery option row ─────────────────────────────────────────────────
function DeliveryOptionCard({ option, index, deliveryOptions, availableOptions, isDefault, onSetDefault, onChangeOption, onRemove, canRemove }) {
  const selected = deliveryOptions.find((d) => d.id === option.deliveryOptionId);

  return (
    <Box
      sx={{
        borderRadius: '14px',
        border: '2px solid',
        borderColor: isDefault ? 'text.primary' : 'divider',
        bgcolor: isDefault ? 'action.hover' : 'background.paper',
        overflow: 'hidden',
        transition: 'all 0.18s',
      }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5 }}>
        {/* Default toggle */}
        <Box
          onClick={() => onSetDefault(index)}
          sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', flexShrink: 0 }}
        >
          {isDefault
            ? <CheckCircleIcon sx={{ fontSize: 20, color: 'text.primary' }} />
            : <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
          }
        </Box>

        {/* Select */}
        <Select
          value={option.deliveryOptionId || ''}
          onChange={(e) => onChangeOption(index, e.target.value)}
          displayEmpty
          size="small"
          sx={{ flex: 1, ...fieldSx['& .MuiOutlinedInput-root'] && fieldSx }}
        >
          <MenuItem value="" disabled>Select a delivery method</MenuItem>
          {[...availableOptions, ...(selected ? [selected] : [])].map((d) => (
            <MenuItem key={d.id} value={d.id}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <LocalShippingOutlinedIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
                <Box>
                  <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.3 }}>{d.name}</Typography>
                  <Typography variant="caption" color="text.disabled">{d.min_days}–{d.max_days} days</Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto', flexShrink: 0 }}>
                  GHS {d.cost ?? 'Free'}
                </Typography>
              </Stack>
            </MenuItem>
          ))}
        </Select>

        {isDefault && (
          <Chip label="Default" size="small" sx={{ height: 20, fontSize: 10, fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', borderRadius: '5px', flexShrink: 0, '& .MuiChip-label': { px: 1 } }} />
        )}

        <IconButton
          size="small"
          onClick={() => onRemove(index)}
          disabled={!canRemove}
          sx={{ flexShrink: 0, borderRadius: '8px', color: 'text.disabled', '&:hover': { bgcolor: 'error.lighter', color: 'error.main' }, '&.Mui-disabled': { opacity: 0.3 } }}
        >
          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
        </IconButton>
      </Stack>

      {/* Selected option details */}
      {selected && (
        <>
          <Divider />
          <Stack direction="row" spacing={3} sx={{ px: 2, py: 1.25 }}>
            <Box>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Cost</Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">GHS {selected.cost ?? '0.00'}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Delivery time</Typography>
              <Typography variant="body2" fontWeight={700} color="text.primary">{selected.min_days}–{selected.max_days} days</Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Description</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>{selected.description}</Typography>
            </Box>
          </Stack>
        </>
      )}
    </Box>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
const DeliveryOptions = ({ fieldOptions, onOptionsChange, deliveryOptions }) => {
  const [options, setOptions] = useState(() =>
    fieldOptions.length ? fieldOptions : [{ id: null, deliveryOptionId: '', default: false }]
  );
  const [error, setError] = useState('');

  // Validate
  useEffect(() => {
    const defaultCount = options.filter((o) => o.default).length;
    if (options.length > 0 && defaultCount === 0)  setError('Mark one option as the default delivery method.');
    else if (defaultCount > 1)                     setError('Only one option can be the default.');
    else                                            setError('');
  }, [options]);

  const push = (newOpts) => {
    setOptions(newOpts);
    onOptionsChange(newOpts, error);
  };

  const handleSetDefault = (index) => {
    push(options.map((o, i) => ({ ...o, default: i === index })));
  };

  const handleChangeOption = (index, value) => {
    const updated = [...options];
    updated[index] = { ...updated[index], deliveryOptionId: value };
    push(updated);
  };

  const handleRemove = (index) => {
    const updated = options.filter((_, i) => i !== index);
    push(updated);
  };

  const handleAdd = () => {
    const selectedIds = options.map((o) => o.deliveryOptionId);
    const available   = deliveryOptions.filter((d) => !selectedIds.includes(d.id));
    if (!available.length) { setError('All available delivery options are already added.'); return; }
    push([...options, { id: null, deliveryOptionId: '', default: false }]);
  };

  // Compute available options per row (exclude already-selected ones)
  const selectedIds = options.map((o) => o.deliveryOptionId);
  const globalAvailable = deliveryOptions.filter((d) => !selectedIds.includes(d.id));

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }} color="text.primary">
            Delivery methods
          </Typography>
          <Typography variant="caption" color="text.disabled">
            {options.length} method{options.length !== 1 ? 's' : ''} · click a row to set it as default
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          startIcon={<AddIcon sx={{ fontSize: 14 }} />}
          onClick={handleAdd}
          disabled={options.length >= deliveryOptions.length}
          sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontWeight: 600, fontSize: 12, flexShrink: 0, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}
        >
          Add method
        </Button>
      </Stack>

      {error && (
        <Box sx={{ mb: 2, px: 2, py: 1.25, borderRadius: '10px', bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light' }}>
          <Typography variant="caption" color="error.main" fontWeight={600}>{error}</Typography>
        </Box>
      )}

      {options.length === 0 ? (
        <Box
          onClick={handleAdd}
          sx={{
            border: '2px dashed', borderColor: 'divider', borderRadius: '16px',
            p: 5, textAlign: 'center', cursor: 'pointer',
            '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          <LocalShippingOutlinedIcon sx={{ fontSize: 28, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>No delivery methods yet</Typography>
          <Typography variant="caption" color="text.disabled">Click to add your first delivery method</Typography>
        </Box>
      ) : (
        <Stack spacing={1.5}>
          {options.map((option, i) => (
            <DeliveryOptionCard
              key={i}
              option={option}
              index={i}
              deliveryOptions={deliveryOptions}
              availableOptions={globalAvailable}
              isDefault={option.default}
              onSetDefault={handleSetDefault}
              onChangeOption={handleChangeOption}
              onRemove={handleRemove}
              canRemove={options.length > 1}
            />
          ))}
        </Stack>
      )}

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2.5, textAlign: 'center' }}>
        The default delivery method is pre-selected for customers at checkout.
      </Typography>
    </Box>
  );
};

export default DeliveryOptions;