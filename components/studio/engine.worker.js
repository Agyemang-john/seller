/* eslint-disable no-restricted-globals */
/**
 * Photo studio engine, in a Web Worker so the page never freezes.
 *
 * Background removal: BiRefNet-lite (MIT licence, github.com/ZhengPeng7/BiRefNet),
 * a high-resolution segmentation model that keeps fine edges (hair, straps,
 * glass) as soft alpha, run with transformers.js on the seller's own device.
 * Photos never leave the device. Models are downloaded once and kept in the
 * browser cache.
 *
 * Two qualities, measured on an Intel laptop GPU:
 *   fast  512 px model, GPU or CPU. ~98 MB. ~6 s GPU / ~13 s CPU per photo there
 *         (well under a second on a good GPU). Used for every photo.
 *   hd    1024 px model, GPU only (WebAssembly's 4 GB can't hold it). ~115 MB,
 *         ~20 s there. On request ("HD edges") for hair, fur, lace, etc.
 *
 * A worker uses either the GPU or the CPU, never both: once ONNX Runtime has
 * started on WebGPU, later CPU sessions in the same worker still run GPU
 * kernels. If the GPU can't run the fast model, this worker answers
 * RETRY_ON_CPU and the page starts a fresh CPU worker (engine.js).
 *
 * In:  { type: 'load', skipGpu } · { type: 'cutout', id, width, height, buffer (RGBA), quality }
 * Out: { type: 'status', stage, loaded, total, device, hd } · { type: 'ready', device, hd }
 *      { type: 'result', id, mask, foreground, quality, inputSize, device, timing }
 *      { type: 'error', id?, message, retryOnCpu?, hdFailed? } · { type: 'gpu-failed' }
 */
import { env, pipeline, RawImage } from '@huggingface/transformers';
import { cleanSpecks, estimateForeground } from './imageOps';

env.allowLocalModels = false;
env.useBrowserCache = true;

/**
 * Exports of the same BiRefNet-lite weights, pinned to exact commits so a
 * change upstream can never change what sellers run.
 *  - fast: 512 px export (fits in WebAssembly memory, runs on the GPU too).
 *  - hd:   the 1024 px graph restructured for WebGPU (the onnx-community export
 *          needs 17 storage buffers per shader; many GPUs, e.g. Intel laptops,
 *          allow 16). Weights unchanged, output identical.
 */
const MODELS = {
  fast: { id: 'studioludens/birefnet-lite-512', revision: '962e67969ec6acec9c19fab76acee4f5e22e990c', dtype: 'fp16', inputSize: 512 },
  fastFull: { id: 'studioludens/birefnet-lite-512', revision: '962e67969ec6acec9c19fab76acee4f5e22e990c', dtype: 'fp32', inputSize: 512 },
  // The file is already half precision: load it as is (dtype fp32 = no file-name suffix).
  hd: { id: 'jiabins0303/birefnet-lite-1024-webgpu', revision: '1ad01cef0f4101a285c5a3e0bd7f15597d93403f', dtype: 'fp32', model_file_name: 'model_fp16', inputSize: 1024 },
};

let device = null;            // 'webgpu' | 'wasm', decided once per worker
let skipGpu = false;
const sessions = {};          // quality → Promise<pipeline>
let hdBroken = false;

const label = () => (device === 'webgpu' ? 'GPU' : 'CPU');
const hdAvailable = () => device === 'webgpu' && !hdBroken;

async function pickDevice() {
  if (device) return device;
  device = 'wasm';
  if (!skipGpu && self.navigator?.gpu) {
    try {
      const adapter = await self.navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (adapter?.features.has('shader-f16') && adapter.limits.maxStorageBuffersPerShaderStage >= 8) device = 'webgpu';
    } catch { /* no GPU: CPU */ }
  }
  return device;
}

// Download progress over every file of the model being loaded.
function progressFor(quality) {
  const files = new Map();
  return (event) => {
    if (!event.file) return;
    if (event.status === 'progress' || event.status === 'download' || event.status === 'initiate') {
      const prev = files.get(event.file) || { loaded: 0, total: 0 };
      files.set(event.file, { loaded: event.loaded ?? prev.loaded, total: event.total ?? prev.total });
    } else if (event.status === 'done') {
      const prev = files.get(event.file);
      if (prev) files.set(event.file, { loaded: prev.total, total: prev.total });
    } else return;
    let loaded = 0; let total = 0;
    files.forEach((f) => { loaded += f.loaded || 0; total += f.total || 0; });
    self.postMessage({ type: 'status', stage: 'download', quality, loaded, total, device: label(), hd: hdAvailable() });
  };
}

