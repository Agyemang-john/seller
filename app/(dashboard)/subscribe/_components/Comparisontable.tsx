"use client";

import { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import type { SubscriptionPlan, UIPlan } from "@/types/subscription";

const PRO_TEXT     = "#ffffff";
const PRO_TEXT_DIM = "rgba(255,255,255,0.55)";
const PRO_BG       = "#111111";
const PRO_BORDER   = "rgba(255,255,255,0.1)";

type Cell = string | boolean;

interface CompRow {
  feature: string;
  value: (p: SubscriptionPlan) => Cell;
}

const UNLIMITED = 999_999;
const count = (n: number) => (n >= UNLIMITED ? "Unlimited" : n.toLocaleString("en-GH"));

// Built from the plan records, so the table always matches what sellers pay for.
const GROUPS: { label: string; rows: CompRow[] }[] = [
  {
    label: "Listings & products",
    rows: [
      { feature: "Active listings",    value: (p) => count(p.max_products) },
      { feature: "Images per product", value: (p) => count(p.max_images_per_product) },
      { feature: "Extra photos per variant", value: (p) => p.max_images_per_variant > 0 ? count(p.max_images_per_variant) : false },
      { feature: "Categories",         value: (p) => count(p.max_categories) },
      { feature: "Bulk CSV upload",    value: (p) => p.can_access_bulk_upload },
    ],
  },
  {
    label: "Sales & marketing",
    rows: [
      { feature: "Discount codes",            value: (p) => p.can_offer_discounts },
      { feature: "Featured product boosts",   value: (p) => p.can_feature_products },
      { feature: "Featured vendor placement", value: (p) => p.is_featured_vendor },
      { feature: "Storefront customization",  value: (p) => p.can_use_storefront_customization },
    ],
  },
  {
    label: "Money",
    rows: [
      { feature: "Commission per sale", value: (p) => p.commission_display },
      { feature: "Payout delay",        value: (p) => `${p.payout_delay_days} day${p.payout_delay_days === 1 ? "" : "s"}` },
      { feature: "Analytics dashboard", value: (p) => p.can_use_analytics },
      { feature: "Report exports",      value: (p) => p.can_export_reports },
    ],
  },
  {
    label: "Team & support",
    rows: [
      { feature: "Team members",     value: (p) => count(p.max_team_members ?? 1) },
      { feature: "Priority support", value: (p) => p.priority_support },
    ],
  },
];

function CellIcon({ on, isPro }: { on: boolean; isPro: boolean }) {
  return on ? (
    <Box sx={{
      width: 22, height: 22, borderRadius: "50%",
      bgcolor: isPro ? "rgba(255,255,255,0.15)" : "action.selected",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <CheckIcon aria-label="Included" sx={{ fontSize: 13, color: isPro ? PRO_TEXT : "text.primary" }} />
    </Box>
  ) : (
    <CloseIcon aria-label="Not included" sx={{ fontSize: 16, color: isPro ? PRO_TEXT_DIM : "text.disabled" }} />
  );
}

function CellValue({ val, isPro, isBold }: { val: Cell; isPro: boolean; isBold: boolean }) {
  if (typeof val === "boolean") return <CellIcon on={val} isPro={isPro} />;
  return (
    <Typography variant="body2" sx={{
      fontWeight: isBold ? 600 : 400,
      fontSize: 13,
      color: isPro ? (isBold ? PRO_TEXT : PRO_TEXT_DIM) : isBold ? "text.primary" : "text.secondary",
    }}>
      {val}
    </Typography>
  );
}

// ── Mobile: one plan at a time, chosen with pills ─────────────────────────────
function MobileView({ plans }: { plans: UIPlan[] }) {
  const [activeKey, setActiveKey] = useState<string>(
    plans.find((p) => p.isPro)?.key ?? plans[0]?.key
  );
  const col = plans.find((p) => p.key === activeKey) ?? plans[0];
  if (!col) return null;

  return (
    <Box>
      <Box sx={{ display: "flex", gap: "6px", mb: 3, overflowX: "auto", pb: 0.5, "&::-webkit-scrollbar": { display: "none" }, scrollbarWidth: "none" }}>
        {plans.map((c) => {
          const active = c.key === activeKey;
          return (
            <Box
              key={c.key}
              component="button"
              type="button"
              onClick={() => setActiveKey(c.key)}
              sx={{
                px: 2.5, py: 1, borderRadius: "20px", cursor: "pointer", font: "inherit",
                flexShrink: 0, transition: "all 0.2s",
                bgcolor: active ? (c.isPro ? PRO_BG : "text.primary") : "action.hover",
                border: "1px solid",
                borderColor: active ? (c.isPro ? PRO_BORDER : "text.primary") : "divider",
              }}
            >
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: active ? (c.isPro ? PRO_TEXT : "background.paper") : "text.secondary" }}>
                {c.plan.tier_display}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box sx={{ borderRadius: "16px", overflow: "hidden", border: "1px solid", borderColor: col.isPro ? PRO_BORDER : "divider", bgcolor: col.isPro ? PRO_BG : "background.paper" }}>
        {GROUPS.map((group, gi) => (
          <Box key={group.label}>
            <Box sx={{
              px: 3, py: 1.25,
              bgcolor: col.isPro ? "rgba(255,255,255,0.03)" : "action.hover",
              borderTop: gi > 0 ? "1px solid" : "none", borderBottom: "1px solid",
              borderColor: col.isPro ? PRO_BORDER : "divider",
            }}>
              <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: col.isPro ? PRO_TEXT_DIM : "text.disabled" }}>
                {group.label}
              </Typography>
            </Box>
            {group.rows.map((row, ri) => (
              <Box key={row.feature} sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                px: 3, py: 1.75,
                borderBottom: ri < group.rows.length - 1 ? "1px solid" : "none",
                borderColor: col.isPro ? PRO_BORDER : "divider",
              }}>
                <Typography sx={{ fontSize: 13, color: col.isPro ? PRO_TEXT_DIM : "text.secondary", flex: 1, mr: 2 }}>
                  {row.feature}
                </Typography>
                <CellValue val={row.value(col.plan)} isPro={col.isPro} isBold />
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Desktop: collapsible groups ───────────────────────────────────────────────
function GroupBlock({ group, plans, gridCols }: { group: typeof GROUPS[number]; plans: UIPlan[]; gridCols: string }) {
  const [open, setOpen] = useState(true);

  return (
    <Box>
      <Box
        component="button"
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        sx={{
          width: "100%", px: 2.5, py: 1.25, cursor: "pointer", font: "inherit", border: 0,
          bgcolor: "action.hover",
          borderTop: 1, borderBottom: open ? 1 : 0, borderColor: "divider", borderStyle: "solid", borderLeft: 0, borderRight: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          "&:hover": { bgcolor: "action.selected" },
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary" }}>
          {group.label}
        </Typography>
        <KeyboardArrowDownIcon sx={{ fontSize: 16, color: "text.disabled", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </Box>

      {open && group.rows.map((row, i) => (
        <Box key={row.feature} sx={{
          display: "grid", gridTemplateColumns: gridCols,
          borderBottom: i < group.rows.length - 1 ? 1 : 0, borderColor: "divider",
          "&:hover": { bgcolor: "action.hover" },
        }}>
          <Box sx={{ p: "13px 20px", borderRight: 1, borderColor: "divider" }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>{row.feature}</Typography>
          </Box>
          {plans.map((col) => (
            <Stack key={col.key} alignItems="center" justifyContent="center"
              sx={{ p: "13px 12px", bgcolor: col.isPro ? PRO_BG : "transparent" }}>
              <CellValue val={row.value(col.plan)} isPro={col.isPro} isBold={col.isPro} />
            </Stack>
          ))}
        </Box>
      ))}
    </Box>
  );
}

export default function ComparisonTable({ plans }: { plans: UIPlan[] }) {
  if (plans.length === 0) return null;
  const gridCols = `2.2fr repeat(${plans.length}, 1fr)`;

  return (
    <Box component="section" id="compare" sx={{ pb: 9 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.18em", display: "block", mb: 1.25 }}>
          Compare
        </Typography>
        <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: { xs: 28, sm: 34 }, fontWeight: 700, letterSpacing: "-1px" }} color="text.primary">
          Everything, side by side
        </Typography>
      </Box>

      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <MobileView plans={plans} />
      </Box>

      <Box sx={{ display: { xs: "none", md: "block" }, border: 1, borderColor: "divider", borderRadius: "16px", overflow: "hidden" }}>
        <Box sx={{ display: "grid", gridTemplateColumns: gridCols, bgcolor: "action.hover", borderBottom: 1, borderColor: "divider" }}>
          <Box sx={{ p: "16px 20px", borderRight: 1, borderColor: "divider" }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.1em", color: "text.disabled" }}>Feature</Typography>
          </Box>
          {plans.map((col) => (
            <Box key={col.key} sx={{ p: "16px 12px", textAlign: "center", bgcolor: col.isPro ? PRO_BG : "transparent" }}>
              <Typography sx={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: col.isPro ? PRO_TEXT : "text.secondary" }}>
                {col.plan.tier_display}
              </Typography>
              {col.isPro && (
                <Typography sx={{ fontSize: 10, color: PRO_TEXT_DIM, mt: 0.25, letterSpacing: "0.04em" }}>Most popular</Typography>
              )}
            </Box>
          ))}
        </Box>
        {GROUPS.map((group) => (
          <GroupBlock key={group.label} group={group} plans={plans} gridCols={gridCols} />
        ))}
      </Box>
    </Box>
  );
}
