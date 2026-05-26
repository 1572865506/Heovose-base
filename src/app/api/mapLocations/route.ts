import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Use raw query to ensure countryCode is fetched even if Prisma client is stuck
    const locations = await db.$queryRaw`SELECT * FROM "MapLocation" ORDER BY "order" ASC`;
    return NextResponse.json(locations);
  } catch (error) {
    console.error('[API] mapLocations GET Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    
    // Get the highest order to append
    const lastLocation = await db.mapLocation.findFirst({
      orderBy: { order: 'desc' }
    });
    const nextOrder = (lastLocation?.order ?? -1) + 1;

    const createData = {
      id: data.id || undefined,
      order: nextOrder,
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
      countryCode: data.countryCode || 'cn',
      posTop: data.posTop || '50%',
      posLeft: data.posLeft || '50%',
      homepageId: 'map', // Ensure this matches an existing HomepageContent ID
    };

    const { countryCode, ...restData } = createData;

    const location = await db.mapLocation.create({
      data: restData,
    });

    // Manually update countryCode using raw SQL to bypass Prisma validation issues
    if (countryCode) {
      console.log('[API] Setting countryCode via raw SQL for new record:', location.id, '->', countryCode);
      await db.$executeRaw`UPDATE "MapLocation" SET "countryCode" = ${countryCode} WHERE id = ${location.id}`;
    }

    // Fetch the final state from DB to ensure response is accurate
    const finalLocation = await db.mapLocation.findUnique({ where: { id: location.id } });

    return NextResponse.json(finalLocation);
  } catch (error: any) {
    console.error('[API] mapLocations POST Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
