'use client';

/**
 * Product information sections the seller names, like Amazon's "Product
 * information": a laptop has Processor, Display, Memory; a food item has
 * Ingredients, Nutrition facts, Storage. Each section is written with the
 * same editor as the description.
 *
 * formData.info_sections = [{ key, title, body }] (key is only for React).
 * Backend: product/info_sections.py (same limits as here).
 */

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Autocomplete, Box, Button, Chip, FormHelperText, IconButton, Skeleton, Stack, TextField, Tooltip, Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowUpwardRoundedIcon from '@mui/icons-material/ArrowUpwardRounded';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { fieldSx } from './fields';
import { MAX_SECTIONS, MAX_TITLE, newSection, suggestedTitles } from './infoSectionRules';

const Editor = dynamic(() => import('../Editor'), { ssr: false, loading: () => <Skeleton variant="rounded" height={120} /> });

export default function InfoSections({ formData, setField, selectedCategory, formErrors }) {
  const sections = formData.info_sections || [];
  const suggestions = useMemo(
    () => suggestedTitles(selectedCategory, formData.product_type),
    [selectedCategory, formData.product_type],
  );
  const used = new Set(sections.map((s) => (s.title || '').trim().toLowerCase()));
  const unused = suggestions.filter((t) => !used.has(t.toLowerCase()));
  const full = sections.length >= MAX_SECTIONS;

  const set = (next) => setField('info_sections', next);
  const update = (key, patch) => set(sections.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  const move = (i, by) => {
    const next = [...sections];
    [next[i], next[i + by]] = [next[i + by], next[i]];
    set(next);
  };
  const remove = (key) => set(sections.filter((s) => s.key !== key));
  const add = (title = '') => { if (!full) set([...sections, newSection(title)]); };

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Product information</Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Make your own sections and name them for your product. A laptop might have Processor, Display and Memory;
        a food item Ingredients, Nutrition facts and Storage. Shoppers open them on your product page.
      </Typography>

      <Stack spacing={1.5}>
        {sections.map((s, i) => (
          <Box key={s.key} sx={{ border: 1, borderColor: 'divider', borderRadius: '12px', p: { xs: 1.25, sm: 1.5 } }}>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
              <Autocomplete
                freeSolo
                fullWidth
                size="small"
                options={unused}
                inputValue={s.title}
                onInputChange={(_, value) => update(s.key, { title: value.slice(0, MAX_TITLE) })}
                renderInput={(params) => (
                  <TextField {...params} label={`Section ${i + 1} title`} placeholder="e.g. Ingredients, Display, Size & fit"
                    sx={fieldSx} />
                )}
              />
              <Tooltip title="Move up"><span>
                <IconButton size="small" aria-label="Move section up" disabled={i === 0} onClick={() => move(i, -1)}>
                  <ArrowUpwardRoundedIcon fontSize="small" />
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Move down"><span>
                <IconButton size="small" aria-label="Move section down" disabled={i === sections.length - 1} onClick={() => move(i, 1)}>
                  <ArrowDownwardRoundedIcon fontSize="small" />
                </IconButton>
              </span></Tooltip>
              <Tooltip title="Remove section">
                <IconButton size="small" aria-label="Remove section" onClick={() => remove(s.key)}>
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
            <Editor value={s.body} onChange={(body) => update(s.key, { body })}
              placeholder={s.title ? `Write about ${s.title.toLowerCase()}… (lists and tables work well)` : 'Write this section…'} />
          </Box>
        ))}
      </Stack>

      {formErrors.info_sections && <FormHelperText error sx={{ mt: 1 }}>{formErrors.info_sections}</FormHelperText>}

      <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center', mt: 1.5 }}>
        <Button size="small" variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => add()} disabled={full}
          sx={{ borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}>
          Add a section
        </Button>
        {!full && unused.slice(0, 8).map((t) => (
          <Chip key={t} size="small" variant="outlined" icon={<AddRoundedIcon />} label={t} onClick={() => add(t)}
            sx={{ borderRadius: '8px' }} />
        ))}
      </Stack>
      {full && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          {MAX_SECTIONS} sections is the most. Merge some to add another.
        </Typography>
      )}
    </Box>
  );
}
