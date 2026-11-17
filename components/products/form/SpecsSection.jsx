'use client';

import React from 'react';
import { Alert, Box, Divider } from '@mui/material';
import ProductSpecs from '../ProductSpecs';
import PinnedComplements from '../PinnedComplements';

export default function SpecsSection({ id, formData, formErrors, specs, pinned }) {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {formErrors.attributes && <Alert severity="error" sx={{ borderRadius: '10px' }}>{formErrors.attributes}</Alert>}
      <ProductSpecs specs={specs} hasCategory={!!formData.sub_category} />
      <Divider />
      <PinnedComplements productId={id} pinned={pinned} />
    </Box>
  );
}
