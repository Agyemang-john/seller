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