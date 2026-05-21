import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

import { cleanupOrphanedStrings } from '@/lib/db-gc';

function extractIdsFromProductionStep(step: any): string[] {
  const ids: string[] = [];
  if (!step) return ids;
  if (step.titleTextId) ids.push(step.titleTextId);
  if (step.descriptionTextId) ids.push(step.descriptionTextId);
  return ids;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.productionStep.findUnique({
      where: { id },
    });
    if (!item) return NextResponse.json({});
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
    const { id: _, updatedAt: __, ...updateData } = data;

    // 获取更新前的词条 IDs
    const existing = await db.productionStep.findUnique({ where: { id } });
    const oldIds = existing ? extractIdsFromProductionStep(existing) : [];

    const item = await db.productionStep.upsert({
      where: { id },
      update: updateData,
      create: { ...updateData, id },
    });

    // 计算被释放的翻译 IDs，并触发 GC
    const newIds = extractIdsFromProductionStep(item);
    const releasedIds = oldIds.filter(oid => oid && !newIds.includes(oid));
    if (releasedIds.length > 0) {
      await cleanupOrphanedStrings(releasedIds);
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update production step:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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

    // 获取待删除的翻译 IDs
    const existing = await db.productionStep.findUnique({ where: { id } });
    const oldIds = existing ? extractIdsFromProductionStep(existing) : [];

    await db.productionStep.delete({
      where: { id },
    });

    // 触发垃圾回收
    if (oldIds.length > 0) {
      await cleanupOrphanedStrings(oldIds);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

