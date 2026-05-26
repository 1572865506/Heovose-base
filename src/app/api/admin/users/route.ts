import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/audit';
import { createAdminUserSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 获取所有后台用户
export const GET = withAuth('superadmin', async () => {
  const allUsers = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  // 手动过滤敏感信息
  const users = allUsers.map((u: any) => {
    const { password, ...safeUser } = u;
    return safeUser;
  });

  return NextResponse.json(users);
});

// 创建新用户
export const POST = withAuth('superadmin', async (request: Request, context: any, currentUser: { id: string; role: string; email: string }) => {
  const body = await request.json();
  
  // Zod 验证
  const validation = createAdminUserSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
  }

  const { name, email, password, role, permissions } = validation.data;

  // 检查邮箱是否已存在
  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'editor',
      permissions: permissions || []
    }
  });

  // 记录审计日志
  logAdminAction(
    request,
    currentUser.id,
    currentUser.email,
    'CREATE_ADMIN_USER',
    { name, email, password, role, permissions }
  );

  const { password: _, ...safeUser } = newUser as any;
  return NextResponse.json(safeUser);
});
