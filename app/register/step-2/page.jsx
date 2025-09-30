// app/register/step-2/page.jsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import { createAxiosClient } from '@/utils/clientFetch';
import { Box, Button, Divider, Link } from "@mui/material";
import ProfileSetupForm from "../_components/ProfileForm";
import { useSellerForm } from "../SellerFormContext";
import debounce from "lodash.debounce";

export default function Step2() {
  const axiosClient = createAxiosClient();
  const { formData, setFormData } = useSellerForm();
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (query.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const response = await axiosClient.get(
          `/api/v1/vendor/location/autocomplete`,
          { params: { q: query } }
        );
        setSuggestions(response.data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
        setSuggestions([]);
      }
    }, 300),
    []
  );

  const handleSuggestionClick = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      about: {
        ...prev.about,
        address: suggestion.display_name,
        longitude: suggestion.lon,
        latitude: suggestion.lat,
      },
    }));
    setSuggestions([]);
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.about.profile_image?.file) newErrors.profile_image = "Business logo is required.";
    if (!formData.about.cover_image?.file) newErrors.cover_image = "Cover image is required.";
    if (!formData.about.address?.trim()) newErrors.address = "Store location is required.";
    if (!formData.about.longitude?.trim()) newErrors.longitude = "Longitude is required.";
    if (!formData.about.latitude?.trim()) newErrors.latitude = "Latitude is required.";
    if (!formData.about.about?.trim()) newErrors.about = "About section is required.";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      router.push("/register/step-3");
    }
  };

  const handleBack = () => router.push("/register/step-1");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("about.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        about: { ...prev.about, [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("File too large. Please upload a file smaller than 2MB.");
      return;
    }
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("Invalid file type. Only PNG or JPEG files are allowed.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({
        ...prev,
        about: { ...prev.about, [name]: { file, preview: reader.result } },
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleChangeInput = (e) => {
    handleInputChange(e);
    fetchSuggestions(e.target.value);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <ProfileSetupForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleChangeInput={handleChangeInput}
        errors={errors}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
      />
      <Box display="flex" justifyContent="space-between" mt={3}>
        <Button onClick={handleBack}>Back</Button>
        <Button variant="contained" onClick={handleNext}>Next</Button>
      </Box>
    </Box>
  );
}