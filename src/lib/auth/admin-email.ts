export function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() || "";
}

export function isAdminEmail(email: string | null | undefined) {
  const configuredAdmin = normalizeEmail(process.env.ADMIN_EMAIL);
  return Boolean(configuredAdmin) && normalizeEmail(email) === configuredAdmin;
}

