import { notFound } from "next/navigation";
import { updateExperienceAction } from "@/actions/portfolio";
import { AdminDataError } from "@/components/admin/admin-ui";
import { ExperienceForm } from "@/components/admin/content-forms";
import { getContentById } from "@/lib/portfolio/repository";
import type { Experience } from "@/lib/portfolio/types";
export default async function EditExperiencePage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; let record: Experience | null; try { record = await getContentById<Experience>("experiences", id); } catch { return <AdminDataError />; } if (!record) notFound(); return <ExperienceForm experience={record} action={updateExperienceAction.bind(null, id)} />; }
