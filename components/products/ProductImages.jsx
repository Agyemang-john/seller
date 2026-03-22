'use client';

import { Box, Typography, Stack, IconButton, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import { validateImage, squareifyImage } from './fileValidators';
import Swal from 'sweetalert2';

// ── Single image slot ─────────────────────────────────────────────────────────
function ImageSlot({ image, index, onChange, onRemove }) {
  const inputId = `product-img-slot-${index}`;

  return (
    <Box sx={{ position: 'relative', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden' }}>
      {image?.previewUrl ? (
        <>
          <Box
            component="img"
            src={image.previewUrl}
            alt={`Product image ${index + 1}`}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {/* Overlay on hover */}
          <Box
            sx={{
              position: 'absolute', inset: 0,
              bgcolor: 'rgba(0,0,0,0)',
              transition: 'background-color 0.18s',
              display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
              p: 0.75,
              '&:hover': { bgcolor: 'rgba(0,0,0,0.18)' },
            }}
          >
            <IconButton
              size="small"
              onClick={() => onRemove(index)}
              sx={{
                bgcolor: 'rgba(0,0,0,0.55)', color: '#ffffff',
                backdropFilter: 'blur(4px)',
                '&:hover': { bgcolor: 'rgba(220,38,38,0.85)' },
              }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          {/* Replace hidden input */}
          <input accept="image/*" type="file" onChange={(e) => onChange(e, index)} style={{ display: 'none' }} id={inputId} />
        </>
      ) : (
        <>
          <input accept="image/*" type="file" onChange={(e) => onChange(e, index)} style={{ display: 'none' }} id={inputId} />
          <label htmlFor={inputId} style={{ display: 'block', height: '100%', cursor: 'pointer' }}>
            <Box
              sx={{
                height: '100%', border: '2px dashed', borderColor: 'divider',
                borderRadius: '14px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 0.75,
                bgcolor: 'action.hover', transition: 'all 0.18s',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'action.selected' },
              }}
            >
              <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 24, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                {image?.id ? 'Replace' : 'Add image'}
              </Typography>
            </Box>
          </label>
        </>
      )}
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const ProductImages = ({ images, setImages }) => {

  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    // Auto-correct to square before validating
    const squaredFile = await squareifyImage(file, 'pad', '#FFFFFF');

    const validation = await validateImage(squaredFile, {
      maxSizeMB: 2, minResolution: 400, maxResolution: 1800, checkBackground: true,
    });

    if (!validation.valid) {
      Swal.fire({ icon: 'error', title: 'Invalid image', html: validation.errors.join('<br/>') });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updated = [...images];
      updated[index] = { ...updated[index], file: squaredFile, previewUrl: reader.result, title: updated[index]?.title || '' };
      setImages(updated);
    };
    reader.readAsDataURL(squaredFile); // preview the corrected file
  };

  const handleRemove = (index) => {
    const updated = [...images];
    updated.splice(index, 1);
    setImages(updated);
  };

  const handleAdd = () => {
    setImages([...images, { id: null, file: null, previewUrl: null, title: '' }]);
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }} color="text.primary">
            Gallery images
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Square images · 700–1200 px · max 2 MB each
          </Typography>
        </Box>
        <Button
          size="small"
          variant="outlined"
          onClick={handleAdd}
          startIcon={<AddPhotoAlternateOutlinedIcon sx={{ fontSize: 14 }} />}
          sx={{
            borderRadius: '8px', borderColor: 'divider', color: 'text.secondary',
            fontWeight: 600, fontSize: 12, flexShrink: 0,
            '&:hover': { borderColor: 'text.primary', color: 'text.primary' },
          }}
        >
          Add slot
        </Button>
      </Stack>

      {images.length === 0 ? (
        // Empty nudge
        <Box
          onClick={handleAdd}
          sx={{
            border: '2px dashed', borderColor: 'divider', borderRadius: '16px',
            p: 5, textAlign: 'center', cursor: 'pointer',
            transition: 'all 0.18s',
            '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
          }}
        >
          <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            No gallery images yet
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Click to add your first gallery image
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={1.5}>
          {images.map((image, index) => (
            <Grid key={image.id || `slot-${index}`} size={{ xs: 6, sm: 4, md: 3 }}>
              <ImageSlot image={image} index={index} onChange={handleImageChange} onRemove={handleRemove} />
            </Grid>
          ))}
          {/* Add more slot */}
          <Grid size={{ xs: 6, sm: 4, md: 3 }}>
            <Box
              onClick={handleAdd}
              sx={{
                aspectRatio: '1', borderRadius: '14px', border: '2px dashed',
                borderColor: 'divider', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                gap: 0.75, transition: 'all 0.18s',
                '&:hover': { borderColor: 'text.primary', bgcolor: 'action.hover' },
              }}
            >
              <AddPhotoAlternateOutlinedIcon sx={{ fontSize: 22, color: 'text.disabled' }} />
              <Typography variant="caption" color="text.disabled" fontWeight={600} sx={{ fontSize: 10 }}>
                Add more
              </Typography>
            </Box>
          </Grid>
        </Grid>
      )}

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 2, textAlign: 'center' }}>
        {images.filter((i) => i.previewUrl).length} of {images.length} slots filled
      </Typography>
    </Box>
  );
};

export default ProductImages;