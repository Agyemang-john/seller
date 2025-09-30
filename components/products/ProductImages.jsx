'use client';

import { Box, Button, Typography, Grid, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { validateImage  } from "./fileValidators";
import Swal from 'sweetalert2';

const ProductImages = ({ images, setImages }) => {
  
  const handleImageChange = async (e, index) => {
    const file = e.target.files[0];
    if (file) {

      let validation;

      validation = await validateImage(file, {
        maxSizeMB: 2,
        minResolution: 700,
        maxResolution: 1200,
        mustBeSquare: true,
        checkBackground: true,
      });

      if (!validation.valid) {
        Swal.fire({
          icon: 'error',
          title: 'Invalid File',
          html: validation.errors.join('<br/>'),
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const newImages = [...images];
        newImages[index] = {
          ...newImages[index], // Preserve id for existing images
          file, // New file to upload
          previewUrl: reader.result, // Preview for new image
          title: newImages[index]?.title || "", // Ensure title is a string
        };
        setImages(newImages);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddImage = () => {
    const newImage = { id: null, file: null, previewUrl: null, title: "" };
    setImages([...images, newImage]);
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Product Images
      </Typography>
      <Grid container spacing={2}>
        {images.map((image, index) => (
          <Grid size={{ xs: 6, sm: 6, md: 2 }} key={image.id || `new-${index}`}>
            <Box
              sx={{
                border: '1px dashed grey',
                p: 1,
                position: 'relative',
                height: '150px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {image.previewUrl ? (
                <>
                  <img
                    src={image.previewUrl}
                    alt={`Preview ${index}`}
                    style={{ maxWidth: '100%', maxHeight: '100%' }}
                  />
                  <IconButton
                    onClick={() => handleRemoveImage(index)}
                    sx={{ position: 'absolute', top: 0, right: 0 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </>
              ) : (
                <>
                  <input
                    accept="image/*"
                    type="file"
                    onChange={(e) => handleImageChange(e, index)}
                    style={{ display: 'none' }}
                    id={`product-image-${index}`}
                  />
                  <label htmlFor={`product-image-${index}`}>
                    <Button variant="outlined" component="span">
                      {image.id ? 'Replace Image' : 'Add Image'}
                    </Button>
                  </label>
                </>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>
      <Button
        variant="contained"
        onClick={handleAddImage}
        sx={{ mt: 2 }}
      >
        Add Another Image
      </Button>
    </Box>
  );
};

export default ProductImages;