import { MetadataRoute } from 'next';
import db from '@/lib/db';

export default async function robots(): Promise<MetadataRoute.Robots> {
  let siteUrl = 'https://www.heovose.com';
  try {
    const siteConfig = await db.setting.findUnique({ where: { id: 'site' } });
    if (siteConfig?.value) {
      const parsed = JSON.parse(siteConfig.value);
      if (parsed.siteUrl) {
        siteUrl = parsed.siteUrl.replace(/\/$/, '');
      }
    }
  } catch (e) {
    console.error('Failed to parse siteUrl for robots.txt, fallback to default:', e);
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/_next/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
