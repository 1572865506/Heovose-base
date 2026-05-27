import { Metadata } from 'next';
import db from '@/lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/translations';

interface Props {
  params: Promise<{ id: string }>;
}

// Resolve system default language configuration without cookies/headers dependency to enable SSG/ISR
async function getDefaultLocale(): Promise<Locale> {
  try {
    const langSetting = await db.setting.findUnique({ where: { id: 'languages' } });
    if (langSetting && langSetting.value) {
      const parsed = JSON.parse(langSetting.value);
      if (parsed.defaultLanguage && ['en', 'zh', 'id', 'vi'].includes(parsed.defaultLanguage)) {
        return parsed.defaultLanguage as Locale;
      }
    }
  } catch (_) {}
  return 'en';
}

// Generate static params to statically compile detail pages for all published products
export async function generateStaticParams() {
  try {
    const products = await db.product.findMany({
      where: { status: 'published' },
      select: { id: true }
    });
    return products.map((p: any) => ({
      id: p.id
    }));
  } catch (error) {
    console.error('Failed to generate static params for products:', error);
    return [];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
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
  
  // 3. Determine Default Locale
  const locale = await getDefaultLocale();

  // 4. Fetch Translated Strings for Replacement
  const [nameEntry, siteTitleEntry, descEntry] = await Promise.all([
    db.localizedString.findUnique({ where: { id: product.nameTextId } }),
    db.localizedString.findUnique({ where: { id: 'SITE_TITLE' } }),
    product.descriptionTextId ? db.localizedString.findUnique({ where: { id: product.descriptionTextId } }) : null,
  ]);

  const productName = (nameEntry?.content as any)?.[locale] || nameEntry?.[locale] || product.id;
  const siteTitle = (siteTitleEntry?.content as any)?.[locale] || siteTitleEntry?.[locale] || 'Heovose Elevate';
  const description = descEntry ? ((descEntry.content as any)?.[locale] || '') : '';

  // 5. Build Final Title using Template
  let title = template
    .replace('[ProductName]', productName)
    .replace('[SiteTitle]', siteTitle);

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/products/${id}`,
      languages: {
        'en': `${siteUrl}/products/${id}?lang=en`,
        'zh-Hans': `${siteUrl}/products/${id}?lang=zh`,
        'id': `${siteUrl}/products/${id}?lang=id`,
        'vi': `${siteUrl}/products/${id}?lang=vi`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products/${id}`,
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

  const product = await db.product.findUnique({
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
  if (!product) notFound();

  // 提取产品包含的规格翻译 IDs
  const specIds: string[] = [];
  if (product.specGroups && typeof product.specGroups === 'object') {
    const groups = product.specGroups as any;
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
  const specTranslations = specIds.length > 0
    ? await db.localizedString.findMany({
        where: { id: { in: specIds } }
      })
    : [];

  const locale = await getDefaultLocale();

  // 打包产品数据，在客户端进行注入
  const productWithSpecs = {
    ...product,
    specTranslations
  };

  return <ProductClient product={JSON.parse(JSON.stringify(productWithSpecs))} initialLocale={locale} />;
}
