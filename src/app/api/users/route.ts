import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkRole } from '@/lib/auth-utils';

export async function GET() {
  try {
    await checkRole('superadmin');
    const users = await db.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(users);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await checkRole('superadmin');
    const data = await request.json();
    const user = await db.user.create({
      data: {
        email: data.email,
        name: data.displayName,
        role: data.role || 'editor',
      },
    });
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('Failed to create user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
