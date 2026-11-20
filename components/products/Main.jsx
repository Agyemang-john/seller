'use client';

/**
 * Add / edit product: one page for both (routes products/product and
 * products/product/[id]). All sections sit on one scrolling page, with a
 * section list to jump around and one Save that sends the product, its specs
 * and its gallery together. Sections are defined in form/sections.js.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import { Alert, Box, Button, Skeleton, Stack } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import PageContainer from '@/components/PageContainer';
import { createAxiosClient } from '@/utils/clientFetch';
import { useProductForm } from '@/components/products/hooks';
import { toVariantPayload, runGalleryUploads } from '@/components/products/galleryUploads';
import { usePinnedComplements } from './PinnedComplements';
import { useProductSpecs } from './form/useProductSpecs';
import { SECTIONS, sectionStatus, sectionForError, validateProduct } from './form/sections';
import { SectionCard } from './form/fields';
import { DesktopRail, MobileActionBar, MobileSectionBar, scrollToSection, useScrollSpy } from './form/FormNav';

// Optional numbers the model can't store empty: send these instead of ''.
const EMPTY_NUMBER_AS = { old_price: '0', return_period_days: '0' };
// Optional numbers left out when empty, so the saved/default value stands.
const OMIT_WHEN_EMPTY = ['volume'];

/** A stable text form of the form state, to tell whether anything changed. */
function fingerprint(parts) {
  return JSON.stringify(parts, (key, v) => {
    if (typeof File !== 'undefined' && v instanceof File) return `file:${v.name}:${v.size}:${v.lastModified}`;
    if (typeof v === 'string' && v.startsWith('data:')) return `data:${v.length}`;
    if (dayjs.isDayjs(v)) return v.toISOString();
    return v;
  });
}

function errorHtml(errors) {
  return errors.map(([field, msg]) => `<b>${field.replace(/_/g, ' ')}:</b> ${msg}`).join('<br/>');
}

