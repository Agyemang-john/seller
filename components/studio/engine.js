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
const pending = new Map();      // id → { resolve, reject, rgba, width, height }
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
    } else if (msg.type === 'error') {
      if (msg.retryOnCpu) { restartOnCpu(); return; }
      setStatus({ hd: !!msg.hd });
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

/** True when the browser has what the studio needs at all. */
export function studioSupported() {
  return typeof window !== 'undefined' && typeof Worker !== 'undefined' && typeof createImageBitmap === 'function';
}
