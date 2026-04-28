import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const assets = await db.galleryAsset.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Failed to fetch gallery assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