export default function ProductForm({ id = null }) {
  const isEdit = !!id;
  const pageTitle = isEdit ? 'Edit product' : 'Add a product';
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const form = useProductForm(id);
  const {
    loading, loadError, formData, setFormData, formErrors, setFormErrors,
    images, setImages, fieldOptions, deliveryOptions, regions, categories, brands, colors, sizes, variationOptions,
    selectedCategory, selectedBrand, imagePreview, videoPreview,
    variants, setVariants, variantImagePreviews, setVariantImagePreviews,
    handleCategoryChange, handleBrandChange, handleFileChange, handleDateChange,
    handleDeliveryOptionsChange, handleEditorChange,
  } = form;

  const specs = useProductSpecs(id, formData.sub_category || null);
  const pinned = usePinnedComplements(id);

  // Editing a field clears its error, so the page reflects what's left to fix.
  const setField = useCallback((name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => {
      if (!prev[name] && !(name === 'total_quantity' && prev.totalQuantity)) return prev;
      const next = { ...prev };
      delete next[name];
      if (name === 'total_quantity') delete next.totalQuantity;
      return next;
    });
  }, [setFormData, setFormErrors]);

  // ── Unsaved changes ────────────────────────────────────────────────────────
  const current = fingerprint([
    { ...formData, variants: undefined, slug: undefined }, variants,
    images.map((i) => i.id || i.file), specs.values, pinned.value.map((p) => p.id),
  ]);
  const baseline = useRef(null);
  const ready = !loading && !loadError && (!isEdit || (specs.editable && pinned.loaded));
  useEffect(() => {
    if (!ready || baseline.current !== null) return undefined;
    // After derived state settles (slug, variant mirroring, category lookups).
    const t = setTimeout(() => { baseline.current = current; }, 300);
    return () => clearTimeout(t);
  }, [ready, current]);
  const dirty = baseline.current !== null && baseline.current !== current;

  useEffect(() => {
    if (!dirty || saving) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty, saving]);

  const leave = async () => {
    if (dirty) {
      const { isConfirmed } = await Swal.fire({
        icon: 'warning', title: 'Discard your changes?', text: "What you've entered on this page will be lost.",
        showCancelButton: true, confirmButtonText: 'Discard', cancelButtonText: 'Keep editing', reverseButtons: true,
      });
      if (!isConfirmed) return;
    }
    baseline.current = current;
    router.push('/products');
  };

  // ── Sections, status, readiness ──────────────────────────────────────────────
  const ctx = {
    id, formData, setFormData, setField, formErrors, images, setImages, imagePreview, videoPreview,
    handleFileChange, categories, brands, regions, colors, sizes, variationOptions, selectedCategory, selectedBrand,
    handleCategoryChange, handleBrandChange, handleDateChange, handleEditorChange,
    variants, setVariants, variantImagePreviews, setVariantImagePreviews,
    fieldOptions, deliveryOptions, handleDeliveryOptionsChange, specs, pinned,
  };
  const statuses = Object.fromEntries(SECTIONS.map((s) => [s.id, sectionStatus(s, ctx)]));
  const required = SECTIONS.filter((s) => !s.optional);
  const readiness = { done: required.filter((s) => statuses[s.id] === 'done').length, total: required.length };
  const [active] = useScrollSpy(SECTIONS.map((s) => s.id));

  const price = parseFloat(formData.price);
  const preview = {
    title: formData.title,
    image: imagePreview || null,
    price: price > 0 ? `GHS ${price.toLocaleString('en-GH', { minimumFractionDigits: 2 })}` : '',
  };

  const showErrors = (errors) => {
    setFormErrors(errors);
    const first = SECTIONS.find((s) => s.errorKeys.some((k) => errors[k]));
    if (first) scrollToSection(first.id);
    return first;
  };

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    if (saving) return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      Swal.fire('You are offline', 'Connect to the internet and try again. Nothing on this page is lost.', 'warning');
      return;
    }

    const errors = validateProduct({ formData, variants, isNew: !isEdit });
    if (Object.keys(errors).length) {
      const first = showErrors(errors);
      const count = Object.keys(errors).filter((k) => k !== 'variantRows').length;
      toast.error(`${count} thing${count === 1 ? '' : 's'} to fix${first ? ` — starting with ${first.title}` : ''}.`);
      return;
    }

    setSaving(true);
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        const value = formData[key];
        if (['image', 'video', 'variants'].includes(key)) return;
        if (key === 'mfd') {
          if (value) fd.append(key, dayjs(value).toISOString());
        } else if (key === 'available_in_regions') {
          value.forEach((rid) => fd.append('available_in_regions', rid));
        } else if (key === 'delivery_options') {
          fd.append('delivery_options', JSON.stringify(value));
        } else if (key === 'variation_axes') {
          // No versions: no options (the server then treats the product as one version).
          fd.append('variation_axes', JSON.stringify(formData.variant === 'None' ? [] : value));
        } else if (value === '' || value == null) {
          if (OMIT_WHEN_EMPTY.includes(key)) return;
          fd.append(key, EMPTY_NUMBER_AS[key] ?? '');
        } else {
          fd.append(key, value);
        }
      });

      if (formData.image instanceof File) fd.append('image', formData.image);
      if (formData.video instanceof File) fd.append('video', formData.video);

      if (variants.length > 0) {
        fd.append('variants', JSON.stringify(variants.map((v) => toVariantPayload(v, formData.variation_axes))));
        variants.forEach((v, i) => { if (v.image instanceof File) fd.append(`variant_image_${i}`, v.image); });
      }

      images.filter((img) => img.file instanceof File).forEach((img) => fd.append('images[]', img.file));
      if (isEdit) {
        fd.append('keep_images', JSON.stringify(images.filter((img) => img.id && !img.file).map((img) => img.id)));
      }

      const attributes = specs.payload();
      if (attributes) fd.append('attributes', JSON.stringify(attributes));

      const client = createAxiosClient();
      const multipart = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data: saved } = isEdit
        ? await client.put(`/api/v1/vendor/products/${id}/`, fd, multipart)
        : await client.post('/api/v1/vendor/products/', fd, multipart);

      await runGalleryUploads(Swal, variants, saved?.variant_keys);
      const pinnedProblem = await pinned.save(saved?.id ?? id);

      baseline.current = current; // nothing unsaved any more; leave without a prompt
      if (pinnedProblem) toast.error(pinnedProblem);
      await Swal.fire({
        icon: 'success',
        title: isEdit ? 'Changes saved' : 'Product saved',
        text: isEdit ? 'Your changes are saved.' : "It's been sent for review. We'll let you know when it's live.",
        timer: 2200, showConfirmButton: false,
      });
      router.push('/products');
    } catch (error) {
      const body = error?.response?.data;
      if (!error?.response) {
        Swal.fire('Connection problem', 'Check your connection and press Save again. Nothing on this page is lost.', 'error');
        return;
      }
      if (body?.error === 'image_limit_exceeded' || body?.error === 'product_limit_reached' || body?.upgrade_url) {
        const { isConfirmed } = await Swal.fire({
          icon: 'info', title: 'Plan limit reached', text: body.detail || 'Your plan does not allow this.',
          showCancelButton: true, confirmButtonText: 'See plans', cancelButtonText: 'Close',
        });
        if (isConfirmed) window.open(body.upgrade_url || '/subscribe', '_blank', 'noopener');
        return;
      }
      if (body && typeof body === 'object' && !body.detail) {
        // Field errors from the server: put each one beside its field.
        const fieldErrors = {};
        const unplaced = [];
        Object.entries(body).forEach(([field, messages]) => {
          const msg = Array.isArray(messages) ? messages.map((m) => (typeof m === 'string' ? m : JSON.stringify(m))).join(' ')
            : typeof messages === 'string' ? messages : JSON.stringify(messages);
          fieldErrors[field] = msg;
          if (!sectionForError(field)) unplaced.push([field, msg]);
        });
        showErrors(fieldErrors);
        if (unplaced.length) {
          Swal.fire({ icon: 'error', title: 'Please fix the following', html: errorHtml(unplaced) });
        } else {
          toast.error('Some details need fixing. They are marked on the page.');
        }
        return;
      }
      Swal.fire('Could not save', body?.detail || error.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const breadcrumbs = [
    { title: 'Home', path: '/dashboard' },
    { title: 'Products', path: '/products' },
    { title: pageTitle },
  ];

  if (loadError) {
    return (
      <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
        <Alert severity="error" sx={{ borderRadius: '12px' }}
          action={<Button color="inherit" onClick={() => router.push('/products')}>Back to products</Button>}>
          {loadError}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={pageTitle} breadcrumbs={breadcrumbs}>
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <MobileSectionBar sections={SECTIONS} statuses={statuses} active={active} />

        <Grid container spacing={3} alignItems="flex-start">
          <Grid size={{ xs: 12, lg: 9 }}>
            {loading ? (
              <Stack spacing={2}>
                {[220, 320, 260].map((h) => <Skeleton key={h} variant="rounded" height={h} sx={{ borderRadius: '20px' }} />)}
              </Stack>
            ) : (
              <Stack spacing={2}>
                {SECTIONS.map((s) => {
                  const Section = s.component;
                  return (
                    <SectionCard key={s.id} id={s.id} title={s.title} subtitle={s.subtitle} icon={s.icon} status={statuses[s.id]}>
                      <Section {...ctx} />
                    </SectionCard>
                  );
                })}
              </Stack>
            )}
          </Grid>

          <Grid size={{ lg: 3 }} sx={{ display: { xs: 'none', lg: 'block' }, position: 'sticky', top: 16 }}>
            <DesktopRail sections={SECTIONS} statuses={statuses} active={active} readiness={readiness}
              preview={preview} saving={saving} isEdit={isEdit} onSave={handleSubmit} onCancel={leave} dirty={dirty} />
          </Grid>
        </Grid>

        <MobileActionBar readiness={readiness} saving={saving} isEdit={isEdit} onSave={handleSubmit} />
      </Box>
    </PageContainer>
  );
}
