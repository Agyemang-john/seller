"use client";

import { Box, Typography, Stack } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import { useTheme } from "@mui/material/styles";

// ── Pro column constants (intentional off-theme dark surface) ─────────────────
const PRO_TEXT       = "#ffffff";
const PRO_TEXT_DIM   = "rgba(255,255,255,0.5)";
const PRO_BORDER     = "rgba(255,255,255,0.08)";

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
      { feature: "Active listings",     free: "10",    basic: "50",    pro: "200",      enterprise: "Unlimited" },
      { feature: "Images per product",  free: "3",     basic: "6",     pro: "15",       enterprise: "Unlimited" },
      { feature: "Categories",          free: "2",     basic: "5",     pro: "All",      enterprise: "All" },
      { feature: "Bulk CSV upload",     free: false,   basic: false,   pro: true,       enterprise: true },
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

const COLS = ["Free", "Basic", "Pro", "Enterprise"] as const;
type ColName = typeof COLS[number];

function CellIcon({ on, isPro }: { on: boolean; isPro: boolean }) {
  if (on) {
    return (
      <CheckIcon
        sx={{
          fontSize: 14,
          fontWeight: 700,
          color: isPro ? PRO_TEXT : "text.primary",
        }}
      />
    );
  }
  return (
    <CloseIcon
      sx={{
        fontSize: 14,
        color: isPro ? PRO_TEXT_DIM : "text.disabled",
      }}
    />
  );
}

function CellValue({
  val,
  isPro,
  isProCol,
}: {
  val: React.ReactNode;
  isPro: boolean;
  isProCol: boolean;
}) {
  if (typeof val === "boolean") {
    return <CellIcon on={val} isPro={isPro} />;
  }
  return (
    <Typography
      variant="body2"
      sx={{
        fontWeight: isProCol ? 600 : 400,
        color: isPro ? (isProCol ? PRO_TEXT : PRO_TEXT_DIM) : isProCol ? "text.primary" : "text.secondary",
      }}
    >
      {val}
    </Typography>
  );
}

export default function ComparisonTable() {
  useTheme(); // ensures theme context is consumed for future extensions

  return (
    <Box component="section" id="compare" sx={{ pb: 9 }}>
      {/* ── Heading ─────────────────────────────────────────────────────── */}
      <Box sx={{ mb: 4.5 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ letterSpacing: "0.18em", display: "block", mb: 1.25 }}
        >
          Compare
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 34,
            fontWeight: 700,
            letterSpacing: "-1px",
          }}
          color="text.primary"
        >
          Everything, side by side
        </Typography>
      </Box>

      <Box
        sx={{
          border: 1,
          borderColor: "divider",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* ── Column headers ───────────────────────────────────────────── */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "2.2fr repeat(4, 1fr)",
            // Header row uses text.primary surface — same dark treatment as Pro card
            bgcolor: "action.hover",
            borderBottom: `1px solid ${PRO_BORDER}`,
          }}
        >
          <Box
            sx={{
              p: "16px 20px",
              borderRight: `1px solid ${PRO_BORDER}`,
            }}
          >
            <Typography
              variant="overline"
              sx={{ letterSpacing: "0.1em" }}
            >
              Feature
            </Typography>
          </Box>
          {COLS.map((name: ColName) => (
            <Box key={name} sx={{ p: "16px 20px", textAlign: "center" }}>
              <Typography
                variant="overline"
                sx={{
                  // color: name === "Pro" ? PRO_TEXT : PRO_TEXT_DIM,
                  letterSpacing: "0.06em",
                  fontWeight: name === "Pro" ? 700 : 400,
                }}
              >
                {name}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* ── Groups ───────────────────────────────────────────────────── */}
        {GROUPS.map((group) => (
          <Box key={group.label}>
            {/* Group label row */}
            <Box
              sx={{
                px: 2.5,
                py: 1.25,
                bgcolor: "action.hover",
                borderTop: 1,
                borderBottom: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="overline"
                // color="text.secondary"
                sx={{ letterSpacing: "0.14em" }}
              >
                {group.label}
              </Typography>
            </Box>

            {/* Data rows */}
            {group.rows.map((row, i) => {
              const cells = [row.free, row.basic, row.pro, row.enterprise];
              return (
                <Box
                  key={row.feature}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2.2fr repeat(4, 1fr)",
                    borderBottom: i < group.rows.length - 1 ? 1 : 0,
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                    transition: "background-color 0.15s",
                  }}
                >
                  {/* Feature label */}
                  <Box sx={{ p: "13px 20px", borderRight: 1, borderColor: "divider" }}>
                    <Typography variant="body2" color="text.secondary">
                      {row.feature}
                    </Typography>
                  </Box>

                  {/* Value cells */}
                  {cells.map((val, ci) => {
                    const colName = COLS[ci];
                    const isProCol = colName === "Pro";
                    return (
                      <Stack
                        key={ci}
                        alignItems="center"
                        justifyContent="center"
                        sx={{ p: "13px 20px" }}
                      >
                        <CellValue val={val} isPro={false} isProCol={isProCol} />
                      </Stack>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
    </Box>
  );
}