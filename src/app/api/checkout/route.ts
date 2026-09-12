import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { setStripeCustomerId } from "@/lib/credits";
import { db } from "@/lib/db";
import { CREDIT_PLANS, stripe, stripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!stripeEnabled) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  const { planKey } = (await req.json()) as { planKey?: string };
  const plan = planKey ? CREDIT_PLANS[planKey] : undefined;
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const existing = db
    .prepare("SELECT stripe_customer_id FROM user_credits WHERE user_id = ?")
    .get(session.user.id) as { stripe_customer_id: string | null } | undefined;

  let customerId = existing?.stripe_customer_id ?? undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: session.user.email,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    setStripeCustomerId(session.user.id, customerId);
  }

  const origin = process.env.BETTER_AUTH_URL ?? "http://localhost:3020";
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: plan.mode,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${origin}/?checkout=success`,
    cancel_url: `${origin}/?checkout=cancelled`,
    metadata: { userId: session.user.id, planKey: planKey ?? "" },
    ...(plan.mode === "subscription" && {
      subscription_data: { metadata: { userId: session.user.id, planKey: planKey ?? "" } },
    }),
  });

  return NextResponse.json({ url: checkoutSession.url });
}
