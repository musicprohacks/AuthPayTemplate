import { NextResponse } from "next/server";
import Stripe from "stripe";
import { addCredits, markStripeEventProcessed, userIdForStripeCustomer } from "@/lib/credits";
import { CREDIT_PLANS, planByPriceId, stripe, stripeEnabled } from "@/lib/stripe";

export async function POST(req: Request) {
  if (!stripeEnabled) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // Dev fallback only — no STRIPE_WEBHOOK_SECRET set (e.g. not running `stripe listen`).
      // Skips signature verification, so never do this in production.
      event = JSON.parse(body) as Stripe.Event;
    }
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${(err as Error).message}` },
      { status: 400 },
    );
  }

  if (!markStripeEventProcessed(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.mode === "payment") {
        const userId = checkoutSession.metadata?.userId;
        const planKey = checkoutSession.metadata?.planKey;
        const plan = planKey ? CREDIT_PLANS[planKey] : undefined;
        if (userId && plan) addCredits(userId, plan.credits);
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice;
      const priceRef = invoice.lines.data[0]?.pricing?.price_details?.price;
      const priceId = typeof priceRef === "string" ? priceRef : priceRef?.id;
      const customerId =
        typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
      const plan = priceId ? planByPriceId(priceId) : undefined;
      const userId = customerId ? userIdForStripeCustomer(customerId) : null;
      if (userId && plan) addCredits(userId, plan.credits);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
