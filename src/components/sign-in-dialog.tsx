"use client";

import { useEffect, useId, useRef } from "react";
import type { EnabledProviders } from "@/lib/auth";
import { EmailSignInForm } from "./email-sign-in-form";
import { SocialSignInButtons } from "./social-sign-in-buttons";

export function SignInDialog({
  open,
  onClose,
  providers,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  providers: EnabledProviders;
  title: string;
  description: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Close when the backdrop (the dialog element itself) is clicked.
      onClick={(e) => e.target === ref.current && onClose()}
      aria-labelledby={titleId}
      className="m-auto w-[min(92vw,26rem)] rounded-2xl border border-white/10 bg-zinc-900 p-0 text-white shadow-2xl backdrop:bg-black/70 backdrop:backdrop-blur-sm"
    >
      <div className="flex flex-col gap-6 p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-zinc-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 rounded-lg p-2 text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </div>
        <SocialSignInButtons providers={providers} />

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="h-px flex-1 bg-white/10" />
          or
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <EmailSignInForm />

        <p className="text-center text-xs text-zinc-500">
          By continuing you agree to the Terms of Service and Privacy Policy.
        </p>
      </div>
    </dialog>
  );
}
