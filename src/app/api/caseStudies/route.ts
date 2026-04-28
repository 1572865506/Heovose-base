import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const cases = await db.caseStudy.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return NextResponse.json(cases);
  } catch (error) {
    console.error('Failed to fetch case studies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
