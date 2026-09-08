import Link from "next/link";
import { ArrowUpRight, Pencil } from "lucide-react";

import { DeleteButton } from "@/components/admin/delete-button";
import { EmptyState, StatusBadge } from "@/components/admin/admin-ui";
import type { ContentStatus } from "@/lib/portfolio/types";

export interface ContentListItem {
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  status: ContentStatus;
  displayOrder: number;
  editHref: string;
  deleteAction: () => Promise<void>;
}

export function ContentList({
  items,
  emptyTitle,
  emptyDescription,
  newHref,
  newLabel,
}: {
  items: ContentListItem[];
  emptyTitle: string;
  emptyDescription: string;
  newHref: string;
  newLabel: string;
}) {
  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionHref={newHref}
        actionLabel={newLabel}
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
      <div className="divide-y divide-slate-100 md:hidden">
        {items.map((item) => (
          <article key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-xs font-semibold text-slate-400">
                    Order {item.displayOrder}
                  </span>
                </div>
                <h2 className="break-words font-bold text-slate-950">{item.title}</h2>
                <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
                {item.detail ? (
                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">
                    {item.detail}
                  </p>
                ) : null}
              </div>
              <Link
                href={item.editHref}
                aria-label={`Edit ${item.title}`}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-slate-200 text-slate-600 outline-none transition hover:border-[#335cff] hover:text-[#335cff] focus-visible:ring-2 focus-visible:ring-[#335cff]"
              >
                <Pencil aria-hidden="true" className="size-4" />
              </Link>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
              <Link
                href={item.editHref}
                className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#335cff] outline-none hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#335cff]"
              >
                Open editor
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </Link>
              <DeleteButton action={item.deleteAction} itemName={item.title} compact />
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[46rem] border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
              <th scope="col" className="px-5 py-3.5">Content</th>
              <th scope="col" className="px-5 py-3.5">Status</th>
              <th scope="col" className="px-5 py-3.5">Order</th>
              <th scope="col" className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => (
              <tr key={item.id} className="transition hover:bg-slate-50/70">
                <td className="max-w-xl px-5 py-4">
                  <p className="font-bold text-slate-950">{item.title}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.subtitle}</p>
                  {item.detail ? (
                    <p className="mt-1 line-clamp-1 text-xs text-slate-400">{item.detail}</p>
                  ) : null}
                </td>
                <td className="px-5 py-4"><StatusBadge status={item.status} /></td>
                <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                  {item.displayOrder}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-start justify-end gap-1">
                    <Link
                      href={item.editHref}
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#335cff] outline-none transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#335cff]"
                    >
                      <Pencil aria-hidden="true" className="size-4" />
                      Edit
                    </Link>
                    <DeleteButton action={item.deleteAction} itemName={item.title} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
