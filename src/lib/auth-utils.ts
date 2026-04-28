import { auth } from "@/auth";

export async function checkRole(requiredRole: 'superadmin' | 'editor') {
  const session = await auth();
  
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }

  const userRole = (session.user as any).role;

  if (requiredRole === 'superadmin' && userRole !== 'superadmin') {
    throw new Error("Forbidden: Superadmin role required");
  }

  return session.user;
}
