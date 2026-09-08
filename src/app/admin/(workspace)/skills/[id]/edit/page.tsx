import { notFound } from "next/navigation";
import { updateSkillAction } from "@/actions/portfolio";
import { AdminDataError } from "@/components/admin/admin-ui";
import { SkillForm } from "@/components/admin/content-forms";
import { getContentById } from "@/lib/portfolio/repository";
import type { Skill } from "@/lib/portfolio/types";
export default async function EditSkillPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; let record: Skill | null; try { record = await getContentById<Skill>("skills", id); } catch { return <AdminDataError />; } if (!record) notFound(); return <SkillForm skill={record} action={updateSkillAction.bind(null, id)} />; }
