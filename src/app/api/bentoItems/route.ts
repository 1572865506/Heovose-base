import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const items = await db.homepageBentoItem.findMany({
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(items);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const data = await request.json();
    const item = await db.homepageBentoItem.create({
      data: {
        titleZh: data.titleZh,
        titleEn: data.titleEn,
        tagZh: data.tagZh,
        tagEn: data.tagEn,
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl,
        gridSize: data.gridSize || 'small',
        order: data.order || 0,
      },
    });
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
