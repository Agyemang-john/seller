// app/register/page.jsx
"use client";

import React, { useState } from "react";
import { Container, Typography, Stepper, Step, StepLabel, Paper, Box, Link } from "@mui/material";
import { SellerFormProvider } from "../SellerFormContext";
import Step1 from "./step-1/page";
import Step2 from "./step-2/page";
import Step3 from "./step-3/page";
import Step4 from "./step-4/page";

const steps = ["Business Information", "Profile Setup", "Payment Information", "Complete"];

const SellerSignUp = () => {
  const [activeStep, setActiveStep] = useState(0);

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return <Step1 setActiveStep={setActiveStep} />;
      case 1:
        return <Step2 setActiveStep={setActiveStep} />;
      case 2:
        return <Step3 setActiveStep={setActiveStep} />;
      case 3:
        return <Step4 setActiveStep={setActiveStep} />;
      default:
        return <Typography>Error: Unknown step.</Typography>;
    }
  };

  return (
    <SellerFormProvider>
      <Container maxWidth="md" sx={{ py: 6, bgcolor: "#f5faff" }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", textAlign: "center", mb: 4 }}>
          Seller Sign-Up
        </Typography>
        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Paper elevation={0} sx={{ p: 4, borderRadius: 0 }}>
          {renderStepContent(activeStep)}
        </Paper>
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography>
            Already have an account?{" "}
            <Link href="/login" underline="hover">
              Log in here
            </Link>
          </Typography>
        </Box>
      </Container>
    </SellerFormProvider>
  );
};

export default SellerSignUp;