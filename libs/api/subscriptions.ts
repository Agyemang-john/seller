// lib/api/subscriptions.ts
// Every API call related to subscriptions.
// Import from this file only — never use apiClient directly in components.
//
// Usage:
//   import { fetchPlans, initiateSubscription } from "@/lib/api/subscriptions"

import { apiClient } from "./client";
import type {
  SubscriptionPlan,
  InitiateSubscriptionRequest,
  InitiateSubscriptionResponse,
  VerifySubscriptionResponse,
  CurrentSubscriptionResponse,
  CancelSubscriptionResponse,
  UpdateAutoRenewResponse,
  PaymentTransaction,
  SavedCard,
  SetDefaultCardResponse,
  BillingCycle,
} from "@/types/subscription";

// ─────────────────────────────────────────────────────────────────────────────
// Plans — public endpoint, no auth required
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/subscriptions/plans/
 *
 * Fetches all active subscription plans from the database.
 * Used to populate the plan cards on the subscription page.
 * No authentication required.
 *
 * @returns Array of SubscriptionPlan ordered by price (cheapest first).
 *
 * @example
 * const plans = await fetchPlans();
 * // plans[0] = { id: 1, name: "Free", tier: "free", price: "0.00", ... }
 */
export async function fetchPlans(): Promise<SubscriptionPlan[]> {
  return apiClient.get<SubscriptionPlan[]>("/api/v1/payments/plans/", {
    public: true,   // no JWT — this is a public endpoint
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Subscription lifecycle
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /api/subscriptions/initiate/
 *
 * Called when the vendor clicks "Subscribe now".
 * The backend:
 *   1. Resolves the correct plan (monthly vs yearly variant)
 *   2. Creates a pending PaymentTransaction record
 *   3. Calls Paystack /transaction/initialize
 *   4. Returns the authorization_url
 *
 * The frontend should then redirect:
 *   window.location.href = result.authorization_url
 *
 * @param planId  The SubscriptionPlan.id from the database.
 * @param billing "monthly" | "yearly"
 *
 * @example
 * const result = await initiateSubscription({ plan_id: 3, billing: "monthly" });
 * window.location.href = result.authorization_url;
 */
export async function initiateSubscription(
  data: InitiateSubscriptionRequest
): Promise<InitiateSubscriptionResponse> {
  return apiClient.post<InitiateSubscriptionResponse>(
    "/api/v1/payments/initiate/",
    data
  );
}

/**
 * GET /api/subscriptions/verify/?ref=SUB-1-XXXXXXXX
 *
 * Called after Paystack redirects back to:
 *   /vendor/subscription/verify/?ref=SUB-1-XXXXXXXX
 *
 * The backend:
 *   1. Calls Paystack /transaction/verify/{reference}
 *   2. Saves PaystackCustomer + PaystackAuthorization (card token)
 *   3. Creates the VendorSubscription (status=active)
 *   4. Updates the PaymentTransaction (status=success)
 *   5. Syncs Vendor.is_subscribed
 *   6. Fires the confirmation email via Celery
 *
 * @param reference  The Paystack reference from the URL query param.
 *
 * @example
 * // On /vendor/subscription/verify/ page:
 * const ref = searchParams.get("ref");
 * const result = await verifySubscription(ref);
 * // result.plan === "Pro"
 */
export async function verifySubscription(
  reference: string
): Promise<VerifySubscriptionResponse> {
  return apiClient.get<VerifySubscriptionResponse>(
    `/api/v1/payments/verify/?ref=${encodeURIComponent(reference)}`
  );
}

/**
 * GET /api/subscriptions/current/
 *
 * Returns the vendor's current active subscription and their usage tracker.
 * Used in the vendor dashboard, billing settings, and feature-gate checks.
 *
 * @returns { subscription: VendorSubscription | null, usage: SubscriptionUsage | null }
 *
 * @example
 * const { subscription, usage } = await fetchCurrentSubscription();
 * if (!subscription) {
 *   // vendor is on free tier
 * }
 */
export async function fetchCurrentSubscription(): Promise<CurrentSubscriptionResponse> {
  return apiClient.get<CurrentSubscriptionResponse>("/api/v1/payments/current/");
}

/**
 * POST /api/subscriptions/cancel/
 *
 * Cancels the vendor's active subscription.
 * Access is NOT cut off immediately — the vendor retains full access
 * until end_date, then drops to Free. This matches how Stripe/DO work.
 *
 * @param reason  Optional cancellation reason (stored on the record).
 *
 * @example
 * const result = await cancelSubscription("Too expensive");
 * console.log(result.message);    // "Subscription cancelled. Access continues..."
 * console.log(result.access_until); // "2026-04-11T00:00:00Z"
 */
export async function cancelSubscription(
  reason?: string
): Promise<CancelSubscriptionResponse> {
  return apiClient.post<CancelSubscriptionResponse>(
    "/api/v1/payments/cancel/",
    { reason: reason ?? "" }
  );
}

/**
 * PATCH /api/subscriptions/auto-renew/
 *
 * Toggles auto-renewal on or off without cancelling the subscription.
 * Turning auto_renew OFF means the subscription will expire at end_date
 * without charging. Turning it back ON re-enables automatic billing.
 *
 * @param autoRenew  true = will auto-renew, false = will expire at end_date
 *
 * @example
 * await updateAutoRenew(false);
 * // Subscription will now expire naturally at end_date
 */
export async function updateAutoRenew(
  autoRenew: boolean
): Promise<UpdateAutoRenewResponse> {
  return apiClient.patch<UpdateAutoRenewResponse>(
    "/api/v1/payments/auto-renew/",
    { auto_renew: autoRenew }
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Billing history
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/payments/payments/
 *
 * Returns the last 50 payment transactions for the authenticated vendor.
 * Includes initial subscriptions, auto-renewals, upgrades, and refunds.
 * Ordered newest-first.
 *
 * @example
 * const history = await fetchPaymentHistory();
 * history.forEach(t => {
 *   console.log(t.amount_formatted, t.status_display, t.paid_at);
 * });
 */
export async function fetchPaymentHistory(): Promise<PaymentTransaction[]> {
  return apiClient.get<PaymentTransaction[]>("/api/v1/payments/payments/");
}

// ─────────────────────────────────────────────────────────────────────────────
// Saved cards
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/subscriptions/cards/
 *
 * Returns all saved Paystack card authorizations for the vendor.
 * The authorization_code is never returned — only safe display fields.
 * Cards are ordered: default card first, then by created_at desc.
 *
 * @example
 * const cards = await fetchSavedCards();
 * // cards[0] = { id: 1, card_display: "Visa **** 4081", is_default: true, ... }
 */
export async function fetchSavedCards(): Promise<SavedCard[]> {
  return apiClient.get<SavedCard[]>("/api/v1/payments/cards/");
}

/**
 * DELETE /api/v1/payments/cards/{cardId}/
 *
 * Removes a saved card from the vendor's account.
 * If the deleted card was the default, the backend automatically
 * promotes the next available card to default.
 *
 * @param cardId  The SavedCard.id to remove.
 *
 * @example
 * await deleteCard(3);
 * // Card is removed — refetch to update the UI
 */
export async function deleteCard(cardId: number): Promise<void> {
  return apiClient.delete<void>(`/api/v1/payments/cards/${cardId}/`);
}

/**
 * PATCH /api/v1/payments/cards/{cardId}/set-default/
 *
 * Sets a specific card as the default for auto-renewal charges.
 * All other cards for this vendor are automatically unset.
 *
 * @param cardId  The SavedCard.id to promote.
 *
 * @example
 * await setDefaultCard(5);
 * // Card 5 is now the default — future renewals charge this card
 */
export async function setDefaultCard(
  cardId: number
): Promise<SetDefaultCardResponse> {
  return apiClient.patch<SetDefaultCardResponse>(
    `/api/v1/payments/cards/${cardId}/set-default/`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Convenience helper — used in feature-gate checks across the app
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Checks whether the vendor's current plan allows a given feature.
 * Call this after fetchCurrentSubscription() to gate UI features.
 *
 * @example
 * const { subscription } = await fetchCurrentSubscription();
 * if (!canUseFeature(subscription, "can_use_analytics")) {
 *   return <UpgradePrompt />;
 * }
 */
export type GateableFeature =
  | "can_feature_products"
  | "can_use_analytics"
  | "can_offer_discounts"
  | "can_access_bulk_upload"
  | "can_use_storefront_customization"
  | "priority_support"
  | "is_featured_vendor";

export function canUseFeature(
  subscription: CurrentSubscriptionResponse["subscription"],
  feature: GateableFeature
): boolean {
  if (!subscription || !subscription.is_active) return false;
  return subscription.plan[feature] === true;
}

/**
 * Returns how many products the vendor can still add.
 * Returns 0 if they are at the limit.
 *
 * @example
 * const { usage, subscription } = await fetchCurrentSubscription();
 * const remaining = productSlotsRemaining(subscription, usage);
 * if (remaining === 0) showUpgradePrompt();
 */
export function productSlotsRemaining(
  subscription: CurrentSubscriptionResponse["subscription"],
  usage: CurrentSubscriptionResponse["usage"]
): number {
  if (!subscription || !usage) return 0;
  const max = subscription.plan.max_products;
  const used = usage.active_products_count;
  return Math.max(max - used, 0);
}

/**
 * Converts a BillingCycle to the number of days for that cycle.
 * Mirrors the BILLING_DAYS dict in services.py — keep in sync.
 */
export function billingCycleDays(cycle: BillingCycle): number {
  return cycle === "yearly" ? 365 : 30;
}