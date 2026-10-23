// lib/utils/planBuilder.ts
// Converts raw SubscriptionPlan objects from the API into UIPlan objects
// that the frontend components actually consume.
// Centralising this here means the mapping logic is in one place.

import type { SubscriptionPlan, UIPlan, PlanFeature, PlanTier } from "@/types/subscription";

/**
 * Maps a raw SubscriptionPlan from the API into a UIPlan
 * by deriving the feature list and unlock bullets from the plan's flags.
 *
 * @example
 * const plans = await fetchPlans();
 * const uiPlans = plans.map(buildUIPlan);
 */
export function buildUIPlan(plan: SubscriptionPlan): UIPlan {
  const maxProducts = plan.max_products;
  const unlimitedProducts = maxProducts >= 999_999;

  // ── Feature list (shown on plan cards) ──────────────────────────────────
  // Order matters — most important features first.
  const features: PlanFeature[] = [
    {
      label: `${unlimitedProducts ? "Unlimited" : maxProducts} active listings`,
      on: true,
    },
    {
      label: `${plan.max_images_per_product} images per product`,
      on: true,
    },
    {
      label: plan.max_images_per_variant > 0
        ? `${plan.max_images_per_variant} extra photos per variant`
        : "Extra variant photos",
      on: plan.max_images_per_variant > 0,
    },
    {
      label: `${plan.max_categories} product categories`,
      on: true,
    },
    {
      label: "Analytics dashboard",
      on: plan.can_use_analytics,
    },
    {
      label: "Discount & promo codes",
      on: plan.can_offer_discounts,
    },
    {
      label: "Bulk CSV upload",
      on: plan.can_access_bulk_upload,
    },
    {
      label: "Storefront customization",
      on: plan.can_use_storefront_customization,
    },
    {
      label: "Featured product boosts",
      on: plan.can_feature_products,
    },
    {
      label: "Priority support",
      on: plan.priority_support,
    },
    {
      label: "Featured vendor placement",
      on: plan.is_featured_vendor,
    },
  ];

  // ── Unlock bullets (shown in the checkout summary sidebar) ───────────────
  // Only include the "on" features. Cap at 5 for readability.
  const unlocks = features
    .filter((f) => f.on)
    .slice(0, 5)
    .map((f) => f.label);

  return {
    key: plan.tier as PlanTier,
    plan,
    features,
    unlocks,
    isPro: plan.is_recommended,
  };
}

/**
 * Converts an array of raw plans into a map keyed by tier.
 * Useful when you need to look up a specific tier quickly.
 *
 * @example
 * const planMap = buildPlanMap(plans);
 * const proPlan = planMap.pro;
 */
export function buildPlanMap(
  plans: SubscriptionPlan[]
): Partial<Record<PlanTier, UIPlan>> {
  return Object.fromEntries(
    plans.map((p) => [p.tier, buildUIPlan(p)])
  ) as Partial<Record<PlanTier, UIPlan>>;
}

/**
 * Returns the display price for a plan based on billing cycle.
 * Since the API stores separate plan records for monthly/yearly,
 * this just returns plan.price formatted.
 *
 * If you want to show the monthly equivalent of a yearly plan:
 *   monthlyEquivalent = yearly_price / 12
 */
export function getDisplayPrice(plan: SubscriptionPlan): string {
  return plan.price_formatted;
}

/**
 * Returns the monthly equivalent price for yearly plans
 * so you can show "GHS 120/mo" on the yearly billing toggle.
 */
export function getMonthlyEquivalent(plan: SubscriptionPlan): string {
  const price = parseFloat(plan.price);
  if (plan.billing_cycle === "yearly") {
    const monthly = price / 12;
    return `GHS ${monthly.toFixed(2)}`;
  }
  return plan.price_formatted;
}
const TIER_RANK: Record<PlanTier, number> = { free: 0, basic: 1, pro: 2, enterprise: 3 };
const CYCLE_DAYS: Record<string, number> = { monthly: 30, yearly: 365 };

/**
 * How a plan card relates to the vendor's current plan. Mirrors
 * payments/services.quote_change so the button label matches what the
 * backend will do:
 *   upgrade   — higher tier, or same tier monthly → yearly: pay prorated now
 *   downgrade — lower tier, or yearly → monthly: switches at renewal
 *   cancel    — the Free card while on a paid plan (moving to Free = cancel)
 */
export type PlanRelation = "new" | "current" | "upgrade" | "downgrade" | "cancel";

export function planRelation(
  plan: SubscriptionPlan,
  current: { plan_tier: PlanTier; plan_billing_cycle: string } | null
): PlanRelation {
  const onPaid = !!current && current.plan_tier !== "free";
  if (plan.tier === "free") return onPaid ? "cancel" : "current";
  if (!onPaid) return "new";
  if (current.plan_tier === plan.tier && current.plan_billing_cycle === plan.billing_cycle) return "current";

  const rankUp = TIER_RANK[plan.tier] - TIER_RANK[current.plan_tier];
  if (rankUp > 0) return "upgrade";
  if (rankUp < 0) return "downgrade";
  return (CYCLE_DAYS[plan.billing_cycle] ?? 30) > (CYCLE_DAYS[current.plan_billing_cycle] ?? 30)
    ? "upgrade"
    : "downgrade";
}

/** "GHS 1,250.00" from a decimal string or number. */
export function formatGHS(value: string | number): string {
  const n = typeof value === "number" ? value : parseFloat(value || "0");
  return `GHS ${n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "11 April 2026" */
export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
