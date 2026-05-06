import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.homepageContent.findUnique({
      where: { id },
      include: { locations: true },
    });
    if (!item) return NextResponse.json({});
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    
    // Remove system fields
    const { id: _, locations, updatedAt: ___, ...updateData } = data;

    // Handle locations separately if it's the map document
    if (id === 'map' && locations) {
      await db.$transaction(async (tx: any) => {
        // Update basic fields
        await tx.homepageContent.upsert({
          where: { id },
          update: updateData,
          create: { ...updateData, id },
        });

        // Delete existing locations and recreate them (simpler than syncing)
        await tx.mapLocation.deleteMany({
          where: { homepageId: id },
        });

        if (locations.length > 0) {
          await tx.mapLocation.createMany({
            data: locations.map((loc: any) => ({
              id: loc.id || undefined,
              type: loc.type,
              titleZh: loc.titleZh,
              titleEn: loc.titleEn,
              addressZh: loc.addressZh,
              addressEn: loc.addressEn,
              descZh: loc.descZh,
              descEn: loc.descEn,
              imageUrl: loc.imageUrl,
              posTop: loc.posTop,
              posLeft: loc.posLeft,
              homepageId: id,
            })),
          });
        }
      });
      
      const updatedItem = await db.homepageContent.findUnique({
        where: { id },
        include: { locations: true },
      });
      return NextResponse.json(updatedItem);
    }

    // 增强防御性：只允许模型中定义的字段进入 Prisma
    const allowedFields = [
      'heroHeadlineEn', 'heroHeadlineZh', 'heroSubheadlineEn', 'heroSubheadlineZh',
      'heroWholesaleButtonEn', 'heroWholesaleButtonZh', 'heroProjectButtonEn', 'heroProjectButtonZh',
      'heroWholesaleCategoryId', 'heroProjectCategoryId', 'heroSlides',
      'heroWholesaleDescriptionEn', 'heroWholesaleDescriptionZh',
      'heroProjectDescriptionEn', 'heroProjectDescriptionZh',
      'heroWholesaleBg', 'heroProjectBg', 'isVideoEnabled',
      'videoTitleEn', 'videoTitleZh', 'videoSubtitleEn', 'videoSubtitleZh', 'videoUrl',
      'bentoTitleEn', 'bentoTitleZh', 'bentoSubtitleEn', 'bentoSubtitleZh',
      'mapTitleEn', 'mapTitleZh', 'mapSubtitleEn', 'mapSubtitleZh'
    ];

    const filteredData: any = {};
    allowedFields.forEach(field => {
      const val = updateData[field];
      if (val !== undefined) {
        // 类型清洗逻辑
        if (field === 'isVideoEnabled') {
          filteredData[field] = Boolean(val);
        } else if (field === 'heroSlides') {
          // 确保是数组且不为 null
          filteredData[field] = Array.isArray(val) ? val : [];
        } else if (typeof val === 'string' && val.trim() === '') {
          // 将空字符串转为 null，避免 Prisma 验证问题
          filteredData[field] = null;
        } else {
          filteredData[field] = val;
        }
      }
    });

    const item = await db.homepageContent.upsert({
      where: { id },
      update: filteredData,
      create: { ...filteredData, id },
    });
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('CRITICAL ERROR: Failed to update homepage content:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message 
    }, { status: 500 });
  }
}
