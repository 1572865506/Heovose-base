import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request: Request) {
  console.log('[API] GET /api/caseStudies called');
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';

    // Check if we should force fallback or try prisma
    try {
      // We use a dummy where clause with 'published' to force a validation error if the client is stale
      const cases = await db.caseStudy.findMany({
        where: all ? { id: { not: '' }, published: { in: [true, false] } } : { published: true },
        orderBy: {
          order: 'asc',
        },
      });
      return NextResponse.json(cases);
    } catch (prismaError: any) {
      console.warn('[API] Prisma error or stale client. Falling back to raw SQL...');
      const rawCases = await db.$queryRawUnsafe(
        `SELECT * FROM "CaseStudy" ${all ? '' : 'WHERE published = true'} ORDER BY "order" ASC`
      );
      return NextResponse.json(rawCases);
    }
  } catch (error: any) {
    console.error('CRITICAL: Failed to fetch case studies:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}
