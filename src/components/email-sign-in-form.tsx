"use client";

import { useId, useState } from "react";
import { authClient } from "@/lib/auth-client";

export function EmailSignInForm({ callbackURL = "/" }: { callbackURL?: string }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "pending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

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
    </form>
  );
}
