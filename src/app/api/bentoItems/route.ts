import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { bentoItemSchema } from '@/lib/validations';

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

export const POST = withAuth('editor', async (request: Request) => {
  const body = await request.json();
  const validation = bentoItemSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
  }

  const data = validation.data;
  let brightness = data.brightness;

  if (brightness === undefined || brightness === null) {
    try {
      const { calculateImageBrightness } = await import('@/lib/server/image-analysis');
      brightness = await calculateImageBrightness(data.imageUrl);
    } catch (err) {
      console.error('Failed to auto-calculate bento item brightness:', err);
    }
  }

  const item = await db.homepageBentoItem.create({
    data: {
      titleZh: data.titleZh,
      titleEn: data.titleEn,
      tagZh: data.tagZh,
      tagEn: data.tagEn,
      imageUrl: data.imageUrl,
      linkUrl: data.linkUrl,
      gridSize: data.gridSize,
      order: data.order,
      brightness: brightness,
    },
  });

  return NextResponse.json(item);
});
