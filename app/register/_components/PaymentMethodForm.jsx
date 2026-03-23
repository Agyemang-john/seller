import React from "react";
import {
  Box,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";
import PaymentIcon from "@mui/icons-material/Payment";

// ─── Section Heading ─────────────────────────────────────────────────────────
const SectionHeading = ({ children }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: "text.secondary",
      mb: 2,
    }}
  >
    {children}
  </Typography>
);

// ─── Payment Method Card ──────────────────────────────────────────────────────
const MethodCard = ({ icon, label, value, selected, onClick }) => (
  <Box
    onClick={onClick}
    sx={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 1,
      p: "14px 8px",
      border: selected ? "2px solid #1a56db" : "1.5px solid rgba(0,0,0,0.15)",
      borderRadius: 2,
      cursor: "pointer",
      bgcolor: selected ? "#e8f0fe" : "white",
      boxShadow: selected ? "0 0 0 3px rgba(26,86,219,0.12)" : "none",
      transition: "all 0.15s",
      "&:hover": {
        borderColor: "#1a56db",
        bgcolor: "#e8f0fe",
      },
    }}
  >
    <Box
      sx={{
        color: selected ? "#1a56db" : "text.secondary",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {icon}
    </Box>
    <Typography
      sx={{
        fontSize: 12,
        fontWeight: 600,
        color: selected ? "#1a56db" : "text.secondary",
        textAlign: "center",
        lineHeight: 1.3,
      }}
    >
      {label}
    </Typography>
  </Box>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const PaymentMethodForm = ({
  formData,
  handleInputChange,
  errors,
  currencyOptions,
  countryOptions,
}) => {
  const method = formData.payment_method.payment_method;

  return (
    <Box>
      {/* Method selector */}
      <SectionHeading>Choose payment method</SectionHeading>

      <Box sx={{ display: "flex", gap: 1.5, mb: 3 }}>
        <MethodCard
          icon={<SmartphoneIcon />}
          label="Mobile Money"
          value="momo"
          selected={method === "momo"}
          onClick={() => handleInputChange({ target: { name: "payment_method.payment_method", value: "momo" } })}
        />
        <MethodCard
          icon={<AccountBalanceIcon />}
          label="Bank Transfer"
          value="bank"
          selected={method === "bank"}
          onClick={() => handleInputChange({ target: { name: "payment_method.payment_method", value: "bank" } })}
        />
        <MethodCard
          icon={<PaymentIcon />}
          label="PayPal"
          value="paypal"
          selected={method === "paypal"}
          onClick={() => handleInputChange({ target: { name: "payment_method.payment_method", value: "paypal" } })}
        />
      </Box>

      {errors.payment_method && (
        <Typography sx={{ fontSize: 12, color: "error.main", mt: -1.5, mb: 2 }}>
          {errors.payment_method}
        </Typography>
      )}

      {/* Mobile Money Fields */}
      {method === "momo" && (
        <>
          <SectionHeading>Mobile money details</SectionHeading>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Mobile money number"
              name="payment_method.momo_number"
              value={formData.payment_method.momo_number}
              onChange={handleInputChange}
              error={!!errors.momo_number}
              helperText={errors.momo_number}
              required
              size="small"
              placeholder="+233 20 000 0000"
            />
            <TextField
              select
              fullWidth
              label="Provider"
              name="payment_method.momo_provider"
              value={formData.payment_method.momo_provider}
              onChange={handleInputChange}
              error={!!errors.momo_provider}
              helperText={errors.momo_provider}
              required
              size="small"
            >
              <MenuItem value="">Select provider</MenuItem>
              <MenuItem value="MTN">MTN</MenuItem>
              <MenuItem value="VODAFONE">Vodafone</MenuItem>
              <MenuItem value="AIRTELTIGO">AirtelTigo</MenuItem>
            </TextField>
          </Box>
        </>
      )}

      {/* Bank Transfer Fields */}
      {method === "bank" && (
        <>
          <SectionHeading>Bank account details</SectionHeading>
          <TextField
            fullWidth
            label="Bank name"
            name="payment_method.bank_name"
            value={formData.payment_method.bank_name}
            onChange={handleInputChange}
            error={!!errors.bank_name}
            helperText={errors.bank_name}
            required
            size="small"
            sx={{ mb: 2 }}
            placeholder="e.g. GCB Bank"
          />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Account name"
              name="payment_method.bank_account_name"
              value={formData.payment_method.bank_account_name}
              onChange={handleInputChange}
              error={!!errors.bank_account_name}
              helperText={errors.bank_account_name}
              required
              size="small"
            />
            <TextField
              fullWidth
              label="Account number"
              name="payment_method.bank_account_number"
              value={formData.payment_method.bank_account_number}
              onChange={handleInputChange}
              error={!!errors.bank_account_number}
              helperText={errors.bank_account_number}
              required
              size="small"
            />
          </Box>
          <TextField
            fullWidth
            label="Routing number"
            name="payment_method.bank_routing_number"
            value={formData.payment_method.bank_routing_number}
            onChange={handleInputChange}
            size="small"
            placeholder="For international transfers (optional)"
            InputProps={{
              endAdornment: (
                <Typography sx={{ fontSize: 11, color: "text.disabled", whiteSpace: "nowrap" }}>
                  optional
                </Typography>
              ),
            }}
          />
        </>
      )}

      {/* PayPal Fields */}
      {method === "paypal" && (
        <>
          <SectionHeading>PayPal details</SectionHeading>
          <TextField
            fullWidth
            label="PayPal email or phone"
            name="payment_method.momo_number"
            value={formData.payment_method.momo_number}
            onChange={handleInputChange}
            error={!!errors.momo_number}
            helperText={errors.momo_number || "Enter the email or phone linked to your PayPal account"}
            required
            size="small"
            placeholder="you@email.com or +1 555 000 0000"
          />
        </>
      )}

      {/* Country & Currency */}
      <Box sx={{ borderTop: "1px solid rgba(0,0,0,0.08)", mt: 3, mb: 2.5 }} />
      <SectionHeading>Region & currency</SectionHeading>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
        <TextField
          select
          fullWidth
          label="Payment country"
          name="payment_method.country"
          value={formData.payment_method.country}
          onChange={handleInputChange}
          error={!!errors.payment_method_country}
          helperText={errors.payment_method_country}
          required
          size="small"
        >
          {countryOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
        <TextField
          select
          fullWidth
          label="Currency"
          name="payment_method.currency"
          value={formData.payment_method.currency}
          onChange={handleInputChange}
          error={!!errors.payment_method_currency}
          helperText={errors.payment_method_currency}
          required
          size="small"
        >
          {currencyOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};

export default PaymentMethodForm;