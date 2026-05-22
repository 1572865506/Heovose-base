import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { extractIdsFromProduct, cleanupOrphanedStrings } from '@/lib/db-gc';

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
      // 乐观并发控制校验
      if (!data.updatedAt) {
        return NextResponse.json(
          { error: 'version_conflict', message: '未提供版本时间戳，无法进行安全更新' },
          { status: 409 }
        );
      }

      const existingTime = new Date(existingProduct.updatedAt).getTime();
      const clientTime = new Date(data.updatedAt).getTime();

      if (existingTime !== clientTime) {
        return NextResponse.json(
          { error: 'version_conflict', message: '该产品已被其他人修改，请备份您的编辑内容并刷新页面后再试' },
          { status: 409 }
        );
      }

      // 提取更新前关联的词条 ID
      const oldIds = extractIdsFromProduct(existingProduct);

      // Partial update
      const product = await db.product.update({
        where: { id },
        data: {
          nameTextId: (data.nameTextId && data.nameTextId.trim() !== '') ? data.nameTextId : existingProduct.nameTextId,
          descriptionTextId: (data.descriptionTextId && data.descriptionTextId.trim() !== '') ? data.descriptionTextId : null,
          categoryId: data.categoryId,
          mainImageUrl: data.mainImageUrl,
          videoUrl: data.videoUrl,
          galleryImageUrls: data.galleryImageUrls,
          status: data.status,
          enabledLanguages: data.enabledLanguages,
          specGroups: data.specGroups,
          localizedDetails: data.localizedDetails,
          advantageTextIds: Array.isArray(data.advantageTextIds) ? data.advantageTextIds : existingProduct.advantageTextIds,
          galleryImageBrightnesses: Array.isArray(data.galleryImageBrightnesses) ? data.galleryImageBrightnesses : existingProduct.galleryImageBrightnesses,
          mainImageBrightness: data.mainImageBrightness !== undefined ? data.mainImageBrightness : existingProduct.mainImageBrightness
        }
      });

      // 提取更新后关联的词条 ID，并找出被释放的 ID 集合
      const newIds = extractIdsFromProduct(product);
      const releasedIds = oldIds.filter(oid => oid && !newIds.includes(oid));

      // 执行异步/后台垃圾回收清理
      if (releasedIds.length > 0) {
        await cleanupOrphanedStrings(releasedIds);
      }

      return NextResponse.json(product);
    } else {
      // Full create
      const product = await db.product.create({
        data: {
          id,
          nameTextId: (data.nameTextId && data.nameTextId.trim() !== '') ? data.nameTextId : `prod_name_${id}`,
          descriptionTextId: (data.descriptionTextId && data.descriptionTextId.trim() !== '') ? data.descriptionTextId : null,
          categoryId: data.categoryId,
          mainImageUrl: data.mainImageUrl,
          videoUrl: data.videoUrl,
          galleryImageUrls: data.galleryImageUrls || [],
          status: data.status || 'published',
          enabledLanguages: data.enabledLanguages || ['zh', 'en'],
          specGroups: data.specGroups || {},
          localizedDetails: data.localizedDetails || { zh: '', en: '' },
          advantageTextIds: Array.isArray(data.advantageTextIds) ? data.advantageTextIds : [],
          galleryImageBrightnesses: Array.isArray(data.galleryImageBrightnesses) ? data.galleryImageBrightnesses : [],
          mainImageBrightness: data.mainImageBrightness !== undefined ? data.mainImageBrightness : null
        }
      });
      return NextResponse.json(product);
    }
  } catch (error: any) {
    console.error('Failed to update product:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
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

    // 查找待删除产品并提取关联翻译 IDs
    const existingProduct = await db.product.findUnique({ where: { id } });
    const oldIds = existingProduct ? extractIdsFromProduct(existingProduct) : [];

    await db.product.delete({ where: { id } });

    // 删除产品后，释放所有原本关联的词条 ID 引用，并执行垃圾回收
    if (oldIds.length > 0) {
      await cleanupOrphanedStrings(oldIds);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete product:', error);
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}



