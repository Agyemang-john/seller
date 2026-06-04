import { alpha, darken, lighten, PaletteMode } from '@mui/material/styles';

/**
 * ──────────────────────────────────────────────────────────────────────────
 *  SINGLE DESIGN BASE
 *  --------------------------------------------------------------------------
 *  Every dashboard surface should source its colours from here (directly, or
 *  via the MUI palette which is fed from this file in `themePrimitives.ts`).
 *
 *  - `brand`            → Negromart brand identity (constant across modes)
 *  - `socialBrand`      → third-party brand colours (must stay fixed)
 *  - `momoProviders`    → mobile-money provider chips
 *  - `cardGradients`    → saved-card visual backgrounds
 *  - status config maps → business statuses mapped to theme-aware hue tokens
 *
 *  To add/scale a colour: change it ONCE here. Theme-aware tokens (anything
 *  consumed through `theme.palette.status.*` / `theme.palette.brand.*`) then
 *  update automatically in both light and dark mode.
 * ──────────────────────────────────────────────────────────────────────────
 */

// ── Brand identity ──────────────────────────────────────────────────────────
// Used on the navy hero panels / primary CTAs. Intentionally identical in light
// and dark mode (the hero panels are always dark with light text).
export const brand = {
  navy: '#041f41',
  navyAlt: '#0a3466',
  navyDeep: '#0a3570',
  blue: '#0071ce',
  blueDark: '#0058a3',
  gold: '#ffc220',
  ink: '#080808', // near-black premium panels (subscribe / Pro)
  inkAlt: '#0a0a0a',
} as const;

// Gradients derived from the brand identity.
export const brandGradients = {
  hero: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.navyAlt} 100%)`,
  heroWide: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.navyDeep} 50%, ${brand.blue} 100%)`,
} as const;

// ── Third-party brand colours (FIXED — never theme-shift) ───────────────────
export const socialBrand = {
  whatsapp: '#25D366',
  telegram: '#229ED9',
  facebook: '#1877F2',
  instagram: '#E1306C',
  twitter: '#111111',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  tiktok: '#111111',
  discord: '#5865F2',
  pinterest: '#E60023',
  snapchat: '#FFCC00',
  other: '#555555',
} as const;

// ── Mobile-money providers ──────────────────────────────────────────────────
export const momoProviders = [
  { value: 'mtn', label: 'MTN Mobile Money', color: '#FFCB00', text: '#111' },
  { value: 'vodafone', label: 'Vodafone Cash', color: '#E60000', text: '#fff' },
  { value: 'airteltigo', label: 'AirtelTigo Money', color: '#ED1C24', text: '#fff' },
] as const;

// ── Saved-card visual backgrounds ───────────────────────────────────────────
export const cardGradients = {
  visa: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  mastercard: 'linear-gradient(135deg, #0f0c29 0%, #302b63 100%)',
  verve: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
  default: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
} as const;

// ── Semantic hue tokens ─────────────────────────────────────────────────────
// The full set of status accent hues. Each becomes a theme-aware
// `theme.palette.status.<hue>` entry with { text, bg, dot } resolved per mode.
export const HUE = {
  green: '#22c55e',
  amber: '#f59e0b',
  blue: '#3b82f6',
  indigo: '#6366f1',
  violet: '#8b5cf6',
  red: '#ef4444',
  rose: '#dc2626',
  slate: '#94a3b8',
  orange: '#f97316',
  pink: '#ec4899',
  teal: '#14b8a6',
} as const;

export type HueToken = keyof typeof HUE;

export interface StatusColor {
  text: string;
  bg: string;
  dot: string;
}

/** Resolve a single hue into a legible {text,bg,dot} triple for the given mode. */
export const hueVariant = (hue: string, mode: PaletteMode): StatusColor =>
  mode === 'light'
    ? { text: darken(hue, 0.25), bg: alpha(hue, 0.14), dot: hue }
    : { text: lighten(hue, 0.3), bg: alpha(hue, 0.26), dot: lighten(hue, 0.12) };

