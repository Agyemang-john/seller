"use client";

import React from "react";
import { Container, Typography, Stepper, Step, StepLabel, Link, Box } from "@mui/material";
import { usePathname } from "next/navigation";
import { SellerFormProvider } from "./SellerFormContext";

const steps = ["Business Information", "Profile Setup", "Payment Information", "Complete"];

export default function SellerSignUpLayout({ children }) {
  const pathname = usePathname();
  const activeStep = ["/register/step-1", "/register/step-2", "/register/step-3", "/register/step-4"].indexOf(pathname);

  return (
    <SellerFormProvider>
      <Container maxWidth="md" sx={{ py: 6, bgcolor: "#ffffffff" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mb: 4 }}>
          Seller Registration
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        {children}
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography>
            Already have an account?{" "}
            <Link href="/auth/login" underline="hover">
              Log in here
            </Link>
          </Typography>
        </Box>
      </Container>
    </SellerFormProvider>
  );
}