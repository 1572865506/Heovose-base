import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { z } from 'zod';
import createDomPurify from 'dompurify';
import { JSDOM } from 'jsdom';

import { auth } from '@/auth';

import { dbRateLimit } from '@/lib/rate-limit';

// 询盘验证 Schema
const inquirySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required').max(50),
  company: z.string().max(100).optional().nullable(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000),
  productId: z.string().optional().nullable(),
  sessionId: z.string().max(128).optional().nullable(),
  visitorId: z.string().max(128).optional().nullable(),
  clientTimezone: z.string().max(100).optional().nullable(),
  clientLang: z.string().max(50).optional().nullable(),
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

    // 收集所有关联产品ID批量获取可读产品名
    const productIds = Array.from(new Set(inquiries.map((i: any) => i.productId).filter(Boolean)));
    const products = productIds.length > 0 ? await db.product.findMany({
      where: { id: { in: productIds as string[] } },
      include: { nameText: true }
    }) : [];

    const productMap = new Map<string, string>();
    for (const p of products) {
      if (p.nameText?.content) {
        const content = typeof p.nameText.content === 'string' ? JSON.parse(p.nameText.content) : p.nameText.content;
        productMap.set(p.id, content['zh'] || content['en'] || Object.values(content)[0] as string || p.id);
      }
    }

    const formattedInquiries = inquiries.map((inq: any) => {
      let dossier = null;
      if (inq.subject) {
        try {
          dossier = JSON.parse(inq.subject);
        } catch (_) {}
      }
      return {
        ...inq,
        productName: inq.productId ? (productMap.get(inq.productId) || inq.productId) : null,
        dossier
      };
    });

    return NextResponse.json(formattedInquiries);
  } catch (error: any) {
    console.error('[API] Inquiry GET Error Full:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error'
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ip = (request as any).ip || request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
    const rateLimitResult = await dbRateLimit(ip, '/api/inquiries', 5, 60000);
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

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

    // 4.5 发送邮件通知并装配客户战术画像 (异步执行，不阻塞前台响应)
    (async () => {
      try {
        let productName = null;
        if (data.productId) {
          const product = await db.product.findUnique({
            where: { id: data.productId },
            include: { nameText: true }
          });
          if (product && product.nameText) {
            const nameContent = typeof product.nameText.content === 'string' 
              ? JSON.parse(product.nameText.content) 
              : product.nameText.content;
            productName = nameContent['en'] || nameContent['zh'] || Object.values(nameContent)[0] || product.id;
          }
        }

        // --- 隐性战术画像 (Lead Dossier) 智能装配 ---
        let session = null;
        if (data.sessionId) {
          session = await db.visitorSession.findUnique({
            where: { id: data.sessionId }
          });
        }
        if (!session && data.visitorId) {
          session = await db.visitorSession.findFirst({
            where: { visitorId: data.visitorId },
            orderBy: { updatedAt: 'desc' }
          });
        }

        // 收集需要查询的所有相关会话与访客交互事件（优先倒序抓取最新500条，绝不因历史条目把最新下载或对比行为截断）
        const targetSessionIds = new Set<string>();
        if (data.sessionId) targetSessionIds.add(data.sessionId);
        if (session?.id) targetSessionIds.add(session.id);

        let events: any[] = [];
        if (targetSessionIds.size > 0 || data.visitorId) {
          events = await db.analyticsEvent.findMany({
            where: {
              OR: [
                { sessionId: { in: Array.from(targetSessionIds) } },
                ...(data.visitorId ? [{ session: { visitorId: data.visitorId } }] : [])
              ]
            },
            orderBy: { timestamp: 'desc' },
            take: 500
          });
        }

        // 1. 所在国家/地区识别（严格遵循《隐私授权条款》第三条：粗略国家/地区级别，专用于协助调配就近的区域服务中心及技术顾问）
        const formatCountryRegion = (code?: string | null, city?: string | null): string => {
          if (!code || code === 'UNKNOWN') return '未知国家/地区';
          if (code === 'Localhost' || code === 'LOCAL' || (code === 'CN' && city === 'Localhost')) return '本地测试环境';

          const upper = code.toUpperCase();
          const countryNames: Record<string, string> = {
            CN: '中国 (China)',
            DE: '德国 (Germany)',
            US: '美国 (United States)',
            ID: '印度尼西亚 (Indonesia)',
            VN: '越南 (Vietnam)',
            SG: '新加坡 (Singapore)',
            MY: '马来西亚 (Malaysia)',
            TH: '泰国 (Thailand)',
            JP: '日本 (Japan)',
            KR: '韩国 (South Korea)',
            GB: '英国 (United Kingdom)',
            FR: '法国 (France)',
            IT: '意大利 (Italy)',
            ES: '西班牙 (Spain)',
            NL: '荷兰 (Netherlands)',
            AU: '澳大利亚 (Australia)',
            CA: '加拿大 (Canada)',
            RU: '俄罗斯 (Russia)',
            BR: '巴西 (Brazil)',
            IN: '印度 (India)',
            AE: '阿联酋 (UAE)',
            SA: '沙特阿拉伯 (Saudi Arabia)',
            MX: '墨西哥 (Mexico)',
            PH: '菲律宾 (Philippines)',
            TR: '土耳其 (Turkey)',
            PL: '波兰 (Poland)'
          };

          const countryName = countryNames[upper] || upper;
          const cleanCity = (city && city !== 'UNKNOWN' && city !== 'Localhost') ? ` · ${city}` : '';
          return `${countryName}${cleanCity}`;
        };

        const reqCountry = request.headers.get("cf-ipcountry") || 
                           request.headers.get("x-appengine-country") || 
                           request.headers.get("x-vercel-ip-country") || 
                           "";
        const reqCity = request.headers.get("cf-ipcity") || 
                        request.headers.get("x-appengine-city") || 
                        request.headers.get("x-vercel-ip-city") || 
                        "";
        const rawCountry = (session?.country && session.country !== 'UNKNOWN') ? session.country : reqCountry;
        const rawCity = (session?.city && session.city !== 'UNKNOWN') ? session.city : reqCity;
        const locationStr = formatCountryRegion(rawCountry, rawCity);

        // 语言标签友好转换（避免被误解为操作系统配置需求）
        const formatLanguageLabel = (rawLang?: string | null): string => {
          if (!rawLang || rawLang === 'N/A') return '未知';
          const prefix = rawLang.split(/[-_]/)[0].toLowerCase();
          const langMap: Record<string, string> = {
            zh: '中文 (Chinese)',
            en: '英语 (English)',
            de: '德语 (German)',
            vi: '越南语 (Vietnamese)',
            id: '印尼语 (Indonesian)',
            es: '西班牙语 (Spanish)',
            fr: '法语 (French)',
            ru: '俄语 (Russian)',
            ja: '日语 (Japanese)',
            ko: '韩语 (Korean)',
            ar: '阿拉伯语 (Arabic)',
            pt: '葡萄牙语 (Portuguese)',
            it: '意大利语 (Italian)',
            th: '泰语 (Thai)',
            nl: '荷兰语 (Dutch)',
            pl: '波兰语 (Polish)',
            tr: '土耳其语 (Turkish)'
          };
          const label = langMap[prefix];
          return label ? `${label} [${rawLang}]` : rawLang;
        };

        // 3. 渠道与溯源分析
        let channelStr = '直接访问';
        if (session?.referrer) {
          try {
            const refUrl = new URL(session.referrer);
            const host = refUrl.hostname.toLowerCase();
            if (host.includes('google.')) channelStr = 'Google 自然搜索';
            else if (host.includes('bing.')) channelStr = 'Bing 搜索';
            else if (host.includes('baidu.')) channelStr = '百度搜索';
            else channelStr = `外部引荐 (${host})`;
          } catch {
            channelStr = session.referrer;
          }
        }

        // 4. 全生命周期足迹深度研读
        let totalSeconds = 0;
        let pdfDownloaded = false;
        const comparedProductIds: string[] = [];

        const interactionEvents = (events && events.length > 0) ? events : (session?.events || []);
        for (const ev of interactionEvents) {
          const extra = (ev.extraData as any) || {};
          if (extra.utm_source) {
            channelStr = `${extra.utm_source}${extra.utm_campaign ? ` (${extra.utm_campaign})` : ''}`;
          }
          if (ev.type === 'PDF_DOWNLOAD' || extra.element === 'spec_pdf_download') {
            pdfDownloaded = true;
          }
          if (typeof extra.duration === 'number' && extra.duration > 0) {
            totalSeconds += extra.duration;
          }
          // 匹配对比浏览过的其他产品页面
          const path = ev.path || '';
          const match = path.match(/\/products\/([a-zA-Z0-9_\-]+)/);
          const pId = match ? match[1] : (extra.productId || null);
          if (pId && pId !== data.productId && !comparedProductIds.includes(pId)) {
            comparedProductIds.push(pId);
          }
        }

        // 若 duration 累计为 0 但有多次事件，根据事件跨度估算真实停留时长
        if (totalSeconds === 0 && events.length > 1) {
          const t1 = events[0].timestamp.getTime();
          const t2 = events[events.length - 1].timestamp.getTime();
          totalSeconds = Math.max(0, Math.round(Math.abs(t1 - t2) / 1000));
        }

        const formatDwellTime = (sec: number) => {
          if (sec <= 0) return '刚刚进站 (首访即刻留资)';
          const m = Math.floor(sec / 60);
          const s = sec % 60;
          return m > 0 ? `${m}分${s}秒` : `${s}秒`;
        };

        // 5. 对比浏览过的产品名称解析
        let comparedProductNames: string[] = [];
        if (comparedProductIds.length > 0) {
          const comparedProds = await db.product.findMany({
            where: { id: { in: comparedProductIds.slice(0, 5) } },
            include: { nameText: true }
          });
          const prodMap = new Map<string, string>();
          for (const p of comparedProds) {
            let pName = p.id;
            if (p.nameText) {
              const content = typeof p.nameText.content === 'string'
                ? JSON.parse(p.nameText.content)
                : p.nameText.content;
              pName = content['zh'] || content['en'] || Object.values(content)[0] || p.id;
            }
            prodMap.set(p.id, pName);
          }
          comparedProductNames = comparedProductIds.slice(0, 5).map(id => prodMap.get(id) || id);
        }

        // 6. 客观意向分级判定 (企业域名 + 深度行为 + PDF下载)
        const emailDomain = (data.email.split('@')[1] || '').toLowerCase();
        const freeEmailDomains = [
          'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
          'qq.com', '163.com', '126.com', 'foxmail.com', 'icloud.com', 
          'mail.ru', 'protonmail.com', 'aol.com', 'zoho.com'
        ];
        const isCorporateEmail = emailDomain && !freeEmailDomains.includes(emailDomain);

        let leadRating = '🌱 常规快速 (标准留资跟进)';
        if (isCorporateEmail && (pdfDownloaded || totalSeconds >= 180 || comparedProductNames.length > 0)) {
          leadRating = '🔥 极高意向 (企业独立域名 + 深度研读)';
        } else if (pdfDownloaded) {
          leadRating = '🔥 极高意向 (已下载技术规格书)';
        } else if (comparedProductNames.length > 0 || totalSeconds >= 120) {
          leadRating = '⚡ 深度研读 (多款对比选型 / 深度停留)';
        }

        const dossier: Record<string, any> = {
          location: locationStr,
          language: formatLanguageLabel(data.clientLang),
          dwellTime: formatDwellTime(totalSeconds),
          pdfDownloaded,
          comparedProducts: comparedProductNames,
          channel: channelStr,
          leadRating,
          mailStatus: 'pending'
        };

        // 持久化保存画像分析数据到询盘记录，供后台询盘管理调阅
        try {
          await db.inquiry.update({
            where: { id: inquiry.id },
            data: {
              subject: JSON.stringify(dossier)
            }
          });
        } catch (dbUpdateError) {
          console.error('[API] Failed to persist dossier to inquiry subject:', dbUpdateError);
        }

        const { sendInquiryNotification } = await import('@/lib/mail');
        const mailRes = await sendInquiryNotification({
          ...data,
          id: inquiry.id,
          message: sanitizedMessage,
          productName: productName as string,
          dossier
        });

        // 回写邮件转发结果，方便后台识别发信异常并支持一键补发
        const finalDossier = {
          ...dossier,
          mailStatus: mailRes.success ? 'sent' : (mailRes.unconfigured ? 'unconfigured' : 'failed'),
          mailError: mailRes.success ? undefined : mailRes.error,
          mailSentAt: mailRes.success ? new Date().toISOString() : undefined,
        };
        await db.inquiry.update({
          where: { id: inquiry.id },
          data: { subject: JSON.stringify(finalDossier) }
        }).catch((e: any) => console.error('[API] Failed to update mailStatus on inquiry:', e));
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
