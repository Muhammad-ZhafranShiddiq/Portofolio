import { createProjectAction } from "@/actions/portfolio";
import { ProjectForm } from "@/components/admin/content-forms";
export default function NewProjectPage() { return <ProjectForm action={createProjectAction} />; }
