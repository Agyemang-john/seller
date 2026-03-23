"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PaymentMethodForm from "../_components/PaymentMethodForm";
import CardShell from "../_components/CardShell";
import { useSellerForm } from "../SellerFormContext";

export default function Step3() {
  const { formData, setFormData, currencyOptions, countryOptions } = useSellerForm();
  const router = useRouter();
  const [errors, setErrors] = useState({});

  const validateStep3 = () => {
    const newErrors = {};
    const pm = formData.payment_method;
    if (!pm.payment_method) newErrors.payment_method = "Payment method is required.";
    if (pm.payment_method === "momo") {
      if (!pm.momo_number?.trim()) newErrors.momo_number = "Mobile money number is required.";
      else if (!/^\+?\d{9,15}$/.test(pm.momo_number.replace(/\s/g, "")))
        newErrors.momo_number = "Enter a valid mobile money number.";
      if (!pm.momo_provider?.trim()) newErrors.momo_provider = "Please select a provider.";
    }
    if (pm.payment_method === "bank") {
      if (!pm.bank_name?.trim()) newErrors.bank_name = "Bank name is required.";
      if (!pm.bank_account_name?.trim()) newErrors.bank_account_name = "Account name is required.";
      if (!pm.bank_account_number?.trim()) newErrors.bank_account_number = "Account number is required.";
    }
    if (pm.payment_method === "paypal") {
      if (!pm.momo_number?.trim()) newErrors.momo_number = "PayPal email or phone is required.";
      else if (!/^\S+@\S+\.\S+$|^\+?\d{10,15}$/.test(pm.momo_number))
        newErrors.momo_number = "Enter a valid PayPal email or phone number.";
    }
    if (!pm.country) newErrors.payment_method_country = "Payment country is required.";
    if (!pm.currency) newErrors.payment_method_currency = "Currency is required.";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep3();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    <CardShell
      stepLabel="Step 3 of 4"
      title="Payment Setup"
      description="How you'll receive your earnings from sales"
      onBack={handleBack}
      onNext={handleNext}
    >
      <PaymentMethodForm
        formData={formData}
        handleInputChange={handleInputChange}
        errors={errors}
        currencyOptions={currencyOptions}
        countryOptions={countryOptions}
      />
    </CardShell>
  );
}