function retryOnCpu(err) {
  // eslint-disable-next-line no-console
  console.warn('Photo studio: the GPU could not run the model, moving to the CPU', err);
  self.postMessage({ type: 'gpu-failed' });
  const e = new Error('RETRY_ON_CPU');
  e.retryOnCpu = true;
  return e;
}

async function open(spec, quality) {
  const { id, inputSize, ...options } = spec;
  return pipeline('image-segmentation', id, { ...options, device, progress_callback: progressFor(quality) });
}

/** The model for a quality, loaded once. */
function session(quality) {
  if (!sessions[quality]) {
    sessions[quality] = (async () => {
      await pickDevice();
      self.postMessage({ type: 'status', stage: 'starting', quality, device: label(), hd: hdAvailable() });
      if (quality === 'hd') {
        if (device !== 'webgpu') throw new Error('HD edges need graphics acceleration, which this device doesn\'t have.');
        return { run: await open(MODELS.hd, 'hd'), spec: MODELS.hd };
      }
      try {
        return { run: await open(MODELS.fast, 'fast'), spec: MODELS.fast };
      } catch (err) {
        if (device === 'webgpu') throw retryOnCpu(err);
        return { run: await open(MODELS.fastFull, 'fast'), spec: MODELS.fastFull };
      }
    })();
    sessions[quality].then(
      () => self.postMessage({ type: 'ready', device: label(), hd: hdAvailable() }),
      () => { delete sessions[quality]; },
    );
  }
  return sessions[quality];
}

async function segment(image, quality) {
  let s = await session(quality);
  try {
    return { output: await s.run(image), spec: s.spec };
  } catch (err) {
    if (quality === 'hd') {
      hdBroken = true;
      delete sessions.hd;
      const e = new Error('HD edges are not available on this device. The standard cut-out is kept.');
      e.hdFailed = true;
      throw e;
    }
    if (device === 'webgpu') throw retryOnCpu(err);
    if (s.spec === MODELS.fastFull) throw err;
    // The CPU couldn't run half precision: full precision, once.
    // eslint-disable-next-line no-console
    console.warn('Photo studio: half precision failed on the CPU, using full precision', err);
    sessions.fast = (async () => ({ run: await open(MODELS.fastFull, 'fast'), spec: MODELS.fastFull }))();
    s = await sessions.fast;
    return { output: await s.run(image), spec: s.spec };
  }
}

async function cutout({ id, width, height, buffer, quality = 'fast' }) {
  const rgba = new Uint8ClampedArray(buffer);
  const rgb = new Uint8ClampedArray(width * height * 3);
  for (let i = 0, j = 0; i < rgba.length; i += 4, j += 3) {
    rgb[j] = rgba[i]; rgb[j + 1] = rgba[i + 1]; rgb[j + 2] = rgba[i + 2];
  }
  const image = new RawImage(rgb, width, height, 3);
  await session(quality);
  self.postMessage({ type: 'status', stage: 'working', quality, device: label(), hd: hdAvailable() });
  const t0 = performance.now();
  const { output, spec } = await segment(image, quality);
  const maskImage = output[0].mask;
  let mask = Uint8Array.from(maskImage.data);
  if (maskImage.width !== width || maskImage.height !== height) {
    const resized = await maskImage.resize(width, height);
    mask = Uint8Array.from(resized.data);
  }
  mask = cleanSpecks(mask);
  const t1 = performance.now();
  self.postMessage({ type: 'status', stage: 'edges', quality, device: label(), hd: hdAvailable() });
  const foreground = estimateForeground(rgba, mask, width, height);
  const timing = { model: Math.round(t1 - t0), edges: Math.round(performance.now() - t1) };
  self.postMessage({ type: 'result', id, mask, foreground, quality, inputSize: spec.inputSize, device: label(), timing, hd: hdAvailable() },
    [mask.buffer, foreground.buffer]);
}

// One photo at a time: a model session is not shared between runs.
let queue = Promise.resolve();
self.onmessage = (e) => {
  const msg = e.data || {};
  queue = queue.then(async () => {
    try {
      if (msg.type === 'load') { skipGpu = !!msg.skipGpu; await session('fast'); }
      else if (msg.type === 'cutout') await cutout(msg);
    } catch (err) {
      self.postMessage({ type: 'error', id: msg.id, message: err?.message || String(err),
        retryOnCpu: !!err?.retryOnCpu, hdFailed: !!err?.hdFailed, hd: hdAvailable() });
    }
  });
};
