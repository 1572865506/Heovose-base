import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

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
      const rawSearch = '%' + search.toLowerCase() + '%';
      // 用 $queryRaw 针对 PostgreSQL 执行模糊检索
      const matchedStrings: any[] = await db.$queryRaw`
        SELECT id FROM "LocalizedString" 
        WHERE (id LIKE 'prod_%' OR id LIKE 'biz_tr_%') 
        AND LOWER(content::text) LIKE ${rawSearch};
      `;
      const matchedIds = matchedStrings.map(item => item.id);
      
      where.OR = [
        { nameTextId: { in: matchedIds } },
        { descriptionTextId: { in: matchedIds } }
      ];
    }

    // 如果未指定 page，说明是旧版调用，执行不分页的扁平数组查询，保障向下兼容
    if (pageParam === null) {
      const limit = limitParam ? parseInt(limitParam) : undefined;
      const products = await db.product.findMany({
        where,
        include: {
          nameText: true,
          descriptionText: true,
        },
        ...(limit !== undefined ? { take: limit } : {}),
        orderBy
      });
      return NextResponse.json(products);
    }

    // 执行分页逻辑
    const page = parseInt(pageParam) || 1;
    const limit = limitParam ? parseInt(limitParam) : 12;

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
