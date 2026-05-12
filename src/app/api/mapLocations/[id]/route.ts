import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    
    const { id: _, homepageId: __, ...updateData } = data;

    const location = await db.mapLocation.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json(location);
  } catch (error: any) {
    console.error('[API] mapLocations PUT Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
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

    if (location) {
      // 2. Collect all non-null text IDs
      const textIds = [location.titleTextId, location.addressTextId, location.descTextId].filter(Boolean) as string[];
      
      // 3. Delete associated localized strings
      if (textIds.length > 0) {
        await db.localizedString.deleteMany({
          where: { id: { in: textIds } }
        });
      }
    }

    // 4. Finally delete the location
    await db.mapLocation.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] mapLocations DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
