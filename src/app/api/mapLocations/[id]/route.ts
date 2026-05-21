import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

import { cleanupOrphanedStrings } from '@/lib/db-gc';

function extractIdsFromMapLocation(loc: any): string[] {
  const ids: string[] = [];
  if (!loc) return ids;
  if (loc.titleTextId) ids.push(loc.titleTextId);
  if (loc.addressTextId) ids.push(loc.addressTextId);
  if (loc.descTextId) ids.push(loc.descTextId);
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
    console.log('[API] Updating MapLocation:', id, data);
    
    // Ensure the record exists
    const existing = await db.mapLocation.findUnique({ where: { id } });
    if (!existing) {
      console.error('[API] Location not found:', id);
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // 获取更新前关联的 IDs
    const oldIds = extractIdsFromMapLocation(existing);

    const { 
      id: _, 
      homepageId: __, 
      homepageContent: ___,
      createdAt: ____,
      updatedAt: _____,
      ...rawUpdateData 
    } = data;

    // Filter to only include fields present in the model
    const updateData: any = {};
    const allowedFields = [
      'type', 'titleZh', 'titleEn', 'addressZh', 'addressEn', 
      'descZh', 'descEn', 'imageUrl', 'countryCode', 
      'posTop', 'posLeft', 'order', 'titleTextId', 'addressTextId', 'descTextId'
    ];

    allowedFields.forEach(field => {
      if (rawUpdateData[field] !== undefined) {
        updateData[field] = rawUpdateData[field];
      }
    });

    // Remove countryCode from updateData to bypass Prisma validation if it's still failing
    const countryCode = updateData.countryCode;
    delete updateData.countryCode;

    console.log('[API] Prisma updateData (filtered):', updateData);

    const location = await db.mapLocation.update({
      where: { id },
      data: updateData,
    });

    // Manually update countryCode using raw SQL to bypass Prisma validation issues
    if (countryCode) {
      console.log('[API] Updating countryCode via raw SQL:', id, '->', countryCode);
      const affectedRows = await db.$executeRaw`UPDATE "MapLocation" SET "countryCode" = ${countryCode} WHERE id = ${id}`;
      console.log('[API] Raw SQL affected rows:', affectedRows);
    }

    // Fetch the final state from DB to ensure response is accurate
    const finalLocation = await db.mapLocation.findUnique({ where: { id } });

    // 计算被释放的翻译 IDs，并触发 GC
    const newIds = finalLocation ? extractIdsFromMapLocation(finalLocation) : [];
    const releasedIds = oldIds.filter(oid => oid && !newIds.includes(oid));
    if (releasedIds.length > 0) {
      await cleanupOrphanedStrings(releasedIds);
    }

    return NextResponse.json(finalLocation);
  } catch (error: any) {
    console.error('[API] mapLocations PUT Error:', error);
    return NextResponse.json({ 
      error: 'Update failed', 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
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
    
    // 1. Get the location first to find associated textIds
    const location = await db.mapLocation.findUnique({
      where: { id },
      select: { titleTextId: true, addressTextId: true, descTextId: true }
    });

    const oldIds = location ? [location.titleTextId, location.addressTextId, location.descTextId].filter(Boolean) as string[] : [];

    // 2. Finally delete the location
    await db.mapLocation.delete({
      where: { id },
    });

    // 3. 安全引用计数释放翻译词条（取代以前的直接物理强删）
    if (oldIds.length > 0) {
      await cleanupOrphanedStrings(oldIds);
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] mapLocations DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

