"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoaderCircle, Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  itemName,
  compact = false,
}: {
  action: () => Promise<void>;
  itemName: string;
  compact?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  function handleDelete() {
    const confirmed = window.confirm(
      `Delete “${itemName}”? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setError("");
    startTransition(async () => {
      try {
        await action();
        router.refresh();
      } catch {
        setError("Could not delete this item. Try again.");
      }
    });
  }

  return (
    <div className={compact ? "" : "min-w-0"}>
      <button
        type="button"
        disabled={pending}
        onClick={handleDelete}
        aria-label={`Delete ${itemName}`}
        className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-rose-700 outline-none transition hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-500 disabled:cursor-wait disabled:opacity-60 ${
          compact ? "size-10 p-0" : "px-3"
        }`}
      >
        {pending ? (
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <Trash2 aria-hidden="true" className="size-4" />
        )}
        {compact ? <span className="sr-only">Delete</span> : pending ? "Deleting…" : "Delete"}
      </button>
      {error ? (
        <p role="alert" className="mt-1 max-w-44 text-xs text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
