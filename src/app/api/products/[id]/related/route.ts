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
      
      // A. 分类关联打分
      if (p.categoryId === product.categoryId) {
        score += 100;
      } else if (targetParentId && p.category?.parentId === targetParentId) {
        score += 50;
      }

      // B. 特征优势 (Features/Tags) 交集重合度打分
      const pAdv = p.advantageTextIds || [];
      const tAdv = product.advantageTextIds || [];
      const sharedAdv = pAdv.filter((id: string) => tAdv.includes(id));
      score += sharedAdv.length * 20; // 每个相同优势特征加 20 分

      // C. 标题词汇关联度打分 (Name Text similarity)
      const pName = p.nameText?.zh || p.nameText?.en || '';
      const tName = product.nameText?.zh || product.nameText?.en || '';
      if (pName && tName) {
        let matchedChars = 0;
        const setT = new Set(tName.split(''));
        for (const char of pName.split('')) {
          if (setT.has(char) && char.trim()) matchedChars++;
        }
        score += Math.min(matchedChars * 2, 30); // 字符重叠最高加 30 分
      }

      // D. 时间相近度打分（以月为单位做平滑衰减，防止过于久远的产品过度推荐）
      const timeDiff = Math.abs(
        new Date(p.createdAt || 0).getTime() - new Date(product.createdAt || 0).getTime()
      );
      const timeScore = 15 / (1 + timeDiff / (1000 * 60 * 60 * 24 * 30)); // 30天平滑，最高 15 分
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
