import Link from "next/link";
import type { ReactNode } from "react";
import { AlertTriangle, ArrowRight, Inbox, Plus } from "lucide-react";

import type { ContentStatus } from "@/lib/portfolio/types";

export function PageHeader({
  eyebrow = "Portfolio CMS",
  title,
  description,
  actionHref,
  actionLabel,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="mb-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-[#335cff]">
          {eyebrow}
        </p>
        <h1 className="text-balance text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
          {title}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#335cff] px-4 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(51,92,255,0.24)] outline-none transition hover:bg-[#2749d8] focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2"
        >
          <Plus aria-hidden="true" className="size-4" />
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${
        status === "published"
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
      }`}
    >
      {status}
    </span>
  );
}

const statusMessages: Record<string, string> = {
  created: "The item was created successfully.",
  updated: "Your changes are live in the content workspace.",
};

export function MutationStatus({ status }: { status?: string }) {
  const message = status ? statusMessages[status] : undefined;
  if (!message) return null;

  return (
    <div
      role="status"
      className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800"
    >
      {message}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Inbox aria-hidden="true" className="size-5" />
      </span>
      <h2 className="mt-4 text-lg font-bold text-slate-950">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#335cff] px-4 text-sm font-semibold text-white outline-none transition hover:bg-[#2749d8] focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2"
      >
        <Plus aria-hidden="true" className="size-4" />
        {actionLabel}
      </Link>
    </div>
  );
}

export function AdminDataError({
  title = "Content is temporarily unavailable",
  description = "The admin could not reach MongoDB. Check the database configuration and try again.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <AlertTriangle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-amber-700" />
        <div>
          <h2 className="font-bold text-amber-950">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-amber-800">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function DashboardCard({
  href,
  label,
  value,
  icon,
  accent,
}: {
  href: string;
  label: string;
  value: number;
  icon: ReactNode;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_35px_rgba(15,23,42,0.05)] outline-none transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_45px_rgba(15,23,42,0.08)] focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2 motion-reduce:transform-none"
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className="grid size-11 place-items-center rounded-xl text-white"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </span>
        <ArrowRight
          aria-hidden="true"
          className="size-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-600 motion-reduce:transform-none"
        />
      </div>
      <p className="mt-6 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-medium text-slate-500">{label}</p>
    </Link>
  );
}
