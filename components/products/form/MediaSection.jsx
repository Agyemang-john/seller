'use client';

/**
 * Main photo, gallery and video in one place. Sellers can pick or drag in many
 * photos at once: with no main photo yet, the first becomes the main photo and
 * the rest fill the gallery up to the plan's limit. Every photo is squared and
 * checked (photoBatch.js). On a phone the picker offers the camera as well.
 */

import React, { useRef } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, Stack, Typography } from '@mui/material';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import CloseIcon from '@mui/icons-material/Close';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import useSWR from 'swr';
import { fetcher } from '@/components/dashboard/DashboardUI';
import { checkPhoto, checkPhotos, imagesOnly, overLimitNote, reportProblems, useBatchProgress, useDropPhotos } from '../photoBatch';
import { FieldGroup } from './fields';

const TILE = { borderRadius: '14px', overflow: 'hidden', position: 'relative', aspectRatio: '1', border: '1px solid', borderColor: 'divider', bgcolor: 'action.hover' };

const removeBtn = {
  position: 'absolute', top: 6, right: 6, width: 32, height: 32,
  bgcolor: 'rgba(0,0,0,0.6)', color: '#ffffff', backdropFilter: 'blur(4px)',
  '&:hover': { bgcolor: 'rgba(220,38,38,0.9)' },
};

const readAsDataUrl = (file) => new Promise((resolve) => {
  const reader = new FileReader();
  reader.onloadend = () => resolve(reader.result);
  reader.readAsDataURL(file);
});

