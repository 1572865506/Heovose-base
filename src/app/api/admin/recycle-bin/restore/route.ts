import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { revalidatePath } from 'next/cache';

// 恢复软删除资源
export const POST = withAuth('editor', async (request) => {
  try {
    const { type, id, ids } = await request.json();

    if (!type || (!id && (!ids || ids.length === 0))) {
      return NextResponse.json({ error: 'Missing type, id or ids' }, { status: 400 });
    }

    const targetIds: string[] = ids || [id];

    if (type === 'product') {
      await db.product.updateMany({
        where: { id: { in: targetIds } },
        data: {
          deletedAt: null,
          status: 'draft'
        }
      });
      targetIds.forEach((item: string) => revalidatePath(`/products/${item}`));
      revalidatePath('/products');
    } else if (type === 'asset') {
      await db.galleryAsset.updateMany({
        where: { id: { in: targetIds } },
        data: {
          deletedAt: null
        }
      });
    } else {
      return NextResponse.json({ error: 'Invalid resource type' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[RecycleBin API] Restore Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
