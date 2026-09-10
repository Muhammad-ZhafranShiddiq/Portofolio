"use client";

import { KeyboardSensor, PointerSensor } from "@dnd-kit/dom";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortableOperation, useSortable } from "@dnd-kit/react/sortable";
import { GripVertical, LoaderCircle, Pencil } from "lucide-react";
import { useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { EmptyState, StatusBadge } from "@/components/admin/admin-ui";
import { DeleteButton } from "@/components/admin/delete-button";
import type {
  ContentOrderActionResult,
  ContentStatus,
} from "@/lib/portfolio/types";

export interface ContentListItem {
  id: string;
  title: string;
  subtitle: string;
  detail?: string;
  status: ContentStatus;
  editHref: string;
}

type DeleteAction = (id: string) => Promise<void>;
type ReorderAction = (orderedIds: string[]) => Promise<ContentOrderActionResult>;
type SaveStatus = "idle" | "saving" | "success" | "error";

const sensors = [PointerSensor, KeyboardSensor];

function moveItem<T>(items: T[], from: number, to: number) {
  const reordered = [...items];
  const [item] = reordered.splice(from, 1);
  if (item === undefined) return items;
  reordered.splice(to, 0, item);
  return reordered;
}

function SortableContentItem({
  item,
  index,
  group,
  disabled,
  reducedMotion,
  deleteAction,
}: {
  item: ContentListItem;
  index: number;
  group: string;
  disabled: boolean;
  reducedMotion: boolean;
  deleteAction: DeleteAction;
}) {
  const { ref, handleRef, isDragging, isDropTarget } = useSortable({
    id: item.id,
    index,
    group,
    disabled,
    transition: reducedMotion
      ? null
      : { duration: 180, easing: "cubic-bezier(0.25, 1, 0.5, 1)" },
  });

  return (
    <li
      ref={ref}
      className={`relative bg-white px-3 py-4 transition-[background-color,box-shadow,opacity] duration-200 motion-reduce:transition-none sm:px-4 ${
        isDragging
          ? "z-10 opacity-70 shadow-[0_16px_40px_rgba(15,23,42,0.16)]"
          : isDropTarget
            ? "bg-blue-50/70"
            : "hover:bg-slate-50/70"
      }`}
    >
      <div className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-start gap-x-3 gap-y-3 sm:grid-cols-[2.75rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4">
        <button
          ref={handleRef}
          type="button"
          disabled={disabled}
          aria-label={`Reorder ${item.title}`}
          title="Drag to reorder, or press Space or Enter and use the arrow keys"
          className="row-span-2 grid size-11 touch-none place-items-center self-center rounded-xl border border-slate-200 bg-white text-slate-500 outline-none transition hover:border-[#335cff] hover:text-[#335cff] focus-visible:ring-2 focus-visible:ring-[#335cff] focus-visible:ring-offset-2 active:cursor-grabbing disabled:cursor-wait disabled:opacity-50 motion-reduce:transition-none sm:row-span-1"
        >
          <GripVertical aria-hidden="true" className="size-5" />
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="break-words font-bold text-slate-950">{item.title}</h2>
            <StatusBadge status={item.status} />
          </div>
          <p className="mt-1 break-words text-sm text-slate-600">{item.subtitle}</p>
          {item.detail ? (
            <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500 sm:line-clamp-1">
              {item.detail}
            </p>
          ) : null}
        </div>

        <div className="col-start-2 flex items-center justify-end gap-1 sm:col-start-3 sm:row-start-1">
          <Link
            href={item.editHref}
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-[#335cff] outline-none transition hover:bg-blue-50 focus-visible:ring-2 focus-visible:ring-[#335cff] motion-reduce:transition-none"
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </Link>
          <DeleteButton
            action={() => deleteAction(item.id)}
            itemName={item.title}
            compact
          />
        </div>
      </div>
    </li>
  );
}

export function ContentList({
  items,
  emptyTitle,
  emptyDescription,
  newHref,
  newLabel,
  deleteAction,
  reorderAction,
  group = "content",
}: {
  items: ContentListItem[];
  emptyTitle: string;
  emptyDescription: string;
  newHref: string;
  newLabel: string;
  deleteAction: DeleteAction;
  reorderAction: ReorderAction;
  group?: string;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;
  const [orderedItems, setOrderedItems] = useState(items);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [saveMessage, setSaveMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const serverItemsSignature = useMemo(() => JSON.stringify(items), [items]);
  const lastServerItemsSignature = useRef(serverItemsSignature);

  useEffect(() => {
    if (
      !isPending &&
      lastServerItemsSignature.current !== serverItemsSignature
    ) {
      lastServerItemsSignature.current = serverItemsSignature;
      setOrderedItems(items);
    }
  }, [isPending, items, serverItemsSignature]);

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled || !isSortableOperation(event.operation) || isPending) {
      return;
    }

    const { source } = event.operation;
    if (!source) return;

    const sourceId = String(source.id);
    const fromIndex = orderedItems.findIndex((item) => item.id === sourceId);
    const toIndex = Math.min(
      Math.max(source.index, 0),
      orderedItems.length - 1,
    );
    if (fromIndex < 0 || fromIndex === toIndex) return;

    const previousItems = orderedItems;
    const nextItems = moveItem(previousItems, fromIndex, toIndex);
    setOrderedItems(nextItems);
    setSaveStatus("saving");
    setSaveMessage("Saving order…");

    startTransition(async () => {
      let result: ContentOrderActionResult;
      try {
        result = await reorderAction(nextItems.map((item) => item.id));
      } catch {
        result = {
          status: "error",
          message: "The new order could not be saved. Your previous order was restored.",
        };
      }

      if (result.status === "success") {
        setSaveStatus("success");
        setSaveMessage(result.message);
      } else {
        setOrderedItems(previousItems);
        setSaveStatus("error");
        setSaveMessage(result.message);
      }

      router.refresh();
    });
  }

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
    <section
      aria-label={`${group} display order`}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]"
    >
      <div className="flex min-h-14 flex-col justify-center gap-1 border-b border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium leading-5 text-slate-500">
          Drag the handle to reorder. Keyboard: Space or Enter, arrow keys, then Space or Enter to drop; Escape cancels.
        </p>
        <p
          role="status"
          aria-live="polite"
          className={`inline-flex min-h-5 shrink-0 items-center gap-1.5 text-xs font-semibold ${
            saveStatus === "error"
              ? "text-rose-700"
              : saveStatus === "success"
                ? "text-emerald-700"
                : "text-slate-500"
          }`}
        >
          {saveStatus === "saving" ? (
            <LoaderCircle
              aria-hidden="true"
              className="size-3.5 animate-spin motion-reduce:animate-none"
            />
          ) : null}
          {saveMessage}
        </p>
      </div>

      <DragDropProvider sensors={sensors} onDragEnd={handleDragEnd}>
        <ol className="divide-y divide-slate-100">
          {orderedItems.map((item, index) => (
            <SortableContentItem
              key={item.id}
              item={item}
              index={index}
              group={group}
              disabled={isPending}
              reducedMotion={reducedMotion}
              deleteAction={deleteAction}
            />
          ))}
        </ol>
      </DragDropProvider>
    </section>
  );
}
