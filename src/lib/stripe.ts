import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const stripeEnabled = Boolean(process.env.STRIPE_SECRET_KEY);

export interface CreditPlan {
  priceId: string;
  credits: number;
  label: string;
  mode: "subscription" | "payment";
}

// Test-mode price IDs — created via the Stripe API for this template.
// Swap these for your own prices (and update the credit amounts) before going live.
export const CREDIT_PLANS: Record<string, CreditPlan> = {
  "weekly-20-credits": {
    priceId: "price_1UEscOGZzc7VL8Nz25ovieJO",
    credits: 20,
    label: "Weekly — 20 credits/week ($2.00)",
    mode: "subscription",
  },
  "monthly-100-credits": {
    priceId: "price_1UEscPGZzc7VL8Nzl9yxU40U",
    credits: 100,
    label: "Monthly — 100 credits/month ($5.00)",
    mode: "subscription",
  },
  "yearly-1500-credits": {
    priceId: "price_1UEscPGZzc7VL8NzaNe86zsW",
    credits: 1500,
    label: "Yearly — 1500 credits/year ($40.00)",
    mode: "subscription",
  },
  "pack-100-credits": {
    priceId: "price_1UEscQGZzc7VL8NztCrvz8MR",
    credits: 100,
    label: "One-time pack — 100 credits ($5.00)",
    mode: "payment",
  },
};

export function planByPriceId(priceId: string): CreditPlan | undefined {
  return Object.values(CREDIT_PLANS).find((p) => p.priceId === priceId);
}
