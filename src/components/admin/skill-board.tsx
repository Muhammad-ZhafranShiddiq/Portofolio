"use client";

import { KeyboardSensor, PointerSensor } from "@dnd-kit/dom";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { LoaderCircle } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";

import { EmptyState } from "@/components/admin/admin-ui";
import {
  SortableContentItem,
  type ContentListItem,
  type DeleteAction,
} from "@/components/admin/content-list";
import {
  SKILL_CATEGORIES,
  type ContentOrderActionResult,
  type SkillCategory,
  type SkillOrderGroup,
} from "@/lib/portfolio/types";

export interface SkillBoardItem extends ContentListItem {
  category: SkillCategory;
}

type SkillGroups = Record<SkillCategory, SkillBoardItem[]>;
type ReorderSkillsAction = (
  orderedGroups: SkillOrderGroup[],
) => Promise<ContentOrderActionResult>;
type SaveStatus = "idle" | "saving" | "success" | "error";

const sensors = [PointerSensor, KeyboardSensor];
const sortableType = "skill";

function createSkillGroups(items: SkillBoardItem[]): SkillGroups {
  const groups: SkillGroups = {
    "Industry Knowledge": [],
    "Tools & Technology": [],
    "Interpersonal Skill": [],
  };

  for (const item of items) {
    groups[item.category].push(item);
  }

  return groups;
}

function createOrderPayload(groups: SkillGroups): SkillOrderGroup[] {
  return SKILL_CATEGORIES.map((category) => ({
    category,
    orderedIds: groups[category].map((item) => item.id),
  }));
}

function isSkillCategory(value: unknown): value is SkillCategory {
  return (
    typeof value === "string" &&
    SKILL_CATEGORIES.some((category) => category === value)
  );
}

function moveWithinGroup(
  items: SkillBoardItem[],
  fromIndex: number,
  toIndex: number,
) {
  const reordered = [...items];
  const [item] = reordered.splice(fromIndex, 1);
  if (!item) return items;
  reordered.splice(toIndex, 0, item);
  return reordered;
}

function EmptyCategoryDropZone({
  category,
  disabled,
}: {
  category: SkillCategory;
  disabled: boolean;
}) {
  const { ref, isDropTarget } = useSortable({
    id: `skill-category:${category}`,
    index: 0,
    group: category,
    type: sortableType,
    accept: sortableType,
    disabled: { draggable: true, droppable: disabled },
    transition: null,
  });

  return (
    <li
      ref={ref}
      className={`grid min-h-24 place-items-center px-5 py-6 text-center text-sm transition-colors motion-reduce:transition-none ${
        isDropTarget
          ? "bg-blue-50 font-semibold text-[#335cff]"
          : "bg-slate-50/60 text-slate-500"
      }`}
    >
      Drop a skill here
    </li>
  );
}

export function SkillBoard({
  items,
  deleteAction,
  reorderAction,
  newHref,
  newLabel,
}: {
  items: SkillBoardItem[];
  deleteAction: DeleteAction;
  reorderAction: ReorderSkillsAction;
  newHref: string;
  newLabel: string;
}) {
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;
  const [groups, setGroups] = useState<SkillGroups>(() =>
    createSkillGroups(items),
  );
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
      setGroups(createSkillGroups(items));
    }
  }, [isPending, items, serverItemsSignature]);

  function handleDragEnd(event: DragEndEvent) {
    if (event.canceled || isPending) return;

    const { source } = event.operation;
    if (!isSortable(source)) return;

    const sourceCategory = source.initialGroup;
    const targetCategory = source.group;
    if (
      !isSkillCategory(sourceCategory) ||
      !isSkillCategory(targetCategory)
    ) {
      return;
    }

    const sourceId = String(source.id);
    const sourceItems = groups[sourceCategory];
    const fromIndex = sourceItems.findIndex((item) => item.id === sourceId);
    if (fromIndex < 0) return;

    let nextGroups: SkillGroups;

    if (sourceCategory === targetCategory) {
      const toIndex = Math.min(
        Math.max(source.index, 0),
        sourceItems.length - 1,
      );
      if (fromIndex === toIndex) return;

      nextGroups = {
        ...groups,
        [sourceCategory]: moveWithinGroup(sourceItems, fromIndex, toIndex),
      };
    } else {
      const nextSourceItems = [...sourceItems];
      const [movedItem] = nextSourceItems.splice(fromIndex, 1);
      if (!movedItem) return;

      const nextTargetItems = [...groups[targetCategory]];
      const toIndex = Math.min(
        Math.max(source.index, 0),
        nextTargetItems.length,
      );
      nextTargetItems.splice(toIndex, 0, {
        ...movedItem,
        category: targetCategory,
      });

      nextGroups = {
        ...groups,
        [sourceCategory]: nextSourceItems,
        [targetCategory]: nextTargetItems,
      };
    }

    const previousGroups = groups;
    setGroups(nextGroups);
    setSaveStatus("saving");
    setSaveMessage("Saving skill categories and order…");

    startTransition(async () => {
      let result: ContentOrderActionResult;
      try {
        result = await reorderAction(createOrderPayload(nextGroups));
      } catch {
        result = {
          status: "error",
          message:
            "The skill move could not be saved. The previous layout was restored.",
        };
      }

      if (result.status === "success") {
        setSaveStatus("success");
        setSaveMessage(result.message);
      } else {
        setGroups(previousGroups);
        setSaveStatus("error");
        setSaveMessage(result.message);
      }

      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <EmptyState
        title="No skills yet"
        description="Add a skill and group it by the way you apply it."
        actionHref={newHref}
        actionLabel={newLabel}
      />
    );
  }

  return (
    <section aria-label="Skill categories and display order">
      <div className="mb-5 flex min-h-14 flex-col justify-center gap-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-[0_10px_35px_rgba(15,23,42,0.05)] sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-medium leading-5 text-slate-500">
          Drag a handle to reorder or move a skill between categories. Keyboard: Space or Enter, arrow keys, then Space or Enter to drop; Escape cancels.
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
        <div className="space-y-8">
          {SKILL_CATEGORIES.map((category, categoryIndex) => {
            const categoryItems = groups[category];
            const headingId = `skills-category-${categoryIndex}`;

            return (
              <section key={category} aria-labelledby={headingId}>
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h2
                    id={headingId}
                    className="text-lg font-bold text-slate-950"
                  >
                    {category}
                  </h2>
                  <span className="text-xs font-semibold text-slate-500">
                    {categoryItems.length}{" "}
                    {categoryItems.length === 1 ? "skill" : "skills"}
                  </span>
                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.05)]">
                  <ol className="divide-y divide-slate-100">
                    {categoryItems.length > 0 ? (
                      categoryItems.map((item, index) => (
                        <SortableContentItem
                          key={item.id}
                          item={item}
                          index={index}
                          group={category}
                          disabled={isPending}
                          reducedMotion={reducedMotion}
                          deleteAction={deleteAction}
                          sortableType={sortableType}
                          handleLabel={`Move ${item.title}`}
                          handleDescription="Drag to reorder or move between categories, or press Space or Enter and use the arrow keys"
                        />
                      ))
                    ) : (
                      <EmptyCategoryDropZone
                        category={category}
                        disabled={isPending}
                      />
                    )}
                  </ol>
                </div>
              </section>
            );
          })}
        </div>
      </DragDropProvider>
    </section>
  );
}
