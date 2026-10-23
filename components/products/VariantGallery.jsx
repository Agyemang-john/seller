'use client';

import React, { useRef, useState } from 'react';
import { Box, Typography, Stack, IconButton, Button, Chip, Tooltip, CircularProgress } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { validateImage, squareifyImage } from './fileValidators';
import Swal from 'sweetalert2';

const THUMB = { xs: 76, sm: 88 };

const roundBtn = {
  position: 'absolute', width: 24, height: 24, p: 0,
  bgcolor: 'rgba(0,0,0,0.6)', color: '#ffffff', backdropFilter: 'blur(4px)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
};

function UpgradeLink({ children }) {
  // New tab, so the seller doesn't lose the product they're editing.
  return (
    <Button component="a" href="/subscribe" target="_blank" rel="noopener" size="small" variant="contained" disableElevation
      sx={{ borderRadius: '8px', bgcolor: 'text.primary', color: 'background.paper', fontWeight: 600, fontSize: 12, flexShrink: 0, '&:hover': { bgcolor: 'text.secondary' } }}>
      {children}
    </Button>
  );
}

/**
 * Extra photos for one variant, shown under its fields. `limit` comes from the
 * store's plan (null while loading, 0 when the plan doesn't include it).
 * Photos already on a variant stay after a downgrade; only adding is blocked.
 */
export default function VariantGallery({ index, gallery = [], limit, onChange }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const locked = limit === 0;
  const remaining = limit == null ? 0 : Math.max(limit - gallery.length, 0);

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (inputRef.current) inputRef.current.value = '';
    if (files.length === 0) return;

    const accepted = files.slice(0, remaining);
    const errors = [];
    if (files.length > remaining) {
      errors.push(`Only ${remaining} more photo${remaining === 1 ? '' : 's'} fit on this variant with your plan.`);
    }

    setBusy(true);
    const added = [];
    for (const file of accepted) {
      const squared = await squareifyImage(file, 'pad', '#FFFFFF');
      const check = await validateImage(squared, { maxSizeMB: 2, minResolution: 400, maxResolution: 1800, checkBackground: true });
      if (!check.valid) {
        errors.push(`<b>${file.name.replace(/[&<>"']/g, '')}</b>: ${check.errors.join(' ')}`);
        continue;
      }
      added.push({
        key: `pending-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        id: null, file: squared, url: URL.createObjectURL(squared),
      });
    }
    setBusy(false);

    if (added.length) onChange(index, (prev) => [...prev, ...added]);
    if (errors.length) Swal.fire({ icon: 'warning', title: 'Some photos were not added', html: errors.join('<br/>') });
  };

  const remove = (key) => onChange(index, (prev) => {
    const item = prev.find((g) => g.key === key);
    if (item?.file && item.url) URL.revokeObjectURL(item.url);
    return prev.filter((g) => g.key !== key);
  });

  const moveEarlier = (i) => onChange(index, (prev) => {
    const next = [...prev];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    return next;
  });

  return (
    <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mb: 1.25 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} color="text.primary">More photos</Typography>
          <Typography variant="caption" color="text.disabled">
            Other angles, close-ups, the item in use
          </Typography>
        </Box>
        {locked ? (
          <Chip icon={<LockOutlinedIcon sx={{ fontSize: '14px !important' }} />} label="Paid plans" size="small"
            sx={{ height: 22, fontSize: 11, fontWeight: 600, borderRadius: '6px', flexShrink: 0 }} />
        ) : limit != null && (
          <Chip label={`${gallery.length} / ${limit}`} size="small"
            color={gallery.length >= limit ? 'warning' : 'default'}
            sx={{ height: 22, fontSize: 11, fontWeight: 700, borderRadius: '6px', flexShrink: 0 }} />
        )}
      </Stack>

      {locked && (
        <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.25}
          sx={{ p: 1.5, mb: gallery.length ? 1.25 : 0, borderRadius: '12px', bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
            {gallery.length
              ? 'Your current plan doesn’t include extra variant photos. The ones below stay live; upgrade to add more.'
              : 'Show shoppers each colour or size from every angle. Extra variant photos come with paid plans.'}
          </Typography>
          <UpgradeLink>Upgrade</UpgradeLink>
        </Stack>
      )}

      {(gallery.length > 0 || remaining > 0) && (
        <Box
          sx={{
            display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5,
            scrollSnapType: 'x proximity', WebkitOverflowScrolling: 'touch',
            '&::-webkit-scrollbar': { height: 4 },
            '&::-webkit-scrollbar-thumb': { bgcolor: 'divider', borderRadius: 2 },
          }}
        >
          {gallery.map((g, i) => (
            <Box key={g.key} sx={{ position: 'relative', flex: '0 0 auto', width: THUMB, height: THUMB, borderRadius: '10px', overflow: 'hidden', border: '1px solid', borderColor: 'divider', scrollSnapAlign: 'start' }}>
              <Box component="img" src={g.url} alt={`Variant ${index + 1} photo ${i + 2}`} loading="lazy"
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              {g.file && (
                <Box sx={{ position: 'absolute', left: 4, bottom: 4, px: 0.5, borderRadius: '4px', bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 9, fontWeight: 700, letterSpacing: '0.04em' }}>
                  NEW
                </Box>
              )}
              <Tooltip title="Remove photo">
                <IconButton size="small" aria-label="Remove photo" onClick={() => remove(g.key)}
                  sx={{ ...roundBtn, top: 4, right: 4, '&:hover': { bgcolor: 'rgba(220,38,38,0.9)' } }}>
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              {i > 0 && (
                <Tooltip title="Move earlier">
                  <IconButton size="small" aria-label="Move photo earlier" onClick={() => moveEarlier(i)}
                    sx={{ ...roundBtn, bottom: 4, right: 4 }}>
                    <ChevronLeftIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          ))}

          {remaining > 0 && (
            <Box
              component="label"
              sx={{
                flex: '0 0 auto', width: THUMB, height: THUMB, borderRadius: '10px',
                border: '2px dashed', borderColor: 'divider', bgcolor: 'action.hover',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                cursor: busy ? 'progress' : 'pointer', transition: 'border-color 0.18s', scrollSnapAlign: 'start',
                '&:hover': { borderColor: 'text.primary' },
              }}
            >
              <input ref={inputRef} type="file" accept="image/*" multiple hidden disabled={busy}
                onChange={(e) => handleFiles(e.target.files)} />
              {busy
                ? <CircularProgress size={18} />
                : <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />}
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10, fontWeight: 600 }}>
                {busy ? 'Checking…' : 'Add photos'}
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {!locked && limit != null && remaining === 0 && (
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} sx={{ mt: 1 }}>
          <Typography variant="caption" color="text.disabled">
            You’ve used all {limit} photos your plan allows for this variant.
          </Typography>
          <UpgradeLink>Get more</UpgradeLink>
        </Stack>
      )}
    </Box>
  );
}
