import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';

// 获取所有已被软删除的资源 (仅后台管理员可用)
export const GET = withAuth('editor', async (request) => {
  try {
    const [deletedProducts, deletedAssets] = await Promise.all([
      db.product.findMany({
        where: {
          deletedAt: { not: null }
        },
        include: {
          nameText: true,
          category: true,
        },
        orderBy: {
          deletedAt: 'desc'
        }
      }),
      db.galleryAsset.findMany({
        where: {
          deletedAt: { not: null }
        },
        include: {
          category: true
        },
        orderBy: {
          deletedAt: 'desc'
        }
      })
    ]);

    return NextResponse.json({
      products: deletedProducts,
      assets: deletedAssets
    });
  } catch (error: any) {
    console.error('[RecycleBin API] GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
