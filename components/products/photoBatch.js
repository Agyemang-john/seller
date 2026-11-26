'use client';

/**
 * Adding many photos at once, the same way everywhere on the product form
 * (main photo, gallery, variant photos): each photo is squared on a white
 * background and checked (size, resolution, plain background) a few at a time,
 * with progress, and the plan's limit decides how many fit.
 */
import { useCallback, useRef, useState } from 'react';
import Swal from 'sweetalert2';
import { squareifyImage, validateImage } from './fileValidators';

const CHECK = { maxSizeMB: 2, minResolution: 400, maxResolution: 1800, checkBackground: true };
const AT_ONCE = 3;

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
export const imagesOnly = (fileList) => Array.from(fileList || []).filter((f) => f.type?.startsWith('image/'));

/** One photo → { file } (squared, passed) or { error } (safe HTML). The studio's own output always passes. */
export async function checkPhoto(file) {
  try {
    const squared = await squareifyImage(file, 'pad', '#FFFFFF');
    const check = await validateImage(squared, CHECK);
    return check.valid ? { file: squared } : { error: `<b>${escape(file.name)}</b>: ${check.errors.map(escape).join(' ')}` };
  } catch {
    return { error: `<b>${escape(file.name)}</b>: this file couldn't be read as a photo.` };
  }
}

/** Many photos, AT_ONCE in parallel, in the order picked. onProgress(done, total). */
export async function checkPhotos(files, onProgress) {
  const results = new Array(files.length);
  let next = 0;
  let done = 0;
  const worker = async () => {
    while (next < files.length) {
      const i = next++;
      results[i] = await checkPhoto(files[i]);
      done += 1;
      onProgress?.(done, files.length);
    }
  };
  await Promise.all(Array.from({ length: Math.min(AT_ONCE, files.length) }, worker));
  return {
    good: results.filter((r) => r.file).map((r) => r.file),
    problems: results.filter((r) => r.error).map((r) => r.error),
    // The originals that didn't pass: the photo studio can usually fix them.
    failed: files.filter((_, i) => results[i].error),
  };
}

/**
 * Report photos that didn't pass and, when the photo studio is at hand
 * (studio = usePhotoStudio()), offer to fix them there. Resolves to the fixed
 * files (ready to add), or [] when the seller declines.
 */
export async function reportOrFix(problems, failed, studio) {
  if (!problems.length) return [];
  if (!studio || !failed?.length) { reportProblems(problems); return []; }
  const { isConfirmed } = await Swal.fire({
    icon: 'info',
    title: failed.length === 1 ? 'This photo needs a touch-up' : `${failed.length} photos need a touch-up`,
    html: `${problems.join('<br/>')}<br/><br/>The <b>Photo studio</b> can fix ${failed.length === 1 ? 'it' : 'them'}: it removes the background, sizes the photo and keeps it looking real.`,
    showCancelButton: true,
    confirmButtonText: 'Fix in Photo studio',
    cancelButtonText: 'Not now',
    reverseButtons: true,
  });
  if (!isConfirmed) return [];
  const files = await studio.open(failed.map((f) => ({ source: f, name: f.name })));
  return (files || []).filter(Boolean);
}

/** "N didn't fit" note for the plan limit. */
export const overLimitNote = (skipped, limit, where = 'gallery photos') =>
  `Your plan allows ${limit} ${where}, so ${skipped} ${skipped === 1 ? 'photo was' : 'photos were'} not added. `
  + '<a href="/subscribe" target="_blank" rel="noopener">Upgrade for more</a>.';

export function reportProblems(problems) {
  if (problems.length) Swal.fire({ icon: 'warning', title: 'Some photos were not added', html: problems.join('<br/>') });
}

/** Progress for a batch: { label, run(files, fn) } where fn gets (files, onProgress). */
export function useBatchProgress() {
  const [progress, setProgress] = useState(null);            // null | { done, total }
  const run = useCallback(async (total, fn) => {
    setProgress({ done: 0, total });
    try {
      return await fn((done, all) => setProgress({ done, total: all }));
    } finally {
      setProgress(null);
    }
  }, []);
  const label = progress ? (progress.total > 1 ? `Checking ${progress.done} of ${progress.total}…` : 'Checking…') : '';
  return { busy: !!progress, label, run };
}

/** Drag photos from the computer onto an area. Returns { dragging, dropProps }. */
export function useDropPhotos(onFiles, disabled = false) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);
  const hasFiles = (e) => Array.from(e.dataTransfer?.types || []).includes('Files');
  const dropProps = disabled ? {} : {
    onDragEnter: (e) => { if (!hasFiles(e)) return; e.preventDefault(); depth.current += 1; setDragging(true); },
    onDragOver: (e) => { if (hasFiles(e)) e.preventDefault(); },
    onDragLeave: () => { depth.current = Math.max(depth.current - 1, 0); if (!depth.current) setDragging(false); },
    onDrop: (e) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current = 0;
      setDragging(false);
      const files = imagesOnly(e.dataTransfer.files);
      if (files.length) onFiles(files);
    },
  };
  return { dragging, dropProps };
}

/**
 * Add photos to one variant's gallery within its plan limit.
 * onAdd receives gallery items ({ key, id: null, file, url }).
 */
export async function addVariantPhotos({ files, current, limit, onAdd, onProgress }) {
  const room = limit == null ? 0 : Math.max(limit - current, 0);
  const accepted = files.slice(0, room);
  const problems = [];
  if (files.length > accepted.length) {
    problems.push(limit === 0
      ? 'Extra photos for versions come with paid plans. <a href="/subscribe" target="_blank" rel="noopener">Upgrade</a> to add them.'
      : overLimitNote(files.length - accepted.length, limit, 'extra photos per version'));
  }
  if (accepted.length) {
    const { good, problems: bad } = await checkPhotos(accepted, onProgress);
    problems.push(...bad);
    if (good.length) {
      onAdd(good.map((file) => ({
        key: `pending-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
        id: null, file, url: URL.createObjectURL(file),
      })));
    }
  }
  return problems;
}
