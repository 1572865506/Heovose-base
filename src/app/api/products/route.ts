import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100'); // Increased default limit for admin

    const products = await db.product.findMany({
      where: status ? { status } : {},
      take: limit,
      orderBy: { updatedAt: 'desc' } // Recently edited products appear at the top
    });
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
