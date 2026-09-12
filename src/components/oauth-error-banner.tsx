"use client";

import { useEffect, useState } from "react";

const MESSAGES: Record<string, string> = {
  EMAIL_NOT_FOUND:
    "That provider didn't share an email address (Facebook does this sometimes if email access wasn't granted). Try Google or email sign-in instead.",
};

function readErrorFromLocation(): string | null {
  if (typeof window === "undefined") return null;
  const error = new URLSearchParams(window.location.search).get("error");
  return error ? (MESSAGES[error] ?? "Sign-in failed. Please try again.") : null;
}

export function OAuthErrorBanner() {
  const [message] = useState(readErrorFromLocation);

  useEffect(() => {
    if (!message) return;
    const params = new URLSearchParams(window.location.search);
    params.delete("error");
    params.delete("error_description");
    const query = params.toString();
    window.history.replaceState(null, "", query ? `?${query}` : window.location.pathname);
  }, [message]);

  if (!message) return null;

  return (
    <p role="alert" className="max-w-md rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
      {message}
    </p>
  );
}
