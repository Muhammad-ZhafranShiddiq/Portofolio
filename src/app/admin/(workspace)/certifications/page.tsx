import {
  deleteCertificationAction,
  reorderCertificationsAction,
} from "@/actions/portfolio";
import {
  AdminDataError,
  MutationStatus,
  PageHeader,
} from "@/components/admin/admin-ui";
import { ContentList } from "@/components/admin/content-list";
import { listContent } from "@/lib/portfolio/repository";
import type { Certification } from "@/lib/portfolio/types";

export default async function CertificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  let records: Certification[] | null;
  try {
    records = await listContent<Certification>("certifications", {
      includeDrafts: true,
    });
  } catch {
    records = null;
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Certifications"
        description="Maintain credentials, verification details, and supporting media. Drag items below to control their public order."
        actionHref="/admin/certifications/new"
        actionLabel="Add certification"
      />
      <MutationStatus status={status} />
      {records ? (
        <ContentList
          items={records.map((record) => ({
            id: record.id,
            title: record.title,
            subtitle: record.issuer,
            detail: record.description,
            status: record.status,
            editHref: `/admin/certifications/${record.id}/edit`,
          }))}
          emptyTitle="No certifications yet"
          emptyDescription="Add a credential when it contributes useful proof to your portfolio."
          newHref="/admin/certifications/new"
          newLabel="Add certification"
          deleteAction={deleteCertificationAction}
          reorderAction={reorderCertificationsAction.bind(
            null,
            records.map((record) => record.id),
          )}
          group="certifications"
        />
      ) : (
        <AdminDataError />
      )}
    </div>
  );
}
