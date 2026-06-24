import { MetadataRoute } from 'next';
import db from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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
    console.error('Failed to parse siteUrl for sitemap.xml, fallback to default:', e);
  }

  // 1. Static Routes
  const routes = ['', '/about', '/service-centers', '/products'].map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : 0.8,
  }));

  // 2. Product Categories Filter Routes
  let categoryRoutes: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];
  try {
    const categories = await db.productCategory.findMany({
      select: { slug: true }
    });
    categoryRoutes = categories.map((cat: any) => ({
      url: `${siteUrl}/products?category=${encodeURIComponent(cat.slug)}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.error('Failed to fetch categories for sitemap:', e);
  }

  // 3. Product Details Routes
  let productRoutes: Array<{ url: string; lastModified: Date; changeFrequency: 'weekly'; priority: number }> = [];
  try {
    const products = await db.product.findMany({
      where: { status: 'published', deletedAt: null },
      select: { id: true, updatedAt: true }
    });
    productRoutes = products.map((prod: any) => ({
      url: `${siteUrl}/products/${prod.id}`,
      lastModified: prod.updatedAt || new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch (e) {
    console.error('Failed to fetch products for sitemap:', e);
  }

  return [...routes, ...categoryRoutes, ...productRoutes];
}
