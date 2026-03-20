"use client";

import { useState } from "react";
import { Box, Typography, Stack, Divider, Chip, useTheme } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import type { UIPlan, BillingCycle } from "@/types/subscription";

interface PlansGridProps {
  plans: UIPlan[];
  billing: BillingCycle;
  selectedPlanKey: string | null;
  /** Composite key: "free" | "{tier}-{billing_cycle}" e.g. "pro-monthly" */
  activePlanKey: string;
  onSelectPlan: (key: string) => void;
}

export default function PlansGrid({
  plans, billing, selectedPlanKey, activePlanKey, onSelectPlan,
}: PlansGridProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const theme = useTheme();

  // ── Two fixed surfaces: Pro (always dark) and Default (theme-driven) ───────
  // Pro card uses hardcoded near-black — it's intentionally off-theme.
  // Everything else defers to the MUI theme so light/dark modes both work.
  const PRO_BG         = "#111111";
  const PRO_BG_ACTIVE  = "#0a0a0a";
  const PRO_TEXT       = "#ffffff";
  const PRO_TEXT_DIM   = "rgba(255,255,255,0.5)";
  const PRO_TEXT_FAINT = "rgba(255,255,255,0.2)";
  const PRO_BORDER     = "rgba(255,255,255,0.12)";

  return (
    <Box component="section" sx={{ pb: 9 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: "repeat(4,1fr)" },
          border: 1,
          borderColor: "divider",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {plans.map((uiPlan, i) => {
          const { plan, features, isPro } = uiPlan;
          const planKey    = uiPlan.key;
          const isSelected = selectedPlanKey === planKey;
          const isHovered  = hovered === planKey;
          const isActive   = isSelected || isHovered;
          const isFree     = planKey === "free";
          // ── Subscription state for this card ──────────────────────
          // cardKey: exact match (tier + billing_cycle both match)
          const cardKey    = isFree ? "free" : `${planKey}-${plan.billing_cycle}`;
          // isCurrent: vendor is on THIS exact plan (tier + billing cycle)
          const isCurrent  = activePlanKey === cardKey;
          // isSameTier: vendor is on the same tier but DIFFERENT billing cycle
          // e.g. vendor has Basic Monthly, this card is Basic Yearly
          const activeTier = activePlanKey === "free" ? "free" : activePlanKey.split("-")[0];
          const isSameTier = !isCurrent && activeTier === planKey && !isFree;
          const price      = parseFloat(plan.price);
          const maxP       = plan.max_products;
          const maxDisplay = maxP >= 999_999 ? "∞" : String(maxP);

          return (
            <Box
              key={planKey}
              onClick={() => onSelectPlan(planKey)}
              onMouseEnter={() => setHovered(planKey)}
              onMouseLeave={() => setHovered(null)}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                p: "32px 26px 26px",
                cursor: isCurrent && isFree ? "default" : "pointer",
                borderRight: i < plans.length - 1 ? 1 : 0,
                borderColor: "divider",
                // Pro: fixed dark surface. Others: theme background with hover state.
                bgcolor: isPro
                  ? isActive ? PRO_BG_ACTIVE : PRO_BG
                  : isActive ? "action.hover" : "background.paper",
                transition: "background-color 0.2s",
              }}
            >
              {/* ── Top accent bar ──────────────────────────────────────── */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0, left: 0, right: 0,
                  height: "2px",
                  // Pro: always white. Current plan: primary colour. Others: theme divider → primary on hover.
                  bgcolor: isPro
                    ? PRO_TEXT
                    : isCurrent
                    ? "primary.main"
                    : isSameTier
                    ? "text.disabled"         // muted — not their current cycle
                    : isActive ? "text.primary" : "divider",
                  transition: "background-color 0.2s",
                }}
              />

              {/* ── Badges row ──────────────────────────────────────────── */}
              <Stack direction="row" spacing={0.75} sx={{ mb: 2, minHeight: 22 }}>
                {/* Exact match — vendor IS on this plan */}
                {isCurrent && (
                  <Chip
                    label="Current plan"
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                      bgcolor: isPro ? "rgba(255,255,255,0.15)" : "text.primary",
                      color: isPro ? PRO_TEXT : "background.paper",
                      borderRadius: "5px",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                )}
                {/* Same tier, different billing cycle — inform without confusing */}
                {isSameTier && (
                  <Chip
                    label={`You have ${plan.tier_display} (${
                      activePlanKey.endsWith("yearly") ? "monthly" : "yearly"
                    })`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                      bgcolor: isPro ? "rgba(255,255,255,0.08)" : "action.selected",
                      color: isPro ? "rgba(255,255,255,0.55)" : "text.secondary",
                      borderRadius: "5px",
                      "& .MuiChip-label": { px: 1 },
                    }}
                  />
                )}
                {isPro && !isCurrent && !isSameTier && (
                  <Typography variant="overline" sx={{ letterSpacing: "0.14em", color: PRO_TEXT_DIM, lineHeight: 1.4 }}>
                    ★ Most Popular
                  </Typography>
                )}
                {!isPro && !isCurrent && !isSameTier && (
                  <Typography variant="overline" sx={{ letterSpacing: "0.14em", color: "text.secondary", lineHeight: 1.4 }}>
                    {plan.tier_display}
                  </Typography>
                )}
              </Stack>

              {/* ── Price ───────────────────────────────────────────────── */}
              <Box sx={{ mb: 2.75 }}>
                {isFree ? (
                  <Typography sx={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 38, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px",
                    color: isPro ? PRO_TEXT : "text.primary",
                  }}>
                    Free
                  </Typography>
                ) : (
                  <>
                    <Stack direction="row" alignItems="flex-start" spacing={0.4}>
                      <Typography component="sup" sx={{
                        fontSize: 15, fontWeight: 500, mt: 1,
                        color: isPro ? "rgba(255,255,255,0.6)" : "text.secondary",
                      }}>
                        GHS
                      </Typography>
                      <Typography sx={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: "-2px",
                        color: isPro ? PRO_TEXT : "text.primary",
                      }}>
                        {price}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{
                      color: isPro ? "rgba(255,255,255,0.4)" : "text.secondary",
                      mt: 0.6, display: "block",
                    }}>
                      per {plan.billing_cycle === "yearly" ? "year" : "month"}
                    </Typography>
                  </>
                )}
              </Box>

              {/* ── Plan name ───────────────────────────────────────────── */}
              <Typography sx={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 24, fontWeight: 700, letterSpacing: "-0.5px", mb: 1,
                color: isPro ? PRO_TEXT : "text.primary",
              }}>
                {plan.name}
              </Typography>

              {/* ── Description ─────────────────────────────────────────── */}
              <Typography variant="body2" sx={{
                fontWeight: 300, lineHeight: 1.6, mb: 2.75, flex: 1,
                color: isPro ? PRO_TEXT_DIM : "text.secondary",
              }}>
                {plan.description ??
                  `Up to ${maxDisplay} products at ${plan.commission_display} commission.`}
              </Typography>

              <Divider sx={{ borderColor: isPro ? PRO_BORDER : "divider", mb: 2.25 }} />

              {/* ── Product count ────────────────────────────────────────── */}
              <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 2 }}>
                <Typography sx={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 28, fontWeight: 700, lineHeight: 1,
                  color: isPro ? PRO_TEXT : "text.primary",
                }}>
                  {maxDisplay}
                </Typography>
                <Typography variant="body2" fontWeight={500} sx={{
                  color: isPro ? "rgba(255,255,255,0.4)" : "text.secondary",
                }}>
                  products
                </Typography>
              </Stack>

              {/* ── Features list ────────────────────────────────────────── */}
              <Stack component="ul" spacing={1.1} sx={{ listStyle: "none", p: 0, m: 0, mb: 3 }}>
                {features.map((feat) => (
                  <Stack key={feat.label} component="li" direction="row" alignItems="flex-start" spacing={1.1}>
                    <Box sx={{
                      width: 16, height: 16, borderRadius: "4px", flexShrink: 0, mt: "2px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: feat.on
                        ? isPro ? "rgba(255,255,255,0.1)" : "action.selected"
                        : "transparent",
                      border: feat.on ? "none" : "1px solid",
                      borderColor: feat.on
                        ? "transparent"
                        : isPro ? PRO_BORDER : "divider",
                    }}>
                      {feat.on
                        ? <CheckIcon sx={{ fontSize: 9, color: isPro ? PRO_TEXT : "text.primary", fontWeight: 700 }} />
                        : <RemoveIcon sx={{ fontSize: 9, color: isPro ? PRO_TEXT_FAINT : "text.disabled" }} />
                      }
                    </Box>
                    <Typography variant="body2" sx={{
                      lineHeight: 1.45,
                      color: feat.on
                        ? isPro ? "rgba(255,255,255,0.7)" : "text.secondary"
                        : isPro ? PRO_TEXT_FAINT : "text.disabled",
                    }}>
                      {feat.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* ── CTA button ───────────────────────────────────────────── */}
              <Box
                component="button"
                sx={{
                  width: "100%", py: 1.6, px: 2,
                  borderRadius: "10px",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600,
                  letterSpacing: "0.04em",
                  cursor: isCurrent && isFree ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.2s",
                  // Pro card CTA
                  ...(isPro && {
                    bgcolor: isCurrent
                      ? "rgba(255,255,255,0.12)"
                      : isSelected ? PRO_TEXT : "rgba(255,255,255,0.08)",
                    color: isCurrent
                      ? PRO_TEXT_DIM
                      : isSelected ? "#111111" : "rgba(255,255,255,0.6)",
                    border: `1px solid ${isCurrent || isSelected ? PRO_TEXT : PRO_BORDER}`,
                  }),
                  // Light card CTA
                  ...(!isPro && {
                    bgcolor: isCurrent || isSelected ? "text.primary" : "transparent",
                    color: isCurrent || isSelected ? "background.paper" : "text.secondary",
                    border: "1px solid",
                    borderColor: isCurrent || isSelected ? "text.primary" : "divider",
                  }),
                  // Danger state — hovering the current paid plan
                  ...(isCurrent && !isFree && isHovered && !isPro && {
                    bgcolor: "error.lighter",
                    color: "error.main",
                    borderColor: "error.light",
                  }),
                  ...(isCurrent && !isFree && isHovered && isPro && {
                    bgcolor: "rgba(220,38,38,0.15)",
                    color: "#fca5a5",
                    borderColor: "rgba(220,38,38,0.4)",
                  }),
                }}
              >
                <span>
                  {isCurrent
                    ? isFree ? "Your current plan" : "Manage · Cancel"
                    : isSameTier
                    ? `Switch to ${plan.billing_cycle === "yearly" ? "yearly" : "monthly"}`
                    : isSelected ? `Upgrade to ${plan.name}` : `Select ${plan.name}`}
                </span>
                {!(isCurrent && isFree) && (
                  <span style={{ fontSize: 13 }}>
                    {isCurrent ? "✕" : "→"}
                  </span>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}