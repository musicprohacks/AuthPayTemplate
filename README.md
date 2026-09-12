# Hello World App

A minimal, reusable web app template: authentication, sessions, and a
Stripe test-mode credits system. Meant as a clean foundation for future
apps.

- **Sign in** with **Google**, **Facebook**, or a **passwordless email link** (sent via Resend)
- **Sessions** and a minimal user model, backed by SQLite
- **Credits**: free credits on sign-up, one-time purchase, or weekly/monthly/yearly
  subscriptions (Stripe test mode — see the Stripe section below)

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS 4) |
| Auth | [Better Auth](https://www.better-auth.com) — Google + Facebook social sign-in, magic-link email sign-in |
| Email | [Resend](https://resend.com) |
| Payments | [Stripe](https://stripe.com) (test mode) |
| Database | SQLite via `better-sqlite3` (`./data/app.db`) |
| Tests | Vitest (unit), Playwright (end-to-end) |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3020
```

The dev server is pinned to port 3020 (`next dev -p 3020` in `package.json`) so it
doesn't silently land on a different port — Better Auth rejects requests whose
origin doesn't match `BETTER_AUTH_URL`, so a drifting port shows up as an
"Invalid origin" error. If 3020 is taken, free it or change the port in both
`package.json`'s `dev` script and `BETTER_AUTH_URL`.

Tables are created on server start (`src/instrumentation.ts`). The first time you
start with an empty database, Better Auth logs a "Database schema mismatch" error.
This happens once, before migrations finish, and you can ignore it.

Before credentials are set, the Google/Facebook buttons are disabled (a dev note
explains why), and the email link is logged to the server console instead of
being emailed. All three work without any credentials, so the whole sign-in
flow is testable out of the box — see `test.py` for a one-command way to spin
up dev + Stripe webhook forwarding together.

### Google

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create credentials → OAuth client ID → Web application**.
2. Authorized redirect URI: `http://localhost:3020/api/auth/callback/google` (plus your production URL).
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Facebook

1. [Meta for Developers](https://developers.facebook.com/apps) → create an app → add the **Facebook Login** product.
2. Valid OAuth Redirect URI: `http://localhost:3020/api/auth/callback/facebook` (plus your production URL).
3. Set `FACEBOOK_CLIENT_ID` and `FACEBOOK_CLIENT_SECRET`.

Facebook can omit the email from the profile even when the `email` permission
is granted. When that happens, Better Auth redirects back with
`?error=EMAIL_NOT_FOUND` instead of creating an account — `OAuthErrorBanner`
catches this and shows a message pointing the user at Google or email sign-in.

### Email (Resend)

1. [Resend dashboard](https://resend.com/api-keys) → create an API key.
2. Set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` (must be a verified sending domain in production).

Without `RESEND_API_KEY`, `src/lib/email.ts` logs the sign-in link to the server
console instead of sending it — handy for local dev.

### Stripe (test mode)

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) → grab your test **secret** and **publishable** keys.
2. Set `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`.
3. For webhooks locally, run the [Stripe CLI](https://stripe.com/docs/stripe-cli):
   ```bash
   stripe listen --forward-to localhost:3020/api/webhooks/stripe
   ```
   and copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`. Without a
   listener running, Checkout still completes but credits won't be granted —
   Stripe's servers can't reach `localhost` on their own.

Test-mode credit-pack/subscription products are pre-created via the Stripe
API — see the price IDs in `src/lib/stripe.ts` (swap for your own before
going live).

`test.py` automates all of this: it starts the dev server, opens Chrome, starts
`stripe listen` once the server is up, and prints step-by-step testing
instructions (including your `DEV_BYPASS_KEY`).

```bash
python3 test.py
```

### Dev-only sign-in bypass

`DEV_BYPASS_KEY` (a 256-bit hex secret) lets you sign in instantly from the
sign-in dialog — "Dev bypass (skip email)" — without a real Resend send, so
local testing doesn't burn email quota. Generate one with `openssl rand -hex
32`. Leave it unset to disable the bypass; it's also hard-gated on
`NODE_ENV !== "production"` regardless.

## Project layout

```
src/
  app/
    page.tsx                        # server component: resolves session, renders hello world
    api/auth/[...all]/route.ts      # Better Auth handler (OAuth + magic-link callbacks)
    api/checkout/route.ts           # creates a Stripe Checkout Session
    api/webhooks/stripe/route.ts    # verifies + handles Stripe webhook events
    api/credits/route.ts            # current user's credit balance
    api/dev/bypass-signin/route.ts  # dev-only instant sign-in (see above)
  components/
    sign-in-dialog.tsx          # modal wrapper
    social-sign-in-buttons.tsx  # Google + Facebook sign-in
    email-sign-in-form.tsx      # magic-link email sign-in + dev bypass
    site-header.tsx             # sign in / user menu / sign out
    credits-panel.tsx           # balance + buy/subscribe buttons
    oauth-error-banner.tsx      # surfaces ?error= from a failed OAuth callback
  lib/
    auth.ts / auth-client.ts    # Better Auth server + React client
    email.ts                    # Resend sender for magic-link emails
    stripe.ts                   # Stripe client + credit plan definitions
    credits.ts                  # credit balance / Stripe customer mapping
    db.ts / migrate.ts          # SQLite connection + auth schema migrations
tests/unit/                     # Vitest
tests/e2e/                      # Playwright
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / server |
| `npm test` | Vitest unit tests |
| `npm run test:e2e` | Playwright tests (starts its own server on :3100 with a throwaway DB and dummy OAuth credentials) |
| `npm run typecheck` / `npm run lint` | Static checks |

The first time you run end-to-end tests, run `npx playwright install chromium`.

## Roadmap

Auth, sessions, and a credits system are here. Not included: a "my
subscription" view (plan, renewal date, cancel via Stripe's customer
portal), anywhere that actually spends credits, and live-mode Stripe
config (products/prices/webhook are test-mode only — see the Stripe
section above before going live). Application-specific functionality
builds on top of this foundation.
