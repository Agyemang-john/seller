"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import ProfileSetupForm from "../_components/ProfileForm";
import CardShell from "../_components/CardShell";
import { useSellerForm } from "../SellerFormContext";
import debounce from "lodash.debounce";
import axios from "axios";

export default function Step2() {
  const { formData, setFormData } = useSellerForm();
  const router = useRouter();
  const [errors, setErrors] = useState({});
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSuggestions = useCallback(
    debounce(async (query, retryCount = 0) => {
      if (query.length < 3) {
        setSuggestions([]);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: { q: query, format: "json", addressdetails: 1, limit: 8 },
            headers: { "Accept-Language": "en" },
          }
        );
        setSuggestions(
          response.data.map((item) => ({
            display_name: item.display_name,
            lat: item.lat,
            lon: item.lon,
            place_id: item.place_id,
          }))
        );
      } catch (err) {
        if (retryCount < 3) {
          setTimeout(() => fetchSuggestions(query, retryCount + 1), Math.pow(2, retryCount) * 1000);
        } else {
          setError("Unable to fetch location suggestions. Please try again.");
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 500),
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
    if (!formData.about.longitude) newErrors.longitude = "Please select a location from the suggestions.";
    if (!formData.about.latitude) newErrors.latitude = "Please select a location from the suggestions.";
    if (!formData.about.about?.trim()) newErrors.about = "About section is required.";
    return newErrors;
  };

  const handleNext = () => {
    const validationErrors = validateStep2();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      setFormData((prev) => ({ ...prev, about: { ...prev.about, [field]: value } }));
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
    <CardShell
      stepLabel="Step 2 of 4"
      title="Store Profile"
      description="Set up your storefront — how customers will discover you"
      onBack={handleBack}
      onNext={handleNext}
    >
      <ProfileSetupForm
        formData={formData}
        handleInputChange={handleInputChange}
        handleImageChange={handleImageChange}
        handleChangeInput={handleChangeInput}
        errors={errors}
        suggestions={suggestions}
        handleSuggestionClick={handleSuggestionClick}
        isLoading={isLoading}
        error={error}
      />
    </CardShell>
  );
}