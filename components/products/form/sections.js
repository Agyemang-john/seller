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
import { deliveryOptionsError } from '../DeliveryOptions';

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
    id: 'variants', title: 'Variants', subtitle: 'Sizes and colours', icon: TuneOutlinedIcon, optional: true,
    component: VariantsSection,
    isComplete: ({ formData, variants }) => formData.variant !== 'None' && variants.length > 0,
    errorKeys: ['variants', 'variantRows', 'variant'],
  },
  {
    id: 'specs', title: 'Specs', subtitle: 'Details shoppers filter by', icon: ListAltOutlinedIcon, optional: true,
    component: SpecsSection,
    isComplete: ({ specs }) => specs.definitions.length > 0 && specs.missing.length === 0,
    errorKeys: ['attributes'],
  },
  {
    id: 'description', title: 'Description', subtitle: 'What shoppers read', icon: NotesOutlinedIcon,
    component: DescriptionSection,
    isComplete: ({ formData }) => plainText(formData.description).length > 0,
    errorKeys: ['description', 'features', 'specifications', 'delivery_returns'],
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

  if (formData.variant !== 'None') {
    if (!variants.length) {
      errors.variants = 'Add at least one variant, or choose "No" for versions.';
    } else {
      const needSize = ['Size', 'Size-Color'].includes(formData.variant);
      const needColor = ['Color', 'Size-Color'].includes(formData.variant);
      const rows = {};
      variants.forEach((v, i) => {
        const row = {};
        if (!positive(v.price)) row.price = 'Enter a price.';
        if (needSize && !v.size) row.size = 'Choose a size.';
        if (needColor && !v.color) row.color = 'Choose a colour.';
        if (Object.keys(row).length) rows[i] = row;
      });
      if (Object.keys(rows).length) {
        errors.variantRows = rows;
        const first = Object.values(rows)[0];
        errors.variants = `Variant ${Number(Object.keys(rows)[0]) + 1}: ${Object.values(first)[0]}`;
      }
    }
  }
  return errors;
}
