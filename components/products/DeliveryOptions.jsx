'use client';

import { Box, Typography, Checkbox, FormControlLabel, Select, MenuItem, Button, FormHelperText } from '@mui/material';
import { useState, useEffect, useMemo } from 'react';

const DeliveryOptions = ({ fieldOptions, onOptionsChange, deliveryOptions }) => {
  const [options, setOptions] = useState(() => fieldOptions.length ? fieldOptions : [
    { id: null, deliveryOptionId: '', default: false }
  ]);
  const [error, setError] = useState('');

  // Memoize options to prevent unnecessary re-renders
  const memoizedOptions = useMemo(() => options, [options]);

  // Validate defaults on changes
  useEffect(() => {
    const defaultCount = options.filter(opt => opt.default).length;
    if (defaultCount > 1) {
      setError('Only one delivery option can be marked as default.');
    } else if (options.length > 0 && defaultCount === 0) {
      setError('At least one delivery option must be marked as default.');
    } else {
      setError('');
    }
  }, [options]);

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    if (field === 'default' && value) {
      // Uncheck other defaults
      newOptions.forEach((opt, i) => {
        if (i !== index) opt.default = false;
      });
    }
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
    onOptionsChange(newOptions, error);  // Pass options and error to parent
  };

  const handleAddOption = () => {
    // Only allow adding if there are available options not yet selected
    const selectedIds = options.map(opt => opt.deliveryOptionId);
    const availableOptions = deliveryOptions.filter(opt => !selectedIds.includes(opt.id));
    if (availableOptions.length === 0) {
      setError('No more delivery options available to add.');
      return;
    }
    const newOptions = [...options, { id: null, deliveryOptionId: '', default: false }];
    setOptions(newOptions);
    onOptionsChange(newOptions, error);  // Pass options and error
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...options];
    newOptions.splice(index, 1);
    if (newOptions.length === 0) {
      setError('At least one delivery option must be selected.');
    }
    setOptions(newOptions);
    onOptionsChange(newOptions, error);  // Pass options and error
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Delivery Options
      </Typography>
      {error && (
        <FormHelperText error sx={{ mb: 2 }}>
          {error}
        </FormHelperText>
      )}
      {options.map((option, index) => {
        const selectedOption = deliveryOptions.find(opt => opt.id === option.deliveryOptionId);
        return (
          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={option.default || false}
                  onChange={(e) => handleOptionChange(index, 'default', e.target.checked)}
                />
              }
              label="Default Option"
            />
            <Select
              value={option.deliveryOptionId || ''}
              onChange={(e) => handleOptionChange(index, 'deliveryOptionId', e.target.value)}
              fullWidth
              sx={{ mt: 1 }}
              displayEmpty
            >
              <MenuItem value="" disabled>Select Delivery Option</MenuItem>
              {deliveryOptions
                .filter(opt => !options.some(o => o.deliveryOptionId === opt.id && o !== option))
                .map((deliveryOption) => (
                  <MenuItem key={deliveryOption.id} value={deliveryOption.id}>
                    {deliveryOption.name}
                  </MenuItem>
                ))
              }
            </Select>
            {selectedOption && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2">Cost: {selectedOption.cost} GHS</Typography>
                <Typography variant="body2">
                  Estimated Delivery: {selectedOption.min_days} - {selectedOption.max_days} days
                </Typography>
                <Typography variant="body2">Description: {selectedOption.description}</Typography>
              </Box>
            )}
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleRemoveOption(index)}
              sx={{ mt: 1 }}
              disabled={options.length === 1}
            >
              Remove
            </Button>
          </Box>
        );
      })}
      <Button
        variant="contained"
        onClick={handleAddOption}
        sx={{ mt: 2 }}
        disabled={options.length >= deliveryOptions.length}
      >
        Add Delivery Option
      </Button>
    </Box>
  );
};

export default DeliveryOptions;