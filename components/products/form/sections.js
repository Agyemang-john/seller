/**
 * The product form, section by section. Everything about a section lives in
 * its entry: the component, when it counts as complete, and which error keys
 * (client checks and backend field names) belong to it. The section lists,
 * readiness bar and error routing are all derived from this, so adding a
 * section is one entry here and one component.
 */

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import SellOutlinedIcon from '@mui/icons-material/SellOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';

import BasicsSection from './BasicsSection';
import MediaSection from './MediaSection';
import PriceStockSection from './PriceStockSection';
import VariantsSection from './VariantsSection';
import SpecsSection from './SpecsSection';
import DescriptionSection from './DescriptionSection';
import ShippingSection from './ShippingSection';
import MoreDetailsSection from './MoreDetailsSection';
import { plainText } from './fields';
import { cleanValue, comboKey, optionLabel } from './variationOptions';
import { deliveryOptionsError } from '../DeliveryOptions';
import { sectionsError } from './infoSectionRules';

const positive = (v) => parseFloat(v) > 0;

export const SECTIONS = [
  {
    id: 'basics', title: 'Basics', subtitle: 'What you are selling', icon: InfoOutlinedIcon,
    component: BasicsSection,
    isComplete: ({ formData }) => !!formData.title?.trim() && !!formData.sub_category,
    errorKeys: ['title', 'slug', 'sub_category', 'category', 'brand', 'product_type', 'seller_sku', 'gtin'],
  },
  {
    id: 'media', title: 'Photos & video', subtitle: 'Main photo, gallery, video', icon: PhotoLibraryOutlinedIcon,
    component: MediaSection,
    isComplete: ({ formData, imagePreview }) => !!(formData.image || imagePreview),
    errorKeys: ['image', 'video', 'images'],
  },
  {
    id: 'pricing', title: 'Price & stock', subtitle: 'Price, quantity, weight', icon: SellOutlinedIcon,
    component: PriceStockSection,
    isComplete: ({ formData }) => positive(formData.price) && formData.total_quantity !== '' && positive(formData.weight),
    errorKeys: ['price', 'old_price', 'totalQuantity', 'total_quantity', 'weight', 'volume',
      'fulfilment_type', 'sourcing_min_days', 'sourcing_max_days', 'sourced_from'],
  },
  {
    id: 'variants', title: 'Variants', subtitle: 'Colour, size, flavour, pack size…', icon: TuneOutlinedIcon, optional: true,
    component: VariantsSection,
    isComplete: ({ formData, variants }) => formData.variant !== 'None'
      && (formData.variation_axes?.length ?? 0) > 0 && variants.length > 0,
    errorKeys: ['variants', 'variantRows', 'variant', 'variation_axes'],
  },
  {
    id: 'specs', title: 'Specs', subtitle: 'Details shoppers filter by', icon: ListAltOutlinedIcon, optional: true,
    component: SpecsSection,
    isComplete: ({ specs }) => specs.definitions.length > 0 && specs.missing.length === 0,
    errorKeys: ['attributes'],
  },
  {
    id: 'description', title: 'Description', subtitle: 'Description and your own info sections', icon: NotesOutlinedIcon,
    optional: true,   // the seller's own sections can describe the product instead
    component: DescriptionSection,
    isComplete: ({ formData }) => plainText(formData.description).length > 0
      || (formData.info_sections || []).some((s) => (s.title || '').trim() && plainText(s.body).length > 0),
    errorKeys: ['description', 'features', 'specifications', 'info_sections', 'delivery_returns'],
  },
  {
    id: 'shipping', title: 'Shipping', subtitle: 'Where it ships and how', icon: LocalShippingOutlinedIcon,
    component: ShippingSection,
    isComplete: ({ formData }) => (formData.available_in_regions?.length ?? 0) > 0
      && !deliveryOptionsError(formData.delivery_options || []),
    errorKeys: ['available_in_regions', 'delivery_options'],
  },
  {
    id: 'more', title: 'More details', subtitle: 'Returns, dates', icon: MoreHorizOutlinedIcon, optional: true,
    component: MoreDetailsSection,
    isComplete: ({ formData }) => formData.return_period_days !== '' && formData.return_period_days != null,
    errorKeys: ['return_period_days', 'mfd', 'life', 'warranty_period_days'],
  },
];

/** 'error' | 'done' | 'optional' | 'todo' for one section. */
export function sectionStatus(section, ctx) {
  if (section.errorKeys.some((k) => ctx.formErrors[k])) return 'error';
  if (section.isComplete(ctx)) return 'done';
  return section.optional ? 'optional' : 'todo';
}

/** The section a field error belongs to (backend errors included), or undefined. */
export const sectionForError = (key) => SECTIONS.find((s) => s.errorKeys.includes(key));

/**
 * Checks run before anything is sent. Keys match the sections' errorKeys so
 * every message lands in the right place on the page.
 */
export function validateProduct({ formData, variants, isNew }) {
  const errors = {};
  if (!formData.title?.trim()) errors.title = 'Add a product title.';
  if (!formData.sub_category) errors.sub_category = 'Choose a category.';
  if (isNew && !formData.image && formData.variant === 'None') errors.image = 'Add a main photo.';
  if (!positive(formData.price)) errors.price = 'Enter the selling price.';
  if (formData.total_quantity === '' || formData.total_quantity == null) errors.totalQuantity = 'Enter how many you have.';
  if (!positive(formData.weight)) errors.weight = 'Enter the packed weight.';
  if (!(formData.available_in_regions?.length > 0)) errors.available_in_regions = 'Choose at least one country.';
  const delivery = deliveryOptionsError(formData.delivery_options || []);
  if (delivery) errors.delivery_options = delivery;
  const sections = sectionsError(formData.info_sections);
  if (sections) errors.info_sections = sections;

  if (formData.variant !== 'None') {
    const axes = formData.variation_axes || [];
    if (!axes.length) {
      errors.variation_axes = 'Choose what changes between versions (for example Colour or Flavour).';
    } else if (!variants.length) {
      errors.variants = 'Add at least one version, or choose "No, just one".';
    } else {
      const rows = {};
      const seen = new Map();
      variants.forEach((v, i) => {
        const row = {};
        const missing = {};
        axes.forEach((a) => { if (!cleanValue(v.options?.[a.key])) missing[a.key] = `Enter a ${a.label.toLowerCase()}.`; });
        if (Object.keys(missing).length) row.options = missing;
        if (!positive(v.price)) row.price = 'Enter a price.';
        if (!row.options) {
          const key = comboKey(v.options, axes);
          if (seen.has(key)) {
            row.options = { [axes[0].key]: `Same as version ${seen.get(key) + 1}. Change one.` };
          } else {
            seen.set(key, i);
          }
        }
        if (Object.keys(row).length) rows[i] = row;
      });
      if (Object.keys(rows).length) {
        errors.variantRows = rows;
        const [index, first] = Object.entries(rows)[0];
        const message = first.options ? Object.values(first.options)[0] : first.price;
        errors.variants = `${optionLabel(variants[index], axes) || `Version ${Number(index) + 1}`}: ${message}`;
      }
    }
  }
  return errors;
}
