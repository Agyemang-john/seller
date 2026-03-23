"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SellerFormProvider } from "./SellerFormContext";
import { Box, Container, Typography, Link } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

const steps = [
  { label: "Business", sublabel: "Info" },
  { label: "Profile", sublabel: "Setup" },
  { label: "Payment", sublabel: "Method" },
  { label: "Review", sublabel: "& Submit" },
];

const STEP_PATHS = [
  "/register/step-1",
  "/register/step-2",
  "/register/step-3",
  "/register/step-4",
];

export default function SellerSignUpLayout({ children }) {
  const pathname = usePathname();
  const activeStep = STEP_PATHS.indexOf(pathname);

  return (
    <SellerFormProvider>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f0f4ff",
          pb: 6,
        }}
      >
        {/* Header Banner */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a56db 0%, #1240a8 100%)",
            pt: { xs: 4, md: 5 },
            pb: { xs: 5, md: 6 },
            px: 2,
            position: "relative",
            overflow: "hidden",
            "&::before": {
              content: '""',
              position: "absolute",
              top: -60,
              right: -60,
              width: 220,
              height: 220,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.06)",
            },
            "&::after": {
              content: '""',
              position: "absolute",
              bottom: -40,
              left: "30%",
              width: 160,
              height: 160,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.04)",
            },
          }}
        >
          <Container maxWidth="sm" sx={{ position: "relative", zIndex: 1 }}>
            <Typography
              sx={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
                mb: 0.75,
              }}
            >
              Vendor Registration
            </Typography>
            <Typography
              variant="h4"
              sx={{
                color: "white",
                fontWeight: 700,
                fontSize: { xs: "1.6rem", md: "2rem" },
                lineHeight: 1.2,
                mb: 0.5,
              }}
            >
              Start Selling on Negromart Today
            </Typography>
            <Typography sx={{ color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
              Join thousands of vendors on Negromart's marketplace
            </Typography>
          </Container>
        </Box>

        <Container sx={{ mt: { xs: -1, md: -1 } }}>
          {/* Step Indicator */}
          {activeStep >= 0 && (
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                py: 3,
                px: 1,
              }}
            >
              {steps.map((step, index) => {
                const isDone = index < activeStep;
                const isActive = index === activeStep;
                return (
                  <React.Fragment key={step.label}>
                    {/* Step circle + label */}
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 600,
                          transition: "all 0.2s",
                          ...(isDone && {
                            bgcolor: "#1a56db",
                            color: "white",
                            boxShadow: "none",
                          }),
                          ...(isActive && {
                            bgcolor: "#1a56db",
                            color: "white",
                            boxShadow: "0 0 0 4px rgba(26,86,219,0.2)",
                          }),
                          ...(!isDone && !isActive && {
                            bgcolor: "white",
                            color: "#94a3b8",
                            border: "1.5px solid #e2e8f0",
                          }),
                        }}
                      >
                        {isDone ? <CheckIcon sx={{ fontSize: 16 }} /> : index + 1}
                      </Box>
                      <Typography
                        sx={{
                          fontSize: 11,
                          fontWeight: 500,
                          mt: 0.75,
                          color: isActive ? "#1a56db" : isDone ? "#64748b" : "#94a3b8",
                          textAlign: "center",
                          lineHeight: 1.3,
                        }}
                      >
                        {step.label}
                      </Typography>
                    </Box>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <Box
                        sx={{
                          height: 2,
                          flex: 1,
                          mt: "17px",
                          mx: 0.5,
                          bgcolor: index < activeStep ? "#1a56db" : "#e2e8f0",
                          transition: "background-color 0.3s",
                        }}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </Box>
          )}

          {/* Form Card */}
          <Box
            sx={{
              bgcolor: "white",
              borderRadius: 3,
              // boxShadow: "0 1px 4px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.06)",
              overflow: "hidden",
              // border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            {children}
          </Box>

          {/* Footer */}
          <Box textAlign="center" sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: 13, color: "#64748b" }}>
              Already have a seller account?{" "}
              <Link
                href="/auth/login"
                underline="hover"
                sx={{ color: "#1a56db", fontWeight: 500 }}
              >
                Log in here
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </SellerFormProvider>
  );
}