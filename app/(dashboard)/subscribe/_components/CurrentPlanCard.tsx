"use client";

import { Box, Typography, Stack, Button, LinearProgress, Alert, Chip, CircularProgress, useTheme } from "@mui/material";
import EventRepeatOutlinedIcon from "@mui/icons-material/EventRepeatOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import { useRouter } from "next/navigation";
import type { VendorSubscription, SubscriptionUsage } from "@/types/subscription";
import { formatGHS, formatLongDate } from "@/libs/utils/planBuilder";

interface CurrentPlanCardProps {
  subscription: VendorSubscription | null;
  usage: SubscriptionUsage | null;
  /** Product limit on Free, used when the store has no paid plan */
  freeMaxProducts: number | null;
  busy: "resume" | "keep" | null;
  error: string | null;
  onCancel: () => void;
  onResume: () => void;
  onKeepCurrentPlan: () => void;
}

const UNLIMITED = 999_999;

const TONE_HUE = { info: "blue", warning: "amber", error: "red" } as const;

function Notice({ icon, tone, children, action }: {
  icon: React.ReactNode; tone: keyof typeof TONE_HUE; children: React.ReactNode; action?: React.ReactNode;
}) {
  const st = useTheme().palette.status[TONE_HUE[tone]];
  return (
    <Stack
      direction={{ xs: "column", sm: "row" }}
      alignItems={{ sm: "center" }}
      spacing={1.5}
      sx={{
        mt: 2.5, px: 2, py: 1.5, borderRadius: "12px",
        border: "1px solid", borderColor: st.dot, bgcolor: st.bg,
      }}
    >
      <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ flex: 1 }}>
        <Box sx={{ color: st.dot, display: "flex", mt: "1px" }}>{icon}</Box>
        <Typography variant="body2" sx={{ color: "text.primary", lineHeight: 1.6 }}>{children}</Typography>
      </Stack>
      {action}
    </Stack>
  );
}

