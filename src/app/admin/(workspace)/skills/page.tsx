import {
  deleteSkillAction,
  reorderSkillsAction,
} from "@/actions/portfolio";
import {
  AdminDataError,
  MutationStatus,
  PageHeader,
} from "@/components/admin/admin-ui";
import { ContentList } from "@/components/admin/content-list";
import { listContent } from "@/lib/portfolio/repository";
import {
  SKILL_CATEGORIES,
  type Skill,
  type SkillCategory,
} from "@/lib/portfolio/types";

function skillReorderAction(category: SkillCategory, expectedIds: string[]) {
  return reorderSkillsAction.bind(null, category, expectedIds);
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
        description="Organize capabilities within each category. Moving a skill to another category is handled in its editor."
        actionHref="/admin/skills/new"
        actionLabel="Add skill"
      />
      <MutationStatus status={status} />
      {records ? (
        records.length === 0 ? (
          <ContentList
            items={[]}
            emptyTitle="No skills yet"
            emptyDescription="Add a skill and group it by the way you apply it."
            newHref="/admin/skills/new"
            newLabel="Add skill"
            deleteAction={deleteSkillAction}
            reorderAction={skillReorderAction("Tools & Technology", [])}
            group="skills"
          />
        ) : (
          <div className="space-y-8">
            {SKILL_CATEGORIES.map((category, categoryIndex) => {
              const categorySkills = records.filter(
                (record) => record.category === category,
              );
              if (categorySkills.length === 0) return null;

              return (
                <section
                  key={category}
                  aria-labelledby={`skills-category-${categoryIndex}`}
                >
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <h2
                      id={`skills-category-${categoryIndex}`}
                      className="text-lg font-bold text-slate-950"
                    >
                      {category}
                    </h2>
                    <span className="text-xs font-semibold text-slate-500">
                      {categorySkills.length} {categorySkills.length === 1 ? "skill" : "skills"}
                    </span>
                  </div>
                  <ContentList
                    items={categorySkills.map((record) => ({
                      id: record.id,
                      title: record.name,
                      subtitle: record.level || "No level or context added",
                      status: record.status,
                      editHref: `/admin/skills/${record.id}/edit`,
                    }))}
                    emptyTitle={`No skills in ${category}`}
                    emptyDescription="Edit a skill to move it into this category."
                    newHref="/admin/skills/new"
                    newLabel="Add skill"
                    deleteAction={deleteSkillAction}
                    reorderAction={skillReorderAction(
                      category,
                      categorySkills.map((record) => record.id),
                    )}
                    group={`skills-${category}`}
                  />
                </section>
              );
            })}
          </div>
        )
      ) : (
        <AdminDataError />
      )}
    </div>
  );
}
