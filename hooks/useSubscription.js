// hooks/useSubscription.js
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  fetchPlans,
  initiateSubscription,
  verifySubscription,
  fetchCurrentSubscription,
  cancelSubscription,
  updateAutoRenew,
  fetchPaymentHistory,
  fetchSavedCards,
  deleteCard,
  setDefaultCard,
  canUseFeature,
  fetchPlanQuote,
  resumeSubscription,
  clearScheduledChange,
} from "@/libs/api/subscriptions";

import { buildUIPlan } from "@/libs/utils/planBuilder";
import { ApiRequestError } from "@/libs/api/client";

// ─────────────────────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────────────────────
function toErrorMessage(e) {
  if (e instanceof ApiRequestError) return e.message;
  if (e instanceof Error) return e.message;
  return "An unexpected error occurred.";
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. usePlans
// ─────────────────────────────────────────────────────────────────────────────
/** @typedef {import("@/types/subscription").UIPlan} UIPlan */
/** @typedef {import("@/types/subscription").ActiveSubscription} ActiveSubscription */
/** @typedef {import("@/types/subscription").CurrentSubscriptionResponse} CurrentSubscriptionResponse */

export function usePlans(billing = "monthly") {
  const [allPlans, setAllPlans] = useState(/** @type {UIPlan[]} */ ([]));
  const [currentSubscription, setCurrentSubscription] = useState(/** @type {ActiveSubscription | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchPlans()
      .then((response) => {
        setAllPlans(response.plans.map(buildUIPlan));
        setCurrentSubscription(response.current_subscription);
      })
      .catch((e) => setError(toErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const TIERS = ["free", "basic", "pro", "enterprise"];

  const plans = TIERS.flatMap((tier) => {
    const tierPlans = allPlans.filter((p) => p.key === tier);
    if (tierPlans.length === 0) return [];

    if (tier === "free") return [tierPlans[0]];

    const target = billing === "yearly" ? "yearly" : "monthly";

    const match =
      tierPlans.find((p) => p.plan.billing_cycle === target) ||
      tierPlans.find((p) => p.plan.billing_cycle === "monthly") ||
      tierPlans[0];

    return [match];
  });

  // Yearly saving per tier vs paying monthly for 12 months, e.g. { pro: 20 }.
  /** @type {Record<string, number>} */
  const yearlySavings = {};
  for (const tier of TIERS) {
    const monthly = allPlans.find((p) => p.key === tier && p.plan.billing_cycle === "monthly");
    const yearly  = allPlans.find((p) => p.key === tier && p.plan.billing_cycle === "yearly");
    const m = parseFloat(monthly?.plan.price ?? "0");
    const y = parseFloat(yearly?.plan.price ?? "0");
    if (m > 0 && y > 0 && y < m * 12) {
      yearlySavings[tier] = Math.round((1 - y / (m * 12)) * 100);
    }
  }
  const bestYearlySaving = Math.max(0, ...Object.values(yearlySavings));

  // A Free-plan record counts as "no paid plan" everywhere on this page.
  const currentTier = currentSubscription?.plan_tier ?? null;

  const activePlanKey = currentSubscription
    ? currentSubscription.plan_tier === "free"
      ? "free"
      : `${currentSubscription.plan_tier}-${currentSubscription.plan_billing_cycle}`
    : "free";

  return {
    plans,
    allPlans,
    currentTier,
    activePlanKey,
    currentSubscription,
    yearlySavings,
    bestYearlySaving,
    loading,
    error,
    refetch: load,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1b. usePlanQuote — prorated price / effective date for a plan change
// ─────────────────────────────────────────────────────────────────────────────
export function usePlanQuote(planId, billing) {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!planId) { setQuote(null); return; }
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchPlanQuote(planId, billing)
      .then((q) => { if (!cancelled) setQuote(q); })
      .catch((e) => { if (!cancelled) setError(toErrorMessage(e)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [planId, billing]);

  return { quote, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1c. usePlanActions — resume a cancelled plan / drop a scheduled downgrade
// ─────────────────────────────────────────────────────────────────────────────
export function usePlanActions(onDone) {
  const [busy, setBusy] = useState(/** @type {"resume" | "keep" | null} */ (null));
  const [error, setError] = useState(/** @type {string | null} */ (null));

  const run = useCallback(async (kind, fn) => {
    setBusy(kind);
    setError(null);
    try {
      await fn();
      onDone?.();
      return true;
    } catch (e) {
      setError(toErrorMessage(e));
      return false;
    } finally {
      setBusy(null);
    }
  }, [onDone]);

  return {
    resume:          () => run("resume", resumeSubscription),
    keepCurrentPlan: () => run("keep", clearScheduledChange),
    busy,
    error,
    clearError: () => setError(null),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. useInitiateSubscription
// ─────────────────────────────────────────────────────────────────────────────
export function useInitiateSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const initiate = useCallback(async (planId, billing) => {
    setLoading(true);
    setError(null);

    try {
      const result = await initiateSubscription({
        plan_id: planId,
        billing,
      });

      // No payment needed (downgrade scheduled / upgrade covered by credit):
      // the caller shows the outcome instead of redirecting.
      if (!result.authorization_url) {
        setLoading(false);
        return result;
      }
      // Card checkout opens Paystack inline when its script is loaded;
      // otherwise fall back to the hosted page.
      if (!(result.access_code && typeof window !== "undefined" && window.PaystackPop)) {
        window.location.href = result.authorization_url;
      }
      return result;
    } catch (e) {
      setError(toErrorMessage(e));
      setLoading(false);
      return null;
    }
  }, []);

  return {
    initiate,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. useVerifySubscription
// ─────────────────────────────────────────────────────────────────────────────
export function useVerifySubscription() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const reference =
    searchParams.get("ref") ?? searchParams.get("reference");

  const [status, setStatus] = useState("idle");
  const [planName, setPlanName] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState(null);

  const hasFired = useRef(false);

  const verify = useCallback(() => {
    if (!reference) {
      setError("No payment reference found in URL.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    verifySubscription(reference)
      .then((data) => {
        setPlanName(data.plan);
        setEndDate(data.end_date);
        setStatus("success");
      })
      .catch((e) => {
        setError(toErrorMessage(e));
        setStatus("error");
      });
  }, [reference]);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;
    verify();
  }, [verify]);

  const goToDashboard = useCallback(() => {
    router.push("/dashboard");
  }, [router]);

  return {
    status,
    planName,
    endDate,
    error,
    goToDashboard,
    retry: verify,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. useCurrentSubscription
// ─────────────────────────────────────────────────────────────────────────────
export function useCurrentSubscription() {
  const [data, setData] = useState(/** @type {CurrentSubscriptionResponse | null} */ (null));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchCurrentSubscription()
      .then(setData)
      .catch((e) => setError(toErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return {
    subscription: data?.subscription ?? null,
    usage: data?.usage ?? null,
    loading,
    error,
    refetch: load,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. useCancelSubscription
// ─────────────────────────────────────────────────────────────────────────────
export function useCancelSubscription(onSuccess) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cancel = useCallback(
    async (reason) => {
      setLoading(true);
      setError(null);

      try {
        await cancelSubscription(reason);
        if (onSuccess) onSuccess();
      } catch (e) {
        setError(toErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [onSuccess]
  );

  return {
    cancel,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. useAutoRenew
// ─────────────────────────────────────────────────────────────────────────────
export function useAutoRenew(serverValue) {
  const [autoRenew, setAutoRenew] = useState(serverValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setAutoRenew(serverValue);
  }, [serverValue]);

  const toggle = useCallback(async () => {
    const newValue = !autoRenew;
    setAutoRenew(newValue);
    setLoading(true);
    setError(null);

    try {
      const result = await updateAutoRenew(newValue);
      setAutoRenew(result.auto_renew);
    } catch (e) {
      setAutoRenew(!newValue);
      setError(toErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [autoRenew]);

  return { autoRenew, toggle, loading, error };
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. usePaymentHistory
// ─────────────────────────────────────────────────────────────────────────────
export function usePaymentHistory() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchPaymentHistory()
      .then(setTransactions)
      .catch((e) => setError(toErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { transactions, loading, error, refetch: load };
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. useSavedCards
// ─────────────────────────────────────────────────────────────────────────────
export function useSavedCards() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);

    fetchSavedCards()
      .then(setCards)
      .catch((e) => setError(toErrorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const removeCard = useCallback(
    async (cardId) => {
      setCards((prev) => prev.filter((c) => c.id !== cardId));
      try {
        await deleteCard(cardId);
      } catch (e) {
        setError(toErrorMessage(e));
        load();
      }
    },
    [load]
  );

  const makeDefault = useCallback(
    async (cardId) => {
      setCards((prev) =>
        prev.map((c) => ({
          ...c,
          is_default: c.id === cardId,
        }))
      );
      try {
        await setDefaultCard(cardId);
      } catch (e) {
        setError(toErrorMessage(e));
        load();
      }
    },
    [load]
  );

  return {
    cards,
    loading,
    error,
    removeCard,
    makeDefault,
    refetch: load,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. useFeatureGate
// ─────────────────────────────────────────────────────────────────────────────
export function useFeatureGate(feature) {
  const { subscription, loading } = useCurrentSubscription();

  return {
    allowed: canUseFeature(subscription, feature),
    loading,
    planName: subscription?.plan?.name ?? null,
  };
}