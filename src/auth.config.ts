import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true,
  providers: [], // Empty array, overridden in auth.ts
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 1 day
    updateAge: 4 * 60 * 60, // 4 hours
  },
  pages: {
    signIn: "/auth/login",
  },
} satisfies NextAuthConfig;
