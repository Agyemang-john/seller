"use client";

import { useState } from "react";
import { Box, Typography, Stack } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useTheme } from "@mui/material/styles";

const PRO_TEXT     = "#ffffff";
const PRO_TEXT_DIM = "rgba(255,255,255,0.55)";
const PRO_BG       = "#111111";
const PRO_BORDER   = "rgba(255,255,255,0.1)";

interface CompRow {
  feature: string;
  free: React.ReactNode;
  basic: React.ReactNode;
  pro: React.ReactNode;
  enterprise: React.ReactNode;
}

const GROUPS: { label: string; rows: CompRow[] }[] = [
  {
    label: "Listings & Products",
    rows: [
      { feature: "Active listings",     free: "10",   basic: "50",   pro: "200",      enterprise: "Unlimited" },
      { feature: "Images per product",  free: "3",    basic: "6",    pro: "15",       enterprise: "Unlimited" },
      { feature: "Categories",          free: "2",    basic: "5",    pro: "All",      enterprise: "All" },
      { feature: "Bulk CSV upload",     free: false,  basic: false,  pro: true,       enterprise: true },
    ],
  },
  {
    label: "Sales & Marketing",
    rows: [
      { feature: "Discount codes",            free: false, basic: false, pro: true,  enterprise: true },
      { feature: "Featured product boosts",   free: false, basic: false, pro: true,  enterprise: true },
      { feature: "Featured vendor placement", free: false, basic: false, pro: false, enterprise: true },
    ],
  },
  {
    label: "Analytics & Financials",
    rows: [
      { feature: "Analytics dashboard", free: false,  basic: "Basic",  pro: "Advanced", enterprise: "Full + Export" },
      { feature: "Commission rate",     free: "15%",  basic: "12%",    pro: "8%",       enterprise: "5%" },
      { feature: "Payout delay",        free: "7 d",  basic: "5 d",    pro: "3 d",      enterprise: "1 day" },
    ],
  },
  {
    label: "Support",
    rows: [
      { feature: "Support type",    free: "Email", basic: "Email", pro: "Priority", enterprise: "Dedicated" },
      { feature: "Account manager", free: false,   basic: false,   pro: false,      enterprise: true },
    ],
  },
];

const COLS = [
  { key: "free",       label: "Free",       isPro: false },
  { key: "basic",      label: "Basic",      isPro: false },
  { key: "pro",        label: "Pro",        isPro: true  },
  { key: "enterprise", label: "Enterprise", isPro: false },
] as const;

type ColKey = typeof COLS[number]["key"];

function getVal(row: CompRow, key: ColKey): React.ReactNode {
  return row[key as keyof CompRow] as React.ReactNode;
}

