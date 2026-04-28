import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
