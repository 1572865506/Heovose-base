import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { getLocalizedStringRefCount } from '@/lib/db-gc';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    let item = await db.localizedString.findUnique({
      where: { id },
    });

    if (!item) {
      const isSystemUiKey = id.startsWith('SYS_') || id.startsWith('navbar_');
      if (isSystemUiKey) {
        item = await db.localizedString.create({
          data: {
            id,
            content: {}
          }
        });
      } else {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
    }

    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', message: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const p = await params;
    const id = p.id;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const data = await request.json();
    
    // 如果没有指定 forceGlobalUpdate，且引用数 > 1，返回警告
    if (!data.forceGlobalUpdate) {
      const refCount = await getLocalizedStringRefCount(id);
      if (refCount > 1) {
        return NextResponse.json({
          warning: 'MULTIPLE_REFERENCES',
          refCount,
          message: `该词条当前被多处引用（共 ${refCount} 处），直接修改将同步修改所有引用项，是否确认修改？`
        });
      }
    }

    // 获取现有内容以备合并
    const existingEntry = await db.localizedString.findUnique({ where: { id } });
    const existingContent = (existingEntry?.content as any) || {};
    
    const incomingContent = data.content || (() => {
      const { id: _, forceGlobalUpdate: __, ...rest } = data;
      return rest;
    })();

    const contentToSave = {
      ...existingContent,
      ...incomingContent
    };

    const item = await db.localizedString.upsert({
      where: { id },
      update: {
        content: contentToSave
      },
      create: {
        id,
        content: contentToSave
      },
    });
    
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('[API Error] LocalizedString PUT:', error);
    return NextResponse.json({ 
      error: 'CRITICAL_DATABASE_ERROR', 
      message: error.message || 'Unknown database error'
    }, { status: 500 });
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
    await db.localizedString.delete({
      where: { id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

