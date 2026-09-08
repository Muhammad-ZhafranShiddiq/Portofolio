import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdminPage } from "@/lib/auth/session";

export default async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const session = await requireAdminPage();
  return <AdminShell user={{ name: session.user?.name, email: session.user?.email }}>{children}</AdminShell>;
}
