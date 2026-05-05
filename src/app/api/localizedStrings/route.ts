import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const strings = await db.localizedString.findMany();
    return NextResponse.json(strings);
  } catch (error) {
    console.error('Failed to fetch localized strings:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
