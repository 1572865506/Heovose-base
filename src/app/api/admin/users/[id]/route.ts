import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/audit';
import { updateAdminUserSchema } from '@/lib/validations';

export const PATCH = withAuth('superadmin', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
  currentUser: { id: string; role: string; email: string }
) => {
  const { id } = await params;
  const body = await request.json();

  const validation = updateAdminUserSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
  }

  const { role, permissions } = validation.data;

  // Protect superadmin account
  const targetUser = await db.user.findUnique({ where: { id } });
  if (targetUser?.role === 'superadmin') {
    return NextResponse.json({ error: 'Superadmin accounts cannot be modified' }, { status: 400 });
  }

  const updatedUser = await db.user.update({
    where: { id },
    data: {
      role,
      permissions
    }
  });

  logAdminAction(
    request,
    currentUser.id,
    currentUser.email,
    'UPDATE_ADMIN_USER',
    { targetUserId: id, role, permissions }
  );

  const { password, ...userWithoutPassword } = updatedUser;
  return NextResponse.json(userWithoutPassword);
});

export const DELETE = withAuth('superadmin', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
  currentUser: { id: string; role: string; email: string }
) => {
  const { id } = await params;

  // Protect superadmin account
  const targetUser = await db.user.findUnique({ where: { id } });
  if (targetUser?.role === 'superadmin') {
    return NextResponse.json({ error: 'Superadmin accounts cannot be deleted' }, { status: 400 });
  }

  await db.user.delete({ where: { id } });

  logAdminAction(
    request,
    currentUser.id,
    currentUser.email,
    'DELETE_ADMIN_USER',
    { targetUserId: id, targetEmail: targetUser?.email }
  );

  return NextResponse.json({ success: true });
});
