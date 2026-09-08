import { withAuth } from "next-auth/middleware";

import { isAdminEmail } from "@/lib/auth/admin-email";

export default withAuth({
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    authorized: ({ token }) => isAdminEmail(token?.email),
  },
});

export const config = {
  matcher: ["/admin/:path*"],
};

