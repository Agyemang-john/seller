export const validateForm = (formData) => {
  const errors = {};
  if (!formData.title.trim()) errors.title = 'Title is required';
  if (!formData.slug.trim()) errors.slug = 'Slug is required';
  if (!formData.sub_category) errors.category = 'Category is required';
  if (!formData.brand) errors.brand = 'Brand is required';
  if (!formData.variant.trim()) errors.variant = 'Variant is required';
  if (!formData.price) errors.price = 'Price is required';
  if (!formData.total_quantity) errors.totalQuantity = 'Total quantity is required';
  if (!formData.weight) errors.weight = 'Weight is required';
  if (!formData.volume) errors.volume = 'Volume is required';
  if (!formData.life) errors.lifeSpan = 'Life span is required';
  if (!formData.mfd) errors.mfd = 'Manufacture date is required';
  if (!formData.description.trim()) errors.description = 'Description is required';
  if (formData.available_in_regions.length === 0) errors.shipsTo = 'Please select at least one region';

  return errors;
};

export const groupOptionsByFirstLetter = (options) => {
  if (!options) return [];
  return options.map(option => ({
    ...option,
    firstLetter: option.name[0].toUpperCase(),
  }));
};