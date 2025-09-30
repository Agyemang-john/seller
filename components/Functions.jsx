  // utils/groupOptions.js

  /**
   * Groups items by the first letter of their title property.
   * @param {Array} items - Array of items with a title property to group by.
   * @returns {Array} - Array of items with an added firstLetter property for grouping.
   */
  export function groupOptionsByFirstLetter(items) {
      return items.map((item) => {
        const firstLetter = item.title[0].toUpperCase();
        return {
          firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
          ...item,
        };
      });
    }
  
    /**
 * Converts a string into a slug format (lowercase, spaces replaced with hyphens, non-alphanumeric characters removed).
 * @param {string} text - The string to be slugified.
 * @returns {string} - The slugified string.
 */
export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-');        // Replace multiple hyphens with a single one
};

 {/* Modal for Additional Variant Images */}
      {/* <Dialog open={openModal} onClose={handleCloseModal} maxWidth="md" fullWidth>
          <DialogTitle>Additional Variant Images</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Additional Images (Max 6)
              </Typography>
              <Grid container spacing={2}>
                {variantImages.map((image, vIndex) => (
                  <Grid item xs={12} sm={6} md={4} key={image.id || `new-${vIndex}`}>
                    <Box
                      sx={{
                        border: "1px dashed grey",
                        p: 1,
                        position: "relative",
                        height: "150px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {image.previewUrl ? (
                        <>
                          <img
                            src={image.previewUrl}
                            alt={`Additional Image ${vIndex}`}
                            style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "cover" }}
                          />
                          <IconButton
                            onClick={() => handleRemoveVariantImage(vIndex)}
                            sx={{ position: "absolute", top: 0, right: 0 }}
                          >
                            <Delete />
                          </IconButton>
                        </>
                      ) : (
                        <>
                          <input
                            accept="image/*"
                            type="file"
                            onChange={(e) => handleVariantImageChange(vIndex, e.target.files[0])}
                            style={{ display: "none" }}
                            id={`variant-image-${selectedVariantIndex}-${vIndex}`}
                          />
                          <label htmlFor={`variant-image-${selectedVariantIndex}-${vIndex}`}>
                            <Button variant="outlined" component="span">
                              {image.id ? "Replace Image" : "Add Image"}
                            </Button>
                          </label>
                        </>
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
              <Button
                variant="contained"
                onClick={handleAddVariantImage}
                sx={{ mt: 2 }}
                disabled={variantImages.length >= 6}
              >
                Add Another Image
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal}>Close</Button>
          </DialogActions>
        </Dialog> */}

        // const handleSubmit = async (event) => {
          //   event.preventDefault();
        
          //   console.log('formData.variants before submit:', formData.variants);
        
          //   const errors = validateForm(formData);
          //   if (Object.keys(errors).length > 0) {
          //     setFormErrors(errors);
          //     Swal.fire("Error", errors.delivery_options || errors.variants || "Please fix the errors before saving.", "error");
          //     return;
          //   }
        
          //   try {
          //     setIsLoading(true);
          //     const submitData = new FormData();
        
          //     // Append fields, excluding image, video, and variants
          //     Object.keys(formData).forEach((key) => {
          //       if (key === "mfd") {
          //         if (formData.mfd) {
          //           submitData.append(key, dayjs(formData.mfd).toISOString());
          //         }
          //       } else if (key === "available_in_regions") {
          //         formData.available_in_regions.forEach((id) =>
          //           submitData.append("available_in_regions", id)
          //         );
          //       } else if (key === "delivery_options") {
          //         submitData.append("delivery_options", JSON.stringify(formData.delivery_options));
          //       } else if (key !== "image" && key !== "video" && key !== "variants") {
          //         submitData.append(key, formData[key] ?? "");
          //       }
          //     });
        
          //     // Append main product image
          //     if (formData.image instanceof File) {
          //       submitData.append("image", formData.image);
          //     }
        
          //     // Append video
          //     if (formData.video instanceof File) {
          //       submitData.append("video", formData.video);
          //     }
        
          //     // Append variants as JSON (only if variants exist)
          //     if (formData.variants && formData.variants.length > 0) {
               
        
          //       // Append existing variant image IDs to keep
          //       if (id) {
          //         const keepVariantImages = formData.variants
          //           .filter((variant) => variant.id && variant.image && !(variant.image instanceof File))
          //           .map((variant) => variant.id.toString());
          //         submitData.append("keep_variant_images", JSON.stringify(keepVariantImages));
          //       }
          //     }
        
          //     console.log("Submitting form data:", formData.variants);
          //     // Append product images
          //     const newImages = images.filter((img) => img.file instanceof File);
          //     newImages.forEach((img, index) => {
          //       submitData.append("images[]", img.file);
          //     });
        
          //     // Append existing image IDs and delivery options to keep
          //     if (id) {
          //       const keepImages = images
          //         .filter((img) => img.id && !img.file)
          //         .map((img) => img.id);
          //       submitData.append("keep_images", JSON.stringify(keepImages));
          //     }
        
          //     for (let [key, value] of submitData.entries()) {
          //       console.log(`${key}:`, value);
          //     }
        
          //     // let response;
          //     // if (id) {
          //     //   console.log('Submitting PUT request for product ID:', id);
          //     //   response = await axiosClient.put(`/api/v1/vendor/products/${id}/`, submitData, {
          //     //     headers: { "Content-Type": "multipart/form-data" },
          //     //   });
          //     // } else {
          //     //   console.log('Submitting POST request for new product');
          //     //   response = await axiosClient.post(`/api/v1/vendor/products/`, submitData, {
          //     //     headers: { "Content-Type": "multipart/form-data" },
          //     //   });
          //     // }
        
          //     // Swal.fire("Success", "Product saved successfully!", "success");
          //     // router.push(`/products`);
          //   } catch (error) {
          //     console.error("Submit error:", error.response?.data, error);
          //     Swal.fire(
          //       "Error",
          //       error.response?.data?.detail || JSON.stringify(error.response?.data) || error.message,
          //       "error"
          //     );
          //   } finally {
          //     setIsLoading(false);
          //   }
          // };