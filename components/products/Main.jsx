'use client';

import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  Box, Button, Typography, Stack, CircularProgress,
  Chip, LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import { useTheme } from '@mui/material/styles';
import Swal from 'sweetalert2';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from "@/utils/clientFetch";
import { useProductForm } from '@/components/products/hooks';

import ProductGeneralInfo from '@/components/products/ProductGeneralInfo';
import ProductImages from '@/components/products/ProductImages';
import DeliveryOptions from '@/components/products/DeliveryOptions';
import VariantRow from "@/components/products/Variant";

import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// ── Step definitions ──────────────────────────────────────────────────────────
const STEPS = [
  { label: 'General',  icon: InfoOutlinedIcon,             desc: 'Title, price, category' },
  { label: 'Images',   icon: ImageOutlinedIcon,            desc: 'Gallery photos'          },
  { label: 'Variants', icon: TuneOutlinedIcon,             desc: 'Sizes & colours'         },
  { label: 'Delivery', icon: LocalShippingOutlinedIcon,    desc: 'Shipping methods'        },
];

const MenuProps = {
  PaperProps: { style: { maxHeight: 48 * 4.5 + 8, width: 250 } },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: personName.includes(name)
      ? theme?.typography?.fontWeightMedium ?? 500
      : theme?.typography?.fontWeightRegular ?? 400,
  };
}

