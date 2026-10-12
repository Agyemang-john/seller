"use client";

import { Box, Typography, Stack } from "@mui/material";
import type { BillingCycle } from "@/types/subscription";

interface HeroSectionProps {
  billing: BillingCycle;
  onBillingChange: (b: BillingCycle) => void;
  /** Best yearly saving across tiers, in percent (0 when no yearly plans) */
  yearlySaving: number;
}

export default function HeroSection({ billing, onBillingChange, yearlySaving }: HeroSectionProps) {
  const isYearly = billing === "yearly";

  return (
    <Box
      component="section"
      sx={{
        pt: { xs: 4, md: 6 }, pb: { xs: 3, md: 4 },
        display: "flex", flexDirection: { xs: "column", md: "row" },
        alignItems: { md: "flex-end" }, justifyContent: "space-between", gap: 3,
      }}
    >
      <Box>
        <Typography
          component="h1"
          sx={{
            fontFamily: "var(--font-figtree), system-ui, sans-serif", fontWeight: 700,
            fontSize: { xs: "30px", md: "42px" },
            lineHeight: 1.05, letterSpacing: "-1.5px",
            color: "text.primary", mb: 1,
          }}
        >
          Subscription
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, maxWidth: 480 }}>
          Upgrade any time and pay only for the days left. Downgrades and cancellations
          take effect at the end of the period you&apos;ve paid for.
        </Typography>
      </Box>

      {/* Billing toggle */}
      <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flexShrink: 0 }}>
        <Box
          role="radiogroup"
          aria-label="Billing cycle"
          sx={{
            position: "relative",
            width: 200, height: 42,
            bgcolor: "action.hover",
            border: 1, borderColor: "divider",
            borderRadius: "10px",
            display: "flex", p: "3px",
            userSelect: "none",
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
          {(["monthly", "yearly"] as const).map((cycle) => {
            const active = cycle === billing;
            return (
              <Stack
                key={cycle}
                component="button"
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => onBillingChange(cycle)}
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={0.5}
                sx={{
                  flex: 1, position: "relative", zIndex: 1,
                  border: 0, bgcolor: "transparent", cursor: "pointer", font: "inherit", p: 0,
                }}
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
                  {cycle === "monthly" ? "Monthly" : "Yearly"}
                </Typography>
                {cycle === "yearly" && yearlySaving > 0 && (
                  <Box
                    component="span"
                    sx={{
                      bgcolor: active ? "background.paper" : "text.primary",
                      color: active ? "text.primary" : "background.paper",
                      fontSize: "9px", fontWeight: 700,
                      px: 0.6, py: 0.2,
                      borderRadius: "4px", letterSpacing: "0.04em",
                    }}
                  >
                    −{yearlySaving}%
                  </Box>
                )}
              </Stack>
            );
          })}
        </Box>
      </Stack>
    </Box>
  );
}
