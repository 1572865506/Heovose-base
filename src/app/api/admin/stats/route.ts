import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';

export const GET = withAuth('editor', async (request) => {
  try {
    const [productsCount, categoriesCount, usersCount, recentProducts] = await Promise.all([
      db.product.count(),
      db.productCategory.count(),
      db.user.count(),
      db.product.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          nameText: true,
          category: true,
        }
      })
    ]);

    return NextResponse.json({
      stats: {
        products: productsCount,
        categories: categoriesCount,
        users: usersCount,
      },
      recentProducts
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
