import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const { role, permissions } = body;

    // 1. 校验当前用户是否为超级管理员
    const currentUser = await db.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. 保护超级管理员账号不被修改
    const targetUser = await db.user.findUnique({ where: { id } });
    if (targetUser?.role === 'superadmin') {
      return NextResponse.json({ error: 'Superadmin accounts cannot be modified' }, { status: 400 });
    }

    // 3. 执行更新
    const updatedUser = await db.user.update({
      where: { id },
      data: {
        role,
        permissions
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('[API] Users PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;

    // 1. 权限校验
    const currentUser = await db.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 2. 保护超级管理员账号不被删除
    const targetUser = await db.user.findUnique({ where: { id } });
    if (targetUser?.role === 'superadmin') {
      return NextResponse.json({ error: 'Superadmin accounts cannot be deleted' }, { status: 400 });
    }

    // 3. 执行删除
    await db.user.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] Users DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
