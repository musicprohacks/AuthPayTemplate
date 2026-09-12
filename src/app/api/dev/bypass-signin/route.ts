import crypto from "node:crypto";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Dev-only sign-in bypass: skips sending a real magic-link email, so local
 * testing doesn't burn Resend sends. Gated on DEV_BYPASS_KEY (a 256-bit hex
 * secret, only set in .env.local — never in production) plus NODE_ENV as a
 * hard safety net, since anyone holding the key can sign in as any email.
 */
export async function POST(req: Request) {
  const configuredKey = process.env.DEV_BYPASS_KEY;
  if (process.env.NODE_ENV === "production" || !configuredKey) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { key, email } = (await req.json()) as { key?: string; email?: string };
  if (
    !key ||
    key.length !== configuredKey.length ||
    !crypto.timingSafeEqual(Buffer.from(key), Buffer.from(configuredKey))
  ) {
    return NextResponse.json({ error: "Invalid key" }, { status: 401 });
  }
  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  const reqHeaders = await headers();

  await auth.api.signInMagicLink({
    body: { email, callbackURL: "/", metadata: { devBypass: true } },
    headers: reqHeaders,
  });

  const row = db
    .prepare("SELECT identifier FROM verification ORDER BY createdAt DESC LIMIT 1")
    .get() as { identifier: string } | undefined;
  if (!row) {
    return NextResponse.json({ error: "Failed to create sign-in token" }, { status: 500 });
  }

  await auth.api.magicLinkVerify({
    query: { token: row.identifier },
    headers: reqHeaders,
  });

  return NextResponse.json({ ok: true });
}
