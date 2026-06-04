'use client';

import React, { useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import {
  Box, Card, Stack, Typography, Avatar, Chip, Divider, TextField,
  MenuItem, InputAdornment, Button, CircularProgress, Collapse, Paper,
  List, ListItemButton, ClickAwayListener,
} from "@mui/material";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import PhoneAndroidOutlinedIcon from "@mui/icons-material/PhoneAndroidOutlined";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import NumbersRoundedIcon from "@mui/icons-material/NumbersRounded";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PageContainer from './PageContainer';
import { createAxiosClient } from "@/utils/clientFetch";
import Swal from "sweetalert2";

const PAYMENT_METHODS = [
  { value: "momo", label: "Mobile Money" },
  { value: "bank", label: "Bank Transfer" },
];

const MOMO_PROVIDERS = [
  { value: "MTN", label: "MTN" },
  { value: "VODAFONE", label: "Vodafone" },
  { value: "AIRTELTIGO", label: "AirtelTigo" },
];

const COUNTRIES = [
  { value: "GH", label: "Ghana" },
  { value: "US", label: "United States" },
  { value: "EU", label: "European Union" },
];

const CURRENCIES = [
  { value: "GHS", label: "Ghanaian Cedi (GHS)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
];

// Payment-method verification status → design-base hue token + icon.
const STATUS_META = {
  verified: { hue: "green", label: "Verified", Icon: VerifiedRoundedIcon },
  rejected: { hue: "red", label: "Rejected", Icon: ErrorOutlineRoundedIcon },
  pending: { hue: "amber", label: "Pending", Icon: HourglassEmptyRoundedIcon },
};

const PaymentForm = () => {
  const pageTitle = "Payment Method";
  const axiosClient = createAxiosClient();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPaymentMethod, setHasPaymentMethod] = useState(false);
  const [bankSuggestions, setBankSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [formData, setFormData] = useState({
    paymentMethod: "momo",
    momoNumber: "",
    momoProvider: "",
    bankName: "",
    bankAccountName: "",
    bankAccountNumber: "",
    country: "GH",
    currency: "GHS",
  });

  const [paymentStatus, setPaymentStatus] = useState('pending');

  const fetchPaymentDetail = async () => {
    try {
      const response = await axiosClient.get("/api/v1/vendor/payment-method/");
      const data = response.data;
      if (data && Object.keys(data).length > 0) {
        setHasPaymentMethod(true);
        setFormData({
          paymentMethod: data.payment_method || "momo",
          momoNumber: data.momo_number || "",
          momoProvider: data.momo_provider || "",
          bankName: data.bank_name || "",
          bankAccountName: data.bank_account_name || "",
          bankAccountNumber: data.bank_account_number || "",
          country: data.country || "GH",
          currency: data.currency || "GHS",
        });
        setPaymentStatus(data.status || 'pending');
      } else {
        setHasPaymentMethod(false);
      }
    } catch (error) {
      setHasPaymentMethod(false);
      setPaymentStatus('pending');
    } finally {
      setLoading(false);
    }
  };

  const validateBankName = async (bankName) => {
    if (!bankName || formData.paymentMethod !== 'bank') {
      setBankSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    try {
      const response = await axiosClient.post("/api/v1/vendor/validate-bank/", { bank_name: bankName });
      if (response.data.match) {
        setBankSuggestions([response.data.match]);
        setShowSuggestions(true);
      } else {
        setBankSuggestions([]);
        setShowSuggestions(false);
        setErrors((prev) => ({ ...prev, bankName: "No matching bank found. Please check the name." }));
      }
    } catch (error) {
      setBankSuggestions([]);
      setShowSuggestions(false);
      setErrors((prev) => ({ ...prev, bankName: "Error validating bank name." }));
    }
  };

  const debouncedValidateBankName = useCallback(debounce(validateBankName, 300), [formData.paymentMethod]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
    if (name === "bankName") {
      debouncedValidateBankName(value);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setFormData({ ...formData, bankName: suggestion.name });
    setShowSuggestions(false);
    setErrors({ ...errors, bankName: "" });
  };

  const validateStep = () => {
    const newErrors = {};
    if (!formData.paymentMethod) {
      newErrors.paymentMethod = "Payment Method is required";
    }
    if (formData.paymentMethod === "momo") {
      if (!formData.momoNumber) {
        newErrors.momoNumber = "Mobile Money number is required";
      } else if (!/^\+?\d{10,15}$/.test(formData.momoNumber)) {
        newErrors.momoNumber = "Mobile Money number must be 10-15 digits";
      }
      if (!formData.momoProvider) {
        newErrors.momoProvider = "Mobile Money provider is required";
      }
    }
    if (formData.paymentMethod === "bank") {
      if (!formData.bankName) {
        newErrors.bankName = "Bank name is required";
      }
      if (!formData.bankAccountName) {
        newErrors.bankAccountName = "Bank account name is required";
      }
      if (!formData.bankAccountNumber) {
        newErrors.bankAccountNumber = "Bank account number is required";
      } else if (!/^\d{8,50}$/.test(formData.bankAccountNumber)) {
        newErrors.bankAccountNumber = "Bank account number must be 8-50 digits";
      }
    }
    if (formData.paymentMethod === "paypal") {
      if (!formData.momoNumber) {
        newErrors.momoNumber = "PayPal email or phone is required";
      } else if (!/^\S+@\S+\.\S+$|^\+?\d{10,15}$/.test(formData.momoNumber)) {
        newErrors.momoNumber = "Enter a valid email or phone number";
      }
    }
    if (!formData.country) {
      newErrors.country = "Country is required";
    }
    if (!formData.currency) {
      newErrors.currency = "Currency is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isValid = validateStep();
    if (!isValid) {
      Swal.fire({
        title: "Error!",
        text: "Please correct the errors before submitting.",
        icon: "error",
        confirmButtonText: "OK",
      });
      return;
    }

    const confirmResult = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to ${hasPaymentMethod ? "update" : "add"} your payment details?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#0071ce",
      cancelButtonColor: "#6b7280",
      confirmButtonText: `Yes, ${hasPaymentMethod ? "update" : "add"} it!`,
      cancelButtonText: "Cancel",
    });

    if (confirmResult.isConfirmed) {
      setIsSubmitting(true);
      const payload = {
        payment_method: formData.paymentMethod,
        momo_number: formData.momoNumber || null,
        momo_provider: formData.momoProvider || null,
        bank_name: formData.bankName || null,
        bank_account_name: formData.bankAccountName || null,
        bank_account_number: formData.bankAccountNumber || null,
        country: formData.country,
        currency: formData.currency,
      };

      try {
        await axiosClient.put("/api/v1/vendor/payment-method/", payload);
        await Swal.fire({
          title: hasPaymentMethod ? "Updated!" : "Added!",
          text: `Your payment details have been successfully ${hasPaymentMethod ? "updated" : "added"}.`,
          icon: "success",
          confirmButtonText: "OK",
        });
        setHasPaymentMethod(true);
        fetchPaymentDetail();
      } catch (error) {
        let errorMessage = `Something went wrong while ${hasPaymentMethod ? "updating" : "adding"} your payment details.`;
        if (error.response && error.response.data) {
          setErrors(error.response.data);
          errorMessage = Object.values(error.response.data).flat().join(" ");
        }
        await Swal.fire({
          title: "Error!",
          text: errorMessage,
          icon: "error",
          confirmButtonText: "OK",
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  useEffect(() => {
    fetchPaymentDetail();
    return () => {
      debouncedValidateBankName.cancel();
    };
  }, []);

  // Shared field styling — rounded inputs that match the dashboard.
  const fieldSx = { '& .MuiOutlinedInput-root': { borderRadius: '12px' } };

  if (loading) {
    return (
      <PageContainer
        title={pageTitle}
        breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: pageTitle }]}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  const status = STATUS_META[paymentStatus] || STATUS_META.pending;

  return (
    <PageContainer
      title={pageTitle}
      breadcrumbs={[{ title: 'Home', path: '/dashboard' }, { title: pageTitle }]}
    >
      <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
        <Card
          variant="outlined"
          sx={{ borderRadius: '20px', borderColor: 'divider', overflow: 'visible' }}
        >
          {/* Header */}
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: hasPaymentMethod ? 2.5 : 0 }}>
              <Avatar
                variant="rounded"
                sx={{ bgcolor: (t) => `${t.palette.brand.blue}1f`, color: 'brand.blue', width: 48, height: 48, borderRadius: '14px' }}
              >
                <AccountBalanceWalletOutlinedIcon />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontFamily: "'Cormorant Garamond', serif", fontSize: { xs: 22, sm: 26 }, fontWeight: 700, letterSpacing: '-0.5px', lineHeight: 1.2 }} color="text.primary">
                  {hasPaymentMethod ? "Update payment method" : "Set up payment method"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Where your sales payouts will be sent.
                </Typography>
              </Box>
              {hasPaymentMethod && (
                <Chip
                  size="small"
                  icon={<status.Icon sx={{ fontSize: '16px !important' }} />}
                  label={status.label}
                  sx={{
                    fontWeight: 700, fontSize: 11, borderRadius: '8px',
                    bgcolor: `status.${status.hue}.bg`,
                    color: `status.${status.hue}.text`,
                    '& .MuiChip-icon': { color: `status.${status.hue}.text` },
                  }}
                />
              )}
            </Stack>
          </Box>

          <Divider />

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack spacing={2.5}>
              <TextField
                select
                fullWidth
                name="paymentMethod"
                label="Payment method"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                error={Boolean(errors.paymentMethod)}
                helperText={errors.paymentMethod}
                sx={fieldSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PaymentsOutlinedIcon fontSize="small" color="action" />
                    </InputAdornment>
                  ),
                }}
              >
                {PAYMENT_METHODS.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </TextField>

              {/* Mobile Money */}
              <Collapse in={formData.paymentMethod === "momo"} unmountOnExit>
                <Stack spacing={2.5}>
                  <TextField
                    fullWidth
                    name="momoNumber"
                    label="Mobile Money number"
                    placeholder="e.g. 0241234567"
                    value={formData.momoNumber}
                    onChange={handleInputChange}
                    error={Boolean(errors.momoNumber)}
                    helperText={errors.momoNumber}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PhoneAndroidOutlinedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    select
                    fullWidth
                    name="momoProvider"
                    label="Mobile Money provider"
                    value={formData.momoProvider}
                    onChange={handleInputChange}
                    error={Boolean(errors.momoProvider)}
                    helperText={errors.momoProvider}
                    sx={fieldSx}
                  >
                    <MenuItem value=""><em>Select provider</em></MenuItem>
                    {MOMO_PROVIDERS.map((p) => (
                      <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>
                    ))}
                  </TextField>
                </Stack>
              </Collapse>

              {/* Bank */}
              <Collapse in={formData.paymentMethod === "bank"} unmountOnExit>
                <Stack spacing={2.5}>
                  <ClickAwayListener onClickAway={() => setShowSuggestions(false)}>
                    <Box sx={{ position: 'relative' }}>
                      <TextField
                        fullWidth
                        name="bankName"
                        label="Bank name"
                        placeholder="Enter bank name"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        error={Boolean(errors.bankName)}
                        helperText={errors.bankName}
                        sx={fieldSx}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AccountBalanceOutlinedIcon fontSize="small" color="action" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {showSuggestions && bankSuggestions.length > 0 && (
                        <Paper
                          elevation={4}
                          sx={{ position: 'absolute', zIndex: 20, mt: 0.5, width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}
                        >
                          <List disablePadding>
                            {bankSuggestions.map((suggestion, index) => (
                              <ListItemButton key={index} onClick={() => handleSuggestionClick(suggestion)} sx={{ py: 1.25 }}>
                                <AccountBalanceOutlinedIcon fontSize="small" sx={{ mr: 1.5, color: 'text.disabled' }} />
                                <Typography variant="body2">{suggestion.name}</Typography>
                              </ListItemButton>
                            ))}
                          </List>
                        </Paper>
                      )}
                    </Box>
                  </ClickAwayListener>

                  <TextField
                    fullWidth
                    name="bankAccountName"
                    label="Account name"
                    placeholder="Account holder name"
                    value={formData.bankAccountName}
                    onChange={handleInputChange}
                    error={Boolean(errors.bankAccountName)}
                    helperText={errors.bankAccountName}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonOutlineRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    name="bankAccountNumber"
                    label="Account number"
                    placeholder="Enter account number"
                    value={formData.bankAccountNumber}
                    onChange={handleInputChange}
                    error={Boolean(errors.bankAccountNumber)}
                    helperText={errors.bankAccountNumber}
                    sx={fieldSx}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <NumbersRoundedIcon fontSize="small" color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Stack>
              </Collapse>

              <Divider sx={{ '&::before, &::after': { borderColor: 'divider' } }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  Region
                </Typography>
              </Divider>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
                <TextField
                  select
                  fullWidth
                  name="country"
                  label="Country"
                  value={formData.country}
                  onChange={handleInputChange}
                  error={Boolean(errors.country)}
                  helperText={errors.country}
                  sx={fieldSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PublicOutlinedIcon fontSize="small" color="action" />
                      </InputAdornment>
                    ),
                  }}
                >
                  {COUNTRIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  name="currency"
                  label="Currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  error={Boolean(errors.currency)}
                  helperText={errors.currency}
                  sx={fieldSx}
                >
                  {CURRENCIES.map((c) => (
                    <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disableElevation
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={18} color="inherit" /> : null}
                sx={{ borderRadius: '12px', fontWeight: 700, py: 1.25, textTransform: 'none', fontSize: 15 }}
              >
                {isSubmitting
                  ? (hasPaymentMethod ? "Updating…" : "Adding…")
                  : (hasPaymentMethod ? "Update payment details" : "Add payment details")}
              </Button>

              <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                <LockOutlinedIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                <Typography variant="caption" color="text.disabled">
                  Your details are encrypted and used only for payouts.
                </Typography>
              </Stack>
            </Stack>
          </Box>
        </Card>
      </Box>
    </PageContainer>
  );
};

export default PaymentForm;
