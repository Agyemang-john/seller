// app/register/step-1/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button } from "@mui/material";
import BusinessInformationForm from "../_components/BusinessInformationForm";
import { useSellerForm } from "../SellerFormContext";

export default function Step1() {
  const { formData, setFormData, countryOptions } = useSellerForm();
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name?.trim()) newErrors.name = "Store name is required.";
    if (!formData.email?.trim()) newErrors.email = "Business email is required.";
    if (!formData.contact?.trim()) newErrors.contact = "Phone number is required.";
    else if (!/^\+?\d{9,15}$/.test(formData.contact)) newErrors.contact = "Invalid phone number.";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.vendor_type) newErrors.vendor_type = "Vendor type is required.";
    if (!formData.business_type) newErrors.business_type = "Business type is required.";
    if (formData.vendor_type === "student" && !formData.student_id?.file)
      newErrors.student_id = "Student ID is required.";
    if (formData.vendor_type === "non_student" && !formData.government_issued_id?.file)
      newErrors.government_issued_id = "Government-issued ID is required.";
    if (!formData.proof_of_address?.file) newErrors.proof_of_address = "Proof of address is required.";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      router.push("/register/step-2");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Please upload a file smaller than 2MB.");
      return;
    }
    if (!["application/pdf", "image/png", "image/jpeg"].includes(file.type)) {
      alert("Invalid file type. Only PDF, PNG, or JPEG files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData({ ...formData, [name]: { file, preview: reader.result } });
    };
    reader.readAsDataURL(file);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <BusinessInformationForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        countryOptions={countryOptions}
        errors={errors}
      />
      <Box display="flex" justifyContent="flex-end" mt={3}>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Box>
  );
}