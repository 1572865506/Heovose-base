import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { caseStudySchema } from '@/lib/validations';

export const PUT = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const body = await request.json();

    const validation = caseStudySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const data = validation.data;
    let brightness = data.brightness;

    // Auto calculate image brightness if needed
    if (brightness === undefined || brightness === null) {
      try {
        const { calculateImageBrightness } = await import('@/lib/server/image-analysis');
        brightness = await calculateImageBrightness(data.imageUrl);
      } catch (err) {
        console.error('Failed to auto-calculate case study brightness:', err);
      }
    }

    const item = await db.caseStudy.upsert({
      where: { id },
      update: {
        tagZh: data.tagZh,
        tagEn: data.tagEn,
        titleZh: data.titleZh,
        titleEn: data.titleEn,
        descZh: data.descZh,
        descEn: data.descEn,
        imageUrl: data.imageUrl,
        order: data.order,
        published: data.published,
        descriptionTextId: data.descriptionTextId,
        tagTextId: data.tagTextId,
        titleTextId: data.titleTextId,
        brightness: brightness,
      },
      create: {
        id,
        tagZh: data.tagZh,
        tagEn: data.tagEn,
        titleZh: data.titleZh,
        titleEn: data.titleEn,
        descZh: data.descZh,
        descEn: data.descEn,
        imageUrl: data.imageUrl,
        order: data.order,
        published: data.published,
        descriptionTextId: data.descriptionTextId,
        tagTextId: data.tagTextId,
        titleTextId: data.titleTextId,
        brightness: brightness,
      },
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Failed to update case study:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

export const DELETE = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    
    // First find the case study to clean up localized strings
    const item = await db.caseStudy.findUnique({
      where: { id }
    });

    await db.caseStudy.delete({
      where: { id },
    });

    // Clean up associated translation assets in localizedStrings table
    if (item) {
      const idsToDelete = [item.titleTextId, item.descriptionTextId, item.tagTextId].filter(Boolean) as string[];
      if (idsToDelete.length > 0) {
        await db.localizedString.deleteMany({
          where: { id: { in: idsToDelete } }
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete case study:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
