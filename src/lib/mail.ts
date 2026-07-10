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

  return {
    transporter: nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    }),
    sender: user
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

export async function sendInquiryNotification(data: {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  message: string;
  productId?: string | null;
  productName?: string | null;
}) {
  const { transporter, sender } = await getTransporter();

  // 获取当前基础 URL 用于追踪像素
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
    console.error('[Mail] ADMIN_EMAIL is not configured');
    return;
  }

  const escapedName = escapeHtml(data.name);
  const escapedEmail = escapeHtml(data.email);
  const escapedPhone = escapeHtml(data.phone || 'N/A');
  const escapedCompany = escapeHtml(data.company || 'N/A');
  const escapedProductId = escapeHtml(data.productId || 'N/A');
  const escapedProductName = escapeHtml(data.productName || 'General Inquiry');
  const escapedMessage = escapeHtml(data.message);

  const subject = `【官网询盘】${escapedName}`;
  const productLink = data.productId ? `${baseUrl}/products/${encodeURIComponent(data.productId)}` : null;
  const submissionTime = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' });

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 10px;">New Customer Inquiry</h2>
      <div style="margin: 20px 0;">
        <p><strong>Name:</strong> ${escapedName}</p>
        <p><strong>Customer Email:</strong> ${escapedEmail}</p>
        <p><strong>Customer Phone:</strong> ${escapedPhone}</p>
        <p><strong>Company:</strong> ${escapedCompany}</p>
        <p><strong>Product ID:</strong> ${data.productId ? `<a href="${productLink}" style="color: #2563eb; text-decoration: underline;">${escapedProductId}</a>` : 'N/A'}</p>
        <p><strong>Product Name:</strong> ${escapedProductName}</p>
        <p><strong>Comment Time:</strong> ${submissionTime}</p>
      </div>
      <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border-left: 4px solid #d1d5db;">
        <p style="margin-top: 0;"><strong>Message:</strong></p>
        <p style="white-space: pre-wrap;">${escapedMessage}</p>
      </div>
      
      <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-radius: 8px; text-align: center;">
        <a href="${baseUrl}/admin/inquiries" style="display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">在后台查看并回复</a>
      </div>
 
      <p style="margin-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
        这是来自Heovose机器人的自动转发通知，请勿直接回复。
      </p>
 
      <!-- 追踪像素 -->
      <img src="${trackingPixelUrl}" width="1" height="1" style="display:none !important;" />
    </div>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Heovose Inquiry" <${sender}>`,
      to: adminEmail,
      subject,
      html,
    });
    console.log('[Mail] Inquiry notification sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('[Mail] Failed to send inquiry notification:', error);
    throw error;
  }
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
