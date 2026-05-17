import { auth } from '@/auth';
import db from '@/lib/db';

/**
 * 权限校验工具函数
 * @param requiredPermission 需校验的权限位 (如 'products_edit')
 * @returns boolean 是否允许访问
 */
export async function checkPermission(requiredPermission?: string) {
  const session = await auth();
  if (!session?.user?.email) return false;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true, permissions: true }
  });

  if (!user) return false;

  // 1. 超级管理员拥有无限权限
  if (user.role === 'superadmin') return true;

  // 2. 如果不需要特定权限位，且是 editor，则允许访问基础后台
  if (!requiredPermission) return user.role === 'editor' || user.role === 'superadmin';

  // 3. 校验特定权限位
  const permissions = Array.isArray(user.permissions) ? (user.permissions as string[]) : [];
  return permissions.includes(requiredPermission);
}

/**
 * 快捷校验是否为超级管理员
 */
export async function isSuperAdmin() {
  const session = await auth();
  if (!session?.user?.email) return false;

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { role: true }
  });

  return user?.role === 'superadmin';
}

/**
 * 角色校验工具函数，如不满足权限则抛出异常
 * @param requiredRole 'superadmin' | 'editor'
 */
export async function checkRole(requiredRole: string) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true }
  });

  if (!user) {
    throw new Error('Unauthorized');
  }

  if (user.role === 'superadmin') {
    return user;
  }

  if (requiredRole === 'superadmin' && user.role !== 'superadmin') {
    throw new Error('Forbidden');
  }

  return user;
}
