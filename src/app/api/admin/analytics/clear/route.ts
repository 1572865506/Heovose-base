import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import db from '@/lib/db';

export async function POST(request: Request) {
  try {
    // 1. Session 鉴权
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未经授权访问' }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. 校验用户角色是否为超级管理员
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true, email: true }
    });

    if (!user || user.role !== 'superadmin') {
      return NextResponse.json({ error: '权限不足，仅超级管理员可执行数据清洗' }, { status: 403 });
    }

    // 3. 解析请求参数
    const rawBody = await request.text();
    let clearInquiries = false;
    if (rawBody.trim()) {
      const body = JSON.parse(rawBody);
      clearInquiries = !!body.clearInquiries;
    }

    // 4. 执行数据清洗事务
    await db.$transaction(async (tx: any) => {
      // 清空 visitorSession 表 (AnalyticsEvent 表会因为 Cascade 级联删除被自动物理清除)
      await tx.visitorSession.deleteMany({});
      
      // 如果要求清洗询盘
      if (clearInquiries) {
        await tx.inquiry.deleteMany({});
      }

      // 5. 写入审计日志以便追踪
      await tx.auditLog.create({
        data: {
          userId,
          userEmail: user.email,
          action: 'CLEAR_ANALYTICS_DATA',
          details: {
            clearInquiries,
            clearedAt: new Date().toISOString(),
            ip: request.headers.get("x-forwarded-for")?.split(",")[0].trim() || '127.0.0.1'
          }
        }
      });
    });

    return NextResponse.json({ success: true, message: '数据清洗完成' });
  } catch (error: any) {
    console.error('[Analytics Clear] Error:', error);
    return NextResponse.json({ error: '数据清洗执行失败: ' + (error?.message || error) }, { status: 500 });
  }
}
