"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import { InfoIcon } from "lucide-react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/Lock";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

const features = [
  {
    icon: <InfoIcon sx={{ fontSize: 28 }} />,
    title: "You must be a registered user before you can sell on Negromart.",
    desc: (
      <>
        If not registered, please sign up as a user first.{" "}
        <a
          href="https://www.negromart.com"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#1a56db", fontWeight: 600 }}
        >
          www.negromart.com
        </a>{" "}
        then return here to create your vendor account.
      </>
    ),
  },
  {
    icon: <StoreIcon sx={{ fontSize: 28 }} />,
    title: "Your own storefront",
    desc: "Customise your store with your logo, cover photo and business description.",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
    title: "Grow your sales",
    desc: "Reach thousands of customers already shopping on Negromart every day.",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 28 }} />,
    title: "Student-friendly",
    desc: "Special onboarding for student vendors with simplified verification.",
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 28 }} />,
    title: "Secure payouts",
    desc: "Get paid via Mobile Money or bank transfer — whichever works for you.",
  },
];

export default function SellerRegisterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST}/api/v1/vendor/check`, {
      method: "GET",
      credentials: "include",
      headers: {
        "X-User-Type": "customer",
      },
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f0f4ff" }}>
      {/* Hero */}
      <Box
        sx={{
          // background: "linear-gradient(135deg, #1a56db 0%, #1240a8 100%)",
          pt: { xs: 7, md: 10 },
          pb: { xs: 8, md: 11 },
          px: 2,
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: -80, right: -80,
            width: 320, height: 320,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -60, left: "20%",
            width: 240, height: 240,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          },
        }}
      >
        <Container  sx={{ textAlign: "center", position: "relative", zIndex: 1 }}>
          <Typography
            sx={{
              fontSize: 11, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "grey", mb: 1.5,
            }}
          >
            Negromart Marketplace
          </Typography>
          <Typography
            variant="h3"
            sx={{
              color: "#1a56db", fontWeight: 700,
              fontSize: { xs: "2rem", md: "2.75rem" },
              lineHeight: 1.15, mb: 2,
            }}
          >
            Ready to Grow Your Business?
          </Typography>
          <Typography sx={{ color: "rgba(117, 117, 117, 0.8)", fontSize: { xs: 15, md: 17 }, mb: 4, lineHeight: 1.6 }}>
            Sign up today and start selling on Negromart's trusted marketplace.
            It takes less than 5 minutes.
          </Typography>

          <Typography sx={{ color: "rgba(75, 75, 75, 0.55)", fontSize: 12, mt: 1.5 }}>
            Free to join · No monthly fees
          </Typography>
        </Container>
      </Box>

      {/* Features */}
      <Container maxWidth="md" sx={{ py: { xs: 2, md: 2 } }}>
        <Grid container spacing={3}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} key={f.title}>
              <Box
                sx={{
                  bgcolor: "white",
                  borderRadius: 3,
                  p: 3,
                  height: "100%",
                  border: "1px solid rgba(0,0,0,0.07)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                  display: "flex",
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 52, height: 52,
                    borderRadius: 2,
                    bgcolor: "#e8f0fe",
                    color: "#1a56db",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: 15, mb: 0.5 }}>{f.title}</Typography>
                  <Typography sx={{ fontSize: 13, color: "text.secondary", lineHeight: 1.6 }}>{f.desc}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 5, textAlign: "center" }}>
          {/* Info Card */}
          {!isAuthenticated && (
            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 2,
                bgcolor: "#fff4f4",
                border: "1px solid #f5c2c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 1.5,
                maxWidth: 420,
                mx: "auto",
              }}
            >
              <LockIcon sx={{ color: "#d32f2f", fontSize: 20 }} />
              <Typography sx={{ fontSize: 13, color: "#7a1c1c" }}>
                You must be logged in as a customer before becoming a vendor.
              </Typography>
            </Box>
          )}

          {/* CTA Button */}
          <Button
            variant="contained"
            size="large"
            onClick={() => {
              if (!isAuthenticated) {
                window.location.href =
                  "https://www.negromart.com/auth/register";
              } else {
                router.push("/register/step-1");
              }
            }}
            startIcon={
              isAuthenticated ? (
                <CheckCircleIcon />
              ) : (
                <ArrowForwardIcon />
              )
            }
            sx={{
              bgcolor: isAuthenticated ? "#1a56db" : "#111827",
              fontWeight: 700,
              fontSize: 15,
              px: 5,
              py: 1.6,
              borderRadius: 3,
              textTransform: "none",
              boxShadow: isAuthenticated
                ? "0 4px 14px rgba(26,86,219,0.35)"
                : "0 4px 14px rgba(0,0,0,0.25)",
              transition: "all 0.25s ease",
              "&:hover": {
                bgcolor: isAuthenticated ? "#1240a8" : "#000",
                transform: "translateY(-2px)",
              },
            }}
          >
            {isAuthenticated
              ? "Continue to vendor setup"
              : "Create account to continue"}
          </Button>

          {/* Secondary hint */}
          {!isAuthenticated && (
            <Typography
              sx={{
                mt: 1.5,
                fontSize: 12,
                color: "text.secondary",
              }}
            >
              Takes less than 2 minutes to get started.
            </Typography>
          )}
        </Box>
      </Container>
    </Box>
  );
}