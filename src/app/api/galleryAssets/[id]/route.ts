import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { deleteFile } from '@/lib/s3';
import { galleryAssetSchema } from '@/lib/validations';

export const PUT = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const { id } = await params;
    const data = await request.json();
    
    // Zod validation
    const validation = galleryAssetSchema.safeParse(data);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const updateData = validation.data;

    console.log(`[GalleryAPI] Upserting asset ${id}:`, updateData);
    const item = await db.galleryAsset.upsert({
      where: { id },
      update: updateData,
      create: { ...updateData, id },
    });
    console.log(`[GalleryAPI] Successfully upserted asset ${id}`);
    return NextResponse.json(item);
  } catch (error: any) {
    console.error('Failed to update gallery asset:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
    }, { status: 500 });
  }
});

export const DELETE = withAuth('editor', async (
  request: Request,
  { params }: { params: Promise<{ id: string }> },
  user
) => {
  try {
    const { id } = await params;
    
    // 1. 获取待删除素材的信息（核心是 URL）
    const asset = await db.galleryAsset.findUnique({ where: { id } });
    if (!asset) {
      return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
    }

    // 2. 检查是否有未删除的产品正在引用该素材的 URL (无论是主图还是画廊组图)
    const referencingProducts = await db.product.findMany({
      where: {
        deletedAt: null,
        OR: [
          { mainImageUrl: asset.url },
          { galleryImageUrls: { has: asset.url } }
        ]
      },
      include: {
        nameText: true
      }
    });

    // 检查分类引用 (thumbnailImageUrl)
    const referencingCategories = await db.productCategory.findMany({
      where: {
        thumbnailImageUrl: asset.url
      },
      include: {
        nameText: true
      }
    });

    // 检查案例引用 (imageUrl)
    const referencingCases = await db.caseStudy.findMany({
      where: {
        imageUrl: asset.url
      }
    });

    // 检查生产步骤引用 (imageUrls)
    const referencingSteps = await db.productionStep.findMany({
      where: {
        imageUrls: { has: asset.url }
      }
    });

    // 检查 Bento 板块引用 (imageUrl)
    const referencingBento = await db.homepageBentoItem.findMany({
      where: {
        imageUrl: asset.url
      }
    });

    // 检查地图标记引用 (imageUrl)
    const referencingMap = await db.mapLocation.findMany({
      where: {
        imageUrl: asset.url
      }
    });

    // 检查首页全局配置引用 (heroSlides 幻灯片、视频封面、板块背景等)
    const homepageContent = await db.homepageContent.findMany();
    const homepageReferences: string[] = [];
    for (const hc of homepageContent) {
      if (hc.heroProjectBg === asset.url) homepageReferences.push('首页“专属项目”背景图');
      if (hc.heroWholesaleBg === asset.url) homepageReferences.push('首页“现货批发”背景图');
      if (hc.videoUrl === asset.url) homepageReferences.push('首页视频/动效资源');
      
      // 解析 slides 幻灯片 JSON
      if (hc.heroSlides) {
        try {
          const slides = typeof hc.heroSlides === 'string' ? JSON.parse(hc.heroSlides) : hc.heroSlides;
          if (Array.isArray(slides)) {
            const hasSlide = slides.some((slide: any) => slide.imageUrl === asset.url || slide.videoUrl === asset.url);
            if (hasSlide) homepageReferences.push('首页大图轮播幻灯片 (Slides)');
          }
        } catch (_) {}
      }
    }

    const referenceWarnings: string[] = [];

    if (referencingProducts.length > 0) {
      const names = referencingProducts.map((p: any) => {
        const content = p.nameText?.content;
        if (content) {
          if (typeof content === 'object') return content.zh || content.en || p.id;
          try {
            const parsed = JSON.parse(content);
            return parsed.zh || parsed.en || p.id;
          } catch (_) {}
        }
        return p.nameText?.zh || p.nameText?.en || p.id;
      });
      referenceWarnings.push(`产品列表：${names.join('、')}`);
    }

    if (referencingCategories.length > 0) {
      const names = referencingCategories.map((c: any) => {
        const content = c.nameText?.content;
        if (content) {
          if (typeof content === 'object') return content.zh || content.en || c.id;
          try {
            const parsed = JSON.parse(content);
            return parsed.zh || parsed.en || c.id;
          } catch (_) {}
        }
        return c.nameText?.zh || c.nameText?.en || c.id;
      });
      referenceWarnings.push(`产品分类：${names.join('、')}`);
    }

    if (referencingCases.length > 0) {
      const names = referencingCases.map((c: any) => c.titleZh || c.titleEn || c.id);
      referenceWarnings.push(`首页案例展示：${names.join('、')}`);
    }

    if (referencingSteps.length > 0) {
      const names = referencingSteps.map((s: any) => s.titleZh || s.titleEn || s.id);
      referenceWarnings.push(`生产步骤/技术流程：${names.join('、')}`);
    }

    if (referencingBento.length > 0) {
      const names = referencingBento.map((b: any) => b.titleZh || b.titleEn || b.id);
      referenceWarnings.push(`首页 Bento 格子板块：${names.join('、')}`);
    }

    if (referencingMap.length > 0) {
      const names = referencingMap.map((m: any) => m.titleZh || m.titleEn || m.id);
      referenceWarnings.push(`全球案例地图标记：${names.join('、')}`);
    }

    if (homepageReferences.length > 0) {
      referenceWarnings.push(`页面基础配置：${homepageReferences.join('、')}`);
    }

    if (referenceWarnings.length > 0) {
      return NextResponse.json({
        error: 'REFERENCED_BY_COMPONENTS',
        message: `无法删除素材！该素材目前正被以下页面板块或卡片引用，请先在对应的后台配置中移除此素材的占用：\n\n` + 
          referenceWarnings.map(w => `• ${w}`).join('\n')
      }, { status: 400 });
    }

    // 3. 逻辑软删除：仅在数据库中标记 deletedAt 时间及操作人，不在 S3/MinIO 中物理删除文件
    await db.galleryAsset.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: user.email
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Soft-delete asset error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});
