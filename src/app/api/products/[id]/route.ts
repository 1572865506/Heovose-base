import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        nameText: true,
        descriptionText: true,
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Failed to fetch product:', error);
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
    
    // Check if product exists for partial update support
    const existingProduct = await db.product.findUnique({ where: { id } });

    if (existingProduct) {
      // Partial update
      const product = await db.product.update({
        where: { id },
        data: {
          nameTextId: data.nameTextId,
          descriptionTextId: data.descriptionTextId,
          categoryId: data.categoryId,
          mainImageUrl: data.mainImageUrl,
          videoUrl: data.videoUrl,
          galleryImageUrls: data.galleryImageUrls,
          status: data.status,
          enabledLanguages: data.enabledLanguages,
          specGroups: data.specGroups,
          localizedDetails: data.localizedDetails
        }
      });
      return NextResponse.json(product);
    } else {
      // Full create
      const product = await db.product.create({
        data: {
          id,
          nameTextId: data.nameTextId || `prod_name_${id}`,
          descriptionTextId: data.descriptionTextId || `prod_desc_${id}`,
          categoryId: data.categoryId,
          mainImageUrl: data.mainImageUrl,
          videoUrl: data.videoUrl,
          galleryImageUrls: data.galleryImageUrls || [],
          status: data.status || 'published',
          enabledLanguages: data.enabledLanguages || ['zh', 'en'],
          specGroups: data.specGroups || {},
          localizedDetails: data.localizedDetails || { zh: '', en: '' }
        }
      });
      return NextResponse.json(product);
    }
  } catch (error) {
    console.error('Failed to update product:', error);
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
    await db.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
