import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const item = await db.caseStudy.findUnique({
      where: { id },
    });
    if (!item) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    return NextResponse.json(item);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    const data = await request.json();
    
    // Clean up data for Prisma
    const { id: _, updatedAt: __, ...updateData } = data;

    const item = await db.caseStudy.upsert({
      where: { id },
      update: updateData,
      create: { ...updateData, id },
    });
    return NextResponse.json(item);
  } catch (error) {
    console.error('Failed to update case study:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await params;
    await db.caseStudy.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete case study:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
