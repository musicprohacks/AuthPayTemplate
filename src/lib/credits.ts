import { db } from "./db";

export const FREE_SIGNUP_CREDITS = 20;

export function ensureUserCredits(userId: string): number {
  const existing = db
    .prepare("SELECT balance FROM user_credits WHERE user_id = ?")
    .get(userId) as { balance: number } | undefined;
  if (existing) return existing.balance;

  db.prepare(
    "INSERT INTO user_credits (user_id, balance, updated_at) VALUES (?, ?, ?)",
  ).run(userId, FREE_SIGNUP_CREDITS, Date.now());
  return FREE_SIGNUP_CREDITS;
}

export function getBalance(userId: string): number {
  const row = db
    .prepare("SELECT balance FROM user_credits WHERE user_id = ?")
    .get(userId) as { balance: number } | undefined;
  return row?.balance ?? 0;
}

export function addCredits(userId: string, amount: number) {
  db.prepare(
    `INSERT INTO user_credits (user_id, balance, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET balance = balance + excluded.balance, updated_at = excluded.updated_at`,
  ).run(userId, amount, Date.now());
}

export function setStripeCustomerId(userId: string, customerId: string) {
  db.prepare(
    `INSERT INTO user_credits (user_id, balance, stripe_customer_id, updated_at) VALUES (?, 0, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET stripe_customer_id = excluded.stripe_customer_id, updated_at = excluded.updated_at`,
  ).run(userId, customerId, Date.now());
}

export function userIdForStripeCustomer(customerId: string): string | null {
  const row = db
    .prepare("SELECT user_id FROM user_credits WHERE stripe_customer_id = ?")
    .get(customerId) as { user_id: string } | undefined;
  return row?.user_id ?? null;
}

/** Returns false if this Stripe event was already processed (safe to ignore). */
export function markStripeEventProcessed(eventId: string): boolean {
  try {
    db.prepare(
      "INSERT INTO processed_stripe_events (event_id, processed_at) VALUES (?, ?)",
    ).run(eventId, Date.now());
    return true;
  } catch {
    return false; // UNIQUE constraint — already processed.
  }
}
