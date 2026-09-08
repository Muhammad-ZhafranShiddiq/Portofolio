import "server-only";

import type { NextAuthOptions } from "next-auth";
import GoogleProvider, {
  type GoogleProfile,
} from "next-auth/providers/google";

import { isAdminEmail } from "@/lib/auth/admin-email";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "missing-google-client-id",
      clientSecret:
        process.env.GOOGLE_CLIENT_SECRET || "missing-google-client-secret",
    }),
  ],
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google" || !profile) {
        return false;
      }

      const googleProfile = profile as GoogleProfile;
      return (
        googleProfile.email_verified === true &&
        isAdminEmail(googleProfile.email || user.email)
      );
    },
    async jwt({ token }) {
      if (!isAdminEmail(token.email)) {
        token.email = null;
      }
      return token;
    },
    async session({ session }) {
      if (!isAdminEmail(session.user?.email)) {
        return { ...session, user: undefined };
      }
      return session;
    },
  },
};

