import { createExperienceAction } from "@/actions/portfolio";
import { ExperienceForm } from "@/components/admin/content-forms";
export default function NewExperiencePage() { return <ExperienceForm action={createExperienceAction} />; }
