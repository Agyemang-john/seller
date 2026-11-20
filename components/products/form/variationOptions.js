/**
 * What a product's versions differ by (the backend's product/variations.py):
 * up to 3 options such as Colour, Size, Flavour or one the seller names.
 * formData.variation_axes = [{ key, label }]; each variant has options = { key: value }.
 */

// Used until /vendor/product-related-data/ has answered (and if it ever doesn't).
export const FALLBACK_VARIATIONS = {
  types: [
    { key: 'color', label: 'Colour', kind: 'swatch', examples: ['Black', 'Navy', 'Red'] },
    { key: 'size', label: 'Size', kind: 'button', examples: ['S', 'M', 'L', 'XL'] },
    { key: 'flavor', label: 'Flavour', kind: 'button', examples: ['Vanilla', 'Chocolate'] },
    { key: 'scent', label: 'Scent', kind: 'button', examples: ['Lavender', 'Unscented'] },
    { key: 'style', label: 'Style', kind: 'button', examples: ['Classic', 'Slim fit'] },
    { key: 'material', label: 'Material', kind: 'button', examples: ['Cotton', 'Leather'] },
    { key: 'pack_size', label: 'Pack size', kind: 'button', examples: ['Single', 'Pack of 6'] },
    { key: 'weight', label: 'Weight', kind: 'button', examples: ['250 g', '1 kg'] },
    { key: 'volume', label: 'Volume', kind: 'button', examples: ['500 ml', '1 L'] },
    { key: 'capacity', label: 'Capacity', kind: 'button', examples: ['64 GB', '128 GB'] },
  ],
  suggested: { grocery: ['flavor', 'weight', 'volume', 'pack_size', 'count', 'size'] },
  default_suggested: ['color', 'size', 'style', 'material', 'pack_size'],
  max_axes: 3,
};

/** Same rule as the backend's _custom_key, so variants and options agree on the key. */
export function customKey(label) {
  const slug = (label || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    .slice(0, 24);
  return `x_${slug || 'option'}`;
}

export const cleanValue = (v) => String(v ?? '').replace(/\s+/g, ' ').trim().slice(0, 40);

/** 'Vanilla / 500 g' */
export const optionLabel = (variant, axes) =>
  axes.map((a) => cleanValue(variant.options?.[a.key])).filter(Boolean).join(' / ');

export const comboKey = (options, axes) =>
  axes.map((a) => `${a.key}=${cleanValue(options?.[a.key]).toLowerCase()}`).join('|');

/** Option types in the order to offer them: suggested for this kind of product first. */
export function orderedTypes(variations, productType) {
  const v = variations || FALLBACK_VARIATIONS;
  const first = v.suggested?.[productType] || v.default_suggested || [];
  const rank = (key) => {
    const i = first.indexOf(key);
    return i === -1 ? first.length + v.types.findIndex((t) => t.key === key) : i;
  };
  return [...v.types].sort((a, b) => rank(a.key) - rank(b.key));
}

/** Every combination of the values typed per option: [{flavor: 'Vanilla', size: '500 g'}, ...] */
export function combinations(axes, valuesByKey) {
  return axes.reduce((rows, a) => {
    const values = (valuesByKey[a.key] || []).map(cleanValue).filter(Boolean);
    if (!values.length) return [];
    return rows.flatMap((row) => values.map((value) => ({ ...row, [a.key]: value })));
  }, [{}]);
}
