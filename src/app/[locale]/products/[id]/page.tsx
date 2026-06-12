import { Metadata } from 'next';
import db from '@/lib/db';
import ProductClient from '@/app/products/[id]/ProductClient';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/translations';
import { Suspense } from 'react';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const locale = resolvedParams.locale as Locale;
  
  // 1. Fetch Product
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return { title: 'Product Not Found' };

  // 2. Fetch Site Config & SEO Template
  const siteConfig = await db.setting.findUnique({ where: { id: 'site' } });
  
  let config: any = {};
  if (siteConfig?.value) {
    try { config = JSON.parse(siteConfig.value); } catch (_) {}
  }
  const template = config.productSeoTemplate || '[ProductName] | [SiteTitle]';
  const siteUrl = config.siteUrl ? config.siteUrl.replace(/\/$/, '') : 'https://www.heovose.com';

  // 3. Fetch Translated Strings for Replacement
  const [nameEntry, siteTitleEntry, descEntry] = await Promise.all([
    db.localizedString.findUnique({ where: { id: product.nameTextId } }),
    db.localizedString.findUnique({ where: { id: 'SITE_TITLE' } }),
    product.descriptionTextId ? db.localizedString.findUnique({ where: { id: product.descriptionTextId } }) : null,
  ]);

  const productName = (nameEntry?.content as any)?.[locale] || nameEntry?.[locale] || product.id;
  const siteTitle = (siteTitleEntry?.content as any)?.[locale] || siteTitleEntry?.[locale] || 'Heovose Elevate';
  const description = descEntry ? ((descEntry.content as any)?.[locale] || '') : '';

  // 4. Build Final Title using Template
  let title = template
    .replace('[ProductName]', productName)
    .replace('[SiteTitle]', siteTitle);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/${locale}/products/${id}`,
      languages: {
        'en': `${siteUrl}/en/products/${id}`,
        'zh-Hans': `${siteUrl}/zh/products/${id}`,
        'id': `${siteUrl}/id/products/${id}`,
        'vi': `${siteUrl}/vi/products/${id}`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/${locale}/products/${id}`,
      type: 'website',
      siteName: siteTitle,
      locale: locale === 'zh' ? 'zh_CN' : 'en_US',
      images: product.mainImageUrl ? [product.mainImageUrl] : [],
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  const targetLocale = resolvedParams.locale as Locale;

  let product: any = null;
  let specTranslations: any[] = [];

  try {
    product = await db.product.findUnique({
      where: { id },
      include: {
        nameText: true,
        descriptionText: true,
        category: {
          include: {
            nameText: true
          }
        }
      }
    });

    if (product) {
      // 提取产品包含的规格翻译 IDs
      const specIds: string[] = [];
      let specGroups = product.specGroups;
      if (typeof specGroups === 'string') {
        try {
          specGroups = JSON.parse(specGroups);
        } catch (_) {
          specGroups = null;
        }
      }
      if (specGroups && typeof specGroups === 'object') {
        const groups = specGroups as any;
        const groupArray = Array.isArray(groups) ? groups : [];
        groupArray.forEach((g: any) => {
          if (g.titleId) specIds.push(g.titleId);
          if (Array.isArray(g.items)) {
            g.items.forEach((item: any) => {
              if (item.labelId) specIds.push(item.labelId);
              if (item.valueId) specIds.push(item.valueId);
            });
          }
        });
      }

      // 批量查出这些 ID 的翻译
      if (specIds.length > 0) {
        specTranslations = await db.localizedString.findMany({
          where: { id: { in: specIds } }
        });
      }
    }
  } catch (error) {
    console.error('[Build / SSR] Product detail query failed or connection not found:', error);
  }

  // 如果在编译预渲染阶段由于数据库缺失导致产品为空，返回兜底对象，避免 notFound 中断 build
  if (!product) {
    if (!process.env.DATABASE_URL) {
      product = { id, nameText: {}, descriptionText: {}, specGroups: [] };
    } else {
      notFound();
    }
  }

  // 打包产品数据，在客户端进行注入
  const productWithSpecs = {
    ...product,
    specTranslations
  };

  return (
    <Suspense fallback={null}>
      <ProductClient product={JSON.parse(JSON.stringify(productWithSpecs))} initialLocale={targetLocale} />
    </Suspense>
  );
}
