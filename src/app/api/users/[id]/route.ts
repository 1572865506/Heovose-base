import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { checkRole } from '@/lib/auth-utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    await checkRole('editor');
    const { id } = await params;
    const user = await db.user.findUnique({
      where: { id },
    });
    if (!user) return NextResponse.json({});
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    await checkRole('superadmin');
    const { id } = await params;
    const data = await request.json();
    const { id: _, emailVerified: __, createdAt: ___, updatedAt: ____, ...updateData } = data;

    const user = await db.user.update({
      where: { id },
      data: updateData,
    });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return NextResponse.json(userWithoutPassword);
    }
    return NextResponse.json(user);
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    console.error('Failed to update user:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<any> }
) {
  try {
    const sessionUser = await checkRole('superadmin');
    const { id } = await params;

    if (sessionUser.id === id) {
      return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
    }

    await db.user.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (error.message.includes('Forbidden')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
