"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CardShell from "../_components/CardShell";
import { useSellerForm } from "../SellerFormContext";
import { createAxiosClient } from "@/utils/clientFetch";
import Swal from "sweetalert2";

// ─── Review Section ───────────────────────────────────────────────────────────
const ReviewSection = ({ title, editPath, rows }) => {
  const router = useRouter();
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.secondary",
          }}
        >
          {title}
        </Typography>
        <Button
          size="small"
          onClick={() => router.push(editPath)}
          startIcon={<EditOutlinedIcon sx={{ fontSize: 13 }} />}
          sx={{
            textTransform: "none",
            fontSize: 12,
            fontWeight: 500,
            color: "#1a56db",
            minWidth: 0,
            py: 0.25,
            px: 1,
            "&:hover": { bgcolor: "#e8f0fe" },
          }}
        >
          Edit
        </Button>
      </Box>
      <Box sx={{ borderRadius: 2, border: "1px solid rgba(0,0,0,0.08)", overflow: "hidden" }}>
        {rows.map((row, i) => (
          <Box
            key={i}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              px: 2,
              py: 1.25,
              bgcolor: i % 2 === 0 ? "white" : "#f8fafc",
              gap: 2,
            }}
          >
            <Typography sx={{ fontSize: 13, color: "text.secondary", flexShrink: 0 }}>
              {row.label}
            </Typography>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 500,
                textAlign: "right",
                maxWidth: "60%",
                wordBreak: "break-word",
              }}
            >
              {row.value || "—"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Step4() {
  const axiosClient = createAxiosClient();
  const { formData } = useSellerForm();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateAllSteps = () => {
    const newErrors = {};
    // Step 1
    if (!formData.name?.trim()) newErrors.name = "Store name is required (Step 1).";
    if (!formData.email?.trim()) newErrors.email = "Business email is required (Step 1).";
    if (!formData.contact?.trim()) newErrors.contact = "Phone number is required (Step 1).";
    else if (!/^\+?\d{9,15}$/.test(formData.contact.replace(/\s/g, "")))
      newErrors.contact = "Invalid phone number (Step 1).";
    if (!formData.country) newErrors.country = "Country is required (Step 1).";
    if (!formData.vendor_type) newErrors.vendor_type = "Vendor type is required (Step 1).";
    if (!formData.business_type) newErrors.business_type = "Business type is required (Step 1).";
    if (formData.vendor_type === "student" && !formData.student_id?.file)
      newErrors.student_id = "Student ID is required (Step 1).";
    if (formData.vendor_type === "non_student" && !formData.government_issued_id?.file)
      newErrors.government_issued_id = "Government-issued ID is required (Step 1).";
    if (!formData.proof_of_address?.file)
      newErrors.proof_of_address = "Proof of address is required (Step 1).";
    // Step 2
    if (!formData.about.profile_image?.file) newErrors.profile_image = "Business logo is required (Step 2).";
    if (!formData.about.cover_image?.file) newErrors.cover_image = "Cover image is required (Step 2).";
    if (!formData.about.address?.trim()) newErrors.address = "Store location is required (Step 2).";
    if (!formData.about.about?.trim()) newErrors.about = "About section is required (Step 2).";
    // Step 3
    const pm = formData.payment_method;
    if (!pm.payment_method) newErrors.payment_method = "Payment method is required (Step 3).";
    if (pm.payment_method === "momo") {
      if (!pm.momo_number?.trim()) newErrors.momo_number = "Mobile money number is required (Step 3).";
      if (!pm.momo_provider?.trim()) newErrors.momo_provider = "Provider is required (Step 3).";
    }
    if (pm.payment_method === "bank") {
      if (!pm.bank_name?.trim()) newErrors.bank_name = "Bank name is required (Step 3).";
      if (!pm.bank_account_name?.trim()) newErrors.bank_account_name = "Account name is required (Step 3).";
      if (!pm.bank_account_number?.trim()) newErrors.bank_account_number = "Account number is required (Step 3).";
    }
    if (pm.payment_method === "paypal") {
      if (!pm.momo_number?.trim()) newErrors.momo_number = "PayPal email/phone is required (Step 3).";
    }
    if (!pm.country) newErrors.payment_method_country = "Payment country is required (Step 3).";
    if (!pm.currency) newErrors.payment_method_currency = "Currency is required (Step 3).";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateAllSteps();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        html: `Please complete the following:<br/><ul style="text-align:left;margin-top:8px;">${Object.values(validationErrors)
          .map((e) => `<li>${e}</li>`)
          .join("")}</ul>`,
        confirmButtonColor: "#1a56db",
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
    if (formData.tax_id) dataToSend.append("tax_id", formData.tax_id);

    Object.entries(formData.about).forEach(([key, value]) => {
      if (key === "profile_image" && value?.file) dataToSend.append("about.profile_image", value.file);
      else if (key === "cover_image" && value?.file) dataToSend.append("about.cover_image", value.file);
      else if (value && typeof value !== "object") dataToSend.append(`about.${key}`, value);
    });

    Object.entries(formData.payment_method).forEach(([key, value]) => {
      if (value) dataToSend.append(`payment_method.${key}`, value);
    });

    try {
      await axiosClient.post("/api/v1/vendor/register/", dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      Swal.fire({
        icon: "success",
        title: "Application Submitted!",
        text: "Your vendor registration is under review. You'll hear from us within 24–48 hours.",
        confirmButtonColor: "#1a56db",
      }).then(() => {
        sessionStorage.removeItem("seller-form-data");
        router.push("/");
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text:
          error.response?.data?.error ||
          Object.values(error.response?.data || {}).flat().join(", ") ||
          "Something went wrong. Please try again.",
        confirmButtonColor: "#1a56db",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => router.push("/register/step-3");

  const pm = formData.payment_method;
  const paymentDetails =
    pm.payment_method === "momo"
      ? `${pm.momo_provider} · ${pm.momo_number}`
      : pm.payment_method === "bank"
      ? `${pm.bank_name} · ${pm.bank_account_number}`
      : pm.momo_number;

  const businessTypeLabels = {
    sole_proprietor: "Sole Proprietor",
    partnership: "Partnership",
    corporation: "Corporation",
    llc: "LLC",
    non_profit: "Non-Profit",
    other: "Other",
  };

  const paymentMethodLabels = {
    momo: "Mobile Money",
    bank: "Bank Transfer",
    paypal: "PayPal",
  };

  return (
    <CardShell
      stepLabel="Step 4 of 4"
      title="Review & Submit"
      description="Check your details before completing registration"
      onBack={handleBack}
      onNext={handleSubmit}
      nextLabel="Submit Registration"
      loading={loading}
    >
      {Object.keys(errors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography fontWeight={500} fontSize={13}>Please fix errors before submitting:</Typography>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18 }}>
            {Object.values(errors).map((err, i) => (
              <li key={i} style={{ fontSize: 13 }}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      <ReviewSection
        title="Business Details"
        editPath="/register/step-1"
        rows={[
          { label: "Store name", value: formData.name },
          { label: "Email", value: formData.email },
          { label: "Phone", value: formData.contact },
          { label: "Country", value: formData.country },
          { label: "Vendor type", value: formData.vendor_type === "student" ? "Student" : "Non-Student" },
          { label: "Business type", value: businessTypeLabels[formData.business_type] || formData.business_type },
          { label: "Student ID", value: formData.student_id?.file?.name },
          { label: "Gov. ID", value: formData.government_issued_id?.file?.name },
          { label: "Proof of address", value: formData.proof_of_address?.file?.name },
          ...(formData.license?.file ? [{ label: "Business license", value: formData.license.file.name }] : []),
          ...(formData.tax_id ? [{ label: "Tax ID", value: formData.tax_id }] : []),
        ].filter((r) => r.value)}
      />

      <ReviewSection
        title="Store Profile"
        editPath="/register/step-2"
        rows={[
          { label: "Location", value: formData.about.address },
          { label: "About", value: formData.about.about?.length > 100 ? formData.about.about.substring(0, 100) + "..." : formData.about.about },
          { label: "Logo", value: formData.about.profile_image?.file?.name },
          { label: "Cover image", value: formData.about.cover_image?.file?.name },
        ].filter((r) => r.value)}
      />

      <ReviewSection
        title="Payment"
        editPath="/register/step-3"
        rows={[
          { label: "Method", value: paymentMethodLabels[pm.payment_method] },
          { label: "Details", value: paymentDetails },
          { label: "Country", value: pm.country },
          { label: "Currency", value: pm.currency },
        ].filter((r) => r.value)}
      />

      {/* Confirmation note */}
      <Box
        sx={{
          bgcolor: "#e8f0fe",
          borderRadius: 2,
          border: "1px solid rgba(26,86,219,0.2)",
          p: 2,
          display: "flex",
          gap: 1.5,
          alignItems: "flex-start",
        }}
      >
        <CheckCircleOutlineIcon sx={{ color: "#1a56db", fontSize: 20, mt: 0.1, flexShrink: 0 }} />
        <Typography sx={{ fontSize: 13, color: "#1a56db", lineHeight: 1.6 }}>
          By submitting, you confirm all information is accurate. Your application will be reviewed
          within <strong>24–48 hours</strong> and you'll be notified by email.
        </Typography>
      </Box>
    </CardShell>
  );
}