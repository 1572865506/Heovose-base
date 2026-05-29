import { Metadata } from 'next';
import db from '@/lib/db';
import ProductClient from '@/app/products/[id]/ProductClient';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/translations';

interface Props {
  params: Promise<{ locale: string; id: string }>;
}

// Generate static params to statically compile detail pages for all published products across all locales
export async function generateStaticParams() {
  try {
    const [products, langSetting] = await Promise.all([
      db.product.findMany({
        where: { status: 'published' },
        select: { id: true }
      }),
      db.setting.findUnique({ where: { id: 'languages' } })
    ]);

    let locales = ['en', 'zh', 'id', 'vi'];
    if (langSetting?.value) {
      const parsed = JSON.parse(langSetting.value);
      if (Array.isArray(parsed.supportedLanguages)) {
        locales = parsed.supportedLanguages.map((l: any) => l.code);
      }
    }

    const paramsList: Array<{ locale: string; id: string }> = [];
    products.forEach((p: any) => {
      locales.forEach((locale: string) => {
        paramsList.push({
          locale,
          id: p.id
        });
      });
    });
    return paramsList;
  } catch (error) {
    console.error('Failed to generate static params for product details:', error);
    return [];
  }
}

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
  const specTranslations = specIds.length > 0
    ? await db.localizedString.findMany({
        where: { id: { in: specIds } }
      })
    : [];

  // 打包产品数据，在客户端进行注入
  const productWithSpecs = {
    ...product,
    specTranslations
  };

  return <ProductClient product={JSON.parse(JSON.stringify(productWithSpecs))} initialLocale={targetLocale} />;
}
