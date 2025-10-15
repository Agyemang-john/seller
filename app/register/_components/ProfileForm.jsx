import React, { useEffect } from "react";
import { Box, Typography, Button, TextField, Link, Divider, Grid, Alert } from "@mui/material";
import Swal from "sweetalert2";

const ProfileSetupForm = ({
  formData,
  handleInputChange,
  handleImageChange,
  handleChangeInput,
  errors,
  suggestions,
  handleSuggestionClick,
  isLoading,
  error
}) => {
  useEffect(() => {
    const missingFiles = [];
    if (formData.about.profile_image?.name && !formData.about.profile_image.file) missingFiles.push("Business Logo");
    if (formData.about.cover_image?.name && !formData.about.cover_image.file) missingFiles.push("Cover Image");
    
    if (missingFiles.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Files Missing",
        text: `Please re-upload the following files: ${missingFiles.join(", ")}. They were lost due to a page refresh.`,
      });
    }
  }, [formData]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Create Your Storefront
      </Typography>
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Please fix the following errors:
          <ul>
            {Object.values(errors).map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}
      <Typography sx={{ mb: 1 }}>Business Logo</Typography>
      {formData.about.profile_image?.preview && (
        <img
          src={formData.about.profile_image.preview}
          alt="Profile Preview"
          style={{ width: 100, height: 100, borderRadius: "50%", mb: 1, border: "2px solid #ddd" }}
        />
      )}
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Upload Business Logo
        <input
          type="file"
          accept="image/*"
          name="profile_image"
          hidden
          onChange={handleImageChange}
        />
      </Button>
      {formData.about.profile_image?.name && !formData.about.profile_image?.file && (
        <Typography color="error" variant="caption" sx={{ mb: 2, display: "block" }}>
          Please re-upload Business Logo
        </Typography>
      )}
      {errors.profile_image && (
        <Typography color="error" variant="caption" sx={{ mb: 2, display: "block" }}>
          {errors.profile_image}
        </Typography>
      )}
      <Typography sx={{ mb: 1 }}>Cover Image</Typography>
      {formData.about.cover_image?.preview && (
        <img
          src={formData.about.cover_image.preview}
          alt="Cover Preview"
          style={{ width: "100%", height: 150, objectFit: "cover", mb: 1, border: "2px solid #ddd" }}
        />
      )}
      <Button variant="contained" component="label" sx={{ mb: 2 }}>
        Upload Cover Image
        <input
          type="file"
          accept="image/*"
          name="cover_image"
          hidden
          onChange={handleImageChange}
        />
      </Button>
      {formData.about.cover_image?.name && !formData.about.cover_image?.file && (
        <Typography color="error" variant="caption" sx={{ mb: 2, display: "block" }}>
          Please re-upload Cover Image
        </Typography>
      )}
      {errors.cover_image && (
        <Typography color="error" variant="caption" sx={{ mb: 2, display: "block" }}>
          {errors.cover_image}
        </Typography>
      )}
      <TextField
        fullWidth
        label="Store Location"
        name="about.address"
        value={formData.about.address}
        onChange={handleChangeInput}
        error={!!errors.address}
        helperText={errors.address}
        sx={{ mb: 2 }}
        placeholder="Start typing to get location suggestions e.g.,'Bantama, Kumasi, Ghana'"
      />

      {isLoading && <p>Loading suggestions...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {suggestions.length > 0 && (
        <Box sx={{ maxHeight: 200, overflowY: "auto", bgcolor: "background.paper", p: 1, borderRadius: 1, mb: 2 }}>
          {suggestions.map((suggestion, index) => (
            <React.Fragment key={index}>
              <Link
                component="button"
                onClick={() => handleSuggestionClick(suggestion)}
                sx={{ display: "block", p: 1, textAlign: "left", color: "text.primary", ":hover": { color: "primary.main" } }}
              >
                {suggestion.display_name}
              </Link>
              {index < suggestions.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Box>
      )}
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Longitude"
            name="about.longitude"
            value={formData.about.longitude}
            onChange={handleInputChange}
            error={!!errors.longitude}
            helperText={errors.longitude}
            InputProps={{ readOnly: true }}
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Latitude"
            name="about.latitude"
            value={formData.about.latitude}
            onChange={handleInputChange}
            error={!!errors.latitude}
            helperText={errors.latitude}
            InputProps={{ readOnly: true }}
          />
        </Grid>
      </Grid>
      <TextField
        fullWidth
        label="About Your Business"
        name="about.about"
        multiline
        rows={4}
        value={formData.about.about}
        onChange={handleInputChange}
        error={!!errors.about}
        helperText={errors.about}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        label="Facebook URL (Optional)"
        name="about.facebook_url"
        value={formData.about.facebook_url}
        onChange={handleInputChange}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        label="Instagram URL (Optional)"
        name="about.instagram_url"
        value={formData.about.instagram_url}
        onChange={handleInputChange}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        label="Twitter URL (Optional)"
        name="about.twitter_url"
        value={formData.about.twitter_url}
        onChange={handleInputChange}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        label="LinkedIn URL (Optional)"
        name="about.linkedin_url"
        value={formData.about.linkedin_url}
        onChange={handleInputChange}
        sx={{ mt: 2 }}
      />
    </Box>
  );
};

export default ProfileSetupForm;