import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    // 1. 先查出当前产品
    const product = await db.product.findUnique({
      where: { id: productId },
      include: {
        category: true
      }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. 查出所有的 published 产品（除自己外），并且包含它们的分类信息及名字/描述翻译
    const otherProducts = await db.product.findMany({
      where: {
        id: { not: productId },
        status: 'published'
      },
      include: {
        category: true,
        nameText: true,
        descriptionText: true
      }
    });

    // 3. 按照相似度打分并排序
    const targetParentId = product.category?.parentId;

    const ratedProducts = otherProducts.map((p: any) => {
      let score = 0;
      if (p.categoryId === product.categoryId) {
        score += 100;
      } else if (targetParentId && p.category?.parentId === targetParentId) {
        score += 50;
      }

      const timeDiff = Math.abs(
        new Date(p.createdAt || 0).getTime() - new Date(product.createdAt || 0).getTime()
      );
      const timeScore = 10 / (1 + timeDiff / (1000 * 60 * 60 * 24));
      score += timeScore;

      return {
        id: p.id,
        status: p.status,
        nameTextId: p.nameTextId,
        descriptionTextId: p.descriptionTextId,
        categoryId: p.categoryId,
        createdAt: p.createdAt,
        mainImageUrl: p.mainImageUrl,
        videoUrl: p.videoUrl,
        galleryImageUrls: p.galleryImageUrls,
        nameText: p.nameText,
        descriptionText: p.descriptionText,
        score
      };
    });

    // 4. 排序并截取前 6 个
    const sorted = ratedProducts
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6);

    // 去除 score，返回数据
    const result = sorted.map(({ score, ...rest }: { score: number, [key: string]: any }) => rest);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch related products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
