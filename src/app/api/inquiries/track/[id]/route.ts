import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // 更新询盘的查看时间（如果尚未查看）
    const inquiry = await db.inquiry.findUnique({
      where: { id },
      select: { emailViewedAt: true }
    });

    if (inquiry && !inquiry.emailViewedAt) {
      await db.inquiry.update({
        where: { id },
        data: { emailViewedAt: new Date() }
      });
      console.log(`[Tracking] Inquiry ${id} marked as viewed in email.`);
    }
  } catch (error) {
    console.error('[Tracking] Error updating inquiry status:', error);
  }

  // 返回一个 1x1 透明 PNG 图片
  const transparentPng = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    'base64'
  );

  return new NextResponse(transparentPng, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}
