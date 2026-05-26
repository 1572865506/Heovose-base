import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { deleteFile } from '@/lib/s3';
import { galleryAssetSchema } from '@/lib/validations';

export const PUT = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Zod validation
    const validation = galleryAssetSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const updateData = validation.data;

    console.log(`[GalleryAPI] Upserting asset ${id}:`, updateData);
    const item = await db.galleryAsset.upsert({
      where: { id },
      update: updateData,
      create: { ...updateData, id },
    });
    console.log(`[GalleryAPI] Successfully upserted asset ${id}`);
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Failed to update gallery asset:', error);
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
});
