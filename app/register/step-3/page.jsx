// app/register/step-3/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Box, Button } from "@mui/material";
import PaymentMethodForm from "../_components/PaymentMethodForm";
import { useSellerForm } from "../SellerFormContext";

export default function Step3() {
  const { formData, setFormData, currencyOptions, countryOptions } = useSellerForm();
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const validateStep3 = () => {
    const newErrors = {};
    if (!formData.payment_method.payment_method) newErrors.payment_method = "Payment method is required.";
    if (formData.payment_method.payment_method === "momo") {
      if (!formData.payment_method.momo_number?.trim()) newErrors.momo_number = "Mobile money number is required.";
      else if (!/^\+?\d{10,15}$/.test(formData.payment_method.momo_number))
        newErrors.momo_number = "Invalid mobile money number.";
      if (!formData.payment_method.momo_provider?.trim()) newErrors.momo_provider = "Mobile money provider is required.";
    }
    if (formData.payment_method.payment_method === "bank") {
      if (!formData.payment_method.bank_name?.trim()) newErrors.bank_name = "Bank name is required.";
      if (!formData.payment_method.bank_account_name?.trim()) newErrors.bank_account_name = "Account name is required.";
      if (!formData.payment_method.bank_account_number?.trim()) newErrors.bank_account_number = "Account number is required.";
    }
    if (formData.payment_method.payment_method === "paypal") {
      if (!formData.payment_method.momo_number?.trim()) newErrors.momo_number = "PayPal email or phone is required.";
      else if (!/^\S+@\S+\.\S+$|^\+?\d{10,15}$/.test(formData.payment_method.momo_number))
        newErrors.momo_number = "Invalid PayPal email or phone.";
    }
    if (!formData.payment_method.country) newErrors.payment_method_country = "Country is required.";
    if (!formData.payment_method.currency) newErrors.payment_method_currency = "Currency is required.";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep3();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      router.push("/register/step-4");
    }
  };

  const handleBack = () => router.push("/register/step-2");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const field = name.startsWith("payment_method.") ? name.split(".")[1] : name;
    setFormData((prev) => ({
      ...prev,
      payment_method: { ...prev.payment_method, [field]: value },
    }));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <PaymentMethodForm
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        currencyOptions={currencyOptions}
        countryOptions={countryOptions}
      />
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={handleBack}>Back</Button>
        <Button variant="contained" onClick={handleNext}>Next</Button>
      </Box>
    </Box>
  );
}