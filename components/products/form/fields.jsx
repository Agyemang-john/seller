'use client';

/**
 * Small building blocks shared by every section of the product form.
 */

import React from 'react';
import { Box, Chip, Stack, TextField, Typography } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorRoundedIcon from '@mui/icons-material/ErrorRounded';

export const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: '10px',
    '& fieldset': { borderColor: 'divider' },
  },
};

/**
 * A number typed as text. type="number" lets a mouse wheel change the price,
 * hides the decimal key on some phone keyboards and can't be cleared on iOS;
 * inputMode brings up the right keypad on every phone and tablet instead.
 */
export function NumberField({ value, onChange, decimals = true, ...props }) {
  // decimals: true = 2 places, false = whole numbers, or a number of places.
  const places = decimals === true ? 2 : decimals === false ? 0 : decimals;
  const handle = (e) => {
    let next = e.target.value.replace(',', '.').replace(places ? /[^\d.]/g : /\D/g, '');
    if (places) {
      const [whole, ...rest] = next.split('.');
      next = rest.length ? `${whole}.${rest.join('').slice(0, places)}` : whole;
    }
    onChange(next);
  };
  return (
    <TextField
      {...props}
      value={value ?? ''}
      onChange={handle}
      size="small"
      fullWidth
      sx={{ ...fieldSx, ...(props.sx || {}) }}
      inputProps={{ inputMode: places ? 'decimal' : 'numeric', autoComplete: 'off', ...(props.inputProps || {}) }}
    />
  );
}

/** A labelled group of fields inside a section. */
export function FieldGroup({ title, hint, children }) {
  return (
    <Box>
      {title && (
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: hint ? 0.25 : 1.25 }}>{title}</Typography>
      )}
      {hint && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{hint}</Typography>}
      <Stack spacing={2}>{children}</Stack>
    </Box>
  );
}

/** Status shown beside a section title and in the section lists. */
export function SectionStatus({ status }) {
  if (status === 'error') {
    return <Chip size="small" icon={<ErrorRoundedIcon />} label="Fix this" color="error" variant="outlined"
      sx={{ height: 22, fontSize: 11, fontWeight: 700, borderRadius: '6px' }} />;
  }
  if (status === 'done') {
    return <Chip size="small" icon={<CheckCircleRoundedIcon />} label="Done" color="success" variant="outlined"
      sx={{ height: 22, fontSize: 11, fontWeight: 700, borderRadius: '6px' }} />;
  }
  if (status === 'optional') {
    return <Chip size="small" label="Optional" variant="outlined"
      sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: '6px', color: 'text.secondary' }} />;
  }
  return <Chip size="small" label="Required" variant="outlined"
    sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: '6px', color: 'text.secondary' }} />;
}

/** One card on the page. `id` is the scroll target used by the section lists. */
export function SectionCard({ id, title, subtitle, icon: Icon, status, children }) {
  return (
    <Box
      id={id}
      component="section"
      aria-labelledby={`${id}-title`}
      sx={{
        // Clears the sticky section bar on phones and tablets when jumped to.
        scrollMarginTop: { xs: 64, lg: 16 },
        borderRadius: { xs: '16px', sm: '20px' },
        border: '1px solid',
        borderColor: status === 'error' ? 'error.light' : 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1.5}
        sx={{ px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 2.5 }, pb: { xs: 1.5, sm: 2 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        {Icon && (
          <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Box>
        )}
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography id={`${id}-title`} component="h2"
            sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 18, sm: 20 }, fontWeight: 700, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
            {title}
          </Typography>
          {subtitle && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{subtitle}</Typography>}
        </Box>
        <SectionStatus status={status} />
      </Stack>
      <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
    </Box>
  );
}

/** Plain text from an editor's HTML, to tell whether anything was written. */
export const plainText = (html) => (html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').trim();
