'use client';

/**
 * Photo studio page: fix many product photos in one go.
 * Drop photos → edit them in the studio (components/studio/PhotoStudio.jsx) →
 * download them (one by one or as a .zip) or start a new product with them.
 * Everything runs in the browser: photos are only uploaded when a product is saved.
 */

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { imagesOnly, useDropPhotos } from '@/components/products/photoBatch';
import { usePhotoStudio } from '@/components/studio/usePhotoStudio';
import { studioSupported, warmUp } from '@/components/studio/engine';
import { sendToNewProduct } from '@/components/studio/outbox';
import { makeZip } from '@/components/studio/zip';

const MAX_PHOTOS = 30;
let nextKey = 1;

const download = (blob, name) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
};

function Feature({ title, text }) {
  return (
    <Box sx={{ p: 2, borderRadius: '14px', border: '1px solid', borderColor: 'divider', height: '100%' }}>
      <Typography fontWeight={700} sx={{ mb: 0.5 }}>{title}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>{text}</Typography>
    </Box>
  );
}

export default function PhotoStudioPage() {
  const router = useRouter();
  const studio = usePhotoStudio();
  const input = useRef(null);
  // { key, original: File, originalUrl, result: File|null, resultUrl }
  const [photos, setPhotos] = useState([]);
  const [supported, setSupported] = useState(true);
  const [zipping, setZipping] = useState(false);

  useEffect(() => { setSupported(studioSupported()); }, []);
  useEffect(() => () => photos.forEach((p) => { URL.revokeObjectURL(p.originalUrl); if (p.resultUrl) URL.revokeObjectURL(p.resultUrl); }),
    []); // eslint-disable-line react-hooks/exhaustive-deps

  const edit = async (list) => {
    if (!list.length) return;
    const files = await studio.open(list.map((p) => ({ source: p.original, name: p.original.name })),
      { title: list.length > 1 ? `Photo studio: ${list.length} photos` : 'Photo studio' });
    if (!files) return;
    setPhotos((prev) => prev.map((p) => {
      const i = list.findIndex((x) => x.key === p.key);
      if (i < 0 || !files[i]) return p;
      if (p.resultUrl) URL.revokeObjectURL(p.resultUrl);
      return { ...p, result: files[i], resultUrl: URL.createObjectURL(files[i]) };
    }));
  };

  const add = (fileList) => {
    const room = MAX_PHOTOS - photos.length;
    const files = imagesOnly(fileList).slice(0, Math.max(room, 0));
    if (!files.length) return;
    warmUp();
    const added = files.map((f) => ({ key: nextKey++, original: f, originalUrl: URL.createObjectURL(f), result: null, resultUrl: null }));
    setPhotos((prev) => [...prev, ...added]);
    edit(added);
  };
  const { dragging, dropProps } = useDropPhotos(add);

  const done = photos.filter((p) => p.result);
  const remove = (key) => setPhotos((prev) => prev.filter((p) => p.key !== key));

  const downloadAll = async () => {
    if (done.length === 1) { download(done[0].result, done[0].result.name); return; }
    setZipping(true);
    try {
      download(await makeZip(done.map((p) => ({ name: p.result.name, blob: p.result }))), 'negromart-studio-photos.zip');
    } finally {
      setZipping(false);
    }
  };

  const newProduct = () => {
    sendToNewProduct(done.map((p) => p.result));
    router.push('/products/product');
  };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', width: '100%', maxWidth: 1100, mx: 'auto', py: { xs: 1, md: 3 } }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'flex-end' }} spacing={2} sx={{ mb: 3 }}>
        <Box>
          <Typography component="h1" sx={{ fontFamily: 'var(--font-figtree), system-ui, sans-serif', fontSize: { xs: 30, md: 38 }, fontWeight: 700, letterSpacing: '-0.8px', lineHeight: 1.1 }}>
            Photo studio
          </Typography>
          <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 640, lineHeight: 1.7 }}>
            Turn everyday photos into clean product photos: background removed, the product centred on white,
            light corrected and sized for Negromart. Your photos stay on your device until you save a product.
          </Typography>
        </Box>
        <Button component={Link} href="/products/photo-studio/guide" sx={{ fontWeight: 600, borderRadius: '10px', whiteSpace: 'nowrap' }}>How it works</Button>
      </Stack>

      {!supported && (
        <Alert severity="warning" sx={{ borderRadius: '12px', mb: 2 }}>
          This browser can&apos;t run the Photo studio. Use the latest Chrome, Edge, Safari or Firefox.
        </Alert>
      )}

      <Box {...dropProps} role="button" tabIndex={0} onClick={() => input.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && input.current?.click()}
        sx={{ p: { xs: 3, md: 5 }, borderRadius: '18px', border: '2px dashed', borderColor: dragging ? 'text.primary' : 'divider',
          bgcolor: dragging ? 'action.selected' : 'action.hover', textAlign: 'center', cursor: 'pointer', transition: 'all .15s',
          '&:hover': { borderColor: 'text.primary' } }}>
        <input ref={input} type="file" accept="image/*" multiple hidden
          onChange={(e) => { const f = [...e.target.files]; e.target.value = ''; add(f); }} />
        {dragging ? <CloudUploadOutlinedIcon sx={{ fontSize: 44 }} /> : <AutoFixHighOutlinedIcon sx={{ fontSize: 44 }} />}
        <Typography fontWeight={800} sx={{ mt: 1, fontSize: 18 }}>{dragging ? 'Drop your photos' : 'Choose photos to fix'}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Up to {MAX_PHOTOS} at once. Select several, or drag them here. JPG, PNG or WebP straight from your phone are fine.
        </Typography>
      </Box>

      {photos.length > 0 && (
        <>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={1.5} sx={{ mt: 4, mb: 2 }}>
            <Typography fontWeight={800}>
              {done.length} of {photos.length} photo{photos.length === 1 ? '' : 's'} ready
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', rowGap: 1 }}>
              {photos.length > done.length && (
                <Button variant="outlined" startIcon={<AutoFixHighOutlinedIcon />} onClick={() => edit(photos.filter((p) => !p.result))}
                  sx={{ borderRadius: '10px', fontWeight: 700 }}>Edit the rest</Button>
              )}
              <Button variant="outlined" startIcon={<DownloadIcon />} disabled={!done.length || zipping} onClick={downloadAll}
                sx={{ borderRadius: '10px', fontWeight: 700 }}>
                {zipping ? 'Preparing…' : done.length > 1 ? 'Download all (.zip)' : 'Download'}
              </Button>
              <Button variant="contained" disableElevation startIcon={<AddBoxOutlinedIcon />} disabled={!done.length} onClick={newProduct}
                sx={{ borderRadius: '10px', fontWeight: 700, bgcolor: 'text.primary', color: 'background.paper', '&:hover': { bgcolor: 'text.secondary' } }}>
                Create a product with {done.length > 1 ? 'these' : 'this'}
              </Button>
            </Stack>
          </Stack>
          <Grid container spacing={2}>
            {photos.map((p) => (
              <Grid key={p.key} size={{ xs: 6, sm: 4, md: 3 }}>
                <Box sx={{ borderRadius: '14px', border: '1px solid', borderColor: 'divider', overflow: 'hidden', bgcolor: 'background.paper' }}>
                  <Box sx={{ position: 'relative', aspectRatio: '1', bgcolor: '#fff' }}>
                    <Box component="img" src={p.resultUrl || p.originalUrl} alt={p.original.name}
                      sx={{ width: '100%', height: '100%', objectFit: p.result ? 'contain' : 'cover', display: 'block', opacity: p.result ? 1 : 0.55 }} />
                    {p.result && (
                      <Tooltip title="Original">
                        <Box component="img" src={p.originalUrl} alt="" sx={{ position: 'absolute', left: 8, bottom: 8, width: 44, height: 44,
                          objectFit: 'cover', borderRadius: '8px', border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }} />
                      </Tooltip>
                    )}
                    {p.result && <CheckCircleOutlineIcon sx={{ position: 'absolute', top: 8, left: 8, color: 'success.main', bgcolor: '#fff', borderRadius: '50%' }} />}
                  </Box>
                  <Stack direction="row" alignItems="center" sx={{ px: 1, py: 0.5 }}>
                    <Typography variant="caption" noWrap sx={{ flex: 1, minWidth: 0, fontWeight: 600 }}>{p.original.name}</Typography>
                    <Tooltip title={p.result ? 'Edit again' : 'Edit'}>
                      <IconButton size="small" aria-label={`Edit ${p.original.name}`} onClick={() => edit([p])}><AutoFixHighOutlinedIcon sx={{ fontSize: 18 }} /></IconButton>
                    </Tooltip>
                    {p.result && (
                      <Tooltip title="Download">
                        <IconButton size="small" aria-label={`Download ${p.result.name}`} onClick={() => download(p.result, p.result.name)}><DownloadIcon sx={{ fontSize: 18 }} /></IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Remove">
                      <IconButton size="small" aria-label={`Remove ${p.original.name}`} onClick={() => remove(p.key)}><DeleteOutlineIcon sx={{ fontSize: 18 }} /></IconButton>
                    </Tooltip>
                  </Stack>
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Grid container spacing={2} sx={{ mt: 4 }}>
        {[
          ['Background removed by AI', 'A high-resolution model finds the product and keeps fine edges such as hair, straps and see-through parts soft and real.'],
          ['No halos, no sticker look', 'Edge colours are cleaned so the old background doesn\'t show around the product. An optional natural shadow keeps it grounded.'],
          ['Light that stays true', 'Auto evens out the light and colour gently. Shoppers get what they see, which means fewer returns.'],
          ['Ready to upload', `Every photo comes out ${1600} × ${1600} px on white, under 2 MB: exactly what product listings need.`],
        ].map(([t, d]) => <Grid key={t} size={{ xs: 12, sm: 6, md: 3 }}><Feature title={t} text={d} /></Grid>)}
      </Grid>
      {studio.element}
    </Box>
  );
}
