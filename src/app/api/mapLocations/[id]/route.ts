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
    await db.mapLocation.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[API] mapLocations DELETE Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
