import { deleteExperienceAction } from "@/actions/portfolio";
import { AdminDataError, MutationStatus, PageHeader } from "@/components/admin/admin-ui";
import { ContentList } from "@/components/admin/content-list";
import { listContent } from "@/lib/portfolio/repository";
import type { Experience } from "@/lib/portfolio/types";

export default async function ExperiencesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams; let records: Experience[] | null;
  try { records = await listContent<Experience>("experiences", { includeDrafts: true }); } catch { records = null; }
  return <div className="mx-auto max-w-6xl"><PageHeader title="Experience" description="Manage roles and measurable outcomes shown in your career timeline." actionHref="/admin/experiences/new" actionLabel="Add experience" /><MutationStatus status={status} />{records ? <ContentList items={records.map((record) => ({ id: record.id, title: record.role, subtitle: record.organization, detail: record.highlights[0], status: record.status, displayOrder: record.displayOrder, editHref: `/admin/experiences/${record.id}/edit`, deleteAction: deleteExperienceAction.bind(null, record.id) }))} emptyTitle="No experience yet" emptyDescription="Create your first role to start the public timeline." newHref="/admin/experiences/new" newLabel="Add experience" /> : <AdminDataError />}</div>;
}
