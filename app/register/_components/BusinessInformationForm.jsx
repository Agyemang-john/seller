import React, { useEffect } from "react";
import { Box, Typography, TextField, MenuItem, Button, IconButton, Alert } from "@mui/material";
import { CheckCircle, Error } from "@mui/icons-material";
import Swal from "sweetalert2";

const BusinessInformationForm = ({ formData, handleInputChange, handleFileChange, countryOptions, errors }) => {
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
        text: `Please re-upload the following files: ${missingFiles.join(", ")}. They were lost due to a page refresh.`,
      });
    }
  }, [formData]);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Enter Your Business Information
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
      <TextField
        fullWidth
        label="Store Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        error={!!errors.name}
        helperText={errors.name}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Business Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        error={!!errors.email}
        helperText={errors.email}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        select
        label="Country"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        error={!!errors.country}
        helperText={errors.country}
        fullWidth
        sx={{ mb: 2 }}
      >
        {countryOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Vendor Type"
        name="vendor_type"
        value={formData.vendor_type}
        onChange={handleInputChange}
        error={!!errors.vendor_type}
        helperText={errors.vendor_type}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="student">Student</MenuItem>
        <MenuItem value="non_student">Non-Student</MenuItem>
      </TextField>
      {formData.vendor_type === "student" ? (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" component="label">
            Upload Student ID
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              name="student_id"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {formData.student_id?.file ? (
            <IconButton color="success" sx={{ ml: 2 }}>
              <CheckCircle />
            </IconButton>
          ) : (
            formData.student_id?.name && (
              <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                Please re-upload Student ID
              </Typography>
            )
          )}
          {errors.student_id && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              {errors.student_id}
            </Typography>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Button variant="contained" component="label">
            Upload Government-Issued ID
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg"
              name="government_issued_id"
              hidden
              onChange={handleFileChange}
            />
          </Button>
          {formData.government_issued_id?.file ? (
            <IconButton color="success" sx={{ ml: 2 }}>
              <CheckCircle />
            </IconButton>
          ) : (
            formData.government_issued_id?.name && (
              <Typography color="error" variant="caption" sx={{ ml: 2 }}>
                Please re-upload Government-Issued ID
              </Typography>
            )
          )}
          {errors.government_issued_id && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              {errors.government_issued_id}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Upload Business License (Optional)
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            name="license"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        {formData.license?.file ? (
          <IconButton color="success" sx={{ ml: 2 }}>
            <CheckCircle />
          </IconButton>
        ) : (
          formData.license?.name && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              Please re-upload Business License
            </Typography>
          )
        )}
        {errors.license && (
          <Typography color="error" variant="caption" sx={{ ml: 2 }}>
            {errors.license}
          </Typography>
        )}
      </Box>
      <Box sx={{ mb: 2 }}>
        <Button variant="contained" component="label">
          Upload Proof of Address
          <input
            type="file"
            accept="application/pdf,image/png,image/jpeg"
            name="proof_of_address"
            hidden
            onChange={handleFileChange}
          />
        </Button>
        {formData.proof_of_address?.file ? (
          <IconButton color="success" sx={{ ml: 2 }}>
            <CheckCircle />
          </IconButton>
        ) : (
          formData.proof_of_address?.name && (
            <Typography color="error" variant="caption" sx={{ ml: 2 }}>
              Please re-upload Proof of Address
            </Typography>
          )
        )}
        {errors.proof_of_address && (
          <Typography color="error" variant="caption" sx={{ ml: 2 }}>
            {errors.proof_of_address}
          </Typography>
        )}
      </Box>
      <TextField
        select
        label="Business Type"
        name="business_type"
        value={formData.business_type}
        onChange={handleInputChange}
        error={!!errors.business_type}
        helperText={errors.business_type}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="sole_proprietor">Sole Proprietor</MenuItem>
        <MenuItem value="partnership">Partnership</MenuItem>
        <MenuItem value="corporation">Corporation</MenuItem>
        <MenuItem value="llc">Limited Liability Company (LLC)</MenuItem>
        <MenuItem value="non_profit">Non-Profit</MenuItem>
        <MenuItem value="other">Other</MenuItem>
      </TextField>
      <TextField
        fullWidth
        label="Phone Number"
        name="contact"
        value={formData.contact}
        onChange={handleInputChange}
        error={!!errors.contact}
        helperText={errors.contact}
        required
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Tax ID (Optional)"
        name="tax_id"
        value={formData.tax_id}
        onChange={handleInputChange}
        error={!!errors.tax_id}
        helperText={errors.tax_id}
        sx={{ mb: 2 }}
      />
    </Box>
  );
};

export default BusinessInformationForm;