"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Box, Container, Typography, CircularProgress, Alert, Button, Snackbar } from "@mui/material";
import HeroSection from "./_components/Herosection";
import CurrentPlanCard from "./_components/CurrentPlanCard";
import PlansGrid from "./_components/PlansGrid";
import CheckoutPanel from "./_components/Checkoutpanel";
import ComparisonTable from "./_components/Comparisontable";
import FAQSection from "./_components/Faqsection";
import CancelDialog from "./_components/Canceldialog";
import {
  usePlans, useCurrentSubscription, useCancelSubscription, usePlanActions,
} from "@/hooks/useSubscription";
import { planRelation, formatLongDate } from "@/libs/utils/planBuilder";
import type { UIPlan, BillingCycle, InitiateSubscriptionResponse } from "@/types/subscription";

export default function SubscriptionPage() {
  const [billing, setBilling]                 = useState<BillingCycle>("monthly");
  const [selectedPlanKey, setSelectedPlanKey] = useState<string | null>(null);
  const [showCancel, setShowCancel]           = useState(false);
  const [toast, setToast]                     = useState<string | null>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const billingInitialised = useRef(false);

  const {
    plans, allPlans, currentSubscription, yearlySavings, bestYearlySaving,
    loading: plansLoading, error: plansError, refetch: refetchPlans,
  } = usePlans(billing);
  const { subscription, usage, refetch: refetchCurrent } = useCurrentSubscription();

  const refreshAll = useCallback(() => {
    refetchPlans();
    refetchCurrent();
  }, [refetchPlans, refetchCurrent]);

  // Open on the cycle the seller already pays, so their plan is highlighted.
  useEffect(() => {
    if (billingInitialised.current || plansLoading) return;
    billingInitialised.current = true;
    if (currentSubscription?.plan_billing_cycle === "yearly") setBilling("yearly");
  }, [plansLoading, currentSubscription]);

  const planActions = usePlanActions(refreshAll);
  const { cancel, loading: cancelling, error: cancelError } = useCancelSubscription(
    useCallback(() => {
      refreshAll();
      setShowCancel(false);
      setToast("Subscription cancelled. You keep your plan until the end of the period.");
    }, [refreshAll])
  );

  // The exact plan record being paid for (either cycle); null on Free.
  const currentPlan = currentSubscription && currentSubscription.plan_tier !== "free"
    ? allPlans.find((p: UIPlan) => p.key === currentSubscription.plan_tier
        && p.plan.billing_cycle === currentSubscription.plan_billing_cycle)?.plan ?? null
    : null;
  const handleResume = async () => {
    if (await planActions.resume()) setToast("Your plan will renew as normal.");
  };

  const freePlan = allPlans.find((p: UIPlan) => p.key === "free")?.plan ?? null;
  const freeMaxProducts = freePlan?.max_products ?? null;

  // One plan per tier for the comparison table (monthly where there's a choice).
  const comparisonPlans = useMemo(() => {
    const seen = new Set<string>();
    return [...allPlans]
      .sort((a: UIPlan, b: UIPlan) => Number(a.plan.billing_cycle !== "monthly") - Number(b.plan.billing_cycle !== "monthly"))
      .filter((p: UIPlan) => (seen.has(p.key) ? false : (seen.add(p.key), true)))
      .sort((a: UIPlan, b: UIPlan) => parseFloat(a.plan.price) - parseFloat(b.plan.price));
  }, [allPlans]);

  const handleSelectPlan = (planKey: string) => {
    const uiPlan = plans.find((p: UIPlan) => p.key === planKey);
    if (!uiPlan) return;
    const relation = planRelation(uiPlan.plan, currentSubscription);
    if (relation === "current") return;
    if (relation === "cancel") { setShowCancel(true); return; }

    setSelectedPlanKey(planKey);
    setTimeout(() => checkoutRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  };

  const handleChanged = useCallback((result: InitiateSubscriptionResponse) => {
    setSelectedPlanKey(null);
    refreshAll();
    if (result.scheduled) {
      setToast(`Switch to ${result.plan} scheduled for ${formatLongDate(result.effective_date)}.`);
    } else {
      setToast(`You're now on ${result.plan ?? "your new plan"}.`);
    }
  }, [refreshAll]);

  const selectedPlan: UIPlan | null = plans.find((p: UIPlan) => p.key === selectedPlanKey) ?? null;
  const cancelTarget = subscription && parseFloat(subscription.plan.price) > 0
    ? { plan_name: subscription.plan.name, end_date: subscription.end_date, days_remaining: subscription.days_remaining }
    : null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <HeroSection billing={billing} onBillingChange={setBilling} yearlySaving={bestYearlySaving} />

        {plansLoading && (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1.5, py: 10 }}>
            <CircularProgress size={20} thickness={5} />
            <Typography variant="body2" color="text.secondary">Loading plans…</Typography>
          </Box>
        )}

        {plansError && !plansLoading && (
          <Alert
            severity="error"
            action={<Button color="inherit" size="small" onClick={refreshAll}>Retry</Button>}
            sx={{ mb: 4, borderRadius: 2 }}
          >
            {plansError}
          </Alert>
        )}

        {!plansLoading && !plansError && (
          <>
            <CurrentPlanCard
              subscription={subscription}
              usage={usage}
              freeMaxProducts={freeMaxProducts}
              busy={planActions.busy as "resume" | "keep" | null}
              error={planActions.error}
              onCancel={() => setShowCancel(true)}
              onResume={handleResume}
              onKeepCurrentPlan={async () => { if (await planActions.keepCurrentPlan()) setToast("Scheduled change removed."); }}
            />

            {plans.length > 0 && (
              <PlansGrid
                plans={plans}
                selectedPlanKey={selectedPlanKey}
                currentSubscription={currentSubscription}
                yearlySavings={yearlySavings}
                billing={billing}
                currentPlan={currentPlan}
                onSelectPlan={handleSelectPlan}
                onCancel={() => setShowCancel(true)}
                onResume={handleResume}
                resuming={planActions.busy === "resume"}
              />
            )}

            <div ref={checkoutRef} style={{ scrollMarginTop: 80 }}>
              {selectedPlan && (
                <CheckoutPanel
                  key={`${selectedPlan.plan.id}`}
                  plan={selectedPlan}
                  billing={billing}
                  onChanged={handleChanged}
                  onCancel={() => setSelectedPlanKey(null)}
                />
              )}
            </div>

            <ComparisonTable plans={comparisonPlans} />
            <FAQSection />
          </>
        )}
      </Container>

      <CancelDialog
        open={showCancel}
        subscription={cancelTarget}
        freeMaxProducts={freeMaxProducts}
        loading={cancelling}
        error={cancelError}
        onConfirm={(reason) => cancel(reason)}
        onClose={() => setShowCancel(false)}
      />

      <Snackbar
        open={!!toast}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        message={toast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
}
