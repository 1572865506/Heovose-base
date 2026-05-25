import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');

    let where: any = {};
    if (parentId) {
      where.OR = [
        { id: parentId },
        { parentId: parentId }
      ];
    }

    const categories = await db.productCategory.findMany({
      where,
      include: {
        nameText: true,
        descriptionText: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
