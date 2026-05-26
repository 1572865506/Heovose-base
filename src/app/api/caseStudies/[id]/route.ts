import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { cleanupOrphanedStrings } from '@/lib/db-gc';
import { caseStudySchema } from '@/lib/validations';

function extractIdsFromCaseStudy(cs: any): string[] {
  const ids: string[] = [];
  if (!cs) return ids;
  if (cs.titleTextId) ids.push(cs.titleTextId);
  if (cs.tagTextId) ids.push(cs.tagTextId);
  if (cs.descriptionTextId) ids.push(cs.descriptionTextId);
  return ids;
}

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

export const PUT = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Zod validation
    const validation = caseStudySchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }
    const updateData = validation.data;

    console.log('[API] Updating case study:', id, 'data:', JSON.stringify(updateData));
    
    // 获取更新前关联的词条 IDs
    const existing = await db.caseStudy.findUnique({ where: { id } });
    const oldIds = existing ? extractIdsFromCaseStudy(existing) : [];

    let item;
    try {
      item = await db.caseStudy.upsert({
        where: { id },
        update: updateData,
        create: { ...updateData, id },
      });
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
        item = await db.caseStudy.upsert({
          where: { id },
          update: safeData,
          create: { ...safeData, id },
        });
      } else {
        throw upsertError;
      }
    }

    // 自动物理垃圾回收释放的词条
    const newIds = extractIdsFromCaseStudy(item);
    const releasedIds = oldIds.filter(oid => oid && !newIds.includes(oid));
    if (releasedIds.length > 0) {
      await cleanupOrphanedStrings(releasedIds);
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Failed to update case study:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
    }, { status: 500 });
  }
});

export const DELETE = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;

    // 获取待删除的翻译 IDs
    const existing = await db.caseStudy.findUnique({ where: { id } });
    const oldIds = existing ? extractIdsFromCaseStudy(existing) : [];

    await db.caseStudy.delete({
      where: { id },
    });

    // 自动物理垃圾回收被释放的词条
    if (oldIds.length > 0) {
      await cleanupOrphanedStrings(oldIds);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete case study:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