// ── Readiness checklist ───────────────────────────────────────────────────────
function ReadinessChecklist({ formData, id }) {
  const checks = [
    { label: 'Title',           done: !!formData.title },
    { label: 'Price set',       done: !!formData.price && parseFloat(formData.price) > 0 },
    { label: 'Category',        done: !!formData.sub_category },
    { label: 'Main image',      done: !!formData.image },
    { label: 'Delivery method', done: (formData.delivery_options?.length ?? 0) > 0 },
  ];
  const complete = checks.filter((c) => c.done).length;
  const pct      = Math.round((complete / checks.length) * 100);

  return (
    <Box>
      {/* Progress bar */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', fontSize: 10, color: 'text.disabled' }}>
          Readiness
        </Typography>
        <Typography variant="caption" sx={{ fontWeight: 700, color: complete === checks.length ? 'success.main' : 'text.disabled', fontSize: 11 }}>
          {complete}/{checks.length}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={pct}
        sx={{
          height: 4, borderRadius: 2, mb: 2,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': {
            borderRadius: 2,
            bgcolor: complete === checks.length ? 'success.main' : 'text.primary',
          },
        }}
      />
      <Stack spacing={0.6}>
        {checks.map((c) => (
          <Stack key={c.label} direction="row" alignItems="center" spacing={1}>
            {c.done
              ? <CheckCircleIcon sx={{ fontSize: 13, color: 'success.main', flexShrink: 0 }} />
              : <RadioButtonUncheckedIcon sx={{ fontSize: 13, color: 'text.disabled', flexShrink: 0 }} />
            }
            <Typography variant="caption" sx={{ color: c.done ? 'text.primary' : 'text.disabled', fontWeight: c.done ? 600 : 400 }}>
              {c.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function ProductSidebar({ formData, isLoading, isEdit, onSubmit, activeStep, id }) {
  const price    = parseFloat(formData.price || 0);
  const oldPrice = parseFloat(formData.old_price || 0);
  const hasDiscount = oldPrice > price && price > 0;

  return (
    <Box sx={{ position: { lg: 'sticky' }, top: { lg: 24 } }}>

      {/* Preview card */}
      <Box sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'text.primary', overflow: 'hidden', mb: 2 }}>
        {/* Image preview */}
        <Box sx={{ aspectRatio: '16/9', bgcolor: 'rgba(255,255,255,0.06)', overflow: 'hidden', position: 'relative' }}>
          {formData.image && typeof formData.image !== 'string' ? (
            <Box
              component="img"
              src={URL.createObjectURL(formData.image)}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : formData.image && typeof formData.image === 'string' ? (
            <Box
              component="img"
              src={formData.image}
              sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageOutlinedIcon sx={{ fontSize: 36, color: 'rgba(255,255,255,0.15)' }} />
            </Box>
          )}

          {/* Status chip */}
          <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
            <Chip
              label={isEdit ? 'Editing' : 'New product'}
              size="small"
              sx={{ height: 20, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', bgcolor: 'rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)', borderRadius: '5px', '& .MuiChip-label': { px: 1 } }}
            />
          </Box>
        </Box>

        {/* Title + price */}
        <Box sx={{ p: '16px 20px 20px' }}>
          <Typography
            sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 700, letterSpacing: '-0.4px', color: '#ffffff', lineHeight: 1.25, mb: 0.75 }}
            noWrap
          >
            {formData.title || 'Untitled product'}
          </Typography>

          {formData.price ? (
            <Stack direction="row" alignItems="baseline" spacing={0.75}>
              <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, color: '#ffffff', lineHeight: 1 }}>
                GHS {price.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
              </Typography>
              {hasDiscount && (
                <Typography sx={{ fontSize: 12, textDecoration: 'line-through', color: 'rgba(255,255,255,0.35)' }}>
                  {oldPrice.toLocaleString('en-GH', { minimumFractionDigits: 2 })}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography sx={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No price set yet</Typography>
          )}
        </Box>
      </Box>

      {/* Checklist card */}
      <Box sx={{ borderRadius: '16px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', p: '18px 20px', mb: 2 }}>
        <ReadinessChecklist formData={formData} id={id} />
      </Box>

      {/* Save button */}
      <Button
        type="submit"
        variant="contained"
        disableElevation
        fullWidth
        disabled={isLoading}
        onClick={onSubmit}
        startIcon={isLoading
          ? <CircularProgress size={15} thickness={5} color="inherit" />
          : <SaveOutlinedIcon sx={{ fontSize: 16 }} />
        }
        sx={{
          bgcolor: 'text.primary', color: 'background.paper',
          borderRadius: '12px', fontWeight: 700, fontSize: 14, py: 1.6,
          '&:hover': { bgcolor: 'text.secondary' },
          '&.Mui-disabled': { bgcolor: 'action.disabledBackground' },
        }}
      >
        {isLoading ? 'Saving…' : isEdit ? 'Update product' : 'Save product'}
      </Button>

      <Typography variant="caption" color="text.disabled" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
        {isEdit ? 'Changes save immediately' : 'Submitted for review after saving'}
      </Typography>
    </Box>
  );
}

// ── Step navigator ────────────────────────────────────────────────────────────
function StepNav({ activeStep, setActiveStep, hasError }) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${STEPS.length}, 1fr)`,
        gap: '4px',
        borderRadius: '16px', border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', p: '5px', mb: 2.5,
        overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {STEPS.map((step, i) => {
        const Icon    = step.icon;
        const active  = activeStep === i;
        const hasErr  = hasError(i);

        return (
          <Box
            key={step.label}
            onClick={() => setActiveStep(i)}
            sx={{
              px: { xs: 1, sm: 1.5 }, py: { xs: 0.75, sm: 1 },
              borderRadius: '11px', cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.18s',
              bgcolor: active ? 'text.secondary' : 'transparent',
              '&:hover': { bgcolor: active ? 'text.primary' : 'action.hover' },
              position: 'relative', minWidth: 68,
            }}
          >
            <Icon sx={{
              fontSize: 16, display: 'block', mx: 'auto', mb: 0.3,
              color: active ? '#ffffff' : hasErr ? 'error.main' : 'text.disabled',
            }} />
            <Typography variant="caption" sx={{
              fontWeight: 700, fontSize: 11, letterSpacing: '0.03em',
              color: active ? '#ffffff' : hasErr ? 'error.main' : 'text.secondary',
              display: 'block', lineHeight: 1,
            }}>
              {step.label}
            </Typography>
            {/* Error dot */}
            {hasErr && !active && (
              <Box sx={{ position: 'absolute', top: 5, right: 5, width: 5, height: 5, borderRadius: '50%', bgcolor: 'error.main' }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ProductForm({ id = null }) {
  const pageTitle  = id ? 'Edit Product' : 'Add New Product';
  const theme      = useTheme();
  const router     = useRouter();
  const [isLoading,  setIsLoading]  = useState(false);
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
    if (!data.title)          errors.title         = 'Title is required';
    if (!data.price)          errors.price         = 'Price is required';
    if (!data.total_quantity) errors.totalQuantity = 'Quantity is required';
    if (!id && !data.image && data.variant === 'None') errors.image = 'Main image is required';
    if (!data.delivery_options || data.delivery_options.length === 0) {
      errors.delivery_options = 'At least one delivery option must be selected';
    } else {
      const dc = data.delivery_options.filter((o) => o.default).length;
      if (dc !== 1)  errors.delivery_options = 'Exactly one delivery option must be marked as default';
      if (data.delivery_options.some((o) => !o.deliveryOptionId)) errors.delivery_options = 'All options must have a delivery type selected';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    if (event?.preventDefault) event.preventDefault();
    if (!navigator.onLine) { Swal.fire('Offline', 'Please connect and try again.', 'warning'); return; }

    const errors = validateForm(formData);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      Swal.fire('Required fields missing', errors.delivery_options || Object.values(errors)[0], 'error');
      return;
    }

    try {
      setIsLoading(true);
      const fd = new FormData();

      Object.keys(formData).forEach((key) => {
        if (key === 'mfd') {
          if (formData.mfd) fd.append(key, dayjs(formData.mfd).toISOString());
        } else if (key === 'available_in_regions') {
          formData.available_in_regions.forEach((rid) => fd.append('available_in_regions', rid));
        } else if (key === 'delivery_options') {
          fd.append('delivery_options', JSON.stringify(formData.delivery_options));
        } else if (!['image', 'video', 'variants'].includes(key)) {
          fd.append(key, formData[key] ?? '');
        }
      });

      if (formData.image instanceof File) fd.append('image', formData.image);
      if (formData.video instanceof File) fd.append('video', formData.video);

      if (formData.variants?.length > 0) {
        fd.append('variants', JSON.stringify(formData.variants.map((v) => ({ ...v, image: null }))));
        variants.forEach((v, i) => { if (v.image instanceof File) fd.append(`variant_image_${i}`, v.image); });
      }

      images.filter((img) => img.file instanceof File).forEach((img) => fd.append('images[]', img.file));
      if (id) {
        fd.append('keep_images', JSON.stringify(images.filter((img) => img.id && !img.file).map((img) => img.id)));
      }

      const client = createAxiosClient();
      if (id) {
        await client.put(`/api/v1/vendor/products/${id}/`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await client.post('/api/v1/vendor/products/', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      await Swal.fire({ icon: 'success', title: 'Product saved!', text: 'Submitted for review.', timer: 2200, showConfirmButton: false });
      router.push('/products');
    } catch (error) {
      const body = error?.response?.data;
      const msg  = body?.detail || (typeof body === 'object' ? JSON.stringify(body) : null) || error.message || 'An error occurred';
      Swal.fire(!error.response ? 'Network Error' : 'Save failed', !error.response ? 'Check your connection and try again.' : msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const hasError = (step) => {
    if (step === 0) return !!(formErrors.title || formErrors.price || formErrors.totalQuantity || formErrors.image);
    if (step === 3) return !!formErrors.delivery_options;
    return false;
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

  const currentStep = STEPS[activeStep];

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[
        { title: 'Home',     path: '/dashboard' },
        { title: 'Products', path: '/products'  },
        { title: pageTitle },
      ]}
    >
      <Box component="form" onSubmit={handleSubmit} sx={{ pb: 10 }}>
        <Grid container spacing={3} alignItems="flex-start">

          {/* ── Left: steps + content ────────────────────────────────── */}
          <Grid size={{ xs: 12, lg: 8 }}>

            {/* Step navigator */}
            <StepNav activeStep={activeStep} setActiveStep={setActiveStep} hasError={hasError} />

            {/* Content card */}
            <Box sx={{ borderRadius: '20px', border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>

              {/* Card header */}
              <Box sx={{ px: { xs: 2.5, md: 3 }, pt: { xs: 2.5, md: 3 }, pb: 2.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box sx={{ width: 36, height: 36, borderRadius: '10px', bgcolor: 'action.selected', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {React.createElement(currentStep.icon, { sx: { fontSize: 18, color: 'text.secondary' } })}
                    </Box>
                    <Box>
                      <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.1 }} color="text.primary">
                        {currentStep.label}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">{currentStep.desc}</Typography>
                    </Box>
                  </Stack>

                  {/* Prev / Next */}
                  <Stack direction="row" spacing={1}>
                    {activeStep > 0 && (
                      <Button size="small" startIcon={<ArrowBackIcon sx={{ fontSize: 13 }} />}
                        onClick={() => setActiveStep((s) => s - 1)}
                        sx={{ borderRadius: '8px', color: 'text.secondary', fontWeight: 600, fontSize: 12, '&:hover': { bgcolor: 'action.hover', color: 'text.primary' } }}>
                        Back
                      </Button>
                    )}
                    {activeStep < STEPS.length - 1 && (
                      <Button size="small" variant="contained" disableElevation
                        endIcon={<ArrowForwardIcon sx={{ fontSize: 13 }} />}
                        onClick={() => setActiveStep((s) => s + 1)}
                        sx={{ borderRadius: '8px', bgcolor: 'text.primary', color: 'background.paper', fontWeight: 600, fontSize: 12, '&:hover': { bgcolor: 'text.secondary' } }}>
                        {STEPS[activeStep + 1].label}
                      </Button>
                    )}
                  </Stack>
                </Stack>

                {/* Error banner */}
                {hasError(activeStep) && (
                  <Box sx={{ mt: 2, px: 2, py: 1.25, borderRadius: '10px', bgcolor: 'error.lighter', border: '1px solid', borderColor: 'error.light', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ErrorOutlineIcon sx={{ fontSize: 16, color: 'error.main', flexShrink: 0 }} />
                    <Typography variant="caption" color="error.main" fontWeight={600}>
                      Some fields need attention before saving.
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Step body */}
              <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                {stepContent[activeStep]}
              </Box>

              {/* Card footer — mobile save button */}
              <Box sx={{ display: { lg: 'none' }, px: 2.5, pb: 2.5 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disableElevation
                  fullWidth
                  disabled={isLoading}
                  onClick={handleSubmit}
                  startIcon={isLoading ? <CircularProgress size={14} thickness={5} color="inherit" /> : <SaveOutlinedIcon />}
                  sx={{ bgcolor: 'text.primary', color: 'background.paper', borderRadius: '12px', fontWeight: 700, fontSize: 14, py: 1.5, '&:hover': { bgcolor: 'text.secondary' } }}
                >
                  {isLoading ? 'Saving…' : id ? 'Update product' : 'Save product'}
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* ── Right: sidebar (desktop only) ───────────────────────── */}
          <Grid size={{ xs: 12, lg: 4 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <ProductSidebar
              formData={formData}
              isLoading={isLoading}
              isEdit={!!id}
              onSubmit={handleSubmit}
              activeStep={activeStep}
              id={id}
            />
          </Grid>

        </Grid>
      </Box>
    </PageContainer>
  );
}