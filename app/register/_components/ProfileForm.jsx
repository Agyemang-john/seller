import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Alert,
  Avatar,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Paper,
  CircularProgress,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import Swal from "sweetalert2";

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "text.secondary",
      mt: 0.5,
      mb: 2,
    }}
  >
    {children}
  </Typography>
);

// ─── Main Component ──────────────────────────────────────────────────────────
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
    if (formData.about.profile_image?.name && !formData.about.profile_image.file) missingFiles.push("Business Logo");
    if (formData.about.cover_image?.name && !formData.about.cover_image.file) missingFiles.push("Cover Image");
    if (missingFiles.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Missing Files",
        text: `Please re-upload: ${missingFiles.join(" and ")}. Files are cleared on page refresh.`,
        confirmButtonColor: "#1a56db",
      });
    }
  }, [formData]);

  return (
    <Box>
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography fontWeight={500} fontSize={13}>Please fix the following errors:</Typography>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {Object.values(errors).map((err, i) => (
              <li key={i} style={{ fontSize: 13 }}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Images row */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "auto 1fr" }, gap: 3, mb: 3, alignItems: "start" }}>
        {/* Logo */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            Business logo <Typography component="span" sx={{ color: "error.main" }}>*</Typography>
          </Typography>
          <Box
            component="label"
            htmlFor="upload-profile_image"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 1,
              cursor: "pointer",
              width: 110,
            }}
          >
            <Avatar
              src={formData.about.profile_image?.preview}
              sx={{
                width: 88,
                height: 88,
                border: formData.about.profile_image?.file
                  ? "2.5px solid #059669"
                  : errors.profile_image
                  ? "2px solid #dc2626"
                  : "2px dashed rgba(0,0,0,0.18)",
                bgcolor: "grey.100",
                fontSize: 28,
              }}
            >
              📷
            </Avatar>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                bgcolor: formData.about.profile_image?.file ? "#ecfdf5" : "grey.100",
                border: "1px solid",
                borderColor: formData.about.profile_image?.file ? "#059669" : "rgba(0,0,0,0.12)",
                borderRadius: 1.5,
                px: 1.25,
                py: 0.5,
              }}
            >
              {formData.about.profile_image?.file ? (
                <CheckCircleIcon sx={{ fontSize: 13, color: "#059669" }} />
              ) : (
                <UploadFileIcon sx={{ fontSize: 13, color: "text.secondary" }} />
              )}
              <Typography sx={{ fontSize: 11, fontWeight: 500, color: formData.about.profile_image?.file ? "#059669" : "text.secondary" }}>
                {formData.about.profile_image?.file ? "Uploaded" : "Upload"}
              </Typography>
            </Box>
          </Box>
          <input id="upload-profile_image" type="file" accept="image/*" hidden name="profile_image" onChange={handleImageChange} />
          {(errors.profile_image || (formData.about.profile_image?.name && !formData.about.profile_image?.file)) && (
            <Typography sx={{ fontSize: 11, color: "error.main", mt: 0.5, maxWidth: 110 }}>
              {errors.profile_image || "Re-upload required"}
            </Typography>
          )}
        </Box>

        {/* Cover Image */}
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>
            Cover image <Typography component="span" sx={{ color: "error.main" }}>*</Typography>
          </Typography>
          <Box
            component="label"
            htmlFor="upload-cover_image"
            sx={{
              display: "block",
              height: 120,
              borderRadius: 2,
              border: formData.about.cover_image?.file
                ? "2px solid #059669"
                : errors.cover_image
                ? "2px solid #dc2626"
                : "2px dashed rgba(0,0,0,0.18)",
              overflow: "hidden",
              cursor: "pointer",
              bgcolor: "grey.100",
              position: "relative",
              "&:hover": { borderColor: "#1a56db" },
            }}
          >
            {formData.about.cover_image?.preview ? (
              <Box
                component="img"
                src={formData.about.cover_image.preview}
                alt="Cover"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <Box
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.5,
                }}
              >
                <UploadFileIcon sx={{ color: "text.disabled", fontSize: 28 }} />
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>Upload cover image</Typography>
              </Box>
            )}
            {formData.about.cover_image?.file && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  bgcolor: "#059669",
                  color: "white",
                  borderRadius: 1,
                  px: 1,
                  py: 0.25,
                  fontSize: 11,
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 12 }} /> Uploaded
              </Box>
            )}
          </Box>
          <input id="upload-cover_image" type="file" accept="image/*" hidden name="cover_image" onChange={handleImageChange} />
          {(errors.cover_image || (formData.about.cover_image?.name && !formData.about.cover_image?.file)) && (
            <Typography sx={{ fontSize: 11, color: "error.main", mt: 0.5 }}>
              {errors.cover_image || "Re-upload required"}
            </Typography>
          )}
        </Box>
      </Box>

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", mb: 2.5 }} />
      <SectionHeading>Store Location</SectionHeading>

      {/* Location autocomplete */}
      <Box sx={{ position: "relative", mb: 2.5 }}>
        <TextField
          fullWidth
          label="Store location"
          name="about.address"
          value={formData.about.address}
          onChange={handleChangeInput}
          error={!!errors.address}
          helperText={errors.address || "e.g. Bantama, Kumasi, Ghana"}
          required
          size="small"
          placeholder="Search for your store location..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              </InputAdornment>
            ),
            endAdornment: isLoading ? (
              <InputAdornment position="end">
                <CircularProgress size={16} />
              </InputAdornment>
            ) : null,
          }}
        />
        {suggestions.length > 0 && (
          <Paper
            elevation={8}
            sx={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              mt: 0.5,
              maxHeight: 280,
              overflow: "auto",
              zIndex: 1400,
              borderRadius: 2,
              border: "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <List disablePadding>
              {suggestions.map((s, i) => (
                <React.Fragment key={s.place_id || i}>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleSuggestionClick(s)} sx={{ py: 1.25 }}>
                      <LocationOnIcon sx={{ fontSize: 15, color: "text.disabled", mr: 1, flexShrink: 0 }} />
                      <ListItemText
                        primary={s.display_name}
                        primaryTypographyProps={{ variant: "body2", fontWeight: 500, fontSize: 13 }}
                      />
                    </ListItemButton>
                  </ListItem>
                  {i < suggestions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, mb: 2.5 }}>
        <TextField
          fullWidth
          label="Latitude"
          value={formData.about.latitude || ""}
          InputProps={{ readOnly: true }}
          variant="outlined"
          size="small"
          placeholder="Auto-filled"
          sx={{ "& input": { bgcolor: "grey.50", color: "text.secondary" } }}
        />
        <TextField
          fullWidth
          label="Longitude"
          value={formData.about.longitude || ""}
          InputProps={{ readOnly: true }}
          variant="outlined"
          size="small"
          placeholder="Auto-filled"
          sx={{ "& input": { bgcolor: "grey.50", color: "text.secondary" } }}
        />
      </Box>

      {/* About */}
      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", mb: 2.5 }} />
      <SectionHeading>About Your Business</SectionHeading>

      <TextField
        fullWidth
        label="About your business"
        name="about.about"
        multiline
        rows={4}
        value={formData.about.about}
        onChange={handleInputChange}
        error={!!errors.about}
        helperText={errors.about || "Tell customers what makes your store special"}
        required
        size="small"
        placeholder="e.g. We specialise in high-quality electronics at student-friendly prices..."
      />

      {/* Social links */}
      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", mt: 2.5, mb: 2.5 }} />
      <SectionHeading>
        Social Media{" "}
        <Typography component="span" sx={{ fontSize: 11, fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
          (optional)
        </Typography>
      </SectionHeading>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        {[
          { label: "Facebook", name: "about.facebook_url", icon: <FacebookIcon sx={{ fontSize: 18 }} /> },
          { label: "Instagram", name: "about.instagram_url", icon: <InstagramIcon sx={{ fontSize: 18 }} /> },
          { label: "Twitter / X", name: "about.twitter_url", icon: <TwitterIcon sx={{ fontSize: 18 }} /> },
          { label: "LinkedIn", name: "about.linkedin_url", icon: <LinkedInIcon sx={{ fontSize: 18 }} /> },
        ].map((s) => (
          <TextField
            key={s.name}
            fullWidth
            label={s.label}
            name={s.name}
            value={formData.about[s.name.split(".")[1]] || ""}
            onChange={handleInputChange}
            size="small"
            placeholder={`${s.label.toLowerCase()}.com/yourpage`}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {s.icon}
                </InputAdornment>
              ),
            }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProfileSetupForm;