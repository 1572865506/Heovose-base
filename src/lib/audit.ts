import db from './db';

// 递归脱敏 JSON 数据中的敏感关键字
export function sanitizeLogData(data: any): any {
  if (data === null || data === undefined) return data;

  // 1. 如果是数组，递归处理每个元素
  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  // 2. 如果是对象，深拷贝并递归过滤敏感键值
  if (typeof data === 'object') {
    const sanitized: any = {};
    const sensitiveRegex = /password|secret|key|token|jwt|credential/i;
    
    for (const [k, v] of Object.entries(data)) {
      if (sensitiveRegex.test(k)) {
        sanitized[k] = '[REDACTED]';
      } else {
        sanitized[k] = sanitizeLogData(v);
      }
    }
    return sanitized;
  }

  // 3. 基本数据类型直接返回
  return data;
}

// 记录管理员操作审计日志 (非阻塞式异步写入)
export async function logAdminAction(
  request: Request | null,
  userId: string | null | undefined,
  userEmail: string | null | undefined,
  action: string,
  details: any
) {
  try {
    let ip: string | null = null;
    let userAgent: string | null = null;

    if (request) {
      ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || null;
      userAgent = request.headers.get("user-agent") || null;
    }

    const sanitizedDetails = sanitizeLogData(details);

    // 使用非阻塞式的 Promise.catch 写入数据库，即使审计失败也不阻断前台业务响应
    db.auditLog.create({
      data: {
        userId: userId || null,
        userEmail: userEmail || null,
        action,
        details: sanitizedDetails || {},
        ip,
        userAgent,
      },
    }).catch((dbErr: any) => {
      console.error('[AuditLog] Failed to persist admin action to DB:', dbErr);
    });
  } catch (err) {
    console.error('[AuditLog] Error in logAdminAction wrapper:', err);
  }
}
