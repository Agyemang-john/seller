// types/subscription.ts
// Every type mirrors the exact shape returned by the Django serializers.
// Never manually construct these — they come from the API.

// ─────────────────────────────────────────────────────────────────────────────
// Primitives / Enums
// ─────────────────────────────────────────────────────────────────────────────

export type BillingCycle = "monthly" | "yearly";

export type PlanTier = "free" | "basic" | "pro" | "enterprise";

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "trial"
  | "past_due";

export type TransactionStatus = "pending" | "success" | "failed" | "refunded";

export type TransactionType =
  | "initial"
  | "renewal"
  | "upgrade"
  | "downgrade"
  | "manual";

// ─────────────────────────────────────────────────────────────────────────────
// SubscriptionPlan  →  SubscriptionPlanSerializer
// ─────────────────────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id: number;
  name: string;
  tier: PlanTier;
  tier_display: string;
  billing_cycle: string;
  billing_cycle_display: string;

  /** DecimalField — comes as a string from DRF e.g. "150.00" */
  price: string;
  /** Pre-formatted by the serializer e.g. "GHS 150.00" */
  price_formatted: string;

  // ── Product & listing limits ─────────────────────────────────────────────
  max_products: number;
  max_images_per_product: number;
  max_categories: number;

  // ── Feature flags ────────────────────────────────────────────────────────
  can_feature_products: boolean;
  can_use_analytics: boolean;
  can_offer_discounts: boolean;
  can_access_bulk_upload: boolean;
  can_use_storefront_customization: boolean;
  priority_support: boolean;
  is_featured_vendor: boolean;

  // ── Financials ───────────────────────────────────────────────────────────
  /** DecimalField string e.g. "8.00" */
  commission_rate: string;
  /** Pre-formatted e.g. "8%" */
  commission_display: string;
  payout_delay_days: number;

  // ── Metadata ─────────────────────────────────────────────────────────────
  is_active: boolean;
  is_recommended: boolean;
  description: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// VendorSubscription  →  VendorSubscriptionSerializer
// ─────────────────────────────────────────────────────────────────────────────

export interface VendorSubscription {
  id: number;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  status_display: string;

  start_date: string;   // ISO 8601
  end_date: string;     // ISO 8601
  trial_end_date: string | null;

  auto_renew: boolean;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  payment_reference: string | null;

  /** Computed by the serializer */
  days_remaining: number;
  is_active: boolean;
  is_on_trial: boolean;

  /** Price of the next renewal charge */
  renewal_amount: number;

  created_at: string;
  updated_at: string;
}

/** Lightweight version used in nav / header */
export interface ActiveSubscription {
  id: number;
  plan_name: string;
  plan_tier: PlanTier;
  /** "monthly" | "yearly" — used to match the exact plan card in the grid */
  plan_billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  end_date: string;
  auto_renew: boolean;
  days_remaining: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SubscriptionUsage  →  SubscriptionUsageSerializer
// ─────────────────────────────────────────────────────────────────────────────

export interface SubscriptionUsage {
  active_products_count: number;
  can_add_product: boolean;
  max_products: number;
  /** 0–100 */
  usage_percentage: number;
  period_start: string;
  period_end: string | null;
  updated_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PaymentTransaction  →  PaymentTransactionSerializer
// ─────────────────────────────────────────────────────────────────────────────

export interface PaymentTransaction {
  id: number;
  transaction_type: TransactionType;
  type_display: string;
  /** DecimalField string */
  amount: string;
  /** Pre-formatted e.g. "GHS 150.00" */
  amount_formatted: string;
  currency: string;
  status: TransactionStatus;
  status_display: string;
  paystack_reference: string;
  plan_name: string | null;
  failure_reason: string | null;
  paid_at: string | null;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// SavedCard  →  PaystackAuthorizationSerializer
// ─────────────────────────────────────────────────────────────────────────────

export interface SavedCard {
  id: number;
  card_type: string;         // "visa" | "mastercard" | etc.
  last4: string;             // "4081"
  exp_month: string;         // "09"
  exp_year: string;          // "2027"
  bank: string;
  is_default: boolean;
  is_reusable: boolean;
  /** e.g. "Visa **** 4081" */
  card_display: string;
  is_expired: boolean;
  created_at: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Request shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface InitiateSubscriptionRequest {
  plan_id: number;
  billing: BillingCycle;
}

export interface CancelSubscriptionRequest {
  reason?: string;
}

export interface UpdateAutoRenewRequest {
  auto_renew: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Response shapes
// ─────────────────────────────────────────────────────────────────────────────

export interface UpgradeInfo {
  from_plan: string;
  to_plan: string;
  /** String decimal e.g. "400.00" */
  charged_today: string;
  current_plan_ends_now: boolean;
  new_plan_starts_today: boolean;
}

export interface InitiateSubscriptionResponse {
  /** Paystack-hosted checkout URL — redirect vendor here */
  authorization_url: string;
  reference: string;
  access_code: string;
  /** "initial" | "upgrade" | "downgrade" — set by the backend */
  transaction_type: TransactionType;
  /**
   * Present only when transaction_type is "upgrade" or "downgrade".
   * Used by CheckoutPanel to show the confirmation warning banner.
   */
  upgrade_info?: UpgradeInfo;
}

export interface VerifySubscriptionResponse {
  vendor_id: number;
  plan: string;
  status: string;
  end_date: string;
}

export interface CurrentSubscriptionResponse {
  subscription: VendorSubscription | null;
  usage: SubscriptionUsage | null;
}

/**
 * Shape returned by GET /api/v1/payments/plans/
 * Combines the plan list with the vendor's current subscription in one request,
 * avoiding a second API call on the subscription page.
 */
export interface PlansResponse {
  plans: SubscriptionPlan[];
  /** null when vendor has no active subscription (e.g. brand new account) */
  current_subscription: ActiveSubscription | null;
}

export interface CancelSubscriptionResponse {
  message: string;
  access_until: string;
  subscription: ActiveSubscription;
}

export interface UpdateAutoRenewResponse {
  auto_renew: boolean;
  message: string;
}

export interface SetDefaultCardResponse {
  message: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// UI-only types (not from the API)
// ─────────────────────────────────────────────────────────────────────────────

export interface PlanFeature {
  label: string;
  on: boolean;
}

/**
 * Enriched plan used by the UI plan cards.
 * Combines the raw API plan with derived display fields.
 */
export interface UIPlan {
  /** Same as plan.tier */
  key: PlanTier;
  /** The raw API object */
  plan: SubscriptionPlan;
  /** Feature list derived from the plan's boolean flags */
  features: PlanFeature[];
  /** Short bullet list shown in the checkout summary */
  unlocks: string[];
  /** True when plan.is_recommended — drives the dark Pro card style */
  isPro: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Generic API error shape (what Django returns on errors)
// ─────────────────────────────────────────────────────────────────────────────

export interface ApiError {
  error?: string;
  detail?: string;
  /** Field-level validation errors from DRF serializers */
  [field: string]: string | string[] | undefined;
}