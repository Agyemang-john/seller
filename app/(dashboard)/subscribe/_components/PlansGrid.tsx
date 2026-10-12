"use client";

import { useState } from "react";
import { Box, Typography, Stack, Divider, Chip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import RemoveIcon from "@mui/icons-material/Remove";
import type { UIPlan, ActiveSubscription } from "@/types/subscription";
import { planRelation, formatLongDate, type PlanRelation } from "@/libs/utils/planBuilder";

interface PlansGridProps {
  plans: UIPlan[];
  selectedPlanKey: string | null;
  currentSubscription: ActiveSubscription | null;
  /** Yearly saving per tier in percent, e.g. { pro: 20 } */
  yearlySavings: Record<string, number>;
  onSelectPlan: (key: string) => void;
}

// Pro card uses a fixed near-black surface — intentionally off-theme.
// Everything else defers to the MUI theme so light/dark modes both work.
const PRO_BG         = "#111111";
const PRO_BG_ACTIVE  = "#0a0a0a";
const PRO_TEXT       = "#ffffff";
const PRO_TEXT_DIM   = "rgba(255,255,255,0.5)";
const PRO_TEXT_FAINT = "rgba(255,255,255,0.2)";
const PRO_BORDER     = "rgba(255,255,255,0.12)";

function ctaLabel(relation: PlanRelation, uiPlan: UIPlan, sub: ActiveSubscription | null): string {
  const { plan } = uiPlan;
  const scheduledHere = sub?.scheduled_plan?.id === plan.id;
  switch (relation) {
    case "current":
      return "Your current plan";
    case "cancel":
      return sub?.cancel_at_period_end ? `Free from ${formatLongDate(sub.end_date)}` : "Cancel to move to Free";
    case "downgrade":
      return scheduledHere ? `Starts ${formatLongDate(sub!.end_date)}` : `Switch at renewal`;
    case "upgrade":
      return sub?.plan_tier === plan.tier ? "Switch to yearly" : `Upgrade to ${plan.name}`;
    default:
      return `Choose ${plan.name}`;
  }
}

export default function PlansGrid({
  plans, selectedPlanKey, currentSubscription, yearlySavings, onSelectPlan,
}: PlansGridProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <Box component="section" sx={{ pb: 6 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)", md: `repeat(${Math.min(plans.length, 4)},1fr)` },
          border: 1,
          borderColor: "divider",
          borderRadius: "20px",
          overflow: "hidden",
        }}
      >
        {plans.map((uiPlan, i) => {
          const { plan, features, isPro } = uiPlan;
          const planKey    = uiPlan.key;
          const relation   = planRelation(plan, currentSubscription);
          const isCurrent  = relation === "current";
          const isSelected = selectedPlanKey === planKey && !isCurrent;
          const isHovered  = hovered === planKey;
          const isActive   = isSelected || (isHovered && !isCurrent);
          const isFree     = planKey === "free";
          const isScheduled = currentSubscription?.scheduled_plan?.id === plan.id;
          const clickable  = !isCurrent && !(relation === "cancel" && currentSubscription?.cancel_at_period_end) && !isScheduled;

          const price      = parseFloat(plan.price);
          const isYearly   = plan.billing_cycle === "yearly";
          const saving     = isYearly ? yearlySavings[planKey] : undefined;
          const maxP       = plan.max_products;
          const maxDisplay = maxP >= 999_999 ? "∞" : String(maxP);

          return (
            <Box
              key={`${planKey}-${plan.billing_cycle}`}
              onClick={() => clickable && onSelectPlan(planKey)}
              onMouseEnter={() => setHovered(planKey)}
              onMouseLeave={() => setHovered(null)}
              sx={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                p: "32px 26px 26px",
                cursor: clickable ? "pointer" : "default",
                borderRight: { md: i < plans.length - 1 ? 1 : 0 },
                borderBottom: { xs: i < plans.length - 1 ? 1 : 0, md: 0 },
                borderColor: { xs: "divider", md: "divider" },
                bgcolor: isPro
                  ? isActive ? PRO_BG_ACTIVE : PRO_BG
                  : isActive ? "action.hover" : "background.paper",
                transition: "background-color 0.2s",
              }}
            >
              {/* ── Top accent bar ──────────────────────────────────────── */}
              <Box
                sx={{
                  position: "absolute", top: 0, left: 0, right: 0, height: isCurrent || isSelected ? "3px" : "2px",
                  bgcolor: isPro
                    ? PRO_TEXT
                    : isCurrent ? "primary.main" : isActive ? "text.primary" : "divider",
                  transition: "background-color 0.2s",
                }}
              />

              {/* ── Badges row ──────────────────────────────────────────── */}
              <Stack direction="row" spacing={0.75} sx={{ mb: 2, minHeight: 22, flexWrap: "wrap", rowGap: 0.5 }}>
                {isCurrent && (
                  <Chip label="Current plan" size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", borderRadius: "5px",
                    bgcolor: isPro ? "rgba(255,255,255,0.15)" : "text.primary",
                    color: isPro ? PRO_TEXT : "background.paper",
                    "& .MuiChip-label": { px: 1 },
                  }} />
                )}
                {isScheduled && (
                  <Chip label="Scheduled" size="small" sx={{
                    height: 20, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", borderRadius: "5px",
                    bgcolor: isPro ? "rgba(255,255,255,0.15)" : "action.selected",
                    color: isPro ? PRO_TEXT : "text.primary",
                    "& .MuiChip-label": { px: 1 },
                  }} />
                )}
                {!isCurrent && !isScheduled && (
                  <Typography variant="overline" sx={{ letterSpacing: "0.14em", color: isPro ? PRO_TEXT_DIM : "text.secondary", lineHeight: 1.4 }}>
                    {isPro ? "★ Most popular" : plan.tier_display}
                  </Typography>
                )}
              </Stack>

              {/* ── Price ───────────────────────────────────────────────── */}
              <Box sx={{ mb: 2.75 }}>
                {isFree ? (
                  <>
                    <Typography sx={{
                      fontFamily: "var(--font-figtree), system-ui, sans-serif",
                      fontSize: 38, fontWeight: 700, lineHeight: 1, letterSpacing: "-1px",
                      color: isPro ? PRO_TEXT : "text.primary",
                    }}>
                      Free
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.6, display: "block" }}>
                      forever
                    </Typography>
                  </>
                ) : (
                  <>
                    <Stack direction="row" alignItems="flex-start" spacing={0.4}>
                      <Typography component="sup" sx={{ fontSize: 15, fontWeight: 500, mt: 1, color: isPro ? "rgba(255,255,255,0.6)" : "text.secondary" }}>
                        GHS
                      </Typography>
                      <Typography sx={{
                        fontFamily: "var(--font-figtree), system-ui, sans-serif",
                        fontSize: 48, fontWeight: 700, lineHeight: 1, letterSpacing: "-2px",
                        color: isPro ? PRO_TEXT : "text.primary",
                      }}>
                        {price.toLocaleString("en-GH")}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: isPro ? "rgba(255,255,255,0.45)" : "text.secondary", mt: 0.6, display: "block" }}>
                      {isYearly
                        ? `per year · GHS ${(price / 12).toLocaleString("en-GH", { maximumFractionDigits: 2 })}/mo${saving ? ` · save ${saving}%` : ""}`
                        : "per month"}
                    </Typography>
                  </>
                )}
              </Box>

              {/* ── Plan name ───────────────────────────────────────────── */}
              <Typography sx={{
                fontFamily: "var(--font-figtree), system-ui, sans-serif",
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
                {plan.description ||
                  `Up to ${maxDisplay === "∞" ? "unlimited" : maxDisplay} products at ${plan.commission_display} commission.`}
              </Typography>

              <Divider sx={{ borderColor: isPro ? PRO_BORDER : "divider", mb: 2.25 }} />

              {/* ── Key numbers ─────────────────────────────────────────── */}
              <Stack direction="row" spacing={2.5} sx={{ mb: 2.25 }}>
                {[
                  [maxDisplay, "products"],
                  [plan.commission_display, "commission"],
                ].map(([value, label]) => (
                  <Box key={label}>
                    <Typography sx={{
                      fontFamily: "var(--font-figtree), system-ui, sans-serif",
                      fontSize: 24, fontWeight: 700, lineHeight: 1,
                      color: isPro ? PRO_TEXT : "text.primary",
                    }}>
                      {value}
                    </Typography>
                    <Typography variant="caption" sx={{ color: isPro ? "rgba(255,255,255,0.4)" : "text.secondary" }}>
                      {label}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              {/* ── Features list ────────────────────────────────────────── */}
              <Stack component="ul" spacing={1.1} sx={{ listStyle: "none", p: 0, m: 0, mb: 3 }}>
                {features.map((feat) => (
                  <Stack key={feat.label} component="li" direction="row" alignItems="flex-start" spacing={1.1}>
                    <Box sx={{
                      width: 16, height: 16, borderRadius: "4px", flexShrink: 0, mt: "2px",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      bgcolor: feat.on ? (isPro ? "rgba(255,255,255,0.1)" : "action.selected") : "transparent",
                      border: feat.on ? "none" : "1px solid",
                      borderColor: feat.on ? "transparent" : isPro ? PRO_BORDER : "divider",
                    }}>
                      {feat.on
                        ? <CheckIcon sx={{ fontSize: 10, color: isPro ? PRO_TEXT : "text.primary" }} />
                        : <RemoveIcon sx={{ fontSize: 10, color: isPro ? PRO_TEXT_FAINT : "text.disabled" }} />}
                    </Box>
                    <Typography variant="body2" sx={{
                      lineHeight: 1.45,
                      color: feat.on
                        ? isPro ? "rgba(255,255,255,0.75)" : "text.secondary"
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
                type="button"
                disabled={!clickable}
                onClick={(e: React.MouseEvent) => { e.stopPropagation(); if (clickable) onSelectPlan(planKey); }}
                sx={{
                  width: "100%", py: 1.6, px: 2,
                  borderRadius: "10px",
                  fontFamily: "inherit", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em",
                  cursor: clickable ? "pointer" : "default",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  transition: "all 0.2s",
                  ...(isPro && {
                    bgcolor: isSelected ? PRO_TEXT : "rgba(255,255,255,0.08)",
                    color: isSelected ? "#111111" : isCurrent ? PRO_TEXT_DIM : "rgba(255,255,255,0.75)",
                    border: `1px solid ${isSelected ? PRO_TEXT : PRO_BORDER}`,
                  }),
                  ...(!isPro && {
                    bgcolor: isSelected ? "text.primary" : "transparent",
                    color: isSelected ? "background.paper" : isCurrent ? "text.disabled" : "text.primary",
                    border: "1px solid",
                    borderColor: isSelected ? "text.primary" : "divider",
                  }),
                  ...(relation === "cancel" && clickable && isHovered && {
                    color: "error.main", borderColor: "error.main",
                  }),
                }}
              >
                <span>{ctaLabel(relation, uiPlan, currentSubscription)}</span>
                {clickable && <span aria-hidden>→</span>}
              </Box>
              {relation === "downgrade" && !isScheduled && currentSubscription && (
                <Typography variant="caption" sx={{ mt: 1, textAlign: "center", color: isPro ? PRO_TEXT_DIM : "text.secondary" }}>
                  Keeps your current plan until {formatLongDate(currentSubscription.end_date)}
                </Typography>
              )}
              {relation === "upgrade" && (
                <Typography variant="caption" sx={{ mt: 1, textAlign: "center", color: isPro ? PRO_TEXT_DIM : "text.secondary" }}>
                  Pay only the difference for the days left
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
