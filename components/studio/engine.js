'use client';

/**
 * The photo studio's background-removal engine, seen from the page: one shared
 * worker (engine.worker.js), started the first time it is needed, one photo at
 * a time in order. Status (download, device) is shared by every open studio.
 *
 * GPU first; if this device's GPU can't run the model, the worker says so
 * (retryOnCpu), and a fresh CPU worker takes over the waiting photos. That is
 * remembered on the device, so the next visit starts on the CPU straight away.
 */

let worker = null;
let nextId = 1;
const pending = new Map();      // id → { resolve, reject, rgba, width, height }  (cut-outs: re-sent after a restart)
const calls = new Map();        // id → { resolve, reject }  (tap to select)
let embeddedKey = null;         // the photo the worker has encoded for tap to select
const listeners = new Set();
let status = { stage: 'idle', quality: 'fast', loaded: 0, total: 0, device: null, hd: false, error: null };

const GPU_FAILED_KEY = 'photo-studio:gpu-failed';
let gpuFailedNow = false;
const skipGpu = () => {
  if (gpuFailedNow) return true;
  try { return localStorage.getItem(GPU_FAILED_KEY) === '1'; } catch { return false; }
};

function setStatus(patch) {
  status = { ...status, ...patch };
  listeners.forEach((fn) => fn(status));
}

function send(id, job) {
  const copy = new Uint8ClampedArray(job.rgba);       // the caller keeps its own pixels
  worker.postMessage({ type: 'cutout', id, width: job.width, height: job.height, buffer: copy.buffer, quality: job.quality },
    [copy.buffer]);
}

/** Start again on the CPU and re-send every photo still waiting. */
function restartOnCpu() {
  gpuFailedNow = true;
  try { localStorage.setItem(GPU_FAILED_KEY, '1'); } catch { /* private mode */ }
  worker?.terminate();
  worker = null;
  embeddedKey = null;
  calls.forEach((c) => {
    const err = new Error('The studio switched to this device\'s processor. Tap again.');
    err.restarted = true;
    c.reject(err);
  });
  calls.clear();
  embedding = null;
  setStatus({ stage: 'starting', device: 'CPU' });
  start();
  pending.forEach((job, id) => send(id, job));
}

function start() {
  if (worker) return worker;
  worker = new Worker(new URL('./engine.worker.js', import.meta.url), { type: 'module' });
  // Always first, so the worker knows whether to try the GPU.
  worker.postMessage({ type: 'load', skipGpu: skipGpu() });
  worker.onmessage = (e) => {
    const msg = e.data || {};
    if (msg.type === 'gpu-failed') {
      gpuFailedNow = true;
    } else if (msg.type === 'status') {
      setStatus({ stage: msg.stage, quality: msg.quality, device: msg.device ?? status.device, hd: !!msg.hd,
        ...(msg.stage === 'download' ? { loaded: msg.loaded, total: msg.total } : {}) });
    } else if (msg.type === 'ready') {
      setStatus({ stage: 'ready', device: msg.device, hd: !!msg.hd, error: null });
    } else if (msg.type === 'result') {
      const job = pending.get(msg.id);
      pending.delete(msg.id);
      setStatus({ stage: 'ready', hd: !!msg.hd });
      job?.resolve({ mask: msg.mask, foreground: new Uint8ClampedArray(msg.foreground.buffer), quality: msg.quality,
        inputSize: msg.inputSize, device: msg.device, timing: msg.timing });
    } else if (msg.type === 'embedded' || msg.type === 'selected') {
      const c = calls.get(msg.id);
      calls.delete(msg.id);
      setStatus({ stage: 'ready' });
      c?.resolve(msg);
    } else if (msg.type === 'error') {
      if (msg.retryOnCpu) { restartOnCpu(); return; }
      setStatus({ hd: !!msg.hd });
      if (msg.id && calls.has(msg.id)) {
        calls.get(msg.id).reject(new Error(msg.message));
        calls.delete(msg.id);
        setStatus({ stage: 'ready' });
        return;
      }
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id).reject(new Error(msg.message));
        pending.delete(msg.id);
      } else {
        setStatus({ stage: 'error', error: msg.message });
      }
    }
  };
  worker.onerror = (e) => {
    setStatus({ stage: 'error', error: e.message || 'The photo studio stopped.' });
    pending.forEach((job) => job.reject(new Error('The photo studio stopped.')));
    pending.clear();
    calls.forEach((c) => c.reject(new Error('The photo studio stopped.')));
    calls.clear();
    embeddedKey = null;
    worker = null;
  };
  return worker;
}

export function getStatus() { return status; }

export function subscribe(fn) {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

/** Start downloading the model ahead of time (e.g. when the studio opens). */
export function warmUp() {
  if (status.stage === 'idle' || status.stage === 'error') {
    setStatus({ stage: 'starting', error: null });
    start();
  }
}

/**
 * Remove the background of RGBA pixels → { mask, foreground, ... }.
 * quality: 'fast' (every photo) or 'hd' (1024 px model, GPU only: status.hd says if available).
 */
export function removeBackground(rgba, width, height, { quality = 'fast' } = {}) {
  start();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    const job = { resolve, reject, rgba, width, height, quality };
    pending.set(id, job);
    setStatus({ stage: status.stage === 'ready' ? 'working' : status.stage });
    send(id, job);
  });
}

function call(msg, transfer = []) {
  start();
  const id = nextId++;
  return new Promise((resolve, reject) => {
    calls.set(id, { resolve, reject });
    worker.postMessage({ ...msg, id }, transfer);
  });
}

/**
 * Tap to select: the object under the given points, as a mask (0/255) the
 * size of the photo. key identifies the photo (it is encoded once, on the first tap).
 * points: [[x, y, 1 = part of it | 0 = not part of it]], in photo pixels.
 */
let embedding = null;           // { key, promise } while a photo is being encoded

/** Encode a photo for tap to select ahead of the first tap (e.g. when Touch up opens). */
export function prepareSelect(key, rgba, width, height) {
  if (embeddedKey === key) return Promise.resolve();
  if (embedding?.key === key) return embedding.promise;
  const copy = new Uint8ClampedArray(rgba);
  const promise = call({ type: 'embed', key, width, height, buffer: copy.buffer }, [copy.buffer])
    .then(() => { embeddedKey = key; })
    .finally(() => { if (embedding?.promise === promise) embedding = null; });
  embedding = { key, promise };
  return promise;
}

export async function selectObject(key, rgba, width, height, points) {
  for (let attempt = 0; ; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await prepareSelect(key, rgba, width, height);
      // eslint-disable-next-line no-await-in-loop
      const { mask, score } = await call({ type: 'select', key, points });
      return { mask, score };
    } catch (err) {
      // The GPU gave up and a CPU worker took over: same tap, once more.
      if (!err?.restarted || attempt) throw err;
    }
  }
}

/** True when the browser has what the studio needs at all. */
export function studioSupported() {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof createImageBitmap === 'function';
}
