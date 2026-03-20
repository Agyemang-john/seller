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
export function usePlans(billing = "monthly") {
  const [allPlans, setAllPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
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
    loading,
    error,
    refetch: load,
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

      window.location.href = result.authorization_url;
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
  const [data, setData] = useState(null);
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