import { createSkillAction } from "@/actions/portfolio";
import { SkillForm } from "@/components/admin/content-forms";
export default function NewSkillPage() { return <SkillForm action={createSkillAction} />; }
