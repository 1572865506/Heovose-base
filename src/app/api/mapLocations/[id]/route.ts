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

    console.log('[API] Updating location with:', validation.data);

    const location = await db.mapLocation.update({
      where: { id },
      data: validation.data,
    });

    // 计算被释放的翻译 IDs，并触发 GC
    const newIds = extractIdsFromMapLocation(location);
    const releasedIds = oldIds.filter(oid => oid && !newIds.includes(oid));
    if (releasedIds.length > 0) {
      await cleanupOrphanedStrings(releasedIds);
    }

    return NextResponse.json(location);

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
