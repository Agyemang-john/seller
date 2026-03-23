"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, Container, Typography, Button, Grid } from "@mui/material";
import StoreIcon from "@mui/icons-material/Store";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PeopleIcon from "@mui/icons-material/People";
import ShieldIcon from "@mui/icons-material/Shield";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// ─── Design tokens (inline — keep in sync with theme.js) ────────────────────
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
  info:        "#2563eb",
  infoBg:      "#eff6ff",
  infoBorder:  "#bfdbfe",
  warn:        "#92400e",
  warnBg:      "#fffbeb",
  warnBorder:  "#fde68a",
  radius:      "8px",
  radiusLg:    "12px",
  shadowSm:    "0 1px 3px rgba(0,0,0,0.07)",
  shadowMd:    "0 4px 12px rgba(0,0,0,0.08)",
};

// ─── Feature cards ───────────────────────────────────────────────────────────
const features = [
  {
    icon: <StoreIcon sx={{ fontSize: 22 }} />,
    label: "Your own storefront",
    desc: "Your own page with logo, cover photo, and business description — fully yours.",
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 22 }} />,
    label: "Grow your sales",
    desc: "Reach thousands of active Negromart shoppers from day one.",
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 22 }} />,
    label: "Student-friendly",
    desc: "Simplified verification for student vendors with a dedicated onboarding path.",
  },
  {
    icon: <ShieldIcon sx={{ fontSize: 22 }} />,
    label: "Secure payouts",
    desc: "Mobile Money, bank transfer, or PayPal — get paid your way, on time.",
  },
];

// ─── Registration steps ───────────────────────────────────────────────────────
const steps = [
  { num: "1", label: "Business info" },
  { num: "2", label: "Store profile" },
  { num: "3", label: "Payment setup" },
  { num: "4", label: "Review & submit" },
];

// ─── Shared sub-components ────────────────────────────────────────────────────
const Divider = () => (
  <Box sx={{ borderTop: `1px solid ${T.border}`, my: 3 }} />
);

