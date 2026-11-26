/**
 * Photo studio pixel work (no DOM here, so it runs in the worker and in tests).
 *
 * The aim is a real photo on a clean background, never a sticker:
 *  - the cut-out keeps the model's soft mask (hair, fur, glass edges stay soft);
 *  - edge colours are cleaned with "blur fusion" foreground estimation
 *    (Forte & Pitié, "Approximate Fast Foreground Colour Estimation", ICIP 2021),
 *    which removes the grey/green halo the old background leaves on edges;
 *  - light and colour use gentle, photographic curves with narrow ranges: no
 *    filters, no clipping, no oversaturation.
 *
 * Images are flat typed arrays: RGBA Uint8ClampedArray, masks Uint8Array (0-255).
 */

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

// ── Blurs ────────────────────────────────────────────────────────────────────

/** Box blur of one channel (Float32Array), radius r, edges extended. O(w·h) whatever r is. */
export function boxBlur(src, w, h, r, out = new Float32Array(w * h), tmp = new Float32Array(w * h)) {
  if (r < 1) { out.set(src); return out; }
  const size = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += src[row + Math.min(Math.max(k, 0), w - 1)];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / size;
      acc += src[row + Math.min(x + r + 1, w - 1)] - src[row + Math.max(x - r, 0)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let k = -r; k <= r; k++) acc += tmp[Math.min(Math.max(k, 0), h - 1) * w + x];
    for (let y = 0; y < h; y++) {
      out[y * w + x] = acc / size;
      acc += tmp[Math.min(y + r + 1, h - 1) * w + x] - tmp[Math.max(y - r, 0) * w + x];
    }
  }
  return out;
}

// ── Clean edge colours ───────────────────────────────────────────────────────

function fusionPass(I, F, B, a, w, h, r) {
  const n = w * h;
  const tmp = new Float32Array(n);
  const ba = boxBlur(a, w, h, r, new Float32Array(n), tmp);
  const nextF = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  const blurB = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  const work = new Float32Array(n);
  const bf = new Float32Array(n);
  const bb = new Float32Array(n);
  for (let c = 0; c < 3; c++) {
    for (let i = 0; i < n; i++) work[i] = F[c][i] * a[i];
    boxBlur(work, w, h, r, bf, tmp);
    for (let i = 0; i < n; i++) work[i] = B[c][i] * (1 - a[i]);
    boxBlur(work, w, h, r, bb, tmp);
    const Fc = nextF[c];
    const Bc = blurB[c];
    const Ic = I[c];
    for (let i = 0; i < n; i++) {
      const fBlur = bf[i] / (ba[i] + 1e-5);
      const bBlur = bb[i] / (1 - ba[i] + 1e-5);
      Bc[i] = bBlur;
      Fc[i] = clamp01(fBlur + a[i] * (Ic[i] - a[i] * fBlur - (1 - a[i]) * bBlur));
    }
  }
  return { F: nextF, B: blurB };
}

/**
 * The product's own colours under its soft edges, without the old background
 * mixed in. rgba: the photo; mask: 0-255. Returns RGBA (alpha 255) to draw
 * with the mask as alpha.
 */
export function estimateForeground(rgba, mask, w, h) {
  const n = w * h;
  const I = [new Float32Array(n), new Float32Array(n), new Float32Array(n)];
  const a = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    I[0][i] = rgba[i * 4] / 255;
    I[1][i] = rgba[i * 4 + 1] / 255;
    I[2][i] = rgba[i * 4 + 2] / 255;
    a[i] = mask[i] / 255;
  }
  // The paper's radii (90, 6) are for ~1000-2000 px images: scale with the photo.
  const long = Math.max(w, h);
  const r1 = Math.max(12, Math.round(long * 0.045));
  const r2 = Math.max(2, Math.round(long * 0.003));
  const first = fusionPass(I, I, I, a, w, h, r1);
  const { F } = fusionPass(I, first.F, first.B, a, w, h, r2);
  const out = new Uint8ClampedArray(n * 4);
  for (let i = 0; i < n; i++) {
    // Solid product pixels keep their exact colour: only edges are estimated.
    if (mask[i] >= 250) {
      out[i * 4] = rgba[i * 4]; out[i * 4 + 1] = rgba[i * 4 + 1]; out[i * 4 + 2] = rgba[i * 4 + 2];
    } else {
      out[i * 4] = F[0][i] * 255; out[i * 4 + 1] = F[1][i] * 255; out[i * 4 + 2] = F[2][i] * 255;
    }
    out[i * 4 + 3] = 255;
  }
  return out;
}

// ── Mask refinement ──────────────────────────────────────────────────────────

