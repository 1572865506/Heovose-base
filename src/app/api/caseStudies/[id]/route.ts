import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.caseStudy.findUnique({
      where: { id },
    });
    if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(item);
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
    const { id } = await params;
    const data = await request.json();
    console.log('[API] Updating case study:', id, 'data:', JSON.stringify(data));
    
    // Clean up data for Prisma
    const { id: _, updatedAt: __, ...updateData } = data;

    try {
      const item = await db.caseStudy.upsert({
        where: { id },
        update: updateData,
        create: { ...updateData, id },
      });
      return NextResponse.json(item);
    } catch (upsertError: any) {
      if (upsertError.message.includes('Unknown argument')) {
        console.warn('[API] Stale client. Falling back to raw SQL for CaseStudy Text IDs...');
        
        // 分离新字段
        const { tagTextId, titleTextId, descriptionTextId, published, ...safeData } = updateData;
        console.log('[API Fallback] published:', published);
        
        // 1. 原始 SQL 更新
        await db.$executeRawUnsafe(
          `UPDATE "CaseStudy" SET "tagTextId" = $1, "titleTextId" = $2, "descriptionTextId" = $3, "published" = $4 WHERE id = $5`,
          tagTextId || null,
          titleTextId || null,
          descriptionTextId || null,
          published === undefined ? true : published,
          id
        );

        // 2. 安全 upsert
        const safeItem = await db.caseStudy.upsert({
          where: { id },
          update: safeData,
          create: { ...safeData, id },
        });
        return NextResponse.json(safeItem);
      }
      throw upsertError;
    }
  } catch (error: any) {
    console.error('Failed to update case study:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error.message
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
    await db.caseStudy.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete case study:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
