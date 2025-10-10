// useProductForm.js
import { useState, useEffect } from "react";
import dayjs from "dayjs";
import { createAxiosClient } from "@/utils/clientFetch";
import { slugify } from "@/components/Functions";
import { validateImage, validateVideo  } from "./fileValidators";
import Swal from 'sweetalert2';


export const useProductForm = (id = null) => {
  const axiosClient = createAxiosClient();

  const [value, setValue] = useState(0);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [colors, setColors] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [regions, setRegions] = useState([]);
  const [deliveryOptions, setDeliveryOptions] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [images, setImages] = useState([]);
  const [variants, setVariants] = useState([]);
  const [variantImagePreviews, setVariantImagePreviews] = useState({});
  const [fieldOptions, setFieldOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [product, setProduct] = useState(null);
  const [deliveryError, setDeliveryError] = useState('');

  const [formData, setFormData] = useState({
    available_in_regions: [],
    title: "",
    slug: "",
    sub_category: "",
    variant: "",
    brand: "",
    price: "1.99",
    old_price: "2.99",
    features: "",
    description: "",
    specifications: "",
    delivery_returns: "",
    total_quantity: "10",
    weight: "1.0",
    volume: "1.0",
    mfd: null,
    life: "3",
    product_type: null,
    delivery_options: [],
    image: null,
    video: null,
    variants: [],
  });

  useEffect(() => {
    if (formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(formData.title),
      }));
    }
  }, [formData.title]);

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (id) {
      fetchProductById(id);
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      const response = await axiosClient.get("/api/v1/vendor/product-related-data/");
      const data = response.data;
      setCategories(data.sub_categories);
      setBrands(data.brands);
      setColors(data.colors);
      setSizes(data.sizes);
      setRegions(data.regions);
      setDeliveryOptions(data.delivery_options);
    } catch (err) {
      console.error("Error fetching product data:", err);
    }
  };

  const fetchProductById = async (productId) => {
    try {
      const response = await axiosClient.get(`/api/v1/vendor/products/${productId}/`);
      const data = response.data;

      const formattedOptions = data.delivery_options.map((option) => ({
        id: option.id,
        deliveryOptionId: option.delivery_option.id,
        default: option.default,
      }));

      const formattedImages = data.p_images.map((img) => ({
        id: img.id,
        file: null,
        previewUrl: img.images,
      }));

      // For formData.variants: image is null
      const formattedVariants = data.variants.map((v) => ({
        id: v.id,
        title: v.title || "",
        size: v.size || null,
        color: v.color || null,
        image: v.image || null, // Keep null for formData
        quantity: v.quantity || 1,
        price: v.price || 0,
      }));

      // For variants state: image holds URLs for display
      const formattedForVariants = data.variants.map((v) => ({
        id: v.id,
        title: v.title || "",
        size: v.size || null,
        color: v.color || null,
        image: v.image || null, // URL for existing variants
        quantity: v.quantity || 1,
        price: v.price || 0,
      }));

      const newFormData = {
        available_in_regions: data.available_in_regions,
        title: data.title,
        slug: data.slug,
        sub_category: data.sub_category,
        variant: data.variant,
        brand: data.brand,
        price: data.price,
        old_price: data.old_price,
        features: data.features,
        description: data.description,
        specifications: data.specifications,
        delivery_returns: data.delivery_returns,
        total_quantity: data.total_quantity,
        weight: data.weight,
        volume: data.volume,
        mfd: data.mfd ? dayjs(data.mfd) : null,
        life: data.life,
        product_type: data.product_type,
        delivery_options: formattedOptions,
        image: null,
        video: null,
        variants: formattedVariants,
      };

      setFormData(newFormData);

      setVariants(formattedForVariants);

      setImagePreview(data.image);
      setVideoPreview(data.video);

      const initialVariantPreviews = {};
      formattedForVariants.forEach((variant, index) => {
        if (variant.image) {
          initialVariantPreviews[index] = variant.image; // URL for display
        }
      });
      setVariantImagePreviews(initialVariantPreviews);

      setFieldOptions(formattedOptions.length ? formattedOptions : [{ id: null, deliveryOptionId: "", default: false }]);
      setImages(formattedImages);
      setProduct(data);
      setSelectedCategory(categories.find((c) => c.id === data.sub_category) || null);
      setSelectedBrand(brands.find((b) => b.id === data.brand) || null);
    } catch (err) {
      console.error("Error fetching product by ID:", err);
    }
  };

  useEffect(() => {
    if (product && categories.length > 0 && brands.length > 0) {
      const cat = categories.find((c) => c.id === product.sub_category);
      const br = brands.find((b) => b.id === product.brand);
      setSelectedCategory(cat || null);
      setSelectedBrand(br || null);
      setFormData((prev) => {
        const updated = {
          ...prev,
          sub_category: product.sub_category,
          brand: product.brand,
        };
        return updated;
      });
    }
  }, [product, categories, brands]);

  const handleFileChange = async (event, field = "image") => {
    const file = event.target.files[0];
    if (!file) {
      setFormData((prev) => ({ ...prev, [field]: null }));
      if (field === "image") setImagePreview(null);
      if (field === "video") setVideoPreview(null);
      return;
    }

    let validation;
    if (field === "image") {
      validation = await validateImage(file, {
        maxSizeMB: 2,
        // minResolution: 700,
        // maxResolution: 1200,
        mustBeSquare: false,
        checkBackground: true,
      });
    } else if (field === "video") {
      validation = await validateVideo(file, {
        maxSizeMB: 10,
        maxDuration: 90,
        minResolution: [640, 480],
        maxResolution: [1920, 1080],
      });
    }

    if (!validation.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        html: validation.errors.join('<br/>'),
      });
      return;
    }

    // ✅ If passed → update state
    setFormData((prev) => ({ ...prev, [field]: file }));

    // ✅ Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      if (field === "image") setImagePreview(reader.result);
      if (field === "video") setVideoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleTabChange = (event, newValue) => setValue(newValue);

  const handleCategoryChange = (event, selectedCategory) => {
    setSelectedCategory(selectedCategory);
    setFormData((prev) => {
      const updated = { ...prev, sub_category: selectedCategory?.id || "" };
      console.log('Updated formData (category):', updated);
      return updated;
    });
  };

  const handleBrandChange = (event, selectedBrand) => {
    setSelectedBrand(selectedBrand);
    setFormData((prev) => {
      const updated = { ...prev, brand: selectedBrand?.id || "" };
      console.log('Updated formData (brand):', updated);
      return updated;
    });
  };

  const handleDateChange = (newDate) => {
    const validDate = dayjs.isDayjs(newDate) && newDate.isValid() ? newDate : null;
    setFormData((prev) => {
      const updated = { ...prev, mfd: validDate };
      console.log('Updated formData (mfd):', updated);
      return updated;
    });
  };

  const handleRegionChange = (event) => {
    const { value } = event.target;
    const selectedRegionIDs = Array.isArray(value) ? value : (typeof value === "string" ? value.split(",") : []);
    const cleanIDs = selectedRegionIDs.filter((id) => id !== "");
    setFormData((prev) => {
      const updated = { ...prev, available_in_regions: cleanIDs };
      return updated;
    });
  };

  const handleEditorChange = (field) => (value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
  };

  const handleDeliveryOptionsChange = (options, error = "") => {
    setFieldOptions(options);
    setFormData((prev) => {
      const updated = { ...prev, delivery_options: options };
      return updated;
    });
    setDeliveryError(error);
  };

  return {
    value,
    setValue,
    formData,
    setFormData,
    formErrors,
    setFormErrors,
    images,
    setImages,
    fieldOptions,
    deliveryError,
    deliveryOptions,
    regions,
    categories,
    brands,
    colors,
    sizes,
    selectedCategory,
    selectedBrand,
    imagePreview,
    videoPreview,
    variants,
    setVariants,
    variantImagePreviews,
    setVariantImagePreviews,
    handleTabChange,
    handleCategoryChange,
    handleBrandChange,
    // handleImageChange,
    handleFileChange,
    handleDateChange,
    handleRegionChange,
    handleDeliveryOptionsChange,
    handleEditorChange,
    fetchProductData,
  };
};