# Hello World App

A minimal, reusable web app template: authentication and sessions only, no
application-specific functionality. Meant as a clean foundation for future
apps — payments, subscriptions, credits, and product features are not
included here.

- **Sign in** with **Google**, or with a **passwordless email link** (sent via Resend)
- **Sessions** and a minimal user model, backed by SQLite

## Stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16 (App Router, TypeScript, Tailwind CSS 4) |
| Auth | [Better Auth](https://www.better-auth.com) — Google social sign-in + magic-link email sign-in |
| Email | [Resend](https://resend.com) |
| Database | SQLite via `better-sqlite3` (`./data/app.db`) |
| Tests | Vitest (unit), Playwright (end-to-end) |

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

Tables are created on server start (`src/instrumentation.ts`). The first time you
start with an empty database, Better Auth logs a "Database schema mismatch" error.
This happens once, before migrations finish, and you can ignore it.

Before credentials are set, the Google button is disabled (a dev note explains why),
and the email link is logged to the server console instead of being emailed. Both
work without any credentials, so the whole sign-in flow is testable out of the box.

### Google

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → **Create credentials → OAuth client ID → Web application**.
2. Authorized redirect URI: `http://localhost:3000/api/auth/callback/google` (plus your production URL).
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Email (Resend)

1. [Resend dashboard](https://resend.com/api-keys) → create an API key.
2. Set `RESEND_API_KEY` and `AUTH_EMAIL_FROM` (must be a verified sending domain in production).

Without `RESEND_API_KEY`, `src/lib/email.ts` logs the sign-in link to the server
console instead of sending it — handy for local dev.

## Project layout

```
src/
  app/
    page.tsx                    # server component: resolves session, renders hello world
    api/auth/[...all]/route.ts  # Better Auth handler (OAuth + magic-link callbacks)
  components/
    sign-in-dialog.tsx          # modal wrapper
    social-sign-in-buttons.tsx  # Google sign-in
    email-sign-in-form.tsx      # magic-link email sign-in
    site-header.tsx             # sign in / user menu / sign out
  lib/
    auth.ts / auth-client.ts    # Better Auth server + React client
    email.ts                    # Resend sender for magic-link emails
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

This template intentionally stops at auth + sessions. Later feature work
(payments, subscriptions, credits, application-specific functionality) builds
on top of this foundation but is out of scope here.
