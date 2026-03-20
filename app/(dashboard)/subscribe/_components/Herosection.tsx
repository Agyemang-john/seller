"use client";

import { Box, Typography, Stack } from "@mui/material";
import type { BillingCycle } from "@/types/subscription";

interface HeroSectionProps {
  billing: BillingCycle;
  onBillingChange: (b: BillingCycle) => void;
}

export default function HeroSection({ billing, onBillingChange }: HeroSectionProps) {
  const isYearly = billing === "yearly";

  return (
    <Box
      component="section"
      sx={{ py: { xs: 6, md: 10 }, position: "relative", overflow: "hidden" }}
    >
      {/* Ghost number */}
      <Typography
        aria-hidden
        sx={{
          position: "absolute", right: -20, top: 20,
          fontFamily: "serif", fontWeight: 700,
          fontSize: { xs: "120px", md: "220px" },
          lineHeight: 1, letterSpacing: "-8px",
          color: "transparent",
          WebkitTextStroke: "1px",
          WebkitTextStrokeColor: "divider",
          pointerEvents: "none", userSelect: "none",
        }}
      >
        4
      </Typography>

      <Box sx={{ position: "relative" }}>
        {/* Heading */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ letterSpacing: "0.18em", display: "block", mb: 1.5 }}
          >
            Vendor plans
          </Typography>
          <Typography
            component="h1"
            sx={{
              fontFamily: "serif", fontWeight: 700,
              fontSize: { xs: "40px", md: "64px", lg: "72px" },
              lineHeight: 1.02, letterSpacing: "-2px",
              color: "text.primary", mb: 2,
            }}
          >
            Grow your store<br />on Negromart.
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontWeight: 300, lineHeight: 1.65, maxWidth: 440 }}
          >
            Choose the plan that fits your business. Upgrade or cancel anytime.
          </Typography>
        </Box>

        {/* Billing toggle */}
        <Stack direction="row" alignItems="center" spacing={1.75}>
          <Typography variant="body2" color="text.secondary">Bill me</Typography>

          <Box
            onClick={() => onBillingChange(isYearly ? "monthly" : "yearly")}
            sx={{
              position: "relative",
              width: 186, height: 42,
              bgcolor: "action.hover",
              border: 1, borderColor: "divider",
              borderRadius: "10px",
              display: "flex", p: "3px",
              cursor: "pointer", userSelect: "none",
            }}
          >
            {/* Sliding pill */}
            <Box
              sx={{
                position: "absolute", top: "3px", left: "3px",
                width: "calc(50% - 3px)", height: "calc(100% - 6px)",
                bgcolor: "text.primary",
                borderRadius: "7px",
                transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                transform: isYearly ? "translateX(100%)" : "translateX(0)",
              }}
            />
            {["Monthly", "Yearly"].map((label) => {
              const active = (label === "Yearly") === isYearly;
              return (
                <Stack
                  key={label}
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={0.5}
                  sx={{ flex: 1, position: "relative", zIndex: 1 }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={{
                      letterSpacing: "0.04em",
                      color: active ? "background.paper" : "text.secondary",
                      transition: "color 0.2s",
                    }}
                  >
                    {label}
                  </Typography>
                  {label === "Yearly" && isYearly && (
                    <Box
                      sx={{
                        bgcolor: "background.paper",
                        color: "text.primary",
                        fontSize: "9px", fontWeight: 700,
                        px: 0.6, py: 0.2,
                        borderRadius: "4px", letterSpacing: "0.04em",
                      }}
                    >
                      −20%
                    </Box>
                  )}
                </Stack>
              );
            })}
          </Box>

          {!isYearly && (
            <Typography variant="caption" color="text.secondary">
              Switch to yearly and save 20%
            </Typography>
          )}
        </Stack>
      </Box>
    </Box>
  );
}