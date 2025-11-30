import React, { useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Grid,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Divider,
  Avatar,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import {
  LocationOn,
  Facebook,
  Instagram,
  Twitter,
  LinkedIn,
  UploadFile,
  Image as ImageIcon,
} from "@mui/icons-material";
import { CircularProgress } from "@mui/material";
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
  error,
}) => {
  useEffect(() => {
    const missingFiles = [];
    if (formData.about.profile_image?.name && !formData.about.profile_image.file)
      missingFiles.push("Business Logo");
    if (formData.about.cover_image?.name && !formData.about.cover_image.file)
      missingFiles.push("Cover Image");

    if (missingFiles.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Files",
        text: `Please re-upload: ${missingFiles.join(" and ")}. Files are cleared on refresh.`,
        confirmButtonColor: "#1976d2",
      });
    }
  }, [formData]);

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", p: { xs: 0, sm: 2 } }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        Create Your Storefront
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Fill in the details to set up your professional business profile
      </Typography>

      {/* Global Errors */}
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography fontWeight={500}>Please fix the following:</Typography>
          <ul style={{ margin: "8px 0" }}>
            {Object.values(errors).map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Business Logo */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Business Logo
      </Typography>
      <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 3 }}>
        <Avatar
          src={formData.about.profile_image?.preview}
          alt="Business Logo"
          sx={{
            width: 100,
            height: 100,
            border: "4px solid",
            borderColor: "grey.200",
            bgcolor: "grey.100",
          }}
        >
          <ImageIcon sx={{ fontSize: 40, color: "grey.400" }} />
        </Avatar>

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFile />}
          sx={{ height: "fit-content", py: 1.5 }}
        >
          Upload Logo
          <input
            type="file"
            accept="image/*"
            hidden
            name="profile_image"
            onChange={handleImageChange}
          />
        </Button>
      </Stack>
      {(formData.about.profile_image?.name && !formData.about.profile_image?.file) || errors.profile_image ? (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          Please re-upload your business logo
        </Typography>
      ) : null}

      {/* Cover Image */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, mt: 4 }}>
        Cover Image
      </Typography>
      <Box sx={{ mb: 3 }}>
        {formData.about.cover_image?.preview ? (
          <Box
            sx={{
              height: 180,
              borderRadius: 2,
              overflow: "hidden",
              border: "2px dashed",
              borderColor: "grey.300",
              bgcolor: "grey.50",
            }}
          >
            <img
              src={formData.about.cover_image.preview}
              alt="Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        ) : (
          <Box
            sx={{
              height: 180,
              borderRadius: 2,
              bgcolor: "grey.100",
              border: "2px dashed",
              borderColor: "grey.300",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ImageIcon sx={{ fontSize: 60, color: "grey.400" }} />
          </Box>
        )}

        <Button
          variant="outlined"
          component="label"
          startIcon={<UploadFile />}
          fullWidth
          sx={{ mt: 2 }}
        >
          {formData.about.cover_image?.preview ? "Change" : "Upload"} Cover Image
          <input
            type="file"
            accept="image/*"
            hidden
            name="cover_image"
            onChange={handleImageChange}
          />
        </Button>
      </Box>

      {/* Location Autocomplete */}
      <Box sx={{ position: "relative", mb: 3 }}>
        <TextField
          fullWidth
          label="Store Location"
          name="about.address"
          value={formData.about.address}
          onChange={handleChangeInput}
          error={!!errors.address}
          helperText={errors.address || "e.g., Bantama, Kumasi, Ghana"}
          placeholder="Search for your store location..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn color="action" />
              </InputAdornment>
            ),
            endAdornment: isLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null,
          }}
          sx={{ mb: suggestions.length > 0 ? 0 : 2 }}
        />

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <Paper
            elevation={10}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              mt: 1,
              maxHeight: 300,
              overflow: "auto",
              zIndex: 1400,
              borderRadius: 2,
            }}
          >
            <List disablePadding>
              {suggestions.map((suggestion, index) => (
                <React.Fragment key={suggestion.place_id || index}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => handleSuggestionClick(suggestion)}
                      sx={{ py: 1.8 }}
                    >
                      <ListItemText
                        primary={suggestion.display_name}
                        primaryTypographyProps={{
                          variant: "body2",
                          fontWeight: 500,
                        }}
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {suggestion.type?.replace(/_/g, " ") || "Location"}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  {index < suggestions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Coordinates (Read-only) */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Longitude"
            value={formData.about.longitude || ""}
            InputProps={{ readOnly: true }}
            variant="filled"
          />
        </Grid>
        <Grid item xs={6}>
          <TextField
            fullWidth
            label="Latitude"
            value={formData.about.latitude || ""}
            InputProps={{ readOnly: true }}
            variant="filled"
          />
        </Grid>
      </Grid>

      {/* About Business */}
      <TextField
        fullWidth
        label="About Your Business"
        name="about.about"
        multiline
        rows={5}
        value={formData.about.about}
        onChange={handleInputChange}
        error={!!errors.about}
        helperText={errors.about || "Tell customers what makes your business special"}
        sx={{ mb: 3 }}
      />

      {/* Social Links */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        Social Media (Optional)
      </Typography>
      <Grid container spacing={2}>
        {[
          { label: "Facebook", name: "facebook_url", icon: <Facebook /> },
          { label: "Instagram", name: "instagram_url", icon: <Instagram /> },
          { label: "Twitter / X", name: "twitter_url", icon: <Twitter /> },
          { label: "LinkedIn", name: "linkedin_url", icon: <LinkedIn /> },
        ].map((social) => (
          <Grid item xs={12} sm={6} key={social.name}>
            <TextField
              fullWidth
              label={social.label}
              name={`about.${social.name}`}
              value={formData.about[social.name.replace("_url", "") + "_url"] || ""}
              onChange={handleInputChange}
              placeholder={`https://${social.label.toLowerCase()}.com/yourprofile`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {social.icon}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, textAlign: "center" }}>
        <Typography variant="caption" color="text.secondary">
          Powered by OpenStreetMap • All fields marked are required
        </Typography>
      </Box>
    </Box>
  );
};

export default ProfileSetupForm;