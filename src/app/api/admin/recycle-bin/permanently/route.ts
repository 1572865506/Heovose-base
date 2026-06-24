import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { deleteFile } from '@/lib/s3';
import { extractIdsFromProduct, cleanupOrphanedStrings } from '@/lib/db-gc';
import { revalidatePath } from 'next/cache';

// 彻底物理删除资源
export const DELETE = withAuth('editor', async (request) => {
  try {
    const { type, id, ids } = await request.json();

    if (!type || (!id && (!ids || ids.length === 0))) {
      return NextResponse.json({ error: 'Missing type, id or ids' }, { status: 400 });
    }

    const targetIds: string[] = ids || [id];

    if (type === 'product') {
      const existingProducts = await db.product.findMany({
        where: { id: { in: targetIds } }
      });
      if (existingProducts.length === 0) {
        return NextResponse.json({ error: 'Products not found' }, { status: 404 });
      }

      // 收集全部被删除产品的翻译词条
      const allOldIds: string[] = [];
      existingProducts.forEach((prod: any) => {
        const oldIds = extractIdsFromProduct(prod);
        allOldIds.push(...oldIds);
      });

      // 批量物理删除产品记录
      await db.product.deleteMany({
        where: { id: { in: targetIds } }
      });

      // 垃圾回收无主词条
      const uniqueOldIds = Array.from(new Set(allOldIds)).filter(Boolean);
      if (uniqueOldIds.length > 0) {
        await cleanupOrphanedStrings(uniqueOldIds);
      }

      targetIds.forEach((item: string) => revalidatePath(`/products/${item}`));
      revalidatePath('/products');

    } else if (type === 'asset') {
      const assets = await db.galleryAsset.findMany({
        where: { id: { in: targetIds } }
      });
      if (assets.length === 0) {
        return NextResponse.json({ error: 'Assets not found' }, { status: 404 });
      }

      // 物理删除 MinIO/S3 关联文件
      for (const asset of assets) {
        try {
          await deleteFile(asset.fileName);
        } catch (s3Error) {
          console.warn(`[RecycleBin API] S3 file delete failed for ${asset.fileName}, bypassing to allow DB record removal:`, s3Error);
        }
      }

      // 批量物理删除数据库记录
      await db.galleryAsset.deleteMany({
        where: { id: { in: targetIds } }
      });
    } else {
      return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[RecycleBin API] Permanent Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
