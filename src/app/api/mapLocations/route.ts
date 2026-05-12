import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const locations = await db.mapLocation.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const location = await db.mapLocation.create({
      data: {
        id: data.id || undefined,
        type: data.type || 'Factory',
        titleZh: data.titleZh || '',
        titleEn: data.titleEn || '',
        addressZh: data.addressZh || '',
        addressEn: data.addressEn || '',
        descZh: data.descZh || '',
        descEn: data.descEn || '',
        titleTextId: data.titleTextId || null,
        addressTextId: data.addressTextId || null,
        descTextId: data.descTextId || null,
        imageUrl: data.imageUrl || null,
        posTop: data.posTop || '50%',
        posLeft: data.posLeft || '50%',
        homepageId: 'map', // Fixed for global map
      },
    });
    return NextResponse.json(location);
  } catch (error: any) {
    console.error('[API] mapLocations POST Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
