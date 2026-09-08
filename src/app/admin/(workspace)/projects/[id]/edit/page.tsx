import { notFound } from "next/navigation";
import { updateProjectAction } from "@/actions/portfolio";
import { AdminDataError } from "@/components/admin/admin-ui";
import { ProjectForm } from "@/components/admin/content-forms";
import { getContentById } from "@/lib/portfolio/repository";
import type { Project } from "@/lib/portfolio/types";
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; let record: Project | null; try { record = await getContentById<Project>("projects", id); } catch { return <AdminDataError />; } if (!record) notFound(); return <ProjectForm project={record} action={updateProjectAction.bind(null, id)} />; }
