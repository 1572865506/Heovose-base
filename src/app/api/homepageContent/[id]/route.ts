import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
 
export const dynamic = 'force-dynamic';

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

  let filteredData: any = {};
  try {
    const { id } = await params;
    const data = await request.json();
    console.log(`[API] Received PUT for homepageContent ID: ${id}`);
    
    // Remove system fields
    const { id: _, locations, updatedAt: ___, ...updateData } = data;

    // Handle locations separately if it's the map document
    if (id === 'map' && locations) {
      try {
        console.log('[API] Starting Map Transaction...');
        await db.$transaction(async (tx: any) => {
          // Update basic fields
          await tx.homepageContent.upsert({
            where: { id },
            update: updateData,
            create: { ...updateData, id },
          });
          console.log('[API] HomepageContent Upserted');

          // Delete existing locations and recreate them
          await tx.mapLocation.deleteMany({
            where: { homepageId: id },
          });
          console.log('[API] Locations Deleted');

          if (locations.length > 0) {
            await tx.mapLocation.createMany({
              data: locations.map((loc: any) => ({
                id: (loc.id && loc.id.startsWith('loc_')) ? loc.id : undefined,
                type: loc.type || 'Factory',
                titleZh: loc.titleZh || '',
                titleEn: loc.titleEn || '',
                addressZh: loc.addressZh || '',
                addressEn: loc.addressEn || '',
                descZh: loc.descZh || '',
                descEn: loc.descEn || '',
                titleTextId: loc.titleTextId || null,
                addressTextId: loc.addressTextId || null,
                descTextId: loc.descTextId || null,
                imageUrl: loc.imageUrl || null,
                posTop: loc.posTop || '50%',
                posLeft: loc.posLeft || '50%',
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
      } catch (txError: any) {
        console.error('[API] Map Transaction Failed:', txError);
        // 如果事务失败，尝试进入下方的通用流程（可能部分字段能存进去）
      }
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
      'processTitleEn', 'processTitleZh', 'processSubtitleEn', 'processSubtitleZh',
      'galleryTitleEn', 'galleryTitleZh', 'gallerySubtitleEn', 'gallerySubtitleZh', 'galleryItems',
      'mapTitleEn', 'mapTitleZh', 'mapSubtitleEn', 'mapSubtitleZh',
      'mapTitleTextId', 'mapSubtitleTextId',
      'casesTitleEn', 'casesTitleZh', 'casesSubtitleEn', 'casesSubtitleZh',
      'casesTitleTextId', 'casesSubtitleTextId',
      'processTitleTextId', 'processSubtitleTextId'
    ];

    filteredData = {};
    allowedFields.forEach(field => {
      const val = updateData[field];
      if (val !== undefined) {
        // 类型清洗逻辑
        if (field === 'isVideoEnabled') {
          filteredData[field] = Boolean(val);
        } else if (field === 'heroSlides' || field === 'galleryItems') {
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

    // 调试日志：查看即将进入数据库的数据
    // console.log(`[DEBUG] Upserting to ${id}:`, JSON.stringify(filteredData, null, 2));

    try {
      const item = await db.homepageContent.upsert({
        where: { id },
        update: filteredData,
        create: { ...filteredData, id },
      });
      return NextResponse.json(item);
    } catch (upsertError: any) {
      console.error('[API DEBUG] Upsert Error:', upsertError.message);
      
      // 捕获字段未同步的错误 (通常发生在 Next.js Turbopack 缓存了旧版 Prisma Client 时)
      if (upsertError.message.includes('Unknown argument')) {
        console.warn('[API] Stale Prisma Client detected. Using Raw SQL fallback for localization fields...');
        
        // 1. 尝试使用原始 SQL 强行写入新字段，绕过 Prisma 的类型检查
        const { 
          casesTitleTextId, casesSubtitleTextId, 
          processTitleTextId, processSubtitleTextId,
          mapTitleTextId, mapSubtitleTextId,
          ...safeData 
        } = filteredData;
        
        try {
          if (casesTitleTextId || casesSubtitleTextId) {
            await db.$executeRawUnsafe(
              `UPDATE "HomepageContent" SET "casesTitleTextId" = $1, "casesSubtitleTextId" = $2 WHERE id = $3`,
              casesTitleTextId || 'CASES_TITLE',
              casesSubtitleTextId || 'CASES_SUBTITLE',
              id
            );
          }
          if (processTitleTextId || processSubtitleTextId) {
            await db.$executeRawUnsafe(
              `UPDATE "HomepageContent" SET "processTitleTextId" = $1, "processSubtitleTextId" = $2 WHERE id = $3`,
              processTitleTextId || 'PROCESS_TITLE',
              processSubtitleTextId || 'PROCESS_SUBTITLE',
              id
            );
          }
          if (mapTitleTextId || mapSubtitleTextId) {
            await db.$executeRawUnsafe(
              `UPDATE "HomepageContent" SET "mapTitleTextId" = $1, "mapSubtitleTextId" = $2 WHERE id = $3`,
              mapTitleTextId || 'MAP_TITLE',
              mapSubtitleTextId || 'MAP_SUBTITLE',
              id
            );
          }
        } catch (rawError) {
          console.error('[API] Raw SQL Fallback failed:', rawError);
        }

        // 2. 移除导致报错的新字段，使用“安全”字段执行正常的 upsert
        const safeItem = await db.homepageContent.upsert({
          where: { id },
          update: safeData,
          create: { ...safeData, id },
        });
        
        return NextResponse.json(safeItem);
      }
      
      // 如果不是字段同步问题，则抛出原错误
      throw upsertError;
    }
  } catch (error: any) {
    console.error('CRITICAL ERROR: Failed to update homepage content:', error);
    // 返回更详尽的错误信息到前端，方便排查
    return NextResponse.json({ 
      error: 'DATABASE_UPSERT_FAILED', 
      details: error.message,
      code: error.code,
      meta: error.meta,
      targetFields: Object.keys(filteredData)
    }, { status: 500 });
  }
}
