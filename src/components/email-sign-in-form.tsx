"use client";

import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function EmailSignInForm({ callbackURL = "/" }: { callbackURL?: string }) {
  const id = useId();
  const bypassId = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [showBypass, setShowBypass] = useState(false);
  const [bypassKey, setBypassKey] = useState("");
  const [bypassing, setBypassing] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("pending");
    setError(null);
    const { error } = await authClient.signIn.magicLink({ email, callbackURL });
    if (error) {
      setError(error.message ?? "Could not send the link. Please try again.");
      setStatus("error");
      return;
    }
    setStatus("sent");
  }

  async function onBypass(e: React.FormEvent) {
    e.preventDefault();
    setBypassing(true);
    setError(null);
    const res = await fetch("/api/dev/bypass-signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, key: bypassKey }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Bypass sign-in failed.");
      setBypassing(false);
      return;
    }
    window.location.assign(callbackURL);
  }

  if (status === "sent") {
    return (
      <p role="status" className="text-sm text-zinc-300">
        Check <strong>{email}</strong> for a sign-in link.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor={id} className="text-sm text-zinc-400">
          Email
        </label>
        <input
          id={id}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 rounded-xl border border-white/15 bg-white/5 px-3.5 text-white placeholder:text-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={status === "pending"}
        className="h-11 rounded-xl bg-white font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {status === "pending" ? "Sending…" : "Continue with email"}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {process.env.NODE_ENV !== "production" && (
        <div className="mt-1 border-t border-white/10 pt-3">
          <button
            type="button"
            onClick={() => setShowBypass((v) => !v)}
            className="text-xs text-zinc-500 hover:text-zinc-300"
          >
            {showBypass ? "Hide dev bypass" : "Dev bypass (skip email)"}
          </button>
          {showBypass && (
            <div className="mt-2 flex flex-col gap-2">
              <label htmlFor={bypassId} className="text-xs text-zinc-500">
                Paste DEV_BYPASS_KEY to sign in as the email above, no email sent.
              </label>
              <input
                id={bypassId}
                type="password"
                value={bypassKey}
                onChange={(e) => setBypassKey(e.target.value)}
                placeholder="dev bypass key"
                className="h-9 rounded-lg border border-white/15 bg-white/5 px-3 text-sm text-white placeholder:text-zinc-600"
              />
              <button
                type="button"
                onClick={onBypass}
                disabled={bypassing || !email || !bypassKey}
                className="h-9 rounded-lg border border-white/15 text-xs font-medium text-white hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {bypassing ? "Signing in…" : "Sign in instantly"}
              </button>
            </div>
          )}
        </div>
      )}
    </form>
  );
}
