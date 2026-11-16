import { MetadataRoute } from 'next';
import db from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let siteUrl = 'https://www.heovose.com';
  const supportedLocales = ['en', 'zh', 'id', 'vi'];

  try {
    const [siteConfig, langConfig] = await Promise.all([
      db.setting.findUnique({ where: { id: 'site' } }),
      db.setting.findUnique({ where: { id: 'languages' } }),
    ]);

    if (siteConfig?.value) {
      const parsed = JSON.parse(siteConfig.value);
      if (parsed.siteUrl) {
        siteUrl = parsed.siteUrl.replace(/\/$/, '');
      }
    }
  } catch (e) {
    console.error('Failed to parse siteUrl for sitemap.xml, fallback to default:', e);
  }

  // 辅助函数：构造带多语言互链 alternates 的 sitemap 条目
  const createLocalizedEntry = (
    path: string,
    priority: number,
    changeFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly',
    lastModified: Date = new Date()
  ) => {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const languages: Record<string, string> = {};
    supportedLocales.forEach((l) => {
      languages[l] = `${siteUrl}/${l}${cleanPath === '/' ? '' : cleanPath}`;
    });

    return {
      url: `${siteUrl}/en${cleanPath === '/' ? '' : cleanPath}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages,
      },
    };
  };

  // 1. 静态基础路由
  const staticPaths = ['/', '/about', '/service-centers', '/products'];
  const routes = staticPaths.map((p) =>
    createLocalizedEntry(p, p === '/' ? 1.0 : 0.8, p === '/' ? 'daily' : 'weekly')
  );

  // 2. 产品分类路由
  let categoryRoutes: MetadataRoute.Sitemap = [];
  try {
    const categories = await db.productCategory.findMany({
      select: { slug: true },
    });
    categoryRoutes = categories.map((cat: any) =>
      createLocalizedEntry(
        `/products?category=${encodeURIComponent(cat.slug)}`,
        0.7,
        'weekly'
      )
    );
  } catch (e) {
    console.error('Failed to fetch categories for sitemap:', e);
  }

  // 3. 产品详情路由
  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    const products = await db.product.findMany({
      where: { status: 'published', deletedAt: null },
      select: { id: true, updatedAt: true },
    });
    productRoutes = products.map((prod: any) =>
      createLocalizedEntry(
        `/products/${prod.id}`,
        0.9,
        'weekly',
        prod.updatedAt || new Date()
      )
    );
  } catch (e) {
    console.error('Failed to fetch products for sitemap:', e);
  }

  return [...routes, ...categoryRoutes, ...productRoutes];
}
