import React, { useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Swal from "sweetalert2";

// ─── Reusable Upload Zone ────────────────────────────────────────────────────
const UploadZone = ({ label, hint, name, uploaded, fileName, onChange, error, optional = false }) => (
  <Box sx={{ mb: 2.5 }}>
    <Typography
      component="label"
      htmlFor={`upload-${name}`}
      sx={{ display: "block", fontSize: 13, fontWeight: 500, mb: 0.75, color: "text.primary" }}
    >
      {label}{" "}
      {optional ? (
        <Typography component="span" sx={{ fontSize: 11, fontWeight: 400, color: "text.disabled" }}>
          (optional)
        </Typography>
      ) : (
        <Typography component="span" sx={{ color: "error.main" }}>*</Typography>
      )}
    </Typography>

    <Box
      component="label"
      htmlFor={`upload-${name}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: "12px 16px",
        border: uploaded
          ? "1.5px solid #059669"
          : error
          ? "1.5px solid"
          : "1.5px dashed rgba(0,0,0,0.18)",
        borderColor: uploaded ? "#059669" : error ? "error.main" : undefined,
        borderRadius: 2,
        cursor: "pointer",
        bgcolor: uploaded ? "#ecfdf5" : "grey.50",
        transition: "all 0.15s",
        "&:hover": {
          borderColor: uploaded ? "#059669" : "primary.main",
          bgcolor: uploaded ? "#ecfdf5" : "primary.50",
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1.5,
          border: "1px solid",
          borderColor: uploaded ? "rgba(5,150,105,0.25)" : "rgba(0,0,0,0.1)",
          bgcolor: uploaded ? "#d1fae5" : "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {uploaded ? (
          <CheckCircleIcon sx={{ fontSize: 20, color: "#059669" }} />
        ) : (
          <UploadFileIcon sx={{ fontSize: 20, color: "text.secondary" }} />
        )}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: uploaded ? "#059669" : "text.primary",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {uploaded ? fileName : `Click to upload ${label}`}
        </Typography>
        <Typography sx={{ fontSize: 11, color: "text.secondary" }}>
          {hint || "PDF, PNG or JPEG — max 2MB"}
        </Typography>
      </Box>
      <input
        id={`upload-${name}`}
        type="file"
        accept="application/pdf,image/png,image/jpeg"
        name={name}
        hidden
        onChange={onChange}
      />
    </Box>

    {error && (
      <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.5, ml: 0.5 }}>
        {error}
      </Typography>
    )}
  </Box>
);

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "text.secondary",
      mt: 1,
      mb: 2,
    }}
  >
    {children}
  </Typography>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const BusinessInformationForm = ({
  formData,
  handleInputChange,
  handleFileChange,
  countryOptions,
  errors,
}) => {
  useEffect(() => {
    const missingFiles = [];
    if (formData.student_id?.name && !formData.student_id.file) missingFiles.push("Student ID");
    if (formData.government_issued_id?.name && !formData.government_issued_id.file) missingFiles.push("Government-Issued ID");
    if (formData.proof_of_address?.name && !formData.proof_of_address.file) missingFiles.push("Proof of Address");
    if (formData.license?.name && !formData.license.file) missingFiles.push("Business License");
    if (missingFiles.length > 0) {
      Swal.fire({
        icon: "warning",
        title: "Files Missing",
        text: `Please re-upload: ${missingFiles.join(", ")}. Files are cleared on page refresh.`,
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
            {Object.values(errors).map((error, i) => (
              <li key={i} style={{ fontSize: 13 }}>{error}</li>
            ))}
          </ul>
        </Alert>
      )}

      {/* Store Info */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Store name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={!!errors.name}
          helperText={errors.name}
          required
          size="small"
        />
        <TextField
          fullWidth
          label="Business email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={!!errors.email}
          helperText={errors.email}
          required
          size="small"
        />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
        <TextField
          fullWidth
          label="Phone number"
          name="contact"
          value={formData.contact}
          onChange={handleInputChange}
          error={!!errors.contact}
          helperText={errors.contact}
          required
          size="small"
          placeholder="+233 20 000 0000"
        />
        <TextField
          select
          fullWidth
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleInputChange}
          error={!!errors.country}
          helperText={errors.country}
          required
          size="small"
        >
          {countryOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2.5 }}>
        {/* Vendor type as toggle */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75, color: "text.primary" }}>
            Vendor type <Typography component="span" sx={{ color: "error.main" }}>*</Typography>
          </Typography>
          <ToggleButtonGroup
            exclusive
            value={formData.vendor_type}
            onChange={(_, v) => v && handleInputChange({ target: { name: "vendor_type", value: v } })}
            fullWidth
            size="small"
            sx={{
              "& .MuiToggleButton-root": {
                textTransform: "none",
                fontWeight: 500,
                fontSize: 13,
                borderColor: "rgba(0,0,0,0.18)",
                color: "text.secondary",
                "&.Mui-selected": {
                  bgcolor: "#1a56db",
                  color: "white",
                  borderColor: "#1a56db",
                  "&:hover": { bgcolor: "#1240a8" },
                },
              },
            }}
          >
            <ToggleButton value="student">Student</ToggleButton>
            <ToggleButton value="non_student">Non-Student</ToggleButton>
          </ToggleButtonGroup>
          {errors.vendor_type && (
            <Typography sx={{ fontSize: 12, color: "error.main", mt: 0.5 }}>{errors.vendor_type}</Typography>
          )}
        </Box>

        <TextField
          select
          fullWidth
          label="Business type"
          name="business_type"
          value={formData.business_type}
          onChange={handleInputChange}
          error={!!errors.business_type}
          helperText={errors.business_type}
          size="small"
        >
          <MenuItem value="sole_proprietor">Sole Proprietor</MenuItem>
          <MenuItem value="partnership">Partnership</MenuItem>
          <MenuItem value="corporation">Corporation</MenuItem>
          <MenuItem value="llc">LLC</MenuItem>
          <MenuItem value="non_profit">Non-Profit</MenuItem>
          <MenuItem value="other">Other</MenuItem>
        </TextField>
      </Box>

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", mb: 2.5 }} />
      <SectionHeading>Identity Documents</SectionHeading>

      {formData.vendor_type === "student" ? (
        <UploadZone
          label="Student ID"
          name="student_id"
          uploaded={!!formData.student_id?.file}
          fileName={formData.student_id?.file?.name}
          onChange={handleFileChange}
          error={errors.student_id}
        />
      ) : (
        <UploadZone
          label="Government-Issued ID"
          name="government_issued_id"
          uploaded={!!formData.government_issued_id?.file}
          fileName={formData.government_issued_id?.file?.name}
          onChange={handleFileChange}
          error={errors.government_issued_id}
        />
      )}

      <UploadZone
        label="Proof of Address"
        hint="Utility bill, bank statement, etc. — max 2MB"
        name="proof_of_address"
        uploaded={!!formData.proof_of_address?.file}
        fileName={formData.proof_of_address?.file?.name}
        onChange={handleFileChange}
        error={errors.proof_of_address}
      />

      <UploadZone
        label="Business License"
        name="license"
        uploaded={!!formData.license?.file}
        fileName={formData.license?.file?.name}
        onChange={handleFileChange}
        error={errors.license}
        optional
      />

      {/* Divider */}
      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", mb: 2.5 }} />
      <SectionHeading>Optional Details</SectionHeading>

      <TextField
        fullWidth
        label="Tax ID"
        name="tax_id"
        value={formData.tax_id}
        onChange={handleInputChange}
        error={!!errors.tax_id}
        helperText={errors.tax_id || "e.g. GH-TIN-0001234"}
        size="small"
        InputProps={{
          endAdornment: (
            <Typography sx={{ fontSize: 11, color: "text.disabled", whiteSpace: "nowrap" }}>
              optional
            </Typography>
          ),
        }}
      />
    </Box>
  );
};

export default BusinessInformationForm;