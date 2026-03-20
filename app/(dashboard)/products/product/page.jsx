'use client';

import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Box, Button, Typography, Stack, CircularProgress, Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from "@/utils/clientFetch";
import { useProductForm } from '@/components/products/hooks';

import ProductGeneralInfo from '@/components/products/ProductGeneralInfo';
import ProductImages from '@/components/products/ProductImages';
import DeliveryOptions from '@/components/products/DeliveryOptions';
import VariantRow from "@/components/products/Variant";

import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const STEPS = [
  { label: 'General',   short: 'Info'     },
  { label: 'Images',    short: 'Images'   },
  { label: 'Variants',  short: 'Variants' },
  { label: 'Delivery',  short: 'Delivery' },
];

const ITEM_HEIGHT     = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 250 } },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme?.typography?.fontWeightMedium ?? 500
      : theme?.typography?.fontWeightRegular ?? 400,
  };
}

// ── Sidebar summary card ──────────────────────────────────────────────────────
function ProductSummary({ formData, isLoading, isEdit, onSubmit }) {
  const price    = parseFloat(formData.price || 0);
  const oldPrice = parseFloat(formData.old_price || 0);
  const hasDiscount = oldPrice > price && price > 0;

  const checks = [
    { label: 'Title',            done: !!formData.title },
    { label: 'Price',            done: !!formData.price && parseFloat(formData.price) > 0 },
    { label: 'Category',        done: !!formData.sub_category },
    { label: 'Main image',      done: !!formData.image },
    { label: 'Delivery option', done: formData.delivery_options?.length > 0 },
  ];
  const complete = checks.filter((c) => c.done).length;

  return (
    <Box
      sx={{
        position: { lg: 'sticky' },
        top: { lg: 24 },
        borderRadius: '20px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      {/* Dark header */}
      <Box sx={{ p: '20px 22px' }}>
        <Typography variant="caption" sx={{ letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 10 }}>
          {isEdit ? 'Editing product' : 'New product'}
        </Typography>
        <Typography
          sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2, mt: 0.5 }}
          noWrap
        >
          {formData.title || 'Untitled product'}
        </Typography>
        {formData.price && (
          <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mt: 1 }}>
            <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700}}>
              GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
            </Typography>
            {hasDiscount && (
              <Typography sx={{ fontSize: 12, textDecoration: 'line-through', color: 'rgba(255,255,255,0.4)' }}>
                {oldPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </Typography>
            )}
          </Stack>
        )}
      </Box>

      {/* Checklist */}
      <Box sx={{ p: '16px 22px', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10 }}>
            Readiness
          </Typography>
          <Typography variant="caption" color={complete === checks.length ? 'success.main' : 'text.disabled'} fontWeight={700}>
            {complete}/{checks.length}
          </Typography>
        </Stack>
        <Stack spacing={0.75}>
          {checks.map((c) => (
            <Stack key={c.label} direction="row" alignItems="center" spacing={1}>
              {c.done
                ? <CheckCircleOutlineIcon sx={{ fontSize: 14, color: 'success.main' }} />
                : <WarningAmberIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
              }
              <Typography variant="caption" color={c.done ? 'text.primary' : 'text.disabled'} fontWeight={c.done ? 600 : 400}>
                {c.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Submit button */}
      <Box sx={{ p: '16px 22px' }}>
        <Button
          type="submit"
          variant="contained"
          disableElevation
          fullWidth
          disabled={isLoading}
          onClick={onSubmit}
          startIcon={isLoading
            ? <CircularProgress size={16} thickness={5} color="inherit" />
            : <SaveOutlinedIcon />
          }
          sx={{
            bgcolor: 'text.primary',
            color: 'background.paper',
            borderRadius: '10px',
            fontWeight: 700,
            fontSize: 14,
            py: 1.5,
            '&:hover': { bgcolor: 'text.secondary' },
            '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
          }}
        >
          {isLoading ? 'Saving…' : isEdit ? 'Update product' : 'Save product'}
        </Button>
        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
          {isEdit ? 'Changes are saved immediately' : 'Product will be submitted for review'}
        </Typography>
      </Box>
    </Box>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function ProductForm({ id = null }) {
  const pageTitle = id ? 'Edit Product' : 'Add New Product';
  const theme     = useRouter();
  const router    = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const {
    value, formData, setFormData, formErrors, setFormErrors,
    images, setImages, fieldOptions, deliveryOptions,
    regions, categories, brands, colors, sizes,
    selectedCategory, selectedBrand, imagePreview, videoPreview,
    variants, setVariants, variantImagePreviews, setVariantImagePreviews,
    handleTabChange, handleCategoryChange, handleBrandChange,
    handleFileChange, handleDateChange, handleRegionChange,
    handleDeliveryOptionsChange, handleEditorChange,
  } = useProductForm(id);

  const validateForm = (data) => {
    const errors = {};
    if (!data.title)          errors.title = 'Title is required';
    if (!data.price)          errors.price = 'Price is required';
    if (!data.total_quantity) errors.totalQuantity = 'Quantity is required';
    if (!id && !data.image && data.variant === 'None') {
      errors.image = 'Main image is required for new products with no variants';
    }
    if (!data.delivery_options || data.delivery_options.length === 0) {
      errors.delivery_options = 'At least one delivery option must be selected';
    } else {
      const defaultCount = data.delivery_options.filter((opt) => opt.default).length;
      if (defaultCount !== 1) errors.delivery_options = 'Exactly one delivery option must be marked as default';
      if (data.delivery_options.some((opt) => !opt.deliveryOptionId)) {
        errors.delivery_options = 'All delivery options must have a selected delivery type';
      }
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!navigator.onLine) {
      Swal.fire('Offline', 'Please connect to the internet and try again.', 'warning');
      return;
    }

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Swal.fire('Required fields missing', errors.delivery_options || Object.values(errors)[0], 'error');
      return;
    }

    try {
      setIsLoading(true);
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === 'mfd') {
          if (formData.mfd) submitData.append(key, dayjs(formData.mfd).toISOString());
        } else if (key === 'available_in_regions') {
          formData.available_in_regions.forEach((rid) => submitData.append('available_in_regions', rid));
        } else if (key === 'delivery_options') {
          submitData.append('delivery_options', JSON.stringify(formData.delivery_options));
        } else if (!['image', 'video', 'variants'].includes(key)) {
          submitData.append(key, formData[key] ?? '');
        }
      });

      if (formData.image instanceof File) submitData.append('image', formData.image);
      if (formData.video instanceof File) submitData.append('video', formData.video);

      if (formData.variants?.length > 0) {
        submitData.append('variants', JSON.stringify(formData.variants.map((v) => ({ ...v, image: null }))));
        variants.forEach((v, i) => {
          if (v.image instanceof File) submitData.append(`variant_image_${i}`, v.image);
        });
      }

      images.filter((img) => img.file instanceof File).forEach((img) => submitData.append('images[]', img.file));

      if (id) {
        const keepImages = images.filter((img) => img.id && !img.file).map((img) => img.id);
        submitData.append('keep_images', JSON.stringify(keepImages));
      }

      const client = createAxiosClient();
      if (id) {
        await client.put(`/api/v1/vendor/products/${id}/`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await client.post('/api/v1/vendor/products/', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      await Swal.fire({ icon: 'success', title: 'Product saved!', text: 'Your product has been submitted for review.', timer: 2500, showConfirmButton: false });
      router.push('/products');
    } catch (error) {
      const body = error?.response?.data;
      const msg  = body?.detail || (typeof body === 'object' ? JSON.stringify(body) : null) || error.message || 'An error occurred';
      if (!error.response) {
        Swal.fire('Network Error', 'Check your internet connection and try again.', 'error');
      } else {
        Swal.fire('Save failed', msg, 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const stepContent = [
    <ProductGeneralInfo
      key="general"
      formData={formData} setFormData={setFormData} formErrors={formErrors}
      categories={categories} handleCategoryChange={handleCategoryChange}
      brands={brands} handleBrandChange={handleBrandChange}
      regions={regions} MenuProps={MenuProps} getStyles={getStyles}
      theme={theme} handleRegionChange={handleRegionChange}
      handleDateChange={handleDateChange} handleEditorChange={handleEditorChange}
      handleFileChange={handleFileChange} imagePreview={imagePreview}
      videoPreview={videoPreview} selectedCategory={selectedCategory}
      selectedBrand={selectedBrand}
    />,
    <ProductImages key="images" images={images} setImages={setImages} />,
    <VariantRow
      key="variants"
      formData={formData} setFormData={setFormData}
      variants={variants} setVariants={setVariants}
      sizes={sizes} colors={colors}
      variantImagePreviews={variantImagePreviews}
      setVariantImagePreviews={setVariantImagePreviews}
    />,
    <DeliveryOptions
      key="delivery"
      fieldOptions={fieldOptions}
      onOptionsChange={handleDeliveryOptionsChange}
      deliveryOptions={deliveryOptions}
    />,
  ];

  const hasStepError = (step) => {
    if (step === 0) return !!(formErrors.title || formErrors.price || formErrors.totalQuantity || formErrors.image);
    if (step === 3) return !!formErrors.delivery_options;
    return false;
  };

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: 'Products', path: '/products' }, { title: pageTitle }]}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ pb: 8 }}>
        <Grid container spacing={3} alignItems="flex-start">

          {/* ── Main content ──────────────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 8 }}>
            {/* Step nav */}
            <Box
              sx={{
                borderRadius: '16px', border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', p: '6px', mb: 2.5,
                display: 'flex', gap: '4px', overflowX: 'auto',
                '&::-webkit-scrollbar': { display: 'none' },
              }}
            >
              {STEPS.map((step, i) => (
                <Box
                  key={step.label}
                  onClick={() => setActiveStep(i)}
                  sx={{
                    flex: 1, minWidth: 72, px: 1.5, py: 1, borderRadius: '10px',
                    cursor: 'pointer', textAlign: 'center', transition: 'all 0.18s',
                    bgcolor: activeStep === i ? 'text.primary' : 'transparent',
                    '&:hover': { bgcolor: activeStep === i ? 'text.primary' : 'action.hover' },
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700, fontSize: 12, letterSpacing: '0.04em',
                      color: activeStep === i ? 'background.paper' : 'text.secondary',
                      display: 'block',
                    }}
                  >
                    {step.label}
                  </Typography>
                  {hasStepError(i) && (
                    <Box sx={{
                      position: 'absolute', top: 4, right: 4,
                      width: 6, height: 6, borderRadius: '50%', bgcolor: 'error.main',
                    }} />
                  )}
                </Box>
              ))}
            </Box>

            {/* Step content panel */}
            <Box
              sx={{
                borderRadius: '20px', border: '1px solid', borderColor: 'divider',
                bgcolor: 'background.paper', p: { xs: 2.5, md: 3 },
              }}
            >
              {/* Step header */}
              <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Box>
                  <Typography
                    sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}
                    color="text.primary"
                  >
                    {STEPS[activeStep].label}
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Step {activeStep + 1} of {STEPS.length}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  {activeStep > 0 && (
                    <Button size="small" variant="outlined" onClick={() => setActiveStep((s) => s - 1)}
                      sx={{ borderRadius: '8px', borderColor: 'divider', color: 'text.secondary', fontSize: 12, fontWeight: 600, '&:hover': { borderColor: 'text.primary', color: 'text.primary' } }}>
                      Back
                    </Button>
                  )}
                  {activeStep < STEPS.length - 1 && (
                    <Button size="small" variant="contained" disableElevation onClick={() => setActiveStep((s) => s + 1)}
                      sx={{ borderRadius: '8px', bgcolor: 'text.primary', color: 'background.paper', fontSize: 12, fontWeight: 600, '&:hover': { bgcolor: 'text.secondary' } }}>
                      Next: {STEPS[activeStep + 1].label}
                    </Button>
                  )}
                </Stack>
              </Stack>

              {formErrors[Object.keys(formErrors).find((k) => [0,3].includes(activeStep) && k)] && (
                <Alert severity="error" sx={{ mb: 2.5, borderRadius: '10px' }}>
                  Please fix the errors below before saving.
                </Alert>
              )}

              {/* Render active step */}
              {stepContent[activeStep]}
            </Box>
          </Grid>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 4 }}>
            <ProductSummary
              formData={formData}
              isLoading={isLoading}
              isEdit={!!id}
              onSubmit={handleSubmit}
            />
          </Grid>
        </Grid>
      </Box>
    </PageContainer>
  );
}