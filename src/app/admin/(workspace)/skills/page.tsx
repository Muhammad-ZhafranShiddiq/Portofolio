import {
  deleteSkillAction,
  reorderSkillsAction,
} from "@/actions/portfolio";
import {
  AdminDataError,
  MutationStatus,
  PageHeader,
} from "@/components/admin/admin-ui";
import { SkillBoard } from "@/components/admin/skill-board";
import { listContent } from "@/lib/portfolio/repository";
import {
  SKILL_CATEGORIES,
  type Skill,
  type SkillOrderGroup,
} from "@/lib/portfolio/types";

function skillOrderGroups(records: Skill[]): SkillOrderGroup[] {
  return SKILL_CATEGORIES.map((category) => ({
    category,
    orderedIds: records
      .filter((record) => record.category === category)
      .map((record) => record.id),
  }));
}

export default async function SkillsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let records: Skill[] | null;
  try {
    records = await listContent<Skill>("skills", { includeDrafts: true });
  } catch {
    records = null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Skills"
        description="Drag skills to reorder them or move them between categories. Changes are saved automatically."
        actionHref="/admin/skills/new"
        actionLabel="Add skill"
      />
      <MutationStatus status={status} />
      {records ? (
        <SkillBoard
          items={records.map((record) => ({
            id: record.id,
            title: record.name,
            subtitle: record.level || "No level or context added",
            status: record.status,
            editHref: `/admin/skills/${record.id}/edit`,
            category: record.category,
          }))}
          newHref="/admin/skills/new"
          newLabel="Add skill"
          deleteAction={deleteSkillAction}
          reorderAction={reorderSkillsAction.bind(
            null,
            skillOrderGroups(records),
          )}
        />
      ) : (
        <AdminDataError />
      )}
    </div>
  );
}
