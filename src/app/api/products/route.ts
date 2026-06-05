import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

function splitSearchQuery(query: string): string[] {
  const terms: string[] = [];
  // 匹配连续的英文字母/数字/小数点，或者中文单字
  const regex = /([a-zA-Z0-9.]+)|([\u4e00-\u9fa5])/g;
  let match;
  while ((match = regex.exec(query)) !== null) {
    if (match[1]) {
      terms.push(match[1]);
    } else if (match[2]) {
      terms.push(match[2]);
    }
  }
  return terms.length > 0 ? terms : [query];
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const lang = searchParams.get('lang');
    const sortBy = searchParams.get('sortBy') || 'updatedAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // 构建 where 条件
    let where: any = {};
    if (status) {
      where.status = status;
    }
    if (lang) {
      where.enabledLanguages = { has: lang };
    }

    // 构建 orderBy
    let orderBy: any = {};
    if (sortBy === 'name') {
      orderBy = { nameTextId: sortOrder };
    } else if (sortBy === 'createdAt') {
      orderBy = { createdAt: sortOrder };
    } else {
      orderBy = { updatedAt: sortOrder };
    }

    // 级联查询分类（包含子分类）
    if (categoryId) {
      const categories = await db.productCategory.findMany();
      const getAllDescendantIds = (parentId: string): string[] => {
        const children = categories.filter((c: any) => c.parentId === parentId);
        let ids = children.map((c: any) => c.id);
        children.forEach((child: any) => {
          ids = [...ids, ...getAllDescendantIds(child.id)];
        });
        return ids;
      };
      const subCategoryIds = [categoryId, ...getAllDescendantIds(categoryId)];
      where.categoryId = { in: subCategoryIds };
    }

    // 模糊检索（后端通过 translation 辅助进行产品搜索）
    if (search) {
      const terms = splitSearchQuery(search);
      // 使用 Prisma 参数化查询替代 $queryRaw，完全防范 SQL 注入风险
      const matchedStrings = await db.localizedString.findMany({
        where: {
          OR: [
            { id: { startsWith: 'prod_' } },
            { id: { startsWith: 'biz_tr_' } }
          ],
          AND: terms.map((term) => ({
            OR: [
              { content: { path: ['zh'], string_contains: term, mode: 'insensitive' } },
              { content: { path: ['en'], string_contains: term, mode: 'insensitive' } },
              { content: { path: ['id'], string_contains: term, mode: 'insensitive' } },
              { content: { path: ['vi'], string_contains: term, mode: 'insensitive' } },
            ]
          }))
        },
        select: {
          id: true
        }
      });
      const matchedIds = matchedStrings.map((item: { id: string }) => item.id);
      
      where.OR = [
        { nameTextId: { in: matchedIds } },
        { descriptionTextId: { in: matchedIds } }
      ];
    }

    // 如果未指定 page，说明是旧版调用，执行不分页的扁平数组查询，保障向下兼容
    if (pageParam === null) {
      // 默认最大限制 2000 条，防范无限制全表扫描，完美向下兼容
      const limit = limitParam ? Math.min(parseInt(limitParam, 10), 2000) : 2000;
      const products = await db.product.findMany({
        where,
        include: {
          nameText: true,
          descriptionText: true,
        },
        take: limit,
        orderBy
      });
      return NextResponse.json(products);
    }

    // 执行分页逻辑
    const page = parseInt(pageParam, 10) || 1;
    // 强制限制分页 limit 最大不超过 2000
    const limit = limitParam ? Math.min(parseInt(limitParam, 10), 2000) : 12;

    const total = await db.product.count({ where });
    const products = await db.product.findMany({
      where,
      include: {
        nameText: true,
        descriptionText: true,
      },
      take: limit,
      skip: (page - 1) * limit,
      orderBy
    });


    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
