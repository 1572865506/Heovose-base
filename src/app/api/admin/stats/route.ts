import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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
}
