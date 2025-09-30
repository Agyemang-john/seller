"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { countries } from "countries-list";
import Swal from "sweetalert2";

const SellerFormContext = createContext();

export const SellerFormProvider = ({ children }) => {
  const countryOptions = Object.entries(countries).map(([code, { name }]) => ({
    label: name,
    value: code,
  }));

  const currencyOptions = [
    { label: "GHS (Ghanaian Cedi)", value: "GHS" },
    { label: "USD (US Dollar)", value: "USD" },
    { label: "EUR (Euro)", value: "EUR" },
  ];

  const initialFormData = {
    name: "",
    email: "",
    contact: "",
    country: "GH",
    vendor_type: "student",
    business_type: "sole_proprietor",
    student_id: { file: null, preview: null, name: null },
    license: { file: null, preview: null, name: null },
    proof_of_address: { file: null, preview: null, name: null },
    government_issued_id: { file: null, preview: null, name: null },
    about: {
      address: "",
      latitude: "",
      longitude: "",
      profile_image: { file: null, preview: null, name: null },
      cover_image: { file: null, preview: null, name: null },
      about: "",
      facebook_url: "",
      instagram_url: "",
      twitter_url: "",
      linkedin_url: "",
      shipping_on_time: "100",
      chat_resp_time: "100",
      authentic_rating: "100",
      day_return: "100",
      warranty_period: "100",
    },
    payment_method: {
      payment_method: "momo",
      momo_number: "",
      momo_provider: "",
      bank_name: "",
      bank_account_name: "",
      bank_account_number: "",
      bank_routing_number: "",
      country: "GH",
      currency: "GHS",
    },
    tax_id: "",
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const stored = sessionStorage.getItem("seller-form-data");
    if (stored) {
      const parsed = JSON.parse(stored);
      const newFormData = {
        ...initialFormData,
        ...parsed,
        student_id: parsed.student_id ? { file: null, preview: null, name: parsed.student_id.name } : { file: null, preview: null, name: null },
        license: parsed.license ? { file: null, preview: null, name: parsed.license.name } : { file: null, preview: null, name: null },
        proof_of_address: parsed.proof_of_address ? { file: null, preview: null, name: parsed.proof_of_address.name } : { file: null, preview: null, name: null },
        government_issued_id: parsed.government_issued_id ? { file: null, preview: null, name: parsed.government_issued_id.name } : { file: null, preview: null, name: null },
        about: {
          ...initialFormData.about,
          ...parsed.about,
          profile_image: parsed.about?.profile_image ? { file: null, preview: null, name: parsed.about.profile_image.name } : { file: null, preview: null, name: null },
          cover_image: parsed.about?.cover_image ? { file: null, preview: null, name: parsed.about.cover_image.name } : { file: null, preview: null, name: null },
        },
      };
      setFormData(newFormData);

      // Check for missing files after refresh
      const missingFiles = [];
      if (parsed.student_id?.name && !newFormData.student_id.file) missingFiles.push("Student ID (Step 1)");
      if (parsed.government_issued_id?.name && !newFormData.government_issued_id.file) missingFiles.push("Government-Issued ID (Step 1)");
      if (parsed.proof_of_address?.name && !newFormData.proof_of_address.file) missingFiles.push("Proof of Address (Step 1)");
      if (parsed.license?.name && !newFormData.license.file) missingFiles.push("Business License (Step 1)");
      if (parsed.about?.profile_image?.name && !newFormData.about.profile_image.file) missingFiles.push("Business Logo (Step 2)");
      if (parsed.about?.cover_image?.name && !newFormData.about.cover_image.file) missingFiles.push("Cover Image (Step 2)");
      
      if (missingFiles.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Files Missing",
          text: `Please re-upload the following files: ${missingFiles.join(", ")}. They were lost due to a page refresh.`,
        });
      }
    }
  }, []);

  useEffect(() => {
    const dataToStore = {
      ...formData,
      student_id: formData.student_id.file ? { name: formData.student_id.file.name } : formData.student_id.name ? { name: formData.student_id.name } : null,
      license: formData.license.file ? { name: formData.license.file.name } : formData.license.name ? { name: formData.license.name } : null,
      proof_of_address: formData.proof_of_address.file ? { name: formData.proof_of_address.file.name } : formData.proof_of_address.name ? { name: formData.proof_of_address.name } : null,
      government_issued_id: formData.government_issued_id.file ? { name: formData.government_issued_id.file.name } : formData.government_issued_id.name ? { name: formData.government_issued_id.name } : null,
      about: {
        ...formData.about,
        profile_image: formData.about.profile_image.file ? { name: formData.about.profile_image.file.name } : formData.about.profile_image.name ? { name: formData.about.profile_image.name } : null,
        cover_image: formData.about.cover_image.file ? { name: formData.about.cover_image.file.name } : formData.about.cover_image.name ? { name: formData.about.cover_image.name } : null,
      },
    };
    sessionStorage.setItem("seller-form-data", JSON.stringify(dataToStore));
  }, [formData]);

  return (
    <SellerFormContext.Provider value={{ formData, setFormData, countryOptions, currencyOptions }}>
      {children}
    </SellerFormContext.Provider>
  );
};

export const useSellerForm = () => useContext(SellerFormContext);