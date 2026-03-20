"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Container, Typography, CircularProgress, Alert, Button } from "@mui/material";
import HeroSection from "./_components/Herosection";
import PlansGrid from "./_components/PlansGrid";
import CheckoutPanel from "./_components/Checkoutpanel";
import ComparisonTable from "./_components/Comparisontable";
import FAQSection from "./_components/Faqsection";
import CancelDialog from "./_components/Canceldialog";
import { usePlans, useCancelSubscription } from "@/hooks/useSubscription";
import type { UIPlan, BillingCycle } from "@/types/subscription";

export default function SubscriptionPage() {
  const [billing, setBilling]                 = useState<BillingCycle>("monthly");
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [showCancel, setShowCancel]           = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────────
  // Both run in parallel on mount
  // usePlans now returns currentTier + currentSubscription alongside the plan
  // list — no need for a separate useCurrentSubscription() call on this page.
  const {
    plans,
    currentTier,
    activePlanKey,
    currentSubscription,
    loading: plansLoading,
    error: plansError,
    refetch: refetchPlans,
  } = usePlans(billing);

  // ── Pre-select the vendor's current plan tier on load ──────────────────────
  useEffect(() => {
    if (!plansLoading && selectedPlanKey === null) {
      setSelectedPlanKey(currentTier ?? "free");
    }
  }, [plansLoading, currentTier]);

  // ── Cancel subscription ────────────────────────────────────────────────────
  const { cancel, loading: cancelling, error: cancelError } = useCancelSubscription(() => {
    refetchPlans();         // reload plans + subscription state after cancel
    setShowCancel(false);
  });

  // ── Plan selection ─────────────────────────────────────────────────────────
  const handleSelectPlan = (planKey: string) => {
    const isCurrentPlan = (currentTier ?? "free") === planKey;

    if (isCurrentPlan) {
      // Clicking the current plan opens the cancel dialog instead of checkout
      if (planKey !== "free") setShowCancel(true);
      return;
    }

    setSelectedPlanKey(planKey);
    if (planKey !== "free") {
      setTimeout(() => {
        checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    }
  };

  // currentPlan for CheckoutPanel — always matches billing + tier
  const currentPlan: UIPlan | null = plans.find((p) => p.key === selectedPlanKey) ?? null;

  // activePlanKey is the composite key from the hook — used by PlansGrid
  // to highlight exactly one card (tier + billing_cycle must both match).

  const isLoading = plansLoading;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <HeroSection billing={billing} onBillingChange={setBilling} />

        {/* Loading */}
        {isLoading && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, py: 10 }}>
            <CircularProgress size={20} thickness={5} />
            <Typography variant="body2" color="text.secondary">Loading plans…</Typography>
          </Box>
        )}

        {/* Error */}
        {plansError && !isLoading && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={() => window.location.reload()}>Retry</Button>}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {plansError}
          </Alert>
        )}

        {/* Plans grid */}
        {!isLoading && !plansError && plans.length > 0 && (
          <PlansGrid
            plans={plans}
            billing={billing}
            selectedPlanKey={selectedPlanKey}
            activePlanKey={activePlanKey}
            onSelectPlan={handleSelectPlan}
          />
        )}

        {/* Checkout — only shown when selecting a DIFFERENT (non-current) plan */}
        <div ref={checkoutRef}>
          {selectedPlanKey &&
            selectedPlanKey !== "free" &&
            selectedPlanKey !== currentTier &&
            currentPlan && (
              <CheckoutPanel plan={currentPlan} billing={billing} />
            )}
        </div>

        <ComparisonTable />
        <FAQSection />

        <Box
          component="footer"
          sx={{
            borderTop: 1, borderColor: "divider",
            py: 3.5,
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: 1.5,
          }}
        >
          <Typography variant="caption" color="text.disabled">
            © 2026 Negromart Ghana. All rights reserved.
          </Typography>
          <Box sx={{ display: "flex", gap: 3 }}>
            {["Terms", "Privacy", "Contact"].map((l) => (
              <Typography
                key={l} component="a" href="#" variant="caption" color="text.disabled"
                sx={{ textDecoration: "none", "&:hover": { color: "text.primary" }, transition: "color 0.18s" }}
              >
                {l}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>

      {/* Cancel dialog — shown when vendor clicks their current paid plan */}
      <CancelDialog
        open={showCancel}
        subscription={currentSubscription}
        loading={cancelling}
        error={cancelError}
        onConfirm={(reason) => cancel(reason)}
        onClose={() => setShowCancel(false)}
      />
    </Box>
  );
}