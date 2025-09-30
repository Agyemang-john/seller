'use client';

import React, { useState } from "react";
import dayjs from "dayjs";
import { Box, Button, Typography, Card, CardContent, Grid, Tabs, Tab } from '@mui/material';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';
import ProductGeneralInfo from '@/components/products/ProductGeneralInfo';
import ProductImages from '@/components/products/ProductImages';
import DeliveryOptions from '@/components/products/DeliveryOptions';
import { useProductForm } from '@/components/products/hooks';
import { createAxiosClient } from "@/utils/clientFetch";
import { CircularProgress } from "@mui/material";
import { useTheme } from '@emotion/react';
import VariantRow from "./Variant";


const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name, personName, theme) {
  return {
    fontWeight: theme?.typography?.fontWeightRegular || 400,
    ...(personName.includes(name) && {
      fontWeight: theme?.typography?.fontWeightMedium || 500,
    }),
  };
}

export default function Main({ id = null }) {
  const theme = useTheme();
  const router = useRouter();
  const axiosClient = createAxiosClient();
  const [isLoading, setIsLoading] = useState(false);
  const {
    value,
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
    handleFileChange,
    handleDateChange,
    handleRegionChange,
    handleDeliveryOptionsChange,
    handleEditorChange,
  } = useProductForm(id);

  const validateForm = (data) => {
  const errors = {};
  if (!data.title) errors.title = "Title is required";
  if (!data.slug) errors.slug = "Slug is required";
  if (!data.price) errors.price = "Price is required";
  if (!data.total_quantity) errors.totalQuantity = "Quantity is required";
  if (!id && !data.image && data.variant === "None") {
    errors.image = "Main image is required for new products with no variants";
  } else if (data.image && !(data.image instanceof File)) {
    errors.image = "Main image must be a valid file";
  }
  if (!data.delivery_options || data.delivery_options.length === 0) {
    errors.delivery_options = "At least one delivery option must be selected";
  } else {
    const defaultCount = data.delivery_options.filter((opt) => opt.default).length;
    if (defaultCount !== 1) {
      errors.delivery_options = "Exactly one delivery option must be marked as default";
    }
    if (data.delivery_options.some((opt) => !opt.deliveryOptionId)) {
      errors.delivery_options = "All delivery options must have a selected delivery type";
    }
  }
  if (data.variant !== "None" && data.variants.length > 0) {
    data.variants.forEach((variant, index) => {
      if (data.variant === "Color" && !variant.color) {
        errors[`variant_${index}_color`] = `Color is required for variant ${index + 1}`;
      }
      if (data.variant === "Size" && !variant.size) {
        errors[`variant_${index}_size`] = `Size is required for variant ${index + 1}`;
      }
      if (data.variant === "Color and Size" && (!variant.color || !variant.size)) {
        errors[`variant_${index}_color_size`] = `Both color and size are required for variant ${index + 1}`;
      }
      if (!variant.image && !variant.id) {
        errors[`variant_${index}_image`] = `Main image is required for variant ${index + 1}`;
      }
    });
  }
  return errors;
};


const handleSubmit = async (event) => {
  event.preventDefault();

  if (!navigator.onLine) {
    Swal.fire(
      "Offline",
      "You are currently offline. Please connect to the internet and try again.",
      "warning"
    );
    return;
  }

  const errors = validateForm(formData);
  if (Object.keys(errors).length > 0) {
    setFormErrors(errors);
    Swal.fire(
      "Error",
      errors.delivery_options || Object.values(errors)[0] || "Please fix the errors before saving.",
      "error"
    );
    return;
  }

  try {
    setIsLoading(true);
    const submitData = new FormData();

    // Append fields, excluding image, video, and variants
    Object.keys(formData).forEach((key) => {
      if (key === "mfd") {
        if (formData.mfd) {
          submitData.append(key, dayjs(formData.mfd).toISOString());
        }
      } else if (key === "available_in_regions") {
        formData.available_in_regions.forEach((id) =>
          submitData.append("available_in_regions", id)
        );
      } else if (key === "delivery_options") {
        submitData.append("delivery_options", JSON.stringify(formData.delivery_options));
      } else if (key !== "image" && key !== "video" && key !== "variants") {
        submitData.append(key, formData[key] ?? "");
      }
    });

    // Append main product image only if it's a File
    if (formData.image instanceof File) {
      submitData.append("image", formData.image);
    } else if (formData.image) {
      console.error("Unexpected formData.image:", formData.image);
    }

    // Append video only if it's a File
    if (formData.video instanceof File) {
      submitData.append("video", formData.video);
    }

    // Append variants as JSON (image is always null)
    if (formData.variants && formData.variants.length > 0) {
      const variantsForSubmit = formData.variants.map((v) => ({
        ...v,
        image: null, // Always null in JSON
      }));
      submitData.append("variants", JSON.stringify(variantsForSubmit));

      // Append variant images from variants state
      variants.forEach((variant, index) => {
        if (variant.image instanceof File) {
          submitData.append(`variant_image_${index}`, variant.image);
        }
      });
    }

    // Append product images
    const newImages = images.filter((img) => img.file instanceof File);
    newImages.forEach((img, index) => {
      submitData.append("images[]", img.file);
    });

    // Append existing image IDs to keep
    if (id) {
      const keepImages = images
        .filter((img) => img.id && !img.file)
        .map((img) => img.id);
      submitData.append("keep_images", JSON.stringify(keepImages));
    }

    // Log FormData contents
    // for (let [key, value] of submitData.entries()) {
    //   console.log(`FormData ${key}:`, value instanceof File ? `[File: ${value.name}]` : value);
    // }

    let response;
    if (id) {
      console.log("Submitting PUT request for product ID:", id);
      response = await axiosClient.put(`/api/v1/vendor/products/${id}/`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } else {
      console.log("Submitting POST request for new product");
      response = await axiosClient.post(`/api/v1/vendor/products/`, submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }

    Swal.fire("Success", "Product saved successfully!", "success");
    router.push(`/products`);
  } catch (error) {
    console.error("Submit error:", error, {
      response: error.response,
      message: error.message,
      code: error.code,
    });

    if (!error.response) {
      Swal.fire(
        "Network Error",
        "Unable to save product due to a network issue. Please check your internet connection and try again.",
        "error"
      );
    } else if (
      error.response.data?.detail &&
      typeof error.response.data.detail === "string" &&
      error.response.data.detail.includes("EndpointConnectionError")
    ) {
      Swal.fire(
        "Network Error",
        "Unable to save product because the server cannot connect to the image storage service. Please check your internet connection and try again.",
        "error"
      );
    } else {
      Swal.fire(
        "Server Error",
        error.response?.data?.detail || JSON.stringify(error.response?.data) || "An error occurred while submitting",
        "error"
      );
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ padding: 1,width: "100%" }}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, lg: 12, md: 12 }} className="w-full">
          <Card>
            <CardContent>
              <Tabs
                variant="scrollable"
                scrollButtons="auto"
                value={value}
                onChange={handleTabChange}
              >
                <Tab label="General" />
                <Tab label="Product Images" />
                <Tab label="Variants" />
                <Tab label="Delivery Options" />
              </Tabs>

              <Box sx={{ padding: 1 }}>
                {value === 0 && (
                  <ProductGeneralInfo
                    formData={formData}
                    setFormData={setFormData}
                    formErrors={formErrors}
                    categories={categories}
                    handleCategoryChange={handleCategoryChange}
                    brands={brands}
                    handleBrandChange={handleBrandChange}
                    regions={regions}
                    MenuProps={MenuProps}
                    getStyles={getStyles}
                    theme={theme}
                    handleRegionChange={handleRegionChange}
                    handleDateChange={handleDateChange}
                    handleEditorChange={handleEditorChange}
                    handleFileChange={handleFileChange}
                    imagePreview={imagePreview}
                    videoPreview={videoPreview}
                    selectedCategory={selectedCategory}
                    selectedBrand={selectedBrand}
                  />
                )}

                {value === 1 && (
                  <ProductImages images={images} setImages={setImages} />
                )}

                {formData.variant !== 'None' && value === 2 && (
                  <VariantRow
                    formData={formData}
                    setFormData={setFormData}
                    variants={variants}
                    setVariants={setVariants}
                    sizes={sizes}
                    colors={colors}
                    variantImagePreviews={variantImagePreviews}
                    setVariantImagePreviews={setVariantImagePreviews}
                  />
                )}

                {value === 3 && (
                  <DeliveryOptions
                    fieldOptions={fieldOptions}
                    onOptionsChange={handleDeliveryOptionsChange}
                    deliveryOptions={deliveryOptions}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4, md: 4 }}>
          <Button
            type="submit"
            variant="contained"
            color="success"
            fullWidth
            disabled={isLoading}
            startIcon={isLoading && <CircularProgress size={20} color="inherit" />}
          >
            {id ? "Update Product" : "Save Product"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};