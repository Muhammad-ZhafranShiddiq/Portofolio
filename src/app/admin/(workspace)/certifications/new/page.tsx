import { createCertificationAction } from "@/actions/portfolio";
import { CertificationForm } from "@/components/admin/content-forms";
export default function NewCertificationPage() { return <CertificationForm action={createCertificationAction} />; }
