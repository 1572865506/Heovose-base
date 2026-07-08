import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { getLocalizedStringRefCount } from '@/lib/db-gc';
import { calculateHash, getSourceText } from '@/lib/translation-sync';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const session = await auth();

    let item: any = await db.localizedString.findUnique({
      where: { id },
    });

    if (!item) {
      const isSystemUiKey = id.startsWith('SYS_') || id.startsWith('navbar_');
      if (isSystemUiKey) {
        if (session) {
          // Only authenticated users (admins) can trigger database-level auto-registration
          item = await db.localizedString.create({
            data: {
              id,
              content: {}
            }
          });
        } else {
          // For unauthenticated visitors, return a virtual in-memory record without modifying the DB
          item = {
            id,
            content: {},
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }
      } else {
        return NextResponse.json({ error: 'Not Found' }, { status: 404 });
      }
    }

    return NextResponse.json(item);
  } catch (error: any) {
    console.error('[API Error] LocalizedString GET:', error);
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

    console.log('[API Debug] PUT localizedString:', {
      id,
      dataContent: data.content,
      incomingContent,
      existingContent
    });

    const contentToSave = {
      ...existingContent,
      ...incomingContent
    };

    console.log('[API Debug] contentToSave:', contentToSave);

    // 引入哈希计算工具
    const newSourceText = getSourceText(contentToSave);
    const newSourceHash = calculateHash(newSourceText);

    // 更新各语种的翻译哈希追踪字典
    const newTranslatedHashes = {
      ...((existingEntry?.translatedHashes as Record<string, string>) || {})
    };

    // 凡是在当前请求（incomingContent）中提供并修改了的非空语种，都更新其哈希为最新的源文哈希
    Object.keys(incomingContent).forEach((lang) => {
      const val = incomingContent[lang];
      if (val && String(val).trim()) {
        newTranslatedHashes[lang] = newSourceHash;
      } else {
        delete newTranslatedHashes[lang];
      }
    });

    // 默认源语言本身处于已同步状态
    newTranslatedHashes['zh'] = newSourceHash;

    console.log('[API Debug] Saving hashes:', {
      newSourceHash,
      newTranslatedHashes
    });

    const item = await db.localizedString.upsert({
      where: { id },
      update: {
        content: contentToSave,
        sourceHash: newSourceHash,
        translatedHashes: newTranslatedHashes
      },
      create: {
        id,
        content: contentToSave,
        sourceHash: newSourceHash,
        translatedHashes: newTranslatedHashes
      },
    });
    
    return NextResponse.json({ success: true, item });
  } catch (error: any) {
    console.error('[API Error] LocalizedString PUT:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
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

