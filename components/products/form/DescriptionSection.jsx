'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { Box, FormHelperText, Skeleton, Typography } from '@mui/material';
import InfoSections from './InfoSections';

const Editor = dynamic(() => import('../Editor'), { ssr: false, loading: () => <Skeleton variant="rounded" height={140} /> });

const BLOCKS = [
  { field: 'description', label: 'Description', hint: 'What it is, who it is for, and why it is worth buying.', placeholder: 'Describe the product…' },
  { field: 'features', label: 'Key features', hint: 'Short points shoppers scan first.', placeholder: 'One feature per line…' },
  { field: 'delivery_returns', label: 'Delivery & returns note', hint: 'Optional. Anything special about sending or returning this item.', placeholder: 'e.g. Fragile, packed in a hard box…' },
];

function Block({ b, formData, formErrors, handleEditorChange }) {
  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>{b.label}</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>{b.hint}</Typography>
      <Editor value={formData[b.field]} onChange={handleEditorChange(b.field)} placeholder={b.placeholder} />
      {formErrors[b.field] && <FormHelperText error>{formErrors[b.field]}</FormHelperText>}
    </Box>
  );
}

export default function DescriptionSection(props) {
  const [description, features, delivery] = BLOCKS;
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Block b={description} {...props} />
      <Block b={features} {...props} />
      <InfoSections {...props} />
      <Block b={delivery} {...props} />
    </Box>
  );
}