/** The complete status palette for a mode — injected into the MUI palette. */
export const buildStatusPalette = (mode: PaletteMode): Record<HueToken, StatusColor> =>
  (Object.keys(HUE) as HueToken[]).reduce((acc, key) => {
    acc[key] = hueVariant(HUE[key], mode);
    return acc;
  }, {} as Record<HueToken, StatusColor>);

// ── Business-status → hue maps ──────────────────────────────────────────────
// Components read `label` for display and `hue` to build a palette path, e.g.
//   sx={{ color: `status.${cfg.hue}.text`, bgcolor: `status.${cfg.hue}.bg` }}
export interface StatusEntry {
  label: string;
  hue: HueToken;
}

export const ORDER_STATUS: Record<string, StatusEntry> = {
  pending: { label: 'Pending', hue: 'amber' },
  processing: { label: 'Processing', hue: 'blue' },
  shipped: { label: 'Shipped', hue: 'violet' },
  in_transit: { label: 'In Transit', hue: 'violet' },
  out_for_delivery: { label: 'Out for Delivery', hue: 'orange' },
  delivered: { label: 'Delivered', hue: 'green' },
  failed: { label: 'Failed', hue: 'red' },
  canceled: { label: 'Canceled', hue: 'slate' },
  returned: { label: 'Returned', hue: 'rose' },
  label_created: { label: 'Label Created', hue: 'blue' },
};

export const PRODUCT_STATUS: Record<string, StatusEntry> = {
  published: { label: 'Live', hue: 'green' },
  in_review: { label: 'In Review', hue: 'amber' },
  draft: { label: 'Draft', hue: 'slate' },
  disabled: { label: 'Disabled', hue: 'red' },
  rejected: { label: 'Rejected', hue: 'rose' },
};

export const SUBSCRIPTION_STATUS: Record<string, StatusEntry> = {
  active: { label: 'Active', hue: 'green' },
  trial: { label: 'Trial', hue: 'blue' },
  expired: { label: 'Expired', hue: 'red' },
  cancelled: { label: 'Cancelled', hue: 'slate' },
  past_due: { label: 'Past Due', hue: 'amber' },
};

// Shipment lifecycle (ordered — drives the status dropdown in order detail).
export const SHIPMENT_STATUS: Record<string, StatusEntry> = {
  pending: { label: 'Pending', hue: 'amber' },
  label_created: { label: 'Label Created', hue: 'blue' },
  in_transit: { label: 'In Transit', hue: 'violet' },
  out_for_delivery: { label: 'Out for Delivery', hue: 'orange' },
  delivered: { label: 'Delivered', hue: 'green' },
  failed: { label: 'Failed', hue: 'red' },
  canceled: { label: 'Canceled', hue: 'slate' },
  returned: { label: 'Returned', hue: 'rose' },
};

export const TXN_STATUS: Record<string, StatusEntry> = {
  success: { label: 'Paid', hue: 'green' },
  failed: { label: 'Failed', hue: 'red' },
  pending: { label: 'Pending', hue: 'amber' },
  refunded: { label: 'Refunded', hue: 'violet' },
};

const FALLBACK: StatusEntry = { label: '—', hue: 'slate' };

/** Look up a status entry, falling back to a neutral slate token. */
export const getStatusEntry = (
  map: Record<string, StatusEntry>,
  key?: string | null,
): StatusEntry => (key && map[key]) || { ...FALLBACK, label: key ?? FALLBACK.label };

// ── Chart accent colours ────────────────────────────────────────────────────
// Raw vivid values for SVG/recharts contexts (fills/strokes can't read CSS
// vars). Sourced from the same hue palette so charts stay on-brand.
export const CHART_STATUS_COLORS: Record<string, string> = {
  delivered: HUE.green,
  pending: HUE.amber,
  processing: HUE.blue,
  shipped: HUE.violet,
  canceled: HUE.red,
  refunded: HUE.pink,
};

// Categorical palette for avatars / generic series.
export const CATEGORICAL_COLORS = [
  HUE.indigo,
  HUE.violet,
  HUE.pink,
  HUE.amber,
  HUE.green,
  HUE.blue,
  HUE.red,
  HUE.teal,
] as const;
