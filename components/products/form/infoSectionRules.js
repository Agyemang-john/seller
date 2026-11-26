/**
 * Rules for the seller's Product information sections (InfoSections.jsx),
 * kept apart from the UI so hooks and validation can use them.
 * Backend: product/info_sections.py (same limits).
 */

import { plainText } from './fields';

export const MAX_SECTIONS = 12;
export const MAX_TITLE = 60;

// Section names that suit each kind of product. Matched against the chosen
// category (and its department); the first group that matches is offered first.
const SUGGESTIONS = [
  { words: ['laptop', 'computer', 'notebook', 'desktop', 'pc', 'monitor', 'tablet'],
    titles: ['Processor', 'Display', 'Memory & storage', 'Graphics', 'Battery', 'Connectivity', 'Ports & slots', 'Operating system', 'Input devices', "What's in the box"] },
  { words: ['phone', 'mobile', 'smartphone', 'smartwatch', 'wearable'],
    titles: ['Display', 'Camera', 'Processor', 'Memory & storage', 'Battery & charging', 'Connectivity', 'Network & SIM', "What's in the box"] },
  { words: ['electronic', 'audio', 'headphone', 'speaker', 'tv', 'television', 'camera', 'gaming', 'console', 'accessor'],
    titles: ['Key specs', 'Connectivity', 'Power & battery', 'Compatibility', 'Dimensions', "What's in the box"] },
  { words: ['grocery', 'food', 'beverage', 'drink', 'snack', 'spice', 'grain', 'rice', 'oil', 'tea', 'coffee', 'cereal', 'sauce'],
    titles: ['Ingredients', 'Nutrition facts', 'Allergens', 'How to prepare', 'Storage', 'Country of origin'] },
  { words: ['beauty', 'skin', 'hair', 'cosmetic', 'makeup', 'fragrance', 'perfume', 'personal care', 'health', 'supplement', 'vitamin'],
    titles: ['Ingredients', 'How to use', 'Suitable for', 'Benefits', 'Safety warnings', 'Size'] },
  { words: ['cloth', 'fashion', 'dress', 'shirt', 'wear', 'trouser', 'jean', 'skirt', 'suit', 'kente', 'fabric', 'shoe', 'sneaker', 'sandal', 'boot'],
    titles: ['Material', 'Size & fit', 'Care instructions', 'Measurements', 'Style notes'] },
  { words: ['bag', 'jewel', 'watch', 'accessor', 'bead', 'necklace', 'ring', 'bracelet'],
    titles: ['Material', 'Dimensions', 'Care instructions', 'Packaging'] },
  { words: ['home', 'furniture', 'kitchen', 'appliance', 'decor', 'bedding', 'garden', 'tool'],
    titles: ['Dimensions', 'Materials', 'Power', 'Assembly', 'Care & cleaning', "What's in the box"] },
  { words: ['baby', 'kid', 'toy', 'child'],
    titles: ['Age range', 'Materials', 'Safety information', "What's in the box", 'Care instructions'] },
  { words: ['book', 'stationery'],
    titles: ['About the author', 'Contents', 'Publisher details', 'Format'] },
  { words: ['sport', 'fitness', 'gym', 'outdoor'],
    titles: ['Material', 'Size & fit', 'Dimensions', 'How to use', 'Care instructions'] },
];
const GENERAL = ['Item details', "What's in the box", 'Materials', 'Dimensions', 'How to use', 'Care instructions', 'Warranty'];

/** Section names to offer for this category, best first. */
export function suggestedTitles(category, productType) {
  const text = [category?.title, category?.category?.title, category?.category?.main_category?.title]
    .filter(Boolean).join(' ').toLowerCase();
  const picked = [];
  if (productType === 'grocery') picked.push(...SUGGESTIONS[3].titles);
  if (productType === 'book') picked.push(...SUGGESTIONS[9].titles);
  SUGGESTIONS.forEach((g) => { if (g.words.some((w) => text.includes(w))) picked.push(...g.titles); });
  picked.push(...GENERAL);
  return [...new Set(picked)];
}

let counter = 0;
export const newSection = (title = '', body = '') => ({ key: `s${Date.now()}_${counter++}`, title, body });

/** What the server gets: no React keys, empty cards left out. */
export function sectionsPayload(sections) {
  return (sections || [])
    .map((s) => ({ title: (s.title || '').replace(/\s+/g, ' ').trim(), body: s.body || '' }))
    .filter((s) => s.title || plainText(s.body));
}

/** Same checks as the server, so mistakes show next to the section. */
export function sectionsError(sections) {
  const seen = new Set();
  const list = sectionsPayload(sections);
  if (list.length > MAX_SECTIONS) return `Use at most ${MAX_SECTIONS} sections.`;
  for (let i = 0; i < list.length; i += 1) {
    const { title, body } = list[i];
    const hasBody = plainText(body) || /<img/i.test(body);
    if (!title) return `Section ${i + 1} needs a title (for example "Ingredients" or "Display").`;
    if (title.length > MAX_TITLE) return `"${title.slice(0, 20)}…" is too long. Keep titles under ${MAX_TITLE} characters.`;
    if (!hasBody) return `"${title}" is empty. Write something in it or remove it.`;
    if (seen.has(title.toLowerCase())) return `There are two sections called "${title}". Merge them or rename one.`;
    seen.add(title.toLowerCase());
  }
  return '';
}
