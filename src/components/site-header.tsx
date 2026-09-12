"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { EnabledProviders } from "@/lib/auth";
import { SignInDialog } from "./sign-in-dialog";

export interface HeaderUser {
  name: string;
  email: string;
  image?: string | null;
}

export function SiteHeader({
  user,
  providers,
}: {
  user: HeaderUser | null;
  providers: EnabledProviders;
}) {
  const router = useRouter();
  const [signInOpen, setSignInOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  async function signOut() {
    setSigningOut(true);
    await authClient.signOut();
    router.refresh();
    setSigningOut(false);
  }

  return (
    <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5">
      <span className="flex items-center gap-2 text-lg font-semibold tracking-tight">
        <span aria-hidden className="grid size-8 place-items-center rounded-lg bg-gradient-to-br from-indigo-500 to-sky-500">
          👋
        </span>
        Hello World App
      </span>

      {user ? (
        <div className="flex items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element -- provider avatars come from arbitrary hosts
            <img src={user.image} alt="" className="size-8 rounded-full" referrerPolicy="no-referrer" />
          ) : (
            <span aria-hidden className="grid size-8 place-items-center rounded-full bg-white/10 text-sm">
              {(user.name || user.email).charAt(0).toUpperCase()}
            </span>
          )}
          <span className="hidden text-sm text-zinc-300 sm:inline" data-testid="user-name">
            {user.name || user.email}
          </span>
          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="rounded-lg px-3 py-1.5 text-sm text-zinc-300 hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            Sign out
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => setSignInOpen(true)}
            className="rounded-lg border border-white/15 px-4 py-1.5 text-sm font-medium hover:bg-white/10"
          >
            Sign in
          </button>
          <SignInDialog
            open={signInOpen}
            onClose={() => setSignInOpen(false)}
            providers={providers}
            title="Sign in"
            description="Use Google, or a sign-in link sent to your email."
          />
        </>
      )}
    </header>
  );
}
