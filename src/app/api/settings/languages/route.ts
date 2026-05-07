import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const item = await db.setting.findUnique({
      where: { id: 'languages' },
    });
    if (!item) return NextResponse.json({});
    return NextResponse.json(JSON.parse(item.value as string));
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();

    const item = await db.setting.upsert({
      where: { id: 'languages' },
      update: { value: JSON.stringify(data) },
      create: { id: 'languages', value: JSON.stringify(data) },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update setting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