const Tag = ({ children }) => (
  <Typography
    component="span"
    sx={{
      display: "inline-block",
      fontSize: "11px",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: T.textMuted,
      bgcolor: T.accentSoft,
      // border: `1px solid ${T.border}`,
      // borderRadius: "100px",
      px: 1.5,
      py: 0.4,
    }}
  >
    {children}
  </Typography>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SellerRegisterPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_HOST}/api/v1/vendor/check`, {
      method: "GET",
      credentials: "include",
      headers: { "X-User-Type": "customer" },
    })
      .then((res) => { if (!res.ok) throw new Error(); return res.json(); })
      .then(() => setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false));
  }, []);

  const handleCTA = () => {
    if (!isAuthenticated) {
      window.location.href = "https://www.negromart.com/auth/register";
    } else {
      router.push("/register/step-1");
    }
  };

  return (
    <Box sx={{ bgcolor: T.bg, minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <Box sx={{ borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="md" sx={{ pt: { xs: 6, md: 9 }, pb: { xs: 5, md: 8 }, px: { xs: 2.5, md: 3 } }}>
          <Box sx={{ maxWidth: 560 }}>
            <Tag>Negromart · Vendor Programme</Tag>
            <Typography
              component="h1"
              sx={{
                mt: 2.5,
                fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
                fontWeight: 800,
                letterSpacing: "-1.5px",
                lineHeight: 1.1,
                color: T.text,
              }}
            >
              Ready to Grow<br />Your Business?
            </Typography>
            <Typography
              sx={{
                mt: 2,
                fontSize: { xs: 15, md: 16 },
                color: T.textSub,
                lineHeight: 1.75,
                maxWidth: 460,
              }}
            >
              Join thousands of vendors on Negromart's trusted marketplace.
              Set up your storefront in under 5 minutes — free to join, no monthly fees.
            </Typography>

            {/* Trust badges */}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 3, mb: 4 }}>
              {["Free to join", "No monthly fees", "Setup in 5 min"].map((t) => (
                <Box key={t} sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <CheckCircleIcon sx={{ fontSize: 15, color: T.textMuted }} />
                  <Typography sx={{ fontSize: "13px", color: T.textSub, fontWeight: 500 }}>{t}</Typography>
                </Box>
              ))}
            </Box>

            <Button
              variant="contained"
              size="large"
              onClick={handleCTA}
              disabled={isAuthenticated === null}
              endIcon={
                isAuthenticated
                  ? <CheckCircleIcon sx={{ fontSize: 17 }} />
                  : <ArrowForwardIcon sx={{ fontSize: 17 }} />
              }
              sx={{
                bgcolor: T.accent,
                color: "#fff",
                fontWeight: 700,
                fontSize: 14,
                px: 3.5,
                py: 1.4,
                // borderRadius: T.radius,
                textTransform: "none",
                boxShadow: "none",
                border: `1px solid ${T.accent}`,
                "&:hover": {
                  bgcolor: T.accentHover,
                  boxShadow: "none",
                },
                "&.Mui-disabled": { bgcolor: T.borderMid, color: T.textMuted, border: "none" },
                transition: "all 0.15s",
              }}
            >
              {isAuthenticated === null
                ? "Checking…"
                : isAuthenticated
                ? "Continue to vendor setup"
                : "Create account to continue"}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* ── 4-step strip ─────────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: T.surface, borderBottom: `1px solid ${T.border}` }}>
        <Container maxWidth="md" sx={{ px: { xs: 2.5, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "flex-start", sm: "center" },
              overflowX: "auto",
              py: 2,
              gap: 0,
            }}
          >
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0, px: { xs: 1, md: 2 } }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      // borderRadius: "50%",
                      bgcolor: T.accent,
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "11px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {s.num}
                  </Box>
                  <Typography sx={{ fontSize: "13px", fontWeight: 500, color: T.textSub, whiteSpace: "nowrap" }}>
                    {s.label}
                  </Typography>
                </Box>
                {i < steps.length - 1 && (
                  <Box sx={{ color: T.borderMid, fontSize: 16, flexShrink: 0 }}>›</Box>
                )}
              </React.Fragment>
            ))}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: { xs: 4, md: 5 }, px: { xs: 2.5, md: 3 } }}>

        {/* ── Auth warning ──────────────────────────────────────────────── */}
        {isAuthenticated === false && (
          <Box
            sx={{
              bgcolor: T.warnBg,
              border: `1px solid ${T.warnBorder}`,
              borderLeft: `3px solid #d97706`,
              borderRadius: T.radius,
              p: 2,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-start",
              mb: 3,
            }}
          >
            <WarningAmberIcon sx={{ color: "#d97706", fontSize: 18, mt: "1px", flexShrink: 0 }} />
            <Box>
              <Typography sx={{ fontWeight: 600, fontSize: "13px", color: T.warn }}>
                You need a Negromart account first
              </Typography>
              <Typography sx={{ fontSize: "13px", color: T.warn, mt: 0.5, lineHeight: 1.6 }}>
                Log in or sign up at{" "}
                <a href="https://www.negromart.com/auth/register" style={{ color: "#d97706", fontWeight: 600 }}>
                  negromart.com
                </a>{" "}
                then return here to set up your vendor account.
              </Typography>
            </Box>
          </Box>
        )}

        {/* ── Info notice ───────────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: T.infoBg,
            border: `1px solid ${T.infoBorder}`,
            borderLeft: `3px solid ${T.info}`,
            borderRadius: T.radius,
            p: 2,
            display: "flex",
            gap: 1.5,
            alignItems: "flex-start",
            mb: 4,
          }}
        >
          <InfoOutlinedIcon sx={{ color: T.info, fontSize: 18, mt: "1px", flexShrink: 0 }} />
          <Box>
            <Typography sx={{ fontWeight: 600, fontSize: "13px", color: T.info }}>
              You must be a registered Negromart user before selling
            </Typography>
            <Typography sx={{ fontSize: "13px", color: T.textSub, mt: 0.5, lineHeight: 1.6 }}>
              If you don't have an account yet, sign up at{" "}
              <a
                href="https://www.negromart.com"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: T.info, fontWeight: 600 }}
              >
                www.negromart.com
              </a>{" "}
              first, then return here to create your vendor account.
            </Typography>
          </Box>
        </Box>

        {/* ── Why sell section ─────────────────────────────────────────── */}
        <Typography sx={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: T.textMuted, mb: 2 }}>
          Why sell on Negromart
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          {features.map((f) => (
            <Grid item xs={12} sm={6} key={f.label}>
              <Box
                sx={{
                  bgcolor: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusLg,
                  p: 2.5,
                  height: "100%",
                  display: "flex",
                  gap: 2,
                  boxShadow: T.shadowSm,
                  transition: "box-shadow 0.15s, transform 0.15s",
                  "&:hover": {
                    boxShadow: T.shadowMd,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    // borderRadius: T.radius,
                    bgcolor: T.accentSoft,
                    border: `1px solid ${T.border}`,
                    color: T.textSub,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {f.icon}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, fontSize: "14px", color: T.text, mb: 0.5 }}>
                    {f.label}
                  </Typography>
                  <Typography sx={{ fontSize: "13px", color: T.textSub, lineHeight: 1.65 }}>
                    {f.desc}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* ── Bottom CTA card ──────────────────────────────────────────── */}
        <Box
          sx={{
            bgcolor: T.surface,
            // border: `1px solid ${T.border}`,
            // borderRadius: T.radiusLg,
            p: { xs: 3, md: 4 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 3,
            boxShadow: T.shadowSm,
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "17px", color: T.text, mb: 0.5 }}>
              Start your seller journey today
            </Typography>
            <Typography sx={{ fontSize: "13px", color: T.textSub, lineHeight: 1.6 }}>
              Join Negromart's growing marketplace. Setup takes under 5 minutes.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={handleCTA}
            disabled={isAuthenticated === null}
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              color: T.text,
              borderColor: T.borderMid,
              fontWeight: 600,
              fontSize: "13px",
              px: 3,
              py: 1.25,
              // borderRadius: T.radius,
              textTransform: "none",
              bgcolor: T.surface,
              flexShrink: 0,
              "&:hover": { bgcolor: T.accentSoft, borderColor: T.accent },
              transition: "all 0.15s",
            }}
          >
            {isAuthenticated ? "Continue setup" : "Get started"}
          </Button>
        </Box>
      </Container>
    </Box>
  );
}