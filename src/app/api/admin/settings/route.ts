import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const settings = await db.setting.findMany();
    // Convert to a simple key-value object
    const settingsMap = settings.reduce((acc: any, s: any) => {
      acc[s.id] = s.value;
      return acc;
    }, {});

    return NextResponse.json(settingsMap);
  } catch (error: any) {
    console.error('[API] Settings GET Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { key, value } = body;

    if (!key) return NextResponse.json({ error: 'Key is required' }, { status: 400 });

    const setting = await db.setting.upsert({
      where: { id: key },
      update: { value: String(value) },
      create: { id: key, value: String(value) },
    });

    return NextResponse.json(setting);
  } catch (error: any) {
    console.error('[API] Settings PATCH Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
