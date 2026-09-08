import { notFound } from "next/navigation";
import { updateCertificationAction } from "@/actions/portfolio";
import { AdminDataError } from "@/components/admin/admin-ui";
import { CertificationForm } from "@/components/admin/content-forms";
import { getContentById } from "@/lib/portfolio/repository";
import type { Certification } from "@/lib/portfolio/types";
export default async function EditCertificationPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; let record: Certification | null; try { record = await getContentById<Certification>("certifications", id); } catch { return <AdminDataError />; } if (!record) notFound(); return <CertificationForm certification={record} action={updateCertificationAction.bind(null, id)} />; }
