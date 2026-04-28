import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    const steps = await db.productionStep.findMany({
      orderBy: {
        order: 'asc',
      },
    });
    return NextResponse.json(steps);
  } catch (error) {
    console.error('Failed to fetch production steps:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
