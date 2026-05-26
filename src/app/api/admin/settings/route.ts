import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { withAuth } from '@/lib/auth-utils';
import { logAdminAction } from '@/lib/audit';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export const GET = withAuth('editor', async () => {
  const settings = await db.setting.findMany();
  // Convert to a simple key-value object
  const settingsMap = settings.reduce((acc: any, s: any) => {
    acc[s.id] = s.value;
    return acc;
  }, {});

  return NextResponse.json(settingsMap);
});

const settingSchema = z.object({
  key: z.string().min(1).max(100),
  value: z.any()
}).strict();

export const PATCH = withAuth('editor', async (
  req: Request,
  context: any,
  currentUser: { id: string; role: string; email: string }
) => {
  const body = await req.json();
  const validation = settingSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
  }

  const { key, value } = validation.data;
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  const setting = await db.setting.upsert({
    where: { id: key },
    update: { value: stringValue },
    create: { id: key, value: stringValue },
  });

  // 记录审计日志
  logAdminAction(
    req,
    currentUser.id,
    currentUser.email,
    'UPDATE_SETTINGS',
    { key, value }
  );

  return NextResponse.json(setting);
});