function CellIcon({ on, isPro }: { on: boolean; isPro: boolean }) {
  return on ? (
    <Box sx={{
      width: 22, height: 22, borderRadius: "50%",
      bgcolor: isPro ? "rgba(255,255,255,0.15)" : "action.selected",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <CheckIcon sx={{ fontSize: 13, color: isPro ? PRO_TEXT : "text.primary", fontWeight: 700 }} />
    </Box>
  ) : (
    <CloseIcon sx={{ fontSize: 16, color: isPro ? PRO_TEXT_DIM : "text.disabled" }} />
  );
}

function CellValue({ val, isPro, isBold }: { val: React.ReactNode; isPro: boolean; isBold: boolean }) {
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

// ── Mobile card view — one plan per card, swipeable via tab selector ──────────
function MobileView() {
  const [activeCol, setActiveCol] = useState<ColKey>("pro");
  const col = COLS.find((c) => c.key === activeCol)!;

  return (
    <Box>
      {/* Plan selector pills */}
      <Box sx={{
        display: "flex", gap: "6px", mb: 3,
        overflowX: "auto", pb: 0.5,
        "&::-webkit-scrollbar": { display: "none" },
        scrollbarWidth: "none",
      }}>
        {COLS.map((c) => (
          <Box
            key={c.key}
            onClick={() => setActiveCol(c.key)}
            sx={{
              px: 2.5, py: 1, borderRadius: "20px", cursor: "pointer",
              flexShrink: 0, transition: "all 0.2s",
              bgcolor: activeCol === c.key
                ? (c.isPro ? PRO_BG : "text.primary")
                : "action.hover",
              border: "1px solid",
              borderColor: activeCol === c.key
                ? (c.isPro ? PRO_BORDER : "text.primary")
                : "divider",
            }}
          >
            <Typography sx={{
              fontSize: 13, fontWeight: 700,
              color: activeCol === c.key ? "#fff" : "text.secondary",
              letterSpacing: "0.03em",
            }}>
              {c.label}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Active plan card */}
      <Box sx={{
        borderRadius: "16px", overflow: "hidden",
        border: "1px solid",
        borderColor: col.isPro ? PRO_BORDER : "divider",
        bgcolor: col.isPro ? PRO_BG : "background.paper",
      }}>
        {/* Card header */}
        <Box sx={{
          px: 3, py: 2.5,
          bgcolor: col.isPro ? "rgba(255,255,255,0.05)" : "action.hover",
          borderBottom: "1px solid",
          borderColor: col.isPro ? PRO_BORDER : "divider",
        }}>
          <Typography sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 22, fontWeight: 700,
            color: col.isPro ? PRO_TEXT : "text.primary",
            letterSpacing: "-0.5px",
          }}>
            {col.label} Plan
          </Typography>
        </Box>

        {/* Groups */}
        {GROUPS.map((group, gi) => (
          <Box key={group.label}>
            <Box sx={{
              px: 3, py: 1.25,
              bgcolor: col.isPro ? "rgba(255,255,255,0.03)" : "action.hover",
              borderTop: gi > 0 ? "1px solid" : "none",
              borderBottom: "1px solid",
              borderColor: col.isPro ? PRO_BORDER : "divider",
            }}>
              <Typography sx={{
                fontSize: 10, fontWeight: 700,
                letterSpacing: "0.14em", textTransform: "uppercase",
                color: col.isPro ? PRO_TEXT_DIM : "text.disabled",
              }}>
                {group.label}
              </Typography>
            </Box>

            {group.rows.map((row, ri) => {
              const val = getVal(row, activeCol);
              return (
                <Box key={row.feature} sx={{
                  display: "flex", alignItems: "center",
                  justifyContent: "space-between",
                  px: 3, py: 1.75,
                  borderBottom: ri < group.rows.length - 1 ? "1px solid" : "none",
                  borderColor: col.isPro ? PRO_BORDER : "divider",
                }}>
                  <Typography sx={{
                    fontSize: 13, color: col.isPro ? PRO_TEXT_DIM : "text.secondary",
                    flex: 1, mr: 2,
                  }}>
                    {row.feature}
                  </Typography>
                  <Box sx={{ flexShrink: 0 }}>
                    <CellValue val={val} isPro={col.isPro} isBold={true} />
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ── Collapsible group for desktop table ───────────────────────────────────────
function GroupBlock({ group, defaultOpen = true }: { group: typeof GROUPS[number]; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Box>
      {/* Group header — clickable to collapse */}
      <Box
        onClick={() => setOpen((v) => !v)}
        sx={{
          px: 2.5, py: 1.25, cursor: "pointer",
          bgcolor: "action.hover",
          borderTop: 1, borderBottom: open ? 1 : 0, borderColor: "divider",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          "&:hover": { bgcolor: "action.selected" },
          transition: "background-color 0.15s",
        }}
      >
        <Typography sx={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "text.secondary" }}>
          {group.label}
        </Typography>
        <KeyboardArrowDownIcon sx={{
          fontSize: 16, color: "text.disabled",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s",
        }} />
      </Box>

      {open && group.rows.map((row, i) => {
        const cells = [row.free, row.basic, row.pro, row.enterprise];
        return (
          <Box key={row.feature} sx={{
            display: "grid",
            gridTemplateColumns: "2.2fr repeat(4, 1fr)",
            borderBottom: i < group.rows.length - 1 ? 1 : 0,
            borderColor: "divider",
            "&:hover": { bgcolor: "action.hover" },
            transition: "background-color 0.15s",
          }}>
            <Box sx={{ p: "13px 20px", borderRight: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13 }}>
                {row.feature}
              </Typography>
            </Box>
            {cells.map((val, ci) => {
              const col = COLS[ci];
              return (
                <Stack key={ci} alignItems="center" justifyContent="center"
                  sx={{ p: "13px 12px", bgcolor: col.isPro ? PRO_BG : "transparent" }}>
                  <CellValue val={val} isPro={col.isPro} isBold={col.key === "pro"} />
                </Stack>
              );
            })}
          </Box>
        );
      })}
    </Box>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────
export default function ComparisonTable() {
  useTheme();

  return (
    <Box component="section" id="compare" sx={{ pb: 9 }}>
      {/* Heading */}
      <Box sx={{ mb: 4.5 }}>
        <Typography variant="overline" color="text.secondary"
          sx={{ letterSpacing: "0.18em", display: "block", mb: 1.25 }}>
          Compare
        </Typography>
        <Typography sx={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: { xs: 28, sm: 34 }, fontWeight: 700, letterSpacing: "-1px",
        }} color="text.primary">
          Everything, side by side
        </Typography>
      </Box>

      {/* ── Mobile view (xs–md) ───────────────────────────────────────── */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        <MobileView />
      </Box>

      {/* ── Desktop table (md+) ──────────────────────────────────────── */}
      <Box sx={{
        display: { xs: "none", md: "block" },
        border: 1, borderColor: "divider",
        borderRadius: "16px", overflow: "hidden",
      }}>
        {/* Column headers */}
        <Box sx={{
          display: "grid",
          gridTemplateColumns: "2.2fr repeat(4, 1fr)",
          bgcolor: "action.hover",
          borderBottom: 1, borderColor: "divider",
        }}>
          <Box sx={{ p: "16px 20px", borderRight: 1, borderColor: "divider" }}>
            <Typography variant="overline" sx={{ letterSpacing: "0.1em", color: "text.disabled" }}>
              Feature
            </Typography>
          </Box>
          {COLS.map((col) => (
            <Box key={col.key} sx={{
              p: "16px 12px", textAlign: "center",
              bgcolor: col.isPro ? PRO_BG : "transparent",
              borderLeft: col.isPro ? `1px solid ${PRO_BORDER}` : "none",
              borderRight: col.isPro ? `1px solid ${PRO_BORDER}` : "none",
            }}>
              <Typography sx={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: col.isPro ? PRO_TEXT : "text.secondary",
              }}>
                {col.label}
              </Typography>
              {col.isPro && (
                <Typography sx={{ fontSize: 10, color: PRO_TEXT_DIM, mt: 0.25, letterSpacing: "0.04em" }}>
                  Most popular
                </Typography>
              )}
            </Box>
          ))}
        </Box>

        {GROUPS.map((group, gi) => (
          <GroupBlock key={group.label} group={group} defaultOpen={true} />
        ))}
      </Box>
    </Box>
  );
}