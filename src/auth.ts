import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import db from "@/lib/db";
import bcrypt from "bcryptjs";
import { authConfig } from "./auth.config";

// 账号维度防暴力破解锁定表（15 分钟窗口内连续失败 5 次锁定 15 分钟）
const LOGIN_MAX_FAILURES = 5;
const LOGIN_LOCK_WINDOW_MS = 15 * 60 * 1000;
const loginFailureMap = new Map<string, { count: number; lockUntil?: number; windowStart: number }>();

function checkAccountLocked(emailKey: string): boolean {
  const now = Date.now();
  const record = loginFailureMap.get(emailKey);
  if (!record) return false;
  if (record.lockUntil && now < record.lockUntil) return true;
  if (now - record.windowStart > LOGIN_LOCK_WINDOW_MS) {
    loginFailureMap.delete(emailKey);
    return false;
  }
  return false;
}

function recordLoginFailure(emailKey: string) {
  const now = Date.now();
  // 惰性清理过期记录
  if (loginFailureMap.size > 500) {
    for (const [k, v] of loginFailureMap.entries()) {
      if (now - v.windowStart > LOGIN_LOCK_WINDOW_MS && (!v.lockUntil || now >= v.lockUntil)) {
        loginFailureMap.delete(k);
      }
    }
  }
  const record = loginFailureMap.get(emailKey);
  if (!record || now - record.windowStart > LOGIN_LOCK_WINDOW_MS) {
    loginFailureMap.set(emailKey, { count: 1, windowStart: now });
    return;
  }
  record.count += 1;
  if (record.count >= LOGIN_MAX_FAILURES) {
    record.lockUntil = now + LOGIN_LOCK_WINDOW_MS;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const rawEmail = String(credentials.email).trim();
        const emailKey = rawEmail.toLowerCase();

        if (checkAccountLocked(emailKey)) {
          throw new Error("TOO_MANY_ATTEMPTS");
        }

        try {
          const user = await db.user.findUnique({
            where: { email: rawEmail },
          });

          // 仅允许具备后台管理角色（superadmin / editor）的账号登录
          if (!user || !user.password || (user.role !== "superadmin" && user.role !== "editor")) {
            recordLoginFailure(emailKey);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            recordLoginFailure(emailKey);
            return null;
          }

          loginFailureMap.delete(emailKey);

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error("Database connection error during auth:", error);
          // Special handling for Prisma connection/initialization errors
          if (error.code === 'P1001' || error.name === 'PrismaClientInitializationError') {
            throw new Error("DATABASE_CONNECTION_ERROR");
          }
          throw error;
        }
      },
    }),
  ],
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
});
