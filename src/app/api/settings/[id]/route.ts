import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { auth } from '@/auth';
import { prepareSettingDataForGet, verifyAndIncrementVersion } from '@/lib/settings-occ';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;

    const item = await db.setting.findUnique({
      where: { id },
    });
    if (!item) return NextResponse.json({});
    
    const prepared = prepareSettingDataForGet(item.value);
    return NextResponse.json(prepared);
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

    const currentItem = await db.setting.findUnique({
      where: { id },
    });

    const occResult = verifyAndIncrementVersion(
      currentItem ? currentItem.value : null,
      data
    );

    if (occResult.hasConflict) {
      return NextResponse.json(
        {
          error: 'version_conflict',
          message: '配置已被他人修改，请刷新页面加载最新数据后再重试。',
          currentVersion: occResult.currentVersion
        },
        { status: 409 }
      );
    }

    const nextData = occResult.nextData;

    const item = await db.setting.upsert({
      where: { id },
      update: { value: JSON.stringify(nextData) },
      create: { id, value: JSON.stringify(nextData) },
    });
    
    // 返回解析后的数据，使得前端可以获得最新的 _version，无需重新 fetch
    return NextResponse.json(prepareSettingDataForGet(item.value));
  } catch (error) {
    console.error('Failed to update setting:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
