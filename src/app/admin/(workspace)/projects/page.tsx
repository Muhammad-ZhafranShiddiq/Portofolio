import {
  deleteProjectAction,
  reorderProjectsAction,
} from "@/actions/portfolio";
import {
  AdminDataError,
  MutationStatus,
  PageHeader,
} from "@/components/admin/admin-ui";
import { ContentList } from "@/components/admin/content-list";
import { listContent } from "@/lib/portfolio/repository";
import type { Project } from "@/lib/portfolio/types";

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let records: Project[] | null;
  try {
    records = await listContent<Project>("projects", { includeDrafts: true });
  } catch {
    records = null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Projects"
        description="Curate project stories, links, technologies, and featured work. The first four published projects appear first in the public gallery."
        actionHref="/admin/projects/new"
        actionLabel="Add project"
      />
      <MutationStatus status={status} />
      {records ? (
        <ContentList
          items={records.map((record) => ({
            id: record.id,
            title: record.title,
            subtitle: record.role,
            detail: record.summary,
            status: record.status,
            editHref: `/admin/projects/${record.id}/edit`,
          }))}
          emptyTitle="No projects yet"
          emptyDescription="Add a project to build your selected-work section."
          newHref="/admin/projects/new"
          newLabel="Add project"
          deleteAction={deleteProjectAction}
          reorderAction={reorderProjectsAction.bind(
            null,
            records.map((record) => record.id),
          )}
          group="projects"
        />
      ) : (
        <AdminDataError />
      )}
    </div>
  );
}
