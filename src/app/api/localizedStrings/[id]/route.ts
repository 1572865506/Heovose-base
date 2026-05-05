import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const p = await params;
    const id = p.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const data = await request.json();
    
    // 获取现有内容以备合并
    const existingEntry = await db.localizedString.findUnique({ where: { id } });
    const existingContent = (existingEntry?.content as any) || {};
    
    const incomingContent = data.content || (() => {
      const { id: _, ...rest } = data;
      return rest;
    })();

    const contentToSave = {
      ...existingContent,
      ...incomingContent
    };

    const item = await db.localizedString.upsert({
      where: { id },
      update: {
        content: contentToSave
      },
      create: {
        id,
        content: contentToSave
      },
    });
    
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('[API Error] LocalizedString PUT:', error);
    return NextResponse.json({ 
      error: 'CRITICAL_DATABASE_ERROR', 
      message: error.message || 'Unknown database error'
    }, { status: 500 });
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
    await db.localizedString.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
