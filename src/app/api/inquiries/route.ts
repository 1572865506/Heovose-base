import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import createDomPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { auth } from '@/auth';

// 询盘验证 Schema
const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional().nullable(),
  company: z.string().max(100).optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  productId: z.string().optional().nullable(),
  // 蜜罐字段：如果被填写，说明是机器人
  website_url: z.string().optional()
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const inquiries = await db.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(inquiries);
  } catch (error: any) {
    console.error('[API] Inquiry GET Error Full:', error);
    return NextResponse.json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Zod 基础验证
    const validation = inquirySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const data = validation.data;

    // 2. 蜜罐检测 (Honeypot)
    if (data.website_url) {
      console.warn('[Security] Bot detected via Honeypot field:', data.email);
      // 静默成功，迷惑机器人，但不存入数据库
      return NextResponse.json({ success: true, message: 'Message sent successfully' });
    }

    // 3. XSS 消毒处理 (服务端初始化)
    const window = new JSDOM('').window;
    const dompurify = createDomPurify(window as any);
    const sanitizedMessage = dompurify.sanitize(data.message);

    // 4. 持久化到数据库
    const inquiry = await db.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: sanitizedMessage,
        productId: data.productId,
        status: 'pending'
      }
    });

    // 4.5 发送邮件通知 (异步执行，不阻塞响应)
    (async () => {
      try {
        let productName = null;
        if (data.productId) {
          const product = await db.product.findUnique({
            where: { id: data.productId },
            include: { nameText: true }
          });
          if (product) {
            // 这里我们尝试获取一个可读的名字，如果不存在则使用 ID
            const nameContent = typeof product.nameText.content === 'string' 
              ? JSON.parse(product.nameText.content) 
              : product.nameText.content;
            productName = nameContent['en'] || nameContent['zh'] || Object.values(nameContent)[0];
          }
        }

        const { sendInquiryNotification } = await import('@/lib/mail');
        await sendInquiryNotification({
          ...data,
          id: inquiry.id,
          message: sanitizedMessage,
          productName: productName as string
        });
      } catch (mailError) {
        console.error('[API] Mail notification failed:', mailError);
      }
    })();

    // 5. AI 自动回复集成 (可选)
    let aiReply = null;
    try {
      const aiSetting = await db.setting.findUnique({ where: { id: 'ai' } });
      if (aiSetting) {
        const config = JSON.parse(aiSetting.value as string);
        if (config.isInquiryAiEnabled) {
          const { inquiryReplyFlow } = await import('@/ai/flows/inquiry-reply-flow');
          aiReply = await inquiryReplyFlow({
            name: data.name,
            message: sanitizedMessage,
            systemInstruction: config.inquirySystemInstruction,
            model: config.model
          });
          
          // 更新询盘记录，存入 AI 回复
          await db.inquiry.update({
            where: { id: inquiry.id },
            data: { 
              // 假设我们增加一个字段存 AI 回复，或者存入 message 的一部分
              // 暂时先存入 console 或者单独记录。
              // 为了完整性，我应该在 Inquiry 模型中增加一个 aiReply 字段
            }
          });
        }
      }
    } catch (aiError) {
      console.error('[AI] Auto-reply failed:', aiError);
    }
    
    return NextResponse.json({ 
      success: true, 
      id: inquiry.id,
      aiReply,
      message: 'Your inquiry has been submitted successfully.' 
    });

  } catch (error: any) {
    console.error('[API] Inquiry POST Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
