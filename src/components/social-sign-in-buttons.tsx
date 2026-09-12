"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { EnabledProviders, SocialProvider } from "@/lib/auth";

const PROVIDERS: { id: SocialProvider; label: string; icon: React.ReactNode }[] = [
  {
    id: "google",
    label: "Google",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
      </svg>
    ),
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden className="size-5 fill-current">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
];

export function SocialSignInButtons({
  providers,
  callbackURL = "/",
}: {
  providers: EnabledProviders;
  callbackURL?: string;
}) {
  const [pending, setPending] = useState<SocialProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(provider: SocialProvider) {
    setPending(provider);
    setError(null);
    // On success the browser is redirected to the provider.
    const { error } = await authClient.signIn.social({ provider, callbackURL });
    if (error) {
      setError(error.message ?? "Sign-in failed. Please try again.");
      setPending(null);
    }
  }

  const unconfigured = PROVIDERS.filter((p) => !providers[p.id]);

  return (
    <div className="flex flex-col gap-3">
      {PROVIDERS.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => signIn(id)}
          disabled={!providers[id] || pending !== null}
          className="flex h-12 items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/5 font-medium text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {icon}
          {pending === id ? "Redirecting…" : `Continue with ${label}`}
        </button>
      ))}

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {process.env.NODE_ENV !== "production" && unconfigured.length > 0 && (
        <p className="text-xs text-zinc-500">
          Dev note: {unconfigured.map((p) => p.label).join(" and ")} sign-in
          is disabled until credentials are set in <code>.env.local</code>.
        </p>
      )}
    </div>
  );
}
