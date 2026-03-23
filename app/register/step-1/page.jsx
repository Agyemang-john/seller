"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import BusinessInformationForm from "../_components/BusinessInformationForm";
import CardShell from "../_components/CardShell";
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
    else if (!/^\+?\d{9,15}$/.test(formData.contact.replace(/\s/g, "")))
      newErrors.contact = "Enter a valid phone number (e.g. +233201234567).";
    if (!formData.country) newErrors.country = "Country is required.";
    if (!formData.vendor_type) newErrors.vendor_type = "Vendor type is required.";
    if (!formData.business_type) newErrors.business_type = "Business type is required.";
    if (formData.vendor_type === "student" && !formData.student_id?.file)
      newErrors.student_id = "Student ID is required.";
    if (formData.vendor_type === "non_student" && !formData.government_issued_id?.file)
      newErrors.government_issued_id = "Government-issued ID is required.";
    if (!formData.proof_of_address?.file)
      newErrors.proof_of_address = "Proof of address is required.";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep1();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      // Scroll to top of card on error
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setErrors({});
      router.push("/register/step-2");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      setFormData((prev) => ({ ...prev, [name]: { file, preview: reader.result } }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <CardShell
      stepLabel="Step 1 of 4"
      title="Business Information"
      description="Basic details about your store and legal identity"
      onNext={handleNext}
      footerNote="* Required fields"
    >
      <BusinessInformationForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleFileChange={handleFileChange}
        countryOptions={countryOptions}
        errors={errors}
      />
    </CardShell>
  );
}