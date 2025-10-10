"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button, Typography, CircularProgress, Alert } from "@mui/material";
import Swal from "sweetalert2";
import { useSellerForm } from "../SellerFormContext";
import { createAxiosClient } from '@/utils/clientFetch';

export default function Step4() {
  const axiosClient = createAxiosClient();
  
  const { formData } = useSellerForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateAllSteps = () => {
    const newErrors = {};

    // Step 1: Business Information
    if (!formData.name?.trim()) newErrors.name = "Store name is required in Step 1.";
    if (!formData.email?.trim()) newErrors.email = "Business email is required in Step 1.";
    if (!formData.contact?.trim()) newErrors.contact = "Phone number is required in Step 1.";
    else if (!/^\+?\d{9,15}$/.test(formData.contact)) newErrors.contact = "Invalid phone number in Step 1.";
    if (!formData.country) newErrors.country = "Country is required in Step 1.";
    if (!formData.vendor_type) newErrors.vendor_type = "Vendor type is required in Step 1.";
    if (!formData.business_type) newErrors.business_type = "Business type is required in Step 1.";
    if (formData.vendor_type === "student" && !formData.student_id?.file)
      newErrors.student_id = "Student ID is required in Step 1.";
    if (formData.vendor_type === "non_student" && !formData.government_issued_id?.file)
      newErrors.government_issued_id = "Government-issued ID is required in Step 1.";
    if (!formData.proof_of_address?.file) newErrors.proof_of_address = "Proof of address is required in Step 1.";

    // Step 2: Profile Setup
    if (!formData.about.profile_image?.file) newErrors.profile_image = "Business logo is required in Step 2.";
    if (!formData.about.cover_image?.file) newErrors.cover_image = "Cover image is required in Step 2.";
    if (!formData.about.address?.trim()) newErrors.address = "Store location is required in Step 2.";
    if (!formData.about.longitude?.trim()) newErrors.longitude = "Longitude is required in Step 2.";
    if (!formData.about.latitude?.trim()) newErrors.latitude = "Latitude is required in Step 2.";
    if (!formData.about.about?.trim()) newErrors.about = "About section is required in Step 2.";

    // Step 3: Payment Information
    if (!formData.payment_method.payment_method) newErrors.payment_method = "Payment method is required in Step 3.";
    if (formData.payment_method.payment_method === "momo") {
      if (!formData.payment_method.momo_number?.trim()) newErrors.momo_number = "Mobile money number is required in Step 3.";
      else if (!/^\+?\d{10,15}$/.test(formData.payment_method.momo_number))
        newErrors.momo_number = "Invalid mobile money number in Step 3.";
      if (!formData.payment_method.momo_provider?.trim()) newErrors.momo_provider = "Mobile money provider is required in Step 3.";
    }
    if (formData.payment_method.payment_method === "bank") {
      if (!formData.payment_method.bank_name?.trim()) newErrors.bank_name = "Bank name is required in Step 3.";
      if (!formData.payment_method.bank_account_name?.trim()) newErrors.bank_account_name = "Account name is required in Step 3.";
      if (!formData.payment_method.bank_account_number?.trim()) newErrors.bank_account_number = "Account number is required in Step 3.";
    }
    if (formData.payment_method.payment_method === "paypal") {
      if (!formData.payment_method.momo_number?.trim()) newErrors.momo_number = "PayPal email or phone is required in Step 3.";
      else if (!/^\S+@\S+\.\S+$|^\+?\d{10,15}$/.test(formData.payment_method.momo_number))
        newErrors.momo_number = "Invalid PayPal email or phone in Step 3.";
    }
    if (!formData.payment_method.country) newErrors.payment_method_country = "Payment country is required in Step 3.";
    if (!formData.payment_method.currency) newErrors.payment_method_currency = "Currency is required in Step 3.";

    return newErrors;
  };

  const handleSubmit = async () => {
    // Validate all steps before submission
    const validationErrors = validateAllSteps();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        html: `Please complete the following:<br/><ul>${Object.values(validationErrors)
          .map((error) => `<li>${error}</li>`)
          .join("")}</ul>`,
      });
      return;
    }

    setLoading(true);
    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("email", formData.email);
    dataToSend.append("contact", formData.contact);
    dataToSend.append("country", formData.country);
    dataToSend.append("vendor_type", formData.vendor_type);
    dataToSend.append("business_type", formData.business_type);
    if (formData.student_id?.file) dataToSend.append("student_id", formData.student_id.file);
    if (formData.license?.file) dataToSend.append("license", formData.license.file);
    if (formData.proof_of_address?.file) dataToSend.append("proof_of_address", formData.proof_of_address.file);
    if (formData.government_issued_id?.file) dataToSend.append("government_issued_id", formData.government_issued_id.file);
    Object.entries(formData.about).forEach(([key, value]) => {
      if (key === "profile_image" && value.file) dataToSend.append("about.profile_image", value.file);
      else if (key === "cover_image" && value.file) dataToSend.append("about.cover_image", value.file);
      else if (value) dataToSend.append(`about.${key}`, value);
    });
    Object.entries(formData.payment_method).forEach(([key, value]) => {
      if (value) dataToSend.append(`payment_method.${key}`, value);
    });
    dataToSend.append("tax_id", formData.tax_id);

    console.log(formData)

    try {
      const response = await axiosClient.post(
        `/api/v1/vendor/register/`,
        dataToSend,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Registration completed successfully.",
      }).then(() => {
        sessionStorage.removeItem("seller-form-data"); // Clear only after success
        router.push("/");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.error || Object.values(error.response?.data || {}).join(", ") || "Something went wrong.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.push("/register/step-3");

  return (
    <Box textAlign="center" sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h6" mb={2}>
        You're All Set!
      </Typography>
      <Typography mb={3}>
        Review your information and submit to complete registration.
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
      <Box display="flex" justifyContent="center" gap={2}>
        <Button onClick={handleBack}>Back</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          {loading ? "Submitting..." : "Finish"}
        </Button>
      </Box>
    </Box>
  );
}
