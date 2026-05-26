import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { cleanupOrphanedStrings } from '@/lib/db-gc';
import { mapLocationSchema } from '@/lib/validations';

export const dynamic = 'force-dynamic';

function extractIdsFromMapLocation(loc: any): string[] {
  const ids: string[] = [];
  if (!loc) return ids;
  if (loc.titleTextId) ids.push(loc.titleTextId);
  if (loc.addressTextId) ids.push(loc.addressTextId);
  if (loc.descTextId) ids.push(loc.descTextId);
  return ids;
}

export const PUT = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = mapLocationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }
    
    // Ensure the record exists
    const existing = await db.mapLocation.findUnique({ where: { id } });
    if (!existing) {
      console.error('[API] Location not found:', id);
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // 获取更新前关联的 IDs
    const oldIds = extractIdsFromMapLocation(existing);

    const updateData = { ...validation.data };
    
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
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
