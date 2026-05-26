import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { bentoItemSchema } from '@/lib/validations';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.homepageBentoItem.findUnique({
      where: { id },
    });
    if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const PUT = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();
    const validation = bentoItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const data = validation.data;
    let brightness = data.brightness;

    const existing = await db.homepageBentoItem.findUnique({
      where: { id },
    });

    if (brightness === undefined || brightness === null) {
      if (existing && existing.imageUrl === data.imageUrl) {
        brightness = existing.brightness;
      } else {
        try {
          const { calculateImageBrightness } = await import('@/lib/server/image-analysis');
          brightness = await calculateImageBrightness(data.imageUrl);
        } catch (err) {
          console.error('Failed to auto-calculate bento item brightness:', err);
        }
      }
    }

    const item = await db.homepageBentoItem.update({
      where: { id },
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
  } catch (error: any) {
    console.error('Failed to update bento item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    await db.homepageBentoItem.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete bento item:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
