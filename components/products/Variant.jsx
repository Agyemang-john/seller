import React, { useState, useEffect } from "react";
import {
  TextField,
  MenuItem,
  IconButton,
  Tooltip,
  Button,
  Box,
  Typography,
} from "@mui/material";
import { Add, Visibility, Delete, Clear } from "@mui/icons-material";
import { validateImage  } from "./fileValidators";
import Swal from 'sweetalert2';

const VariantRow = ({
  formData,
  setFormData,
  variants: propVariants = [],
  setVariants,
  sizes = [],
  colors = [],
  variantImagePreviews = {},
  setVariantImagePreviews,
}) => {
  const [localVariants, setLocalVariants] = useState(propVariants);
  const [variantErrors, setVariantErrors] = useState({});

  // Sync local state with props
  useEffect(() => {
    setLocalVariants(propVariants);
  }, [propVariants]);

  // Update parent formData and variants state
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      variants: localVariants.map((v) => ({
        ...v,
        image: v.image instanceof File ? v.image : null, // Only send File objects
      })),
    }));
    if (setVariants) setVariants(localVariants);

    // Validate variants and update errors
    const newErrors = {};
    localVariants.forEach((variant, index) => {
      if (!isVariantValid(variant)) {
        newErrors[index] = getVariantErrorMessage(variant);
      }
    });
    setVariantErrors(newErrors);
  }, [localVariants, setFormData, setVariants]);

  const handleVariantChange = (index, field, value) => {
    const updatedVariants = [...localVariants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value === "" ? null : Number(value),
    };
    setLocalVariants(updatedVariants);
  };

  const handleFileChange = async (index, file) => {
    if (!file) return;

    let validation;
    
    validation = await validateImage(file, {
      maxSizeMB: 2,
      minResolution: 700,
      maxResolution: 1200,
      mustBeSquare: true,
      checkBackground: true,
    });

    if (!validation.valid) {
      Swal.fire({
        icon: 'error',
        title: 'Invalid File',
        html: validation.errors.join('<br/>'),
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setVariantImagePreviews((prev) => ({
        ...prev,
        [index]: reader.result,
      }));

      const updatedVariants = [...localVariants];
      updatedVariants[index] = {
        ...updatedVariants[index],
        image: file,
      };
      setLocalVariants(updatedVariants);
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewImage = (index) => {
    const imageUrl = variantImagePreviews[index] || localVariants[index]?.image;
    if (imageUrl) {
      window.open(imageUrl, "_blank");
    }
  };

  const handleAddVariant = () => {
    const newVariant = {
      id: null,
      size: null,
      color: null,
      image: null,
      title: "",
      quantity: 1,
      price: 0,
    };
    setLocalVariants((prev) => [...prev, newVariant]);
  };

  const handleRemoveVariant = (index) => {
    // Remove variant and reindex variantImagePreviews
    setLocalVariants((prev) => prev.filter((_, i) => i !== index));
    setVariantImagePreviews((prev) => {
      const newPreviews = {};
      // Rebuild preview keys to match new indices
      localVariants
        .filter((_, i) => i !== index)
        .forEach((_, newIndex) => {
          const oldIndex = newIndex < index ? newIndex : newIndex + 1;
          if (prev[oldIndex]) {
            newPreviews[newIndex] = prev[oldIndex];
          }
        });
      return newPreviews;
    });
  };

  const isVariantValid = (variant) => {
    if (formData.variant === "None") return true;
    if (formData.variant === "Color") return variant.color !== null;
    if (formData.variant === "Size") return variant.size !== null;
    if (formData.variant === "Size-Color")
      return variant.color !== null && variant.size !== null;
    return false;
  };

  const getVariantErrorMessage = (variant) => {
    if (formData.variant === "None") return "";
    if (formData.variant === "Color" && !variant.color) return "Color is required";
    if (formData.variant === "Size" && !variant.size) return "Size is required";
    if (formData.variant === "Size-Color") {
      if (!variant.color && !variant.size) return "Color and Size are required";
      if (!variant.color) return "Color is required";
      if (!variant.size) return "Size is required";
    }
    return "";
  };

  return (
      <Box className="w-full">
        <Box className="flex justify-between items-center mb-6">
          <Typography variant="h6" className="text-lg font-semibold">
            Product Variants
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddVariant}
            size="medium"
            className="bg-blue-600 hover:bg-blue-700"
            disabled={formData.variant === "None"}
          >
            Add Variant
          </Button>
        </Box>

        {localVariants?.length === 0 ? (
          <Box className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <Typography variant="body2" color="textSecondary" className="text-gray-500">
              No variants added yet. Click "Add Variant" to create one.
            </Typography>
          </Box>
        ) : (
          <Box className=" overflow-x-auto">
            {/* Container with min-width to ensure proper scrolling */}
            <Box className="min-w-[1800px] space-y-4 ">
              {/* Header row */}
              <Box className="grid grid-cols-7 items-center gap-4 py-3 px-2 rounded-lg font-semibold text-sm">
                <Box className="min-w-[180px]">Size</Box>
                <Box className="min-w-[180px]">Color</Box>
                <Box className="min-w-[200px]">Image</Box>
                <Box className="min-w-[100px]">Quantity</Box>
                <Box className="min-w-[120px]">Price</Box>
                <Box className="min-w-[100px] text-center">Actions</Box>
              </Box>

              {/* Variant rows */}
              {localVariants?.map((variant, index) => (
                <Box 
                  key={index} 
                  className="grid grid-cols-7 items-center gap-4 py-4 px-2 border-b border-gray-200 hover:bg-gray-50 transition-colors"
                >

                  {/* Size */}
                  <Box className="min-w-[180px]">
                    <Box className="flex items-center gap-2">
                      <TextField
                        select
                        size="small"
                        label="Size"
                        value={variant.size || ""}
                        onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                        className="flex-1"
                        variant="outlined"
                        disabled={formData.variant === "Color" || formData.variant === "None"}
                        error={!!variantErrors[index] && variantErrors[index].includes("Size")}
                        helperText={variantErrors[index] && variantErrors[index].includes("Size") ? variantErrors[index] : ""}
                      >
                        <MenuItem value="">------</MenuItem>
                        {sizes.map((s) => (
                          <MenuItem key={s.id} value={s.id}
                          sx={{
                            fontWeight: Number(variant.size) === Number(s.id) ? "bold" : "normal",
                            // backgroundColor: Number(variant.size) === Number(s.id) ? "rgba(25, 118, 210, 0.08)" : "transparent",
                            "&:hover": {
                              backgroundColor: Number(variant.size) === Number(s.id) ? "rgba(25, 118, 210, 0.16)" : "rgba(0, 0, 0, 0.04)",
                            },
                        }}
                          >
                            {s.name}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>

                  {/* Color */}
                  <Box className="min-w-[180px]">
                    <Box className="flex items-center gap-2">
                      <TextField
                        select
                        size="small"
                        label="Color"
                        value={variant.color || ""}
                        onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                        className="flex-1"
                        variant="outlined"
                        disabled={formData.variant === "Size" || formData.variant === "None"}
                        error={!!variantErrors[index] && variantErrors[index].includes("Color")}
                        helperText={variantErrors[index] && variantErrors[index].includes("Color") ? variantErrors[index] : ""}
                      >
                        <MenuItem value="">------</MenuItem>
                        {colors.map((c) => (
                          <MenuItem key={c.id} value={c.id}
                          sx={{
                            fontWeight: Number(variant.color) === Number(c.id) ? "bold" : "normal",
                            backgroundColor: Number(variant.color) === Number(c.id) ? "rgba(25, 118, 210, 0.08)" : "transparent",
                            "&:hover": {
                              backgroundColor: Number(variant.color) === Number(c.id) ? "rgba(25, 118, 210, 0.16)" : "rgba(0, 0, 0, 0.04)",
                            },
                          }}
                          >
                            <Box className="flex items-center gap-2">
                              <Box
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: c.code }}
                              />
                              {c.name}
                            </Box>
                          </MenuItem>
                        ))}
                      </TextField>
                    </Box>
                  </Box>

                  {/* Image */}
                  <Box className="min-w-[200px]">
                    <Box className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(index, e.target.files[0])}
                        style={{ display: "none" }}
                        id={`variant-image-${index}`}
                      />
                      {variantImagePreviews[index] ? (
                        <>
                          <Box className="relative inline-block">
                            <img 
                              src={variantImagePreviews[index]} 
                              alt="Variant Preview" 
                              className="w-16 h-16 object-cover rounded border"
                            />
                            <IconButton 
                              size="small" 
                              onClick={() => handlePreviewImage(index)}
                              className="absolute -top-1 -right-1 bg-white rounded-full shadow-md border"
                              title="View Full Image"
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Box>
                          <label htmlFor={`variant-image-${index}`}>
                            <Button variant="outlined" component="span" size="small">
                              Replace
                            </Button>
                          </label>
                        </>
                      ) : (
                        <label htmlFor={`variant-image-${index}`}>
                          <Button variant="outlined" component="span" size="small">
                            Add Image
                          </Button>
                        </label>
                      )}
                    </Box>
                  </Box>

                  {/* Quantity */}
                  <Box className="min-w-[100px]">
                    <TextField
                      size="small"
                      label="Quantity"
                      type="number"
                      value={variant.quantity || 10}
                      onChange={(e) => handleVariantChange(index, "quantity", parseInt(e.target.value) || 1)}
                      inputProps={{ min: 1 }}
                      fullWidth
                      variant="outlined"
                    />
                  </Box>

                  {/* Price */}
                  <Box className="min-w-[120px]">
                    <TextField
                      size="small"
                      label="Price"
                      type="number"
                      value={variant.price || 0}
                      onChange={(e) => handleVariantChange(index, "price", parseFloat(e.target.value) || 0)}
                      inputProps={{ min: 1, step: 0.01 }}
                      fullWidth
                      variant="outlined"
                      InputProps={{
                        startAdornment: <span className="text-gray-500 mr-1">₵</span>,
                      }}
                    />
                  </Box>

                  {/* Actions */}
                  <Box className="min-w-[100px] flex justify-center">
                    <Tooltip title="Delete Variant">
                      <IconButton
                        onClick={() => handleRemoveVariant(index)}
                        size="medium"
                        color="error"
                        className="h-10 w-10 bg-red-50 hover:bg-red-100"
                      >
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        )}

       

        {/* Helper text */}
        <Typography variant="caption" className="block mt-6 text-gray-500 text-center">
          Variants allow you to offer different options (sizes, colors) for the same product.
          Scroll horizontally to view all fields.
        </Typography>
      </Box>
  );
};

export default VariantRow;