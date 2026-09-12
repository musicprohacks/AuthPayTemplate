"use client";

import { useEffect, useState } from "react";

const PLANS = [
  { key: "pack-100-credits", label: "Buy 100 credits — $5.00", group: "One-time" },
  { key: "weekly-20-credits", label: "Weekly — 20 credits/week ($2.00)", group: "Subscribe" },
  { key: "monthly-100-credits", label: "Monthly — 100 credits/month ($5.00)", group: "Subscribe" },
  { key: "yearly-1500-credits", label: "Yearly — 1500 credits/year ($40.00)", group: "Subscribe" },
];

export function CreditsPanel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((d) => setBalance(d.balance ?? 0))
      .catch(() => setError("Could not load credit balance."));
  }, []);

  async function buy(planKey: string) {
    setPending(planKey);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Checkout failed.");
      setPending(null);
      return;
    }
    window.location.assign(data.url);
  }

  const oneTime = PLANS.filter((p) => p.group === "One-time");
  const subs = PLANS.filter((p) => p.group === "Subscribe");

  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 text-left">
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-400">Credit balance</span>
        <span className="text-2xl font-bold" data-testid="credit-balance">
          {balance ?? "…"}
        </span>
      </div>

      <div className="mt-5 flex flex-col gap-2">
        {oneTime.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => buy(p.key)}
            disabled={pending !== null}
            className="h-10 rounded-lg bg-white text-sm font-medium text-zinc-900 transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending === p.key ? "Redirecting…" : p.label}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-white/10 pt-4">
        <p className="mb-2 text-xs uppercase tracking-wide text-zinc-500">Or subscribe</p>
        <div className="flex flex-col gap-2">
          {subs.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => buy(p.key)}
              disabled={pending !== null}
              className="h-10 rounded-lg border border-white/15 text-sm font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending === p.key ? "Redirecting…" : p.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
