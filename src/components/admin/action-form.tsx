"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";
import { ArrowLeft, CheckCircle2, LoaderCircle, Save } from "lucide-react";

import {
  initialActionState,
  type ActionState,
} from "@/lib/portfolio/action-state";

export type AdminFormAction = (
  previousState: ActionState,
  formData: FormData,
) => Promise<ActionState>;

interface ActionFormProps {
  action: AdminFormAction;
  title: string;
  description: string;
  submitLabel: string;
  backHref: string;
  children: (state: ActionState) => ReactNode;
}

export function ActionForm({
  action,
  title,
  description,
  submitLabel,
  backHref,
  children,
}: ActionFormProps) {
  const [state, formAction, isPending] = useActionState(
    action,
    initialActionState,
  );

  return (
    <div className="mx-auto w-full max-w-5xl">
      <Link
        href={backHref}
        className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl px-1 text-sm font-semibold text-slate-600 outline-none transition hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-4"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to list
      </Link>

      <div className="mb-7">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#335cff]">
          Portfolio CMS
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>

      <form action={formAction} className="space-y-6">
        {state.message ? (
          <div
            role={state.status === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
              state.status === "error"
                ? "border-rose-200 bg-rose-50 text-rose-800"
                : "border-emerald-200 bg-emerald-50 text-emerald-800"
            }`}
          >
            {state.status === "success" ? (
              <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            ) : null}
            <span>{state.message}</span>
          </div>
        ) : null}

        {children(state)}

        <div className="sticky bottom-3 z-10 flex flex-col-reverse gap-3 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-[0_16px_50px_rgba(15,23,42,0.13)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <p className="px-2 text-xs leading-5 text-slate-500">
            Fields marked with <span aria-hidden="true">*</span> are required.
          </p>
          <div className="flex gap-3">
            <Link
              href={backHref}
              className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-slate-200 px-5 text-sm font-semibold text-slate-700 outline-none transition hover:border-slate-300 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2 sm:flex-none"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-[#335cff] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(51,92,255,0.25)] outline-none transition hover:bg-[#2749d8] focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-65 sm:flex-none"
            >
              {isPending ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
              ) : (
                <Save aria-hidden="true" className="size-4" />
              )}
              {isPending ? "Saving…" : submitLabel}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
