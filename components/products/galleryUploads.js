// Extra gallery photos per variant (backend: vendor/variant_gallery.py).
//
// Each variant carries `key` (stable client id) and `gallery`: its extra photos
// in display order, as { key, id, url } for saved ones and { key, id: null,
// file, url } for photos picked but not uploaded yet.
//
// Saving is two steps: the product save sends `keep_gallery` (saved ids in
// order, null where a new photo sits) so removals and reordering apply, then
// each new photo is uploaded on its own with its position. Small requests keep
// mobile uploads reliable and stay under the server's request size limit.
import { createAxiosClient } from '@/utils/clientFetch';

const UPLOAD_CONCURRENCY = 3;

export const newVariantKey = () => `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const galleryFromApi = (gallery = []) =>
  gallery.map((g) => ({ key: `img-${g.id}`, id: g.id, file: null, url: g.images }));

/** The variant as the product endpoint expects it (no files, no preview URLs). */
export function toVariantPayload(v) {
  const { gallery = [], key, ...rest } = v;
  return {
    ...rest,
    image: null,
    client_key: key,
    keep_gallery: gallery.map((g) => g.id ?? null),
  };
}

export function pendingGalleryCount(variants) {
  return variants.reduce((n, v) => n + (v.gallery || []).filter((g) => g.file).length, 0);
}

function apiMessage(error) {
  const body = error?.response?.data;
  if (!error?.response) return 'Network error';
  return body?.detail || body?.image?.[0] || body?.image || 'Upload failed';
}

/**
 * Upload every photo still pending, after the product save returned
 * `variant_keys` ({ client_key: variant id }). Returns the uploads that failed.
 */
export async function uploadVariantGalleries(variants, variantKeys = {}, onProgress = () => {}) {
  const jobs = [];
  variants.forEach((v, vi) => {
    const variantId = variantKeys[v.key] ?? v.id;
    (v.gallery || []).forEach((g, position) => {
      if (g.file) jobs.push({ variantId, file: g.file, position, label: `Variant ${vi + 1}` });
    });
  });
  if (jobs.length === 0) return [];

  const client = createAxiosClient();
  const failed = [];
  let done = 0;
  let next = 0;
  onProgress(0, jobs.length);

  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      try {
        if (!job.variantId) throw new Error('Variant was not saved');
        const fd = new FormData();
        fd.append('image', job.file);
        fd.append('position', String(job.position));
        await client.post(`/api/v1/vendor/variants/${job.variantId}/images/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch (error) {
        failed.push({ label: job.label, message: apiMessage(error) });
      }
      onProgress(++done, jobs.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(UPLOAD_CONCURRENCY, jobs.length) }, worker));
  return failed;
}

/** Helpers the forms share: show progress while uploading, then report failures. */
export async function runGalleryUploads(Swal, variants, variantKeys) {
  const total = pendingGalleryCount(variants);
  if (total === 0) return;
  Swal.fire({
    title: 'Uploading variant photos',
    html: `0 of ${total}`,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => Swal.showLoading(),
  });
  const failed = await uploadVariantGalleries(variants, variantKeys, (done, all) => {
    const html = Swal.getHtmlContainer();
    if (html) html.textContent = `${done} of ${all}`;
  });
  Swal.close();
  if (failed.length > 0) {
    // Reasons are usually identical (e.g. plan limit) — show each once.
    const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
    const reasons = [...new Set(failed.map((f) => escape(f.message)))];
    await Swal.fire({
      icon: 'warning',
      title: 'Product saved',
      html: `${failed.length} of ${total} variant photos could not be uploaded:<br/><br/>${reasons.join('<br/>')}<br/><br/>Edit the product to try again.`,
    });
  }
}