/** Grow (r > 0) or shrink (r < 0) a mask by |r| pixels (separable max / min). */
export function shiftMask(mask, w, h, r) {
  if (!r) return mask;
  const grow = r > 0;
  const k = Math.abs(r);
  const tmp = new Uint8Array(w * h);
  const out = new Uint8Array(w * h);
  const pick = grow ? Math.max : Math.min;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      let v = mask[row + x];
      for (let d = 1; d <= k; d++) {
        v = pick(v, mask[row + Math.max(x - d, 0)], mask[row + Math.min(x + d, w - 1)]);
      }
      tmp[row + x] = v;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = tmp[y * w + x];
      for (let d = 1; d <= k; d++) {
        v = pick(v, tmp[Math.max(y - d, 0) * w + x], tmp[Math.min(y + d, h - 1) * w + x]);
      }
      out[y * w + x] = v;
    }
  }
  return out;
}

/** Soften a mask's edge by r pixels (two box passes ≈ a gentle gaussian). */
export function featherMask(mask, w, h, r) {
  if (r < 1) return mask;
  const f = new Float32Array(w * h);
  for (let i = 0; i < f.length; i++) f[i] = mask[i];
  const tmp = new Float32Array(w * h);
  const once = boxBlur(f, w, h, Math.max(1, Math.round(r / 2)), new Float32Array(w * h), tmp);
  const twice = boxBlur(once, w, h, Math.max(1, Math.round(r / 2)), new Float32Array(w * h), tmp);
  const out = new Uint8Array(w * h);
  for (let i = 0; i < out.length; i++) out[i] = twice[i];
  return out;
}

/** Remove specks the model may leave far from the product (tiny islands of low confidence). */
export function cleanSpecks(mask, minValue = 12) {
  const out = new Uint8Array(mask.length);
  for (let i = 0; i < mask.length; i++) out[i] = mask[i] < minValue ? 0 : mask[i];
  return out;
}

/**
 * Drop small pieces that aren't connected to the product: fingertips left after
 * removing hands, a speck of hanger, a reflection. A piece is kept when it is
 * at least `minShare` of the largest piece (so a pair of earrings keeps both).
 * Pieces are found on the visible part of the mask (> 32), 8-connected.
 */
export function dropSmallPieces(mask, w, h, minShare = 0.015) {
  const n = w * h;
  const label = new Int32Array(n);
  const sizes = [0];
  const stack = new Int32Array(n);
  for (let start = 0; start < n; start++) {
    if (mask[start] <= 32 || label[start]) continue;
    const id = sizes.length;
    let size = 0; let top = 0;
    stack[top++] = start; label[start] = id;
    while (top) {
      const i = stack[--top];
      size++;
      const x = i % w; const y = (i - x) / w;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w || (!dx && !dy)) continue;
          const j = yy * w + xx;
          if (mask[j] > 32 && !label[j]) { label[j] = id; stack[top++] = j; }
        }
      }
    }
    sizes.push(size);
  }
  if (sizes.length <= 2) return mask;
  const keepFrom = Math.max(...sizes) * minShare;
  const out = Uint8Array.from(mask);
  for (let i = 0; i < n; i++) if (label[i] && sizes[label[i]] < keepFrom) out[i] = 0;
  return out;
}

// ── Light and colour ─────────────────────────────────────────────────────────

