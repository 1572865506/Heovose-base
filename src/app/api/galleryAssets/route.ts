import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pageStr = searchParams.get('page');
    const limitStr = searchParams.get('limit');

    const queryOptions: any = {
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    };

    if (pageStr && limitStr) {
      const page = parseInt(pageStr, 10);
      const limit = parseInt(limitStr, 10);
      if (!isNaN(page) && !isNaN(limit) && page > 0 && limit > 0) {
        queryOptions.skip = (page - 1) * limit;
        queryOptions.take = limit;
      }
    } else {
      // 默认在无分页参数时，限制最多取 2000 条数据以防御内存突损，同时兼容老接口
      queryOptions.take = 2000;
    }

    const assets = await db.galleryAsset.findMany(queryOptions);
    return NextResponse.json(assets);
  } catch (error) {
    console.error('Failed to fetch gallery assets:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

