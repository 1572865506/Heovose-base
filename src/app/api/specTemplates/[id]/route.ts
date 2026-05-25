import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    
    const template = await db.specTemplate.upsert({
      where: { id },
      update: {
        name: body.name,
        specGroups: body.specGroups,
      },
      create: {
        id,
        name: body.name,
        specGroups: body.specGroups,
      },
    });
    
    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to update spec template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await db.specTemplate.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete spec template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
