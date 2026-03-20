export type BillingCycle = "monthly" | "yearly";

export interface PlanFeature {
  label: string;
  on: boolean;
}

export interface Plan {
  key: string;
  tier: string;
  name: string;
  tagline: string;
  monthly: number;
  yearly: number;
  commission: string;
  payout: string;
  maxProducts: string;
  features: PlanFeature[];
  unlocks: string[];
  accent: string;
  isPro?: boolean;
}