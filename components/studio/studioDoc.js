'use client';

/**
 * One photo being edited in the studio: its pixels, its cut-out, the seller's
 * settings and touch-up strokes, and how to draw it.
 *
 * Every setting is non-destructive: the original pixels and the model's mask
 * are kept, and the picture is rebuilt from them (strokes are kept as lines, so
 * undo is exact). The screen uses a smaller copy for speed; Save rebuilds
 * the full-size photo from the originals.
 *
 * Output: OUTPUT_SIZE square JPEG, product centred on a light background, under
 * MAX_BYTES: what the product form and the upload checks expect.
 */

import { adjustPixels, autoAdjust, cornersPlain, featherMask, maskBounds, measure, shiftMask } from './imageOps';

export const OUTPUT_SIZE = 1600;
export const WORK_MAX = 2048;          // longest side kept for editing
const PREVIEW_MAX = 1024;              // longest side used on screen
const MAX_BYTES = 1.9 * 1024 * 1024;

export const BACKGROUNDS = [
  { value: '#FFFFFF', label: 'White', hint: 'Recommended' },
  { value: '#F5F5F4', label: 'Soft grey' },
  { value: '#F4F1EC', label: 'Warm' },
];

export const DEFAULTS = {
  removeBg: true,
  background: '#FFFFFF',
  shadow: 'none',          // none | floor | soft
  fill: 0.85,              // share of the square the product's longest side takes
  zoom: 1,
  panX: 0, panY: 0,        // share of the square
  quarter: 0,              // 90° turns
  straighten: 0,           // degrees, -15..15
  flip: false,
  edgeShift: 0,            // px, - tighter / + looser
  edgeSoft: 1,             // px of feather
  exposure: 0, contrast: 0, warmth: 0, saturation: 0, sharpness: 0,
  wb: [1, 1, 1],
};

// ── Canvas helpers ───────────────────────────────────────────────────────────

const makeCanvas = (w, h) => {
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h));
  return c;
};
const ctx2d = (c) => c.getContext('2d', { willReadFrequently: true });

function canvasFromRgba(rgba, w, h) {
  const c = makeCanvas(w, h);
  ctx2d(c).putImageData(new ImageData(rgba, w, h), 0, 0);
  return c;
}

function grayCanvas(mask, w, h) {
  const rgba = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < mask.length; i++) {
    rgba[i * 4] = rgba[i * 4 + 1] = rgba[i * 4 + 2] = mask[i]; rgba[i * 4 + 3] = 255;
  }
  return canvasFromRgba(rgba, w, h);
}

function readRed(canvas) {
  const { data } = ctx2d(canvas).getImageData(0, 0, canvas.width, canvas.height);
  const out = new Uint8Array(canvas.width * canvas.height);
  for (let i = 0; i < out.length; i++) out[i] = data[i * 4];
  return out;
}

function scaled(source, w, h) {
  const c = makeCanvas(w, h);
  const g = ctx2d(c);
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = 'high';
  g.drawImage(source, 0, 0, w, h);
  return c;
}

// ── Loading a photo ──────────────────────────────────────────────────────────

/** A File, Blob or URL → RGBA pixels at most WORK_MAX on the long side (camera rotation applied). */
export async function loadPhoto(source, name = 'photo') {
  let blob = source;
  if (typeof source === 'string') {
    let res;
    try {
      res = await fetch(source, { mode: 'cors', cache: 'no-cache' });
    } catch {
      throw new Error('This photo could not be opened in the studio. Save it to your device and add it again.');
    }
    if (!res.ok) throw new Error('This photo could not be downloaded.');
    blob = await res.blob();
  }
  let bitmap;
  try {
    bitmap = await createImageBitmap(blob, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`${name} isn't a photo the studio can read (use JPG, PNG or WebP).`);
  }
  const ratio = Math.min(1, WORK_MAX / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * ratio);
  const h = Math.round(bitmap.height * ratio);
  const canvas = scaled(bitmap, w, h);
  bitmap.close?.();
  const { data } = ctx2d(canvas).getImageData(0, 0, w, h);
  return { pixels: data, width: w, height: h, name, originalWidth: Math.round(w / ratio), originalHeight: Math.round(h / ratio) };
}

// ── The document ─────────────────────────────────────────────────────────────

export class StudioDoc {
  constructor({ pixels, width, height, name, originalWidth, originalHeight }) {
    this.name = name;
    this.w = width; this.h = height;
    this.originalSize = Math.max(originalWidth || width, originalHeight || height);
    this.pixels = pixels;
    this.mask = null;          // the model's mask, full size
    this.foreground = null;    // edge-cleaned colours, full size
    this.params = { ...DEFAULTS };
    this.strokes = [];         // { mode: 'erase'|'restore', size, points: [x, y, ...] } in full-size pixels
    this.levels = {};
    this.cache = {};
    this.facts = null;
  }

  get hasCutout() { return !!this.mask; }

  setCutout({ mask, foreground }) {
    this.mask = mask;
    this.foreground = foreground;
    this.levels = {};
    this.cache = {};
    this.facts = measure(this.pixels, mask, this.w, this.h);
    this.auto = autoAdjust(foreground, mask, this.w, this.h);
  }

  /** Full-size or screen-size copies of the pixels, colours and mask. */
  level(kind) {
    if (this.levels[kind]) return this.levels[kind];
    const ratio = kind === 'full' ? 1 : Math.min(1, PREVIEW_MAX / Math.max(this.w, this.h));
    const w = Math.round(this.w * ratio);
    const h = Math.round(this.h * ratio);
    const lv = { kind, ratio, w, h };
    const full = this.levels.full || (kind === 'full' ? null : this.level('full'));
    if (kind === 'full') {
      lv.pixels = this.pixels;
      lv.foreground = this.foreground;
      lv.mask = this.mask;
      lv.pixelCanvas = canvasFromRgba(this.pixels, w, h);
      lv.maskCanvas = this.mask ? grayCanvas(this.mask, w, h) : null;
    } else {
      lv.pixelCanvas = scaled(full.pixelCanvas, w, h);
      lv.pixels = ctx2d(lv.pixelCanvas).getImageData(0, 0, w, h).data;
      if (this.mask) {
        const fg = scaled(canvasFromRgba(this.foreground, this.w, this.h), w, h);
        lv.foreground = ctx2d(fg).getImageData(0, 0, w, h).data;
        lv.maskCanvas = scaled(full.maskCanvas, w, h);
        lv.mask = readRed(lv.maskCanvas);
      }
    }
    this.levels[kind] = lv;
    return lv;
  }

  /** The mask with touch-ups and edge settings applied, at one level. */
  finalMask(lv) {
    const p = this.params;
    const key = `${this.strokes.length}:${this.strokeVersion || 0}:${p.edgeShift}:${p.edgeSoft}`;
    const slot = `mask:${lv.kind}`;
    if (this.cache[slot]?.key === key) return this.cache[slot].value;
    let mask = lv.mask;
    if (this.strokes.length) {
      const c = makeCanvas(lv.w, lv.h);
      const g = ctx2d(c);
      g.drawImage(lv.maskCanvas, 0, 0);
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (const s of this.strokes) {
        g.strokeStyle = s.mode === 'erase' ? '#000' : '#fff';
        g.fillStyle = g.strokeStyle;
        g.lineWidth = Math.max(1, s.size * lv.ratio);
        const pts = s.points;
        g.beginPath();
        g.moveTo(pts[0] * lv.ratio, pts[1] * lv.ratio);
        if (pts.length === 2) {
          g.arc(pts[0] * lv.ratio, pts[1] * lv.ratio, g.lineWidth / 2, 0, Math.PI * 2);
          g.fill();
        } else {
          for (let i = 2; i < pts.length; i += 2) g.lineTo(pts[i] * lv.ratio, pts[i + 1] * lv.ratio);
          g.stroke();
        }
      }
      mask = readRed(c);
    }
    const toLevel = (px) => (px ? Math.sign(px) * Math.max(1, Math.round(Math.abs(px) * lv.ratio)) : 0);
    mask = shiftMask(mask, lv.w, lv.h, toLevel(p.edgeShift));
    // A touch of feather always: a hard pixel edge is what makes cut-outs look pasted on.
    mask = featherMask(mask, lv.w, lv.h, Math.max(lv.kind === 'full' ? 1 : 0, Math.round(p.edgeSoft * lv.ratio)));
    const bounds = maskBounds(mask, lv.w, lv.h);
    const value = { mask, bounds };
    this.cache[slot] = { key, value };
    return value;
  }

  /** The product layer (adjusted colours + alpha), as a canvas, at one level. */
  layer(lv, view) {
    const p = this.params;
    const cut = p.removeBg && this.hasCutout;
    const colourKey = JSON.stringify([cut, p.exposure, p.contrast, p.warmth, p.saturation, p.sharpness, p.wb]);
    const slot = `colour:${lv.kind}`;
    if (this.cache[slot]?.key !== colourKey) {
      const base = cut ? lv.foreground : lv.pixels;
      this.cache[slot] = { key: colourKey, value: adjustPixels(base, lv.w, lv.h, p) };
    }
    const colours = this.cache[slot].value;
    const m = cut || view === 'touchup' ? this.finalMask(lv) : null;
    const n = lv.w * lv.h;
    const out = new Uint8ClampedArray(n * 4);
    if (view === 'touchup' && m) {
      // What is kept in full colour; what is removed, tinted, so the seller can restore it.
      const src = lv.pixels;
      for (let i = 0; i < n; i++) {
        const a = m.mask[i] / 255;
        const o = i * 4;
        out[o] = colours[o] * a + (src[o] * 0.45 + 255 * 0.55) * (1 - a);
        out[o + 1] = colours[o + 1] * a + (src[o + 1] * 0.45 + 40 * 0.55) * (1 - a);
        out[o + 2] = colours[o + 2] * a + (src[o + 2] * 0.45 + 70 * 0.55) * (1 - a);
        out[o + 3] = 255;
      }
    } else {
      out.set(colours);
      if (m) for (let i = 0; i < n; i++) out[i * 4 + 3] = m.mask[i];
      else for (let i = 0; i < n; i++) out[i * 4 + 3] = 255;
    }
    return { canvas: canvasFromRgba(out, lv.w, lv.h), bounds: m && view !== 'touchup' ? m.bounds : null };
  }

  /**
   * Draw the finished square into `target` (a canvas sized size×size).
   * view: 'final' | 'touchup' | 'original' (before, for comparing).
   */
  render(target, { kind = 'preview', view = 'final' } = {}) {
    const size = target.width;
    const lv = this.level(kind);
    const g = target.getContext('2d');
    g.save();
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.imageSmoothingEnabled = true;
    g.imageSmoothingQuality = 'high';

    if (view === 'original') {
      g.fillStyle = '#FFFFFF';
      g.fillRect(0, 0, size, size);
      const s = Math.min(size / lv.w, size / lv.h);
      g.drawImage(lv.pixelCanvas, (size - lv.w * s) / 2, (size - lv.h * s) / 2, lv.w * s, lv.h * s);
      g.restore();
      return null;
    }

    const { canvas: layer, bounds } = this.layer(lv, view);
    const p = this.params;
    const geo = this.geometryFor(lv, size, view === 'touchup' ? null : bounds);
    g.fillStyle = view === 'touchup' ? '#FFFFFF' : p.background;
    g.fillRect(0, 0, size, size);

    const place = () => {
      g.translate(geo.cx, geo.cy);
      g.rotate(geo.angle);
      g.scale(geo.scale * geo.flip, geo.scale);
      g.translate(-geo.bx, -geo.by);
    };

    if (view === 'final' && p.removeBg && this.hasCutout && bounds && p.shadow !== 'none') {
      this.drawShadow(g, layer, bounds, geo, place);
    }
    g.save();
    place();
    g.drawImage(layer, 0, 0);
    g.restore();
    g.restore();
    this.lastGeometry = { ...geo, kind, view };
    return geo;
  }

  /**
   * Where the product sits in the square: scale, centre, angle (for drawing and
   * the brush). Cut-out: the product's longest side takes `fill` of the square.
   * Photo kept: the photo fills the square and the rest is cropped.
   */
  geometryFor(lv, size, bounds) {
    const p = this.params;
    const cut = !!bounds && p.removeBg;
    const box = cut ? bounds : { x: 0, y: 0, w: lv.w, h: lv.h };
    const quarter = ((p.quarter % 4) + 4) % 4;
    const turned = quarter % 2 === 1;
    const bw = turned ? box.h : box.w;
    const bh = turned ? box.w : box.h;
    const base = cut ? (p.fill * size) / Math.max(bw, bh) : size / Math.min(bw, bh);
    return {
      size, scale: base * p.zoom,
      cx: size / 2 + p.panX * size, cy: size / 2 + p.panY * size,
      angle: ((quarter * 90 + p.straighten) * Math.PI) / 180,
      flip: p.flip ? -1 : 1,
      bx: box.x + box.w / 2, by: box.y + box.h / 2, box, ratio: lv.ratio, cut,
    };
  }

  /** Natural studio shadows: a soft floor shadow under the product, or a soft lifted shadow. */
  drawShadow(g, layer, bounds, geo, place) {
    const p = this.params;
    // The product's lowest points on the square, after turning.
    const corners = [[bounds.x, bounds.y], [bounds.x + bounds.w, bounds.y], [bounds.x, bounds.y + bounds.h], [bounds.x + bounds.w, bounds.y + bounds.h]]
      .map(([x, y]) => {
        const dx = (x - geo.bx) * geo.scale * geo.flip;
        const dy = (y - geo.by) * geo.scale;
        return [geo.cx + dx * Math.cos(geo.angle) - dy * Math.sin(geo.angle), geo.cy + dx * Math.sin(geo.angle) + dy * Math.cos(geo.angle)];
      });
    const left = Math.min(...corners.map((c) => c[0]));
    const right = Math.max(...corners.map((c) => c[0]));
    const bottom = Math.max(...corners.map((c) => c[1]));
    const top = Math.min(...corners.map((c) => c[1]));
    const width = right - left;
    const height = bottom - top;

    if (p.shadow === 'floor') {
      const rx = width * 0.46;
      const ry = Math.max(4, Math.min(height * 0.045, width * 0.06));
      g.save();
      g.translate((left + right) / 2, bottom - ry * 0.35);
      g.scale(1, ry / rx);
      const grad = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      grad.addColorStop(0, 'rgba(0,0,0,0.30)');
      grad.addColorStop(0.45, 'rgba(0,0,0,0.16)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grad;
      g.beginPath();
      g.arc(0, 0, rx, 0, Math.PI * 2);
      g.fill();
      g.restore();
      return;
    }

    // Soft: the product's own silhouette, blurred by drawing it small then large.
    const tiny = makeCanvas(layer.width / 24, layer.height / 24);
    const t = tiny.getContext('2d');
    t.drawImage(layer, 0, 0, tiny.width, tiny.height);
    t.globalCompositeOperation = 'source-in';
    t.fillStyle = '#000';
    t.fillRect(0, 0, tiny.width, tiny.height);
    const mid = makeCanvas(layer.width / 6, layer.height / 6);
    const m = mid.getContext('2d');
    m.imageSmoothingQuality = 'high';
    m.drawImage(tiny, 0, 0, mid.width, mid.height);
    g.save();
    g.globalAlpha = 0.16;
    g.translate(0, height * 0.025);
    place();
    g.drawImage(mid, 0, 0, layer.width, layer.height);
    g.restore();
  }

  /** Screen point (in the square's pixels) → full-size photo pixel, for the brush. */
  toSource(x, y) {
    const geo = this.lastGeometry;
    if (!geo) return null;
    const dx = x - geo.cx;
    const dy = y - geo.cy;
    const cos = Math.cos(-geo.angle);
    const sin = Math.sin(-geo.angle);
    const rx = (dx * cos - dy * sin) / (geo.scale * geo.flip);
    const ry = (dx * sin + dy * cos) / geo.scale;
    return [(rx + geo.bx) / geo.ratio, (ry + geo.by) / geo.ratio];
  }

  /** Size on screen → size in full-size photo pixels. */
  toSourceSize(px) {
    const geo = this.lastGeometry;
    return geo ? px / (geo.scale * geo.ratio) : px;
  }

  /** The checklist shown next to the photo. */
  checks() {
    const p = this.params;
    const out = [];
    const cut = p.removeBg && this.hasCutout;
    const lv = this.level('preview');
    const m = cut ? this.finalMask(lv) : null;
    const geo = this.geometryFor(lv, OUTPUT_SIZE, m?.bounds);
    out.push({ ok: true, label: `${OUTPUT_SIZE} × ${OUTPUT_SIZE} px square` });
    if (cut) {
      out.push({ ok: !!m?.bounds, label: m?.bounds ? 'Clean background' : 'No product found: restore it with Touch up' });
      if (m?.bounds) {
        const share = (Math.max(m.bounds.w, m.bounds.h) * geo.scale) / OUTPUT_SIZE;
        out.push({ ok: share >= 0.7 && share <= 0.95, label: share < 0.7 ? 'Product looks small: make it bigger in Frame'
          : share > 0.95 ? 'Product touches the edges: make it smaller in Frame' : 'Product fills the frame well' });
      }
      if (this.facts?.cutOff?.length) out.push({ ok: false, warn: true, label: `The product is cut off at the ${this.facts.cutOff.join(' and ')} of the original photo` });
      if (this.facts?.uncertain > 0.3) out.push({ ok: false, warn: true, label: 'Some edges were hard to find: check them in Touch up' });
    } else {
      const probe = makeCanvas(OUTPUT_SIZE / 8, OUTPUT_SIZE / 8);
      this.render(probe, { kind: 'preview' });
      const { data } = ctx2d(probe).getImageData(0, 0, probe.width, probe.height);
      const plain = cornersPlain(data, probe.width, probe.height);
      out.push({ ok: plain, label: plain ? 'Background is plain' : 'Background isn\'t plain: turn on Remove background' });
    }
    const f = this.facts || measure(this.pixels, null, this.w, this.h);
    if (f && !f.empty) {
      // Output pixels per original pixel: above ~2 the camera's detail runs out.
      const upscale = geo.scale * lv.ratio * (Math.max(this.w, this.h) / this.originalSize);
      const sourcePx = (f.productPixels || 0) * (this.originalSize / Math.max(this.w, this.h));
      if (sourcePx && sourcePx < 700) out.push({ ok: false, warn: true, label: 'Small original photo: it may look soft. A closer photo works best' });
      else if (upscale > 2.2) out.push({ ok: false, warn: true, label: 'Zoomed in a lot: it may look soft' });
      if (f.sharpness < 25) out.push({ ok: false, warn: true, label: 'The photo looks a little blurry. Try Sharpness, or retake it steady in good light' });
      if (f.brightness < 0.18) out.push({ ok: false, warn: true, label: 'Quite dark: try Auto or Brightness' });
    }
    return out;
  }

  /** The finished photo as a JPEG File, full size. */
  async export() {
    const canvas = makeCanvas(OUTPUT_SIZE, OUTPUT_SIZE);
    this.render(canvas, { kind: 'full', view: 'final' });
    let quality = 0.92;
    let blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    while (blob && blob.size > MAX_BYTES && quality > 0.6) {
      quality -= 0.06;
      // eslint-disable-next-line no-await-in-loop
      blob = await new Promise((r) => canvas.toBlob(r, 'image/jpeg', quality));
    }
    if (!blob) throw new Error('The photo could not be saved.');
    const base = (this.name || 'photo').replace(/\.[a-z0-9]+$/i, '').slice(0, 60) || 'photo';
    return new File([blob], `${base}-studio.jpg`, { type: 'image/jpeg', lastModified: Date.now() });
  }

  /** Settings + strokes, for undo. */
  snapshot() { return { params: { ...this.params, wb: [...this.params.wb] }, strokes: this.strokes.slice() }; }

  restore(snap) {
    this.params = { ...snap.params, wb: [...snap.params.wb] };
    this.strokes = snap.strokes.slice();
    this.strokeVersion = (this.strokeVersion || 0) + 1;
  }
}