const toLinear = new Float32Array(256);
for (let i = 0; i < 256; i++) {
  const c = i / 255;
  toLinear[i] = c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
const toSrgb = (v) => {
  const c = clamp01(v);
  return c <= 0.0031308 ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055;
};

/** Contrast without clipping: an S-curve around mid grey (k > 1 more contrast). */
const sCurve = (v, k) => (v < 0.5 ? 0.5 * (2 * v) ** k : 1 - 0.5 * (2 * (1 - v)) ** k);

/**
 * Soft highlight roll-off so brightening never burns highlights to flat white:
 * values above the knee are compressed so the brightest input (top) lands on
 * white (extended Reinhard). top <= 1 (nothing pushed past white): no change.
 */
const KNEE = 0.75;
function shoulder(v, top) {
  if (top <= 1 || v <= KNEE) return v;
  const x = (v - KNEE) / (1 - KNEE);
  const L = (top - KNEE) / (1 - KNEE);
  return KNEE + (1 - KNEE) * ((x * (1 + x / (L * L))) / (1 + x));
}

/**
 * Per-channel look-up tables for exposure (EV), contrast (-1..1), warmth
 * (-1..1) and white balance gains, worked out in linear light like a camera.
 */
export function buildLuts({ exposure = 0, contrast = 0, warmth = 0, wb = [1, 1, 1] } = {}) {
  const gain = 2 ** exposure;
  const warm = [1 + 0.07 * warmth, 1 + 0.01 * warmth, 1 - 0.07 * warmth];
  const k = 1 + contrast * 0.45;
  return [0, 1, 2].map((c) => {
    const lut = new Uint8Array(256);
    const top = gain * wb[c] * warm[c];
    for (let i = 0; i < 256; i++) {
      let v = toLinear[i] * top;
      v = toSrgb(shoulder(v, top));
      lut[i] = Math.round(clamp01(sCurve(v, k)) * 255);
    }
    return lut;
  });
}

const isIdentity = (p) => !p.exposure && !p.contrast && !p.warmth && !p.saturation && !p.sharpness
  && (!p.wb || (p.wb[0] === 1 && p.wb[1] === 1 && p.wb[2] === 1));

/**
 * Apply the seller's light and colour settings to RGBA pixels (alpha untouched).
 * saturation -1..1 (kept within ±30 %), sharpness 0..1 (a fine unsharp mask on
 * brightness only, so colours don't fringe).
 */
export function adjustPixels(rgba, w, h, p = {}) {
  if (isIdentity(p)) return rgba;
  const out = new Uint8ClampedArray(rgba.length);
  const [lr, lg, lb] = buildLuts(p);
  const sat = 1 + (p.saturation || 0) * 0.3;
  const n = w * h;
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    let r = lr[rgba[o]];
    let g = lg[rgba[o + 1]];
    let b = lb[rgba[o + 2]];
    if (sat !== 1) {
      const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = y + (r - y) * sat; g = y + (g - y) * sat; b = y + (b - y) * sat;
    }
    out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = rgba[o + 3];
  }
  if (p.sharpness > 0) sharpenInPlace(out, w, h, p.sharpness);
  return out;
}

function sharpenInPlace(rgba, w, h, amount) {
  const n = w * h;
  const luma = new Float32Array(n);
  for (let i = 0; i < n; i++) luma[i] = 0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2];
  const blurred = boxBlur(luma, w, h, 1);
  const strength = amount * 0.9;
  for (let i = 0; i < n; i++) {
    let d = luma[i] - blurred[i];
    if (Math.abs(d) < 2) continue;                 // leave flat areas (and noise) alone
    d = Math.max(-40, Math.min(40, d)) * strength;
    rgba[i * 4] += d; rgba[i * 4 + 1] += d; rgba[i * 4 + 2] += d;
  }
}

/**
 * One-tap "Auto": what a retoucher would do first, and no more.
 *  - white balance from the truly grey/white parts of the product only (a red
 *    bag stays red, a cream label stays cream), gains kept within ±5 %;
 *  - lift exposure only when the brightest parts are dull (never darkens, max +0.6 EV);
 *  - a touch of contrast when the product looks flat.
 */
export function autoAdjust(rgba, mask, w, h) {
  const n = w * h;
  let nr = 0; let ng = 0; let nb = 0; let neutral = 0; let count = 0;
  const hist = new Uint32Array(256);      // brightness, for contrast
  const peak = new Uint32Array(256);      // brightest channel, for exposure (a pure red is not "dark")
  for (let i = 0; i < n; i++) {
    if (mask && mask[i] < 200) continue;
    const r = rgba[i * 4]; const g = rgba[i * 4 + 1]; const b = rgba[i * 4 + 2];
    const max = Math.max(r, g, b); const min = Math.min(r, g, b);
    const y = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
    hist[y]++; peak[max]++; count++;
    // Only truly grey/white parts: cream, beige or pastel parts are their own colour, not a colour cast.
    if (max > 60 && max < 245 && (max - min) / max < 0.05) { nr += r; ng += g; nb += b; neutral++; }
  }
  if (!count) return { exposure: 0, contrast: 0, warmth: 0, saturation: 0, sharpness: 0, wb: [1, 1, 1] };
  const pct = (hs, p) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hs[v]; if (acc >= count * p) return v / 255; } return 1; };
  const p02 = pct(hist, 0.02); const p50 = pct(hist, 0.5);
  const spread = pct(hist, 0.99) - p02;
  const p99 = pct(peak, 0.99);

  let wb = [1, 1, 1];
  if (neutral > count * 0.03) {
    const avg = (nr + ng + nb) / 3;
    wb = [avg / nr, avg / ng, avg / nb].map((gain) => Math.min(1.05, Math.max(0.95, gain)));
  }
  let exposure = 0;
  if (p99 < 0.9 && p99 > 0.05) exposure = Math.min(0.6, Math.log2(0.94 / p99) * 0.8);
  const contrast = spread < 0.55 ? 0.25 : spread < 0.75 ? 0.12 : 0;
  return { exposure: round2(exposure), contrast: round2(contrast), warmth: 0, saturation: 0, sharpness: 0.2, wb, median: p50 };
}