export default function MediaSection({ formErrors, images, setImages, imagePreview, videoPreview, handleFileChange }) {
  const galleryInput = useRef(null);
  const { busy, label: progressLabel, run } = useBatchProgress();
  const { data: plan } = useSWR('/api/v1/vendor/plan/', fetcher, { revalidateOnFocus: false });
  const limit = plan?.max_images_per_product ?? null; // null: no limit
  const filled = images.filter((i) => i.previewUrl);
  const room = limit == null ? Infinity : Math.max(limit - filled.length, 0);

  /**
   * main: 'fill' = the first photo becomes the main photo if there is none yet,
   * 'replace' = the first photo replaces the main photo, 'none' = all to the gallery.
   */
  const addPhotos = async (fileList, main = 'fill') => {
    const files = imagesOnly(fileList);
    if (galleryInput.current) galleryInput.current.value = '';
    if (!files.length || busy) return;
    const mainFile = main === 'replace' || (main === 'fill' && !imagePreview) ? files.shift() : null;
    const accepted = files.slice(0, room);
    const skipped = files.length - accepted.length;

    const problems = await run((mainFile ? 1 : 0) + accepted.length, async (onProgress) => {
      const out = [];
      if (mainFile) {
        const r = await checkPhoto(mainFile);
        if (r.file) handleFileChange({ target: { files: [r.file] } }, 'image');
        else out.push(r.error);
        onProgress(1, (mainFile ? 1 : 0) + accepted.length);
      }
      if (accepted.length) {
        const offset = mainFile ? 1 : 0;
        const { good, problems: bad } = await checkPhotos(accepted, (done) => onProgress(done + offset, accepted.length + offset));
        out.push(...bad);
        const items = await Promise.all(good.map(async (file) => ({ id: null, file, previewUrl: await readAsDataUrl(file), title: '' })));
        // Drop empty slots left by the old form; keep order: existing first, new after.
        if (items.length) setImages((prev) => [...prev.filter((i) => i.previewUrl), ...items]);
      }
      return out;
    });
    if (skipped > 0) problems.push(overLimitNote(skipped, limit));
    reportProblems(problems);
  };

  const { dragging, dropProps } = useDropPhotos((files) => addPhotos(files, 'fill'), busy);

  const removePhoto = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      <Box {...dropProps} sx={{ display: 'grid', gap: 3, position: 'relative', borderRadius: '16px' }}>
      {dragging && (
        <Stack alignItems="center" justifyContent="center" spacing={1}
          sx={{ position: 'absolute', inset: -8, zIndex: 2, borderRadius: '16px', border: '2px dashed', borderColor: 'primary.main',
            bgcolor: 'rgba(25,118,210,0.08)', backdropFilter: 'blur(2px)', pointerEvents: 'none' }}>
          <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography fontWeight={700}>Drop your photos here</Typography>
          <Typography variant="caption" color="text.secondary">
            {imagePreview ? 'They go into "More photos".' : 'The first becomes the main photo, the rest go into "More photos".'}
          </Typography>
        </Stack>
      )}
      {busy && (
        <Alert severity="info" icon={<CircularProgress size={18} />} sx={{ borderRadius: '10px' }}>
          {progressLabel} Squaring each photo and checking its size and background.
        </Alert>
      )}
      <FieldGroup title="Main photo" hint="The first thing shoppers see. Use a plain, light background. It's cropped to a square for you. You can select several photos here: the first becomes the main photo, the rest go into More photos.">
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '220px 1fr' }, gap: 2, alignItems: 'center' }}>
          <Box component="label" htmlFor="product-main-photo"
            sx={{ ...TILE, maxWidth: { xs: 260, sm: 'none' }, width: '100%', mx: { xs: 'auto', sm: 0 }, cursor: 'pointer', display: 'block',
              borderStyle: imagePreview ? 'solid' : 'dashed', borderWidth: imagePreview ? 1 : 2,
              borderColor: formErrors.image ? 'error.main' : 'divider',
              '&:hover': { borderColor: 'text.primary' } }}>
            <input id="product-main-photo" type="file" accept="image/*" multiple hidden disabled={busy}
              onChange={(e) => { const files = Array.from(e.target.files || []); e.target.value = ''; addPhotos(files, 'replace'); }} />
            {imagePreview ? (
              <>
                <Box component="img" src={imagePreview} alt="Main product photo"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <Stack direction="row" spacing={0.5} alignItems="center"
                  sx={{ position: 'absolute', left: 8, bottom: 8, px: 1, py: 0.5, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.6)', color: '#fff' }}>
                  <SwapHorizIcon sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: 12, fontWeight: 600 }}>Replace</Typography>
                </Stack>
              </>
            ) : (
              <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: '100%', p: 2, textAlign: 'center' }}>
                <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled' }} />
                <Typography variant="body2" fontWeight={700}>Add photos</Typography>
                <Typography variant="caption" color="text.secondary">Choose one or several, or drag them here</Typography>
              </Stack>
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            JPG or PNG, at least 400 px, up to 2 MB. Show the whole item, centred, with nothing else in the picture.
          </Typography>
        </Box>
        {formErrors.image && <Alert severity="error" sx={{ borderRadius: '10px' }}>{formErrors.image}</Alert>}
      </FieldGroup>

      <FieldGroup title="More photos"
        hint={`Other angles, close-ups, the item in use. Select several at once or drag them in. ${limit == null ? '' : `${filled.length} of ${limit} on your plan.`}`}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(5, 1fr)' }, gap: { xs: 1, sm: 1.5 } }}>
          {filled.map((img, index) => (
            <Box key={img.id || img.previewUrl.slice(-24) + index} sx={TILE}>
              <Box component="img" src={img.previewUrl} alt={`Product photo ${index + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <IconButton aria-label={`Remove photo ${index + 1}`} size="small" onClick={() => removePhoto(images.indexOf(img))} sx={removeBtn}>
                <CloseIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          ))}
          {room > 0 && (
            <Box component="button" type="button" onClick={() => galleryInput.current?.click()} disabled={busy}
              sx={{ ...TILE, borderStyle: 'dashed', borderWidth: 2, cursor: 'pointer', font: 'inherit', color: 'inherit',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5,
                '&:hover': { borderColor: 'text.primary' } }}>
              {busy ? <CircularProgress size={22} /> : <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 26, color: 'text.disabled' }} />}
              <Typography variant="caption" fontWeight={700} color="text.secondary">{busy ? progressLabel : 'Add photos'}</Typography>
            </Box>
          )}
        </Box>
        <input ref={galleryInput} type="file" accept="image/*" multiple hidden onChange={(e) => addPhotos(Array.from(e.target.files || []), 'fill')} />
        {room === 0 && limit != null && (
          <Typography variant="caption" color="text.secondary">
            You&apos;ve used all {limit} photos on your plan. <a href="/subscribe" target="_blank" rel="noopener">Upgrade</a> to add more.
          </Typography>
        )}
      </FieldGroup>
      </Box>

      <FieldGroup title="Video" hint="Optional. Up to 90 seconds and 10 MB. A short clip showing the item from all sides works best.">
        {videoPreview ? (
          <Box sx={{ position: 'relative', borderRadius: '14px', overflow: 'hidden', bgcolor: '#000', maxWidth: 480 }}>
            <Box component="video" src={videoPreview} controls playsInline sx={{ width: '100%', display: 'block', maxHeight: 280 }} />
            <Button component="label" size="small" variant="contained" disableElevation
              sx={{ position: 'absolute', top: 8, right: 8, borderRadius: '8px', bgcolor: 'rgba(0,0,0,0.6)', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}>
              Replace
              <input type="file" accept="video/*" hidden onChange={(e) => handleFileChange(e, 'video')} />
            </Button>
          </Box>
        ) : (
          <Button component="label" variant="outlined" startIcon={<VideocamOutlinedIcon />}
            sx={{ alignSelf: 'flex-start', borderRadius: '10px', borderColor: 'divider', color: 'text.primary', fontWeight: 600, minHeight: 44 }}>
            Add a video
            <input type="file" accept="video/*" hidden onChange={(e) => handleFileChange(e, 'video')} />
          </Button>
        )}
        {formErrors.video && <Alert severity="error" sx={{ borderRadius: '10px' }}>{formErrors.video}</Alert>}
      </FieldGroup>
    </Box>
  );
}
