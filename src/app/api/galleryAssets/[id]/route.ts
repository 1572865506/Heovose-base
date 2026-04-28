import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { deleteFile } from '@/lib/s3';

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

    const item = await db.galleryAsset.upsert({
      where: { id },
      update: updateData,
      create: { ...updateData, id },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update gallery asset:', error);
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
    
    // Find asset to get fileName
    const asset = await db.galleryAsset.findUnique({
      where: { id }
    });

    if (asset) {
      await deleteFile(asset.fileName);
      await db.galleryAsset.delete({
        where: { id },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
