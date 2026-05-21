import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { cleanupOrphanedStrings } from '@/lib/db-gc';

function extractIdsFromCategory(category: any): string[] {
  const ids: string[] = [];
  if (!category) return ids;
  if (category.nameTextId) ids.push(category.nameTextId);
  if (category.descriptionTextId) ids.push(category.descriptionTextId);
  return ids;
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
    const { 
      id: _, 
      updatedAt: __, 
      createdAt: ___, 
      nameText: ____, 
      descriptionText: _____,
      products: ______,
      parent: _______,
      children: ________,
      ...updateData 
    } = data;

    // 1. 获取更新前的分类数据并提取关联词条 IDs
    const existingCategory = await db.productCategory.findUnique({ where: { id } });
    const oldIds = existingCategory ? extractIdsFromCategory(existingCategory) : [];

    const item = await db.productCategory.upsert({
      where: { id },
      update: updateData,
      create: { ...updateData, id },
    });

    // 2. 获取更新后的词条 IDs，并找出被释放的 IDs 进行垃圾回收
    const newIds = extractIdsFromCategory(item);
    const releasedIds = oldIds.filter(oid => oid && !newIds.includes(oid));

    if (releasedIds.length > 0) {
      await cleanupOrphanedStrings(releasedIds);
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update product category:', error);
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

    // 1. 查找待删除分类并提取关联翻译 IDs
    const existingCategory = await db.productCategory.findUnique({ where: { id } });
    const oldIds = existingCategory ? extractIdsFromCategory(existingCategory) : [];

    await db.productCategory.delete({
      where: { id },
    });

    // 2. 删除成功后，释放所有原本关联的词条，执行垃圾回收
    if (oldIds.length > 0) {
      await cleanupOrphanedStrings(oldIds);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product category:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