export default function CurrentPlanCard({
  subscription, usage, freeMaxProducts, busy, error, onCancel, onResume, onKeepCurrentPlan,
}: CurrentPlanCardProps) {
  const router = useRouter();
  const plan = subscription?.plan;
  const isPaid = !!plan && parseFloat(plan.price) > 0;

  const maxProducts = usage?.max_products ?? (isPaid ? plan!.max_products : freeMaxProducts) ?? 0;
  const used = usage?.active_products_count ?? 0;
  const unlimited = maxProducts >= UNLIMITED;
  const usagePct = unlimited || !maxProducts ? 0 : Math.min(Math.round((used / maxProducts) * 100), 100);

  const cycleDays = plan?.billing_cycle === "yearly" ? 365 : 30;
  const periodPct = subscription
    ? Math.min(100, Math.max(0, 100 - (subscription.days_remaining / cycleDays) * 100))
    : 0;

  const pastDue = subscription?.status === "past_due";
  const cancelling = !!subscription?.cancel_at_period_end;
  const scheduled = subscription?.scheduled_plan ?? null;

  return (
    <Box sx={{ mb: 5, borderRadius: "20px", border: 1, borderColor: "divider", bgcolor: "background.paper", p: { xs: 2.5, md: 3.5 } }}>
      <Stack direction={{ xs: "column", md: "row" }} spacing={{ xs: 3, md: 5 }} alignItems={{ md: "center" }}>
        {/* ── Plan ─────────────────────────────────────────────────────── */}
        <Box sx={{ flex: 1.2, minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: "0.14em", lineHeight: 1.4 }}>
            Your plan
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1.25} sx={{ mt: 0.5, mb: 0.75, flexWrap: "wrap", rowGap: 0.75 }}>
            <Typography sx={{ fontFamily: "var(--font-figtree), system-ui, sans-serif", fontSize: { xs: 26, md: 30 }, fontWeight: 700, letterSpacing: "-0.8px", lineHeight: 1.1 }} color="text.primary">
              {isPaid ? plan!.name : "Free"}
            </Typography>
            {pastDue && <Chip size="small" color="error" label="Payment overdue" sx={{ height: 22, fontWeight: 700, fontSize: 11 }} />}
            {!pastDue && cancelling && <Chip size="small" color="warning" label="Cancelled" sx={{ height: 22, fontWeight: 700, fontSize: 11 }} />}
          </Stack>
          <Typography variant="body2" color="text.secondary">
            {isPaid
              ? `${formatGHS(plan!.price)} / ${plan!.billing_cycle === "yearly" ? "year" : "month"} · ${plan!.commission_display} commission · ${plan!.payout_delay_days}-day payouts`
              : "Upgrade for more listings, lower commission and faster payouts."}
          </Typography>
        </Box>

        {/* ── Billing period ───────────────────────────────────────────── */}
        {isPaid && subscription && (
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.primary">
                {cancelling ? "Ends" : pastDue ? "Was due" : "Renews"} {formatLongDate(subscription.end_date)}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {subscription.days_remaining} day{subscription.days_remaining === 1 ? "" : "s"} left
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={periodPct}
              sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: "text.primary" } }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
              {cancelling
                ? "No further charges."
                : `Next charge: ${formatGHS(subscription.renewal_amount)}`}
            </Typography>
          </Box>
        )}

        {/* ── Product usage ────────────────────────────────────────────── */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
            <Typography variant="body2" fontWeight={600} color="text.primary">Active listings</Typography>
            <Typography variant="caption" color={usagePct >= 90 ? "error.main" : "text.secondary"} fontWeight={usagePct >= 90 ? 700 : 400}>
              {used} of {unlimited ? "unlimited" : maxProducts}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={unlimited ? 0 : usagePct}
            sx={{ height: 6, borderRadius: 3, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 3, bgcolor: usagePct >= 90 ? "error.main" : "text.primary" } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
            {unlimited ? "No listing limit on your plan." : usagePct >= 90 ? "Almost at your limit — upgrade to list more." : `${Math.max(maxProducts - used, 0)} listings left.`}
          </Typography>
        </Box>

        {/* ── Actions ──────────────────────────────────────────────────── */}
        {isPaid && (
          <Stack direction={{ xs: "row", md: "column" }} spacing={1} sx={{ flexShrink: 0 }}>
            <Button size="small" variant="outlined" onClick={() => router.push("/billing")}
              sx={{ borderRadius: "10px", fontWeight: 600, borderColor: "divider", color: "text.primary", "&:hover": { borderColor: "text.primary" } }}>
              Billing &amp; invoices
            </Button>
            {!cancelling && (
              <Button size="small" onClick={onCancel}
                sx={{ borderRadius: "10px", fontWeight: 600, color: "text.secondary", "&:hover": { color: "error.main", bgcolor: "transparent" } }}>
                Cancel plan
              </Button>
            )}
          </Stack>
        )}
      </Stack>

      {/* ── State notices ──────────────────────────────────────────────── */}
      {pastDue && (
        <Notice tone="error" icon={<ReportProblemOutlinedIcon sx={{ fontSize: 18 }} />}
          action={<Button size="small" variant="contained" color="error" disableElevation onClick={() => router.push("/billing")} sx={{ borderRadius: "8px", fontWeight: 700, flexShrink: 0 }}>Pay now</Button>}>
          We couldn&apos;t collect your renewal payment. Pay now to keep your {plan?.name} features.
        </Notice>
      )}
      {!pastDue && cancelling && subscription && (
        <Notice tone="warning" icon={<EventBusyOutlinedIcon sx={{ fontSize: 18 }} />}
          action={
            <Button size="small" variant="outlined" onClick={onResume} disabled={busy === "resume"}
              startIcon={busy === "resume" ? <CircularProgress size={12} color="inherit" /> : <EventRepeatOutlinedIcon sx={{ fontSize: 16 }} />}
              sx={{ borderRadius: "8px", fontWeight: 700, flexShrink: 0, borderColor: "text.primary", color: "text.primary" }}>
              Keep my plan
            </Button>
          }>
          You keep {plan?.name} until <strong>{formatLongDate(subscription.end_date)}</strong>. After that your store moves to Free
          {freeMaxProducts != null && freeMaxProducts < UNLIMITED ? ` and only ${freeMaxProducts} listings stay live` : ""}.
        </Notice>
      )}
      {!pastDue && !cancelling && scheduled && subscription && (
        <Notice tone="info" icon={<TrendingDownRoundedIcon sx={{ fontSize: 18 }} />}
          action={
            <Button size="small" variant="outlined" onClick={onKeepCurrentPlan} disabled={busy === "keep"}
              startIcon={busy === "keep" ? <CircularProgress size={12} color="inherit" /> : null}
              sx={{ borderRadius: "8px", fontWeight: 700, flexShrink: 0 }}>
              Stay on {plan?.name}
            </Button>
          }>
          Switching to <strong>{scheduled.name}</strong> on {formatLongDate(subscription.end_date)}. You&apos;ll be charged {formatGHS(scheduled.price)} then, and keep {plan?.name} until that date.
        </Notice>
      )}
      {error && <Alert severity="error" sx={{ mt: 2, borderRadius: "10px" }}>{error}</Alert>}
    </Box>
  );
}
