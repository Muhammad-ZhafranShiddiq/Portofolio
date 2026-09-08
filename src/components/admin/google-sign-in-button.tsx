"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";

function GoogleMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" role="img">
      <path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z" />
      <path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.43l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z" />
      <path fill="#FBBC05" d="M6.39 13.86A6 6 0 0 1 6.07 12c0-.65.11-1.28.32-1.86V7.52H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.48l3.35-2.62Z" />
      <path fill="#EA4335" d="M12 6.01c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.96 5.52l3.35 2.62C7.18 7.77 9.39 6.01 12 6.01Z" />
    </svg>
  );
}

export function GoogleSignInButton({ disabled = false }: { disabled?: boolean }) {
  const [pending, setPending] = useState(false);

  async function handleSignIn() {
    setPending(true);
    try {
      await signIn("google", { callbackUrl: "/admin" });
    } catch {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      disabled={pending || disabled}
      onClick={() => void handleSignIn()}
      className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-white px-4 text-sm font-bold text-slate-900 shadow-[0_12px_35px_rgba(15,23,42,0.18)] outline-none ring-1 ring-slate-200 transition hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.22)] focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-4 focus-visible:ring-offset-[#eef2ff] disabled:cursor-wait disabled:translate-y-0 disabled:opacity-70 motion-reduce:transform-none"
    >
      {pending ? (
        <LoaderCircle aria-hidden="true" className="size-5 animate-spin motion-reduce:animate-none" />
      ) : (
        <GoogleMark />
      )}
      {pending ? "Opening Google…" : disabled ? "Complete setup to sign in" : "Continue with Google"}
    </button>
  );
}