const round2 = (v) => Math.round(v * 100) / 100;

// ── Measuring ────────────────────────────────────────────────────────────────

/** Bounding box of the product (mask above `level`), or null if the mask is empty. */
export function maskBounds(mask, w, h, level = 32) {
  let x0 = w; let y0 = h; let x1 = -1; let y1 = -1;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      if (mask[row + x] > level) {
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
      }
    }
  }
  return x1 < 0 ? null : { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

/**
 * Facts about the photo for the checklist: how sharp, how bright, how much of
 * the edge is uncertain, whether the product is cut off by the photo's edge.
 */
export function measure(rgba, mask, w, h) {
  const bounds = mask ? maskBounds(mask, w, h) : { x: 0, y: 0, w, h };
  if (!bounds) return { empty: true };
  // Sharpness: variance of the Laplacian of brightness inside the product.
  let sum = 0; let sum2 = 0; let k = 0; let light = 0; let lightN = 0; let soft = 0; let solid = 0;
  const step = Math.max(1, Math.round(Math.max(w, h) / 900));      // same scale whatever the photo size
  const Y = (i) => 0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2];
  for (let y = bounds.y + step; y < bounds.y + bounds.h - step; y += step) {
    for (let x = bounds.x + step; x < bounds.x + bounds.w - step; x += step) {
      const i = y * w + x;
      const m = mask ? mask[i] : 255;
      if (m > 224) solid++; else if (m > 32) soft++;
      if (m < 240) continue;
      const lap = 4 * Y(i) - Y(i - step) - Y(i + step) - Y(i - step * w) - Y(i + step * w);
      sum += lap; sum2 += lap * lap; k++;
      // Brightest channel, not luminance: a deep red dress is not a dark photo.
      light += Math.max(rgba[i * 4], rgba[i * 4 + 1], rgba[i * 4 + 2]); lightN++;
    }
  }
  const variance = k ? sum2 / k - (sum / k) ** 2 : 0;
  const margin = 2;
  const touches = mask ? {
    left: bounds.x <= margin, right: bounds.x + bounds.w >= w - margin,
    top: bounds.y <= margin, bottom: bounds.y + bounds.h >= h - margin,
  } : {};
  return {
    empty: false,
    bounds,
    sharpness: variance,
    brightness: lightN ? light / lightN / 255 : 0.5,
    uncertain: solid + soft ? soft / (solid + soft) : 0,
    cutOff: Object.entries(touches).filter(([, v]) => v).map(([side]) => side),
    productPixels: Math.max(bounds.w, bounds.h),
  };
}

/**
 * Share of the kept area that looks like skin and runs in from the photo's
 * edge: held-up hands and arms. Used only for a hint ("tap them to remove"),
 * never to remove anything, since mannequins and some products are skin-toned.
 * Skin test: the usual YCbCr box, on reasonably saturated, not-too-bright pixels.
 */
export function edgeSkinShare(rgba, mask, w, h) {
  const band = Math.max(4, Math.round(Math.min(w, h) * 0.12));
  let skin = 0; let kept = 0;
  const step = Math.max(1, Math.round(Math.max(w, h) / 600));
  for (let y = 0; y < h; y += step) {
    for (let x = 0; x < w; x += step) {
      const i = y * w + x;
      if (mask[i] < 128) continue;
      const nearEdge = x < band || y < band || x >= w - band || y >= h - band;
      if (!nearEdge) continue;
      kept++;
      const r = rgba[i * 4]; const g = rgba[i * 4 + 1]; const b = rgba[i * 4 + 2];
      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      // Hue up to ~30°: skin of every tone sits around 10-25°; gold mannequins (~40°) and reds (< 0°) don't.
      const hue = max === min ? 0 : (60 * (g - b)) / (max - min);
      if (cb > 77 && cb < 127 && cr > 135 && cr < 173 && max > 40 && max < 245 && r > g && g >= b && hue <= 30) skin++;
    }
  }
  return kept ? skin / kept : 0;
}

/** Are the four corners of an output image plain and light (what the upload check asks)? */
export function cornersPlain(rgba, w, h) {
  const at = (x, y) => { const o = (y * w + x) * 4; return [rgba[o], rgba[o + 1], rgba[o + 2]]; };
  return [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)]
    .every(([r, g, b]) => (r > 200 && g > 200 && b > 200) || (Math.abs(r - g) < 10 && Math.abs(g - b) < 10));
}
