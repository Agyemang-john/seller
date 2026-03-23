"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SellerFormProvider } from "./SellerFormContext";
import { Box, Container, Typography, Link } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";

// ─── Design tokens (keep in sync with register-page.jsx) ────────────────────
const T = {
  bg:          "#f9f9f9",
  surface:     "#ffffff",
  border:      "#e5e7eb",
  borderMid:   "#d1d5db",
  accent:      "#111827",
  accentHover: "#374151",
  accentSoft:  "#f3f4f6",
  text:        "#111827",
  textSub:     "#4b5563",
  textMuted:   "#9ca3af",
  radiusLg:    "12px",
  shadowSm:    "0 1px 3px rgba(0,0,0,0.07)",
  shadowMd:    "0 4px 12px rgba(0,0,0,0.08)",
};

const steps = [
  { label: "Business" },
  { label: "Profile" },
  { label: "Payment" },
  { label: "Review" },
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
      <Box sx={{ bgcolor: T.bg, minHeight: "100vh", pb: 8 }}>

        {/* ── Page header ─────────────────────────────────────────────── */}
        <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
          <Container maxWidth="sm" sx={{ px: { xs: 2.5, md: 3 }, pt: 3.5, pb: 4 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "1.4rem", md: "1.7rem" },
                letterSpacing: "-0.5px",
                color: T.text,
                mb: 0.5,
              }}
            >
              Start Selling on Negromart
            </Typography>
            <Typography sx={{ fontSize: "14px", color: T.textSub }}>
              Join thousands of vendors on Negromart's marketplace
            </Typography>
          </Container>
        </Box>

        <Container maxWidth="sm" sx={{ px: { xs: 2.5, md: 3 }, mt: 4 }}>

          {/* ── Step indicator ──────────────────────────────────────── */}
          {activeStep >= 0 && (
            <Box sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-start",
                }}
              >
                {steps.map((step, index) => {
                  const isDone   = index < activeStep;
                  const isActive = index === activeStep;
                  return (
                    <React.Fragment key={step.label}>
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
                        {/* Circle */}
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: 700,
                            transition: "all 0.2s",
                            ...(isDone && {
                              bgcolor: T.accent,
                              color: "#fff",
                              border: "none",
                            }),
                            ...(isActive && {
                              bgcolor: T.accent,
                              color: "#fff",
                              boxShadow: "0 0 0 4px rgba(17,24,39,0.1)",
                            }),
                            ...(!isDone && !isActive && {
                              bgcolor: T.surface,
                              color: T.textMuted,
                              border: `1.5px solid ${T.borderMid}`,
                            }),
                          }}
                        >
                          {isDone ? <CheckIcon sx={{ fontSize: 14 }} /> : index + 1}
                        </Box>
                        {/* Label */}
                        <Typography
                          sx={{
                            fontSize: "11px",
                            fontWeight: 500,
                            mt: 0.75,
                            color: isActive ? T.text : isDone ? T.textSub : T.textMuted,
                            textAlign: "center",
                          }}
                        >
                          {step.label}
                        </Typography>
                      </Box>

                      {/* Connector */}
                      {index < steps.length - 1 && (
                        <Box
                          sx={{
                            height: "1.5px",
                            flex: 1,
                            mt: "15px",
                            mx: 0.5,
                            bgcolor: index < activeStep ? T.accent : T.border,
                            transition: "background-color 0.3s",
                          }}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </Box>
            </Box>
          )}

          {/* ── Form card ───────────────────────────────────────────── */}
          <Box
            sx={{
              bgcolor: T.surface,
              // border: `1px solid ${T.border}`,
              // borderRadius: T.radiusLg,
              overflow: "hidden",
              // boxShadow: T.shadowSm,
            }}
          >
            {children}
          </Box>

          {/* ── Footer note ─────────────────────────────────────────── */}
          <Box textAlign="center" sx={{ mt: 3 }}>
            <Typography sx={{ fontSize: "13px", color: T.textMuted }}>
              Already have a seller account?{" "}
              <Link href="/auth/login" underline="hover" sx={{ color: T.text, fontWeight: 600 }}>
                Log in here
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </SellerFormProvider>
  );
}