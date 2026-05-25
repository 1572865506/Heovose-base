import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET() {
  try {
    const templates = await db.specTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(templates);
  } catch (error) {
    console.error('Failed to fetch spec templates:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const template = await db.specTemplate.create({
      data: {
        name: body.name,
        specGroups: body.specGroups,
      },
    });
    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to create spec template:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
