// app/_components/PaymentMethodForm.jsx
import React from "react";
import { Box, Typography, TextField, MenuItem, Grid } from "@mui/material";

const PaymentMethodForm = ({ formData, handleInputChange, errors, currencyOptions, countryOptions }) => {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Set Up Your Payment Method
      </Typography>
      <TextField
        select
        label="Payment Method"
        name="payment_method.payment_method"
        value={formData.payment_method.payment_method}
        onChange={handleInputChange}
        error={!!errors.payment_method}
        helperText={errors.payment_method}
        fullWidth
        sx={{ mb: 2 }}
      >
        <MenuItem value="momo">Mobile Money</MenuItem>
        <MenuItem value="bank">Bank Transfer</MenuItem>
        <MenuItem value="paypal">PayPal</MenuItem>
      </TextField>
      <TextField
        select
        label="Payment Country"
        name="payment_method.country"
        value={formData.payment_method.country}
        onChange={handleInputChange}
        error={!!errors.payment_method_country}
        helperText={errors.payment_method_country}
        fullWidth
        sx={{ mb: 2 }}
      >
        {countryOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Currency"
        name="payment_method.currency"
        value={formData.payment_method.currency}
        onChange={handleInputChange}
        error={!!errors.payment_method_currency}
        helperText={errors.payment_method_currency}
        fullWidth
        sx={{ mb: 2 }}
      >
        {currencyOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {formData.payment_method.payment_method === "momo" && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mobile Money Number"
              name="payment_method.momo_number"
              value={formData.payment_method.momo_number}
              onChange={handleInputChange}
              error={!!errors.momo_number}
              helperText={errors.momo_number}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              select
              label="Mobile Money Provider"
              name="payment_method.momo_provider"
              value={formData.payment_method.momo_provider}
              onChange={handleInputChange}
              error={!!errors.momo_provider}
              helperText={errors.momo_provider}
              fullWidth
              sx={{ mb: 2 }}
            >
              <MenuItem value="MTN">MTN</MenuItem>
              <MenuItem value="VODAFONE">Vodafone</MenuItem>
              <MenuItem value="AIRTELTIGO">AirtelTigo</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      )}
      {formData.payment_method.payment_method === "bank" && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bank Name"
              name="payment_method.bank_name"
              value={formData.payment_method.bank_name}
              onChange={handleInputChange}
              error={!!errors.bank_name}
              helperText={errors.bank_name}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Name"
              name="payment_method.bank_account_name"
              value={formData.payment_method.bank_account_name}
              onChange={handleInputChange}
              error={!!errors.bank_account_name}
              helperText={errors.bank_account_name}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Account Number"
              name="payment_method.bank_account_number"
              value={formData.payment_method.bank_account_number}
              onChange={handleInputChange}
              error={!!errors.bank_account_number}
              helperText={errors.bank_account_number}
              sx={{ mb: 2 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Routing Number (Optional)"
              name="payment_method.bank_routing_number"
              value={formData.payment_method.bank_routing_number}
              onChange={handleInputChange}
              error={!!errors.bank_routing_number}
              helperText={errors.bank_routing_number}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
      )}
      {formData.payment_method.payment_method === "paypal" && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="PayPal Email or Phone"
              name="payment_method.momo_number"
              value={formData.payment_method.momo_number}
              onChange={handleInputChange}
              error={!!errors.momo_number}
              helperText={errors.momo_number}
              sx={{ mb: 2 }}
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default PaymentMethodForm;