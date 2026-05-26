import db from '@/lib/db';

/**
 * Database-backed rate limiting helper for distributed server configurations.
 * 
 * @param ip Client IP address
 * @param path Request path/action key
 * @param limit Max allowed requests within duration
 * @param durationMs Duration window in milliseconds
 * @returns Object indicating success and remaining attempts
 */
export async function dbRateLimit(
  ip: string,
  path: string,
  limit: number,
  durationMs: number
): Promise<{ success: boolean; remaining: number }> {
  const now = new Date();
  const key = `${ip}:${path}`;

  try {
    return await db.$transaction(async (tx: any) => {
      const record = await tx.rateLimit.findUnique({
        where: { key }
      });

      if (!record || now.getTime() > record.resetTime.getTime()) {
        const resetTime = new Date(now.getTime() + durationMs);
        await tx.rateLimit.upsert({
          where: { key },
          create: { key, count: 1, resetTime },
          update: { count: 1, resetTime }
        });
        return { success: true, remaining: limit - 1 };
      }

      if (record.count >= limit) {
        return { success: false, remaining: 0 };
      }

      const updated = await tx.rateLimit.update({
        where: { key },
        data: { count: { increment: 1 } }
      });

      return { success: true, remaining: limit - updated.count };
    });
  } catch (error) {
    console.error('[RateLimit Error] Database rate limit failed, failing open for safety:', error);
    return { success: true, remaining: 1 };
  }
}
