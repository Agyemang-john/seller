'use client';

import React from 'react';
import { Alert, Box } from '@mui/material';
import VariantRow from '../Variant';

export default function VariantsSection({
  formData, setFormData, formErrors, variants, setVariants, sizes, colors,
  variantImagePreviews, setVariantImagePreviews,
}) {
  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {formErrors.variants && <Alert severity="error" sx={{ borderRadius: '10px' }}>{formErrors.variants}</Alert>}
      <VariantRow
        formData={formData} setFormData={setFormData} formErrors={formErrors}
        variants={variants} setVariants={setVariants}
        sizes={sizes} colors={colors}
        variantImagePreviews={variantImagePreviews}
        setVariantImagePreviews={setVariantImagePreviews}
      />
    </Box>
  );
}
