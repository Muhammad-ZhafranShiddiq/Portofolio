import "server-only";

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { isAdminEmail } from "@/lib/auth/admin-email";
import { authOptions } from "@/lib/auth/options";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  return session?.user && isAdminEmail(session.user.email) ? session : null;
}

export async function requireAdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export class UnauthorizedAdminError extends Error {
  constructor() {
    super("You are not authorized to perform this action.");
    this.name = "UnauthorizedAdminError";
  }
}

export async function assertAdmin() {
  const session = await getAdminSession();
  if (!session) {
    throw new UnauthorizedAdminError();
  }
  return session;
}

