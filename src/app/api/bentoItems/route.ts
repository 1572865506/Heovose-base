import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { bentoItemSchema } from '@/lib/validations';

export async function GET() {
  try {
    const items = await db.homepageBentoItem.findMany({
      orderBy: { order: 'asc' },
    });

    // 自动为历史和现有 Bento 卡片补齐 LocalizedString 词条
    for (const item of items) {
      const titleId = `bento_item_${item.id}_title`;
      const existingTitle = await db.localizedString.findUnique({ where: { id: titleId } });
      if (!existingTitle) {
        await db.localizedString.create({
          data: {
            id: titleId,
            content: { zh: item.titleZh, en: item.titleEn }
          }
        });
      }
      if (item.tagZh) {
        const tagId = `bento_item_${item.id}_tag`;
        const existingTag = await db.localizedString.findUnique({ where: { id: tagId } });
        if (!existingTag) {
          await db.localizedString.create({
            data: {
              id: tagId,
              content: { zh: item.tagZh, en: item.tagEn }
            }
          });
        }
      }
    }

    return NextResponse.json(items);
  } catch (error) {
    console.error('[API Error] GET bentoItems:', error);
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

  // 创建/更新 LocalizedString 词条
  await db.localizedString.upsert({
    where: { id: `bento_item_${item.id}_title` },
    create: {
      id: `bento_item_${item.id}_title`,
      content: { zh: data.titleZh, en: data.titleEn },
    },
    update: {
      content: { zh: data.titleZh, en: data.titleEn },
    },
  });

  if (data.tagZh) {
    await db.localizedString.upsert({
      where: { id: `bento_item_${item.id}_tag` },
      create: {
        id: `bento_item_${item.id}_tag`,
        content: { zh: data.tagZh, en: data.tagEn },
      },
      update: {
        content: { zh: data.tagZh, en: data.tagEn },
      },
    });
  }

  return NextResponse.json(item);
});
