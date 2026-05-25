import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 获取所有后台用户
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      console.warn('[API] Users GET: No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[API] Users GET: Checking permissions for', session.user?.email);
    
    // 权限校验：只有超级管理员能管理用户
    const currentUser = await db.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    console.log('[API] Users GET: Current user found:', !!currentUser, 'Role:', currentUser?.role);

    if (currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const allUsers = await db.user.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // 手动过滤敏感信息
    const users = allUsers.map((u: any) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    return NextResponse.json(users);
  } catch (error: any) {
    console.error('[API] Users GET Error Full:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}

// 创建新用户
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 权限校验
    const currentUser = await db.user.findUnique({
      where: { email: session.user?.email || '' }
    });

    if (currentUser?.role !== 'superadmin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { name, email, password, role, permissions } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

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

    const { password: _, ...safeUser } = newUser as any;
    return NextResponse.json(safeUser);
  } catch (error: any) {
    console.error('[API] Users POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
