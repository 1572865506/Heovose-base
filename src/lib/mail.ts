import nodemailer from 'nodemailer';

const getTransporter = async () => {
  let host = process.env.SMTP_HOST;
  let port = parseInt(process.env.SMTP_PORT || '587');
  let secure = process.env.SMTP_SECURE === 'true';
  let user = process.env.SMTP_USER;
  let pass = process.env.SMTP_PASSWORD;

  try {
    const db = (await import('@/lib/db')).default;
    const settings = await db.setting.findMany({
      where: {
        id: { in: ['smtp_host', 'smtp_port', 'smtp_secure', 'smtp_user', 'smtp_password'] }
      }
    });

    const settingsMap = settings.reduce((acc: any, s: any) => {
      acc[s.id] = s.value;
      return acc;
    }, {});

    if (settingsMap.smtp_host) host = settingsMap.smtp_host;
    if (settingsMap.smtp_port) port = parseInt(settingsMap.smtp_port);
    if (settingsMap.smtp_secure) secure = settingsMap.smtp_secure === 'true';
    if (settingsMap.smtp_user) user = settingsMap.smtp_user;
    if (settingsMap.smtp_password) pass = settingsMap.smtp_password;
  } catch (e) {
    console.warn('[Mail] Failed to load SMTP settings from DB, using ENV:', e);
  }

  if (!host || !user || !pass) {
    return {
      transporter: null,
      sender: user,
      configError: 'SMTP 发信服务器参数未配置完整（缺少 host / user / pass）'
    };
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port: Number.isFinite(port) ? port : 587,
      secure,
      auth: { user, pass },
      connectionTimeout: 10000, // 10s 连接超时
      greetingTimeout: 10000,   // 10s 握手超时
      socketTimeout: 15000,     // 15s 传输超时
    }),
    sender: user,
    configError: undefined as string | undefined
  };
};

