'use client';

import React from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Stack,
  FormHelperText
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { Chip, OutlinedInput } from '@mui/material';
// import Editor from './Editor';
import dynamic from 'next/dynamic';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useTheme } from '@emotion/react';


function getStyles(regionId, available_in_regions, theme) {
  return {
    fontWeight: theme?.typography?.fontWeightRegular || 400,  // Fallback to 400 if undefined
    ...(available_in_regions.includes(regionId) && {
      fontWeight: theme?.typography?.fontWeightMedium || 500,  // Bold if selected (check ID)
    })
  };
}

const ProductGeneralInfo = ({
  formData,
  setFormData,
  formErrors,
  categories,
  handleCategoryChange,
  brands,
  handleBrandChange,
  handleRegionChange,
  regions, MenuProps,
  handleDateChange,
  handleEditorChange,
  handleFileChange,
  imagePreview,
  videoPreview,
  selectedCategory,
  selectedBrand
}) => {
  const theme = useTheme();
  

  return (
    <Box sx={{ mt: 2 }}>
      <Stack spacing={2}>
        {/* Title */}
        <TextField
          label="Product Title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          error={!!formErrors.title}
          helperText={formErrors.title}
          fullWidth
        />

        {/* Slug */}
        <TextField
          label="Slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          error={!!formErrors.slug}
          helperText={formErrors.slug}
          fullWidth
        />

        {/* Category */}
        <Autocomplete
          options={categories}
          getOptionLabel={(option) => option.title}  // ✅ use title instead of name
          value={selectedCategory}
          onChange={(event, newValue) => handleCategoryChange(event, newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Category"
              error={!!formErrors.category}
              helperText={formErrors.category}
            />
          )}
        />

        <Autocomplete
          options={brands}
          getOptionLabel={(option) => option.title}  // ✅ use title instead of name
          value={selectedBrand}
          onChange={(event, newValue) => handleBrandChange(event, newValue)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Brand"
              error={!!formErrors.brand}
              helperText={formErrors.brand}
            />
          )}
        />

        <FormControl fullWidth>
            <InputLabel>Product Type</InputLabel>
            <Select
              value={formData.variant}
              error={!!formErrors.variant}
              onChange={(e) => setFormData({ ...formData, variant: e.target.value })}
              label="Variant Type"
              required
            >
              <MenuItem value="None">None</MenuItem>
              <MenuItem value="Size">Size</MenuItem>
              <MenuItem value="Color">Color</MenuItem>
              <MenuItem value="Size-Color">Size-Color</MenuItem>
            </Select>
          </FormControl>

        {/* Price Fields */}
        <Stack direction="row" spacing={2}>
          <TextField
            label="Price"
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            error={!!formErrors.price}
            helperText={formErrors.price}
            fullWidth
          />
          <TextField
            label="Old Price"
            type="number"
            value={formData.old_price}
            onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
            fullWidth
          />
        </Stack>

          {/* Weight and Volume */}
          <Stack direction="row" spacing={2}>
            <TextField
              label="Weight (kg)"
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              error={!!formErrors.weight}
              helperText={formErrors.weight}
              fullWidth
            />
            <TextField
              label="Volume (m³)"
              type="number"
              value={formData.volume}
              onChange={(e) => setFormData({ ...formData, volume: e.target.value })}
              error={!!formErrors.volume}
              helperText={formErrors.volume}
              fullWidth
            />
          </Stack>

          {/* Quantity */}
          <TextField
            label="Total Quantity"
            type="number"
              value={formData.total_quantity}
              onChange={(e) => setFormData({ ...formData, total_quantity: e.target.value })}
              error={!!formErrors.totalQuantity}
              helperText={formErrors.totalQuantity}
              fullWidth
          />

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Manufacture Date"
              value={formData.mfd ? dayjs(formData.mfd) : null}
              onChange={handleDateChange}
              slotProps={{
                textField: {
                  error: !!formErrors.mfd,
                  helperText: formErrors.mfd,
                  fullWidth: true,
                },
              }}
            />
          </LocalizationProvider>



          {/* Life Span */}
          <TextField
            label="Life Span (months)"
            type="number"
            value={formData.life}
            onChange={(e) => setFormData({ ...formData, life: e.target.value })}
            error={!!formErrors.lifeSpan}
            helperText={formErrors.lifeSpan}
            fullWidth
          />

          {/* Product Type */}
          <FormControl fullWidth>
            <InputLabel>Product Type</InputLabel>
            <Select
              value={formData.product_type || ''}
              onChange={(e) => setFormData({ ...formData, product_type: e.target.value })}
              label="Product Type"
            >
              <MenuItem value="new">New</MenuItem>
              <MenuItem value="used">Used</MenuItem>
              <MenuItem value="refurbished">Refurbished</MenuItem>
            </Select>
          </FormControl>

          <Grid container sx={{ mb: 5, py: 4, my: 4, width: '100%' }}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FormControl sx={{ m: 1, width: 300 }} fullWidth error={!!formErrors.available_in_regions}>
              <InputLabel id="region-select-chip-label">Ships to</InputLabel>
              <Select
                labelId="region-select-chip-label"
                id="region-select-chip"
                multiple
                value={formData.available_in_regions}  // IDs (e.g., [1, 2])
                onChange={handleRegionChange}
                input={<OutlinedInput id="select-multiple-chip" label="Countries" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected?.map((value) => {
                      const region = regions.find(region => region.id === value); // ID lookup
                      return region ? <Chip key={value} label={region.name} /> : null;
                    })}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {regions.map((region) => (
                  <MenuItem
                    key={region.id}
                    value={region.id}  // ✅ Use ID (matches formData.available_in_regions)
                    style={getStyles(region.id, formData.available_in_regions, theme)}  // Check ID
                  >
                    {region.name}
                  </MenuItem>
                ))}
              </Select>
              {formErrors.available_in_regions && <FormHelperText>{formErrors.available_in_regions}</FormHelperText>}
            </FormControl>
          </Grid>
        </Grid>


          {/* Image Upload */}
        <Box>
          <input
            accept="image/*"
            type="file"
            onChange={(e) => handleFileChange(e, "image")} // Specify field as "image"
            style={{ display: 'none' }}
            id="product-image-upload"
          />
          <label htmlFor="product-image-upload">
            <Button variant="contained" component="span">
              Upload Main Image
            </Button>
          </label>
          {imagePreview && (
            <Box mt={2}>
              <img src={imagePreview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px' }} />
            </Box>
          )}
        </Box>

          {/* Video Upload */}
          {/* <Box>
            <input
              accept="video/*"
              type="file"
              onChange={(e) => handleFileChange(e, "video")} // Specify field as "video"
              style={{ display: 'none' }}
              id="product-video-upload"
            />
            <label htmlFor="product-video-upload">
              <Button variant="contained" component="span">
                Upload Product Video
              </Button>
            </label>
            {videoPreview && (
              <Box mt={2}>
                <video src={videoPreview} controls style={{ maxWidth: '100%', maxHeight: '200px' }} />
              </Box>
            )}
          </Box> */}

          {/* Rich Text Editors */}
          <Box>
            <Editor
              label="Features"
              value={formData.features}
              onChange={handleEditorChange('features')}
              placeholder="Enter product features..."
            />
          </Box>

          <Box mt={2}>
            <Editor
              label="Description"
              value={formData.description}
              onChange={handleEditorChange('description')}
              placeholder="Enter product description..."
            />
            {formErrors.description && (
              <FormHelperText error>{formErrors.description}</FormHelperText>
            )}
          </Box>

          <Box mt={2}>
            <Editor
              label="Specifications"
              value={formData.specifications}
              onChange={handleEditorChange('specifications')}
              placeholder="Enter product specifications..."
            />
          </Box>

          <Box mt={2}>
            <Editor
              label="Delivery & Returns"
              value={formData.delivery_returns}
              onChange={handleEditorChange('delivery_returns')}
              placeholder="Enter delivery and return information..."
            />
          </Box>
        </Stack>
      </Box>
    );
  };

  export default ProductGeneralInfo;