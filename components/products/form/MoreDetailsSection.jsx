'use client';

import React from 'react';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { fieldSx, NumberField } from './fields';

export default function MoreDetailsSection({ formData, setField, formErrors, handleDateChange }) {
  return (
    <Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 4 }}>
          <NumberField decimals={false} label="Return window" value={formData.return_period_days}
            onChange={(v) => setField('return_period_days', v)}
            InputProps={{ endAdornment: <Box component="span" sx={{ color: 'text.secondary', pl: 1 }}>days</Box> }}
            error={!!formErrors.return_period_days}
            helperText={formErrors.return_period_days || 'Days a shopper has to return it. 0 = no returns.'} />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker label="Manufacture date" value={formData.mfd ? dayjs(formData.mfd) : null}
              onChange={handleDateChange} disableFuture
              slotProps={{ textField: { size: 'small', fullWidth: true, sx: fieldSx, error: !!formErrors.mfd,
                helperText: formErrors.mfd || 'Optional.' } }} />
          </LocalizationProvider>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <NumberField decimals={false} label="Shelf life" value={formData.life}
            onChange={(v) => setField('life', v)}
            InputProps={{ endAdornment: <Box component="span" sx={{ color: 'text.secondary', pl: 1 }}>months</Box> }}
            error={!!formErrors.life} helperText={formErrors.life || 'For food, cosmetics, batteries…'} />
        </Grid>
      </Grid>
    </Box>
  );
}