function escapeHtml(str: string): string {
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

export interface LeadDossier {
  location?: string;
  language?: string;
  dwellTime?: string;
  pdfDownloaded?: boolean;
  comparedProducts?: string[];
  channel?: string;
  leadRating?: string;
  mailStatus?: 'sent' | 'failed' | 'unconfigured' | 'pending';
  mailError?: string;
  mailSentAt?: string;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  unconfigured?: boolean;
  attempts: number;
}

function isNonRetryableSmtpError(err: any): boolean {
  const code = String(err?.code || '').toUpperCase();
  const responseCode = Number(err?.responseCode || 0);
  const msg = String(err?.message || '').toLowerCase();
  // 认证失败、无效收件人或明确永久拒绝（535/550/553）不进行无效重试
  if (code === 'EAUTH' || responseCode === 535 || responseCode === 550 || responseCode === 553) {
    return true;
  }
  if (msg.includes('invalid login') || msg.includes('authentication failed') || msg.includes('bad credentials')) {
    return true;
  }
  return false;
}

export async function sendInquiryNotification(data: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  productId?: string | null;
  productName?: string | null;
  dossier?: LeadDossier;
}): Promise<SendMailResult> {
  const { transporter, sender, configError } = await getTransporter();

  if (configError || !transporter) {
    console.warn('[Mail] SMTP not configured:', configError);
    return {
      success: false,
      unconfigured: true,
      error: configError || 'SMTP 发信服务器未配置',
      attempts: 0
    };
  }

  // 获取当前基础 URL 用于追踪像素与详情链接
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://heovose.com';
  const trackingPixelUrl = `${baseUrl}/api/inquiries/track/${encodeURIComponent(data.id)}`;

  // 优先从数据库读取转发邮箱
  let adminEmail = process.env.ADMIN_EMAIL;
  try {
    const db = (await import('@/lib/db')).default;
    const setting = await db.setting.findUnique({
      where: { id: 'inquiry_forward_email' }
    });
    if (setting?.value) {
      adminEmail = setting.value;
      console.log('[Mail] Using database-configured recipient:', adminEmail);
    }
  } catch (dbError) {
    console.warn('[Mail] Failed to read email setting from DB, falling back to ENV:', dbError);
  }

  if (!adminEmail) {
    const errMsg = '未配置询盘转发接收邮箱 (ADMIN_EMAIL / inquiry_forward_email)';
    console.error('[Mail]', errMsg);
    return {
      success: false,
      unconfigured: true,
      error: errMsg,
      attempts: 0
    };
  }

  const escapedName = escapeHtml(data.name);
  const escapedEmail = escapeHtml(data.email);
  const escapedPhone = escapeHtml(data.phone || 'N/A');
  const escapedCompany = escapeHtml(data.company || 'N/A');
  const escapedProductId = escapeHtml(data.productId || 'N/A');
  const escapedProductName = escapeHtml(data.productName || 'General Inquiry');
  const escapedMessage = escapeHtml(data.message);

  const subject = `【官网询盘】${escapedName}${data.productId ? ` - ${escapedProductName}` : ''}`;
  const productLink = data.productId ? `${baseUrl}/products/${encodeURIComponent(data.productId)}` : null;
  const submissionTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  // 客户画像数据清洗与防注入（严格符合官网隐私条款规定）
  const dossier = data.dossier;
  const escapedLocation = escapeHtml(dossier?.location || '未知国家/地区');
  const escapedLanguage = escapeHtml(dossier?.language || '未知');
  const escapedDwellTime = escapeHtml(dossier?.dwellTime || 'N/A');
  const escapedChannel = escapeHtml(dossier?.channel || '直接访问');
  const escapedLeadRating = escapeHtml(dossier?.leadRating || '🌱 常规留资');
  const escapedComparedProducts = dossier?.comparedProducts && dossier.comparedProducts.length > 0
    ? dossier.comparedProducts.map(p => escapeHtml(p)).join('、')
    : '';

  const productHtml = productLink
    ? `<a href="${productLink}" style="color: #2563eb; font-weight: 600; text-decoration: underline;" target="_blank" rel="noopener noreferrer">${escapedProductName} (ID: ${escapedProductId})</a>`
    : escapedProductName;

  let dossierHtml = '';
  if (dossier) {
    const comparedHtml = escapedComparedProducts ? `
          <tr>
            <td style="color: #94a3b8; vertical-align: top;">• 对比浏览产品:</td>
            <td style="color: #475569;">${escapedComparedProducts}</td>
          </tr>` : '';

    const pdfStatusHtml = dossier.pdfDownloaded
      ? '<span style="font-weight: 600; color: #16a34a;">已下载 (高意向)</span>'
      : '<span style="color: #64748b;">未下载</span>';

    dossierHtml = `
      <!-- 分割线：明确区分核心询盘内容与辅助性系统画像 -->
      <div style="margin: 24px 0 12px; padding-top: 16px; border-top: 1px dashed #cbd5e1; text-align: center; font-size: 11px; color: #94a3b8; letter-spacing: 0.5px;">
        —— 以下为后台获取的访客信息，仅供参考 ——
      </div>

      <!-- 邮件底部：辅助性客户画像专栏 (Auxiliary Analytics Dossier) -->
      <div style="padding: 12px 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
        <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #475569; font-size: 12px; font-weight: 600;">🎯 后台分析画像</span>
          <span style="font-size: 11px; font-weight: 600; color: #3b82f6;">${escapedLeadRating}</span>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; line-height: 1.7; color: #64748b;">
          <tr>
            <td style="width: 105px; color: #94a3b8;">• 所在国家/地区:</td>
            <td style="color: #475569;">${escapedLocation}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">• 建议沟通语种:</td>
            <td style="color: #475569;">${escapedLanguage}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">• 站内总停留:</td>
            <td style="color: #475569;">${escapedDwellTime}</td>
          </tr>
          <tr>
            <td style="color: #94a3b8;">• 规格书PDF下载:</td>
            <td>${pdfStatusHtml}</td>
          </tr>
          ${comparedHtml}
          <tr>
            <td style="color: #94a3b8;">• 渠道来源:</td>
            <td style="color: #475569;">${escapedChannel}</td>
          </tr>
        </table>
      </div>
    `;
  }

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-top: 0; font-size: 20px;">New Customer Inquiry</h2>
      
      <!-- 客户核心联系方式与产品信息 -->
      <table style="width: 100%; border-collapse: collapse; margin: 18px 0; font-size: 14px; line-height: 1.8;">
        <tr>
          <td style="width: 120px; color: #64748b; font-weight: 500;">Name:</td>
          <td style="color: #0f172a; font-weight: 600;">${escapedName}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 500;">Email:</td>
          <td style="color: #0f172a;"><a href="mailto:${escapedEmail}" style="color: #2563eb; text-decoration: none;">${escapedEmail}</a></td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 500;">Phone:</td>
          <td style="color: #0f172a;"><a href="tel:${escapedPhone}" style="color: #0f172a; text-decoration: none; font-weight: 500;">${escapedPhone}</a></td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 500;">Company:</td>
          <td style="color: #0f172a;">${escapedCompany}</td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 500;">Target Product:</td>
          <td style="color: #0f172a;">
            ${productHtml}
          </td>
        </tr>
        <tr>
          <td style="color: #64748b; font-weight: 500;">Submit Time:</td>
          <td style="color: #0f172a;">${submissionTime}</td>
        </tr>
      </table>

      <!-- 客户原始留言区 -->
      <div style="background: #f8fafc; padding: 16px 18px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <p style="margin-top: 0; margin-bottom: 8px; font-weight: 700; color: #1e293b; font-size: 14px;">Customer Message:</p>
        <p style="white-space: pre-wrap; margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">${escapedMessage}</p>
      </div>

      ${dossierHtml}

      <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center;">
        此邮件由 Heovose 系统自动通知发送，请直接通过客户邮箱或电话联系客户。
      </p>

      <!-- 追踪像素 -->
      <img src="${trackingPixelUrl}" width="1" height="1" style="display:none !important;" />
    </div>
  `;

  const maxAttempts = 3;
  const retryDelaysMs = [1500, 3500];
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: `"Heovose Inquiry" <${sender}>`,
        to: adminEmail,
        subject,
        html,
      });
      console.log(`[Mail] Inquiry notification sent (attempt ${attempt}/${maxAttempts}):`, info.messageId);
      return {
        success: true,
        messageId: info.messageId,
        attempts: attempt
      };
    } catch (error: any) {
      lastError = error;
      console.error(`[Mail] Send attempt ${attempt}/${maxAttempts} failed:`, error?.message || error);

      if (isNonRetryableSmtpError(error) || attempt >= maxAttempts) {
        break;
      }

      const waitMs = retryDelaysMs[attempt - 1] || 3000;
      await new Promise((resolve) => setTimeout(resolve, waitMs));
    }
  }

  const errMsg = lastError?.message || String(lastError || 'Unknown SMTP error');
  return {
    success: false,
    error: errMsg.slice(0, 300),
    attempts: maxAttempts
  };
}

export async function testSMTPConnection(settings: {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  to: string;
}) {
  const transporter = nodemailer.createTransport({
    host: settings.host,
    port: settings.port,
    secure: settings.secure,
    auth: {
      user: settings.user,
      pass: settings.pass,
    },
  });

  try {
    // 1. Verify connection
    await transporter.verify();

    // 2. Send test email
    await transporter.sendMail({
      from: `"Heovose System Test" <${settings.user}>`,
      to: settings.to,
      subject: 'SMTP Connection Test - Heovose Elevate',
      html: `
        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #10b981;">Connection Successful!</h2>
          <p>Your SMTP configuration for <strong>Heovose Elevate</strong> is working correctly.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">
            Sent to: ${settings.to}<br>
            Timestamp: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    });

    return { success: true };
  } catch (error: any) {
    console.error('[Mail Test] Failed:', error);
    throw error;
  }
}
