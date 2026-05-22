import { Metadata } from 'next';
import db from '@/lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/translations';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

import { getServerLocale } from "@/lib/server-locale";

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;
  
  // 1. Fetch Product
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return { title: 'Product Not Found' };

  // 2. Fetch Site Config & SEO Template
  const siteConfig = await db.setting.findUnique({ where: { id: 'site' } });
  
  const config = (siteConfig?.value as any) || {};
  const template = config.productSeoTemplate || '[ProductName] | [SiteTitle]';
  
  // 3. Determine Locale
  const locale = await getServerLocale(typeof resolvedSearchParams.lang === 'string' ? resolvedSearchParams.lang : undefined);

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
    title,
    description,
    openGraph: {
      title,
      images: product.mainImageUrl ? [product.mainImageUrl] : [],
    }
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
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

  const locale = await getServerLocale(typeof resolvedSearchParams.lang === 'string' ? resolvedSearchParams.lang : undefined);

  // 打包产品数据，在客户端进行注入
  const productWithSpecs = {
    ...product,
    specTranslations
  };

  return <ProductClient product={JSON.parse(JSON.stringify(productWithSpecs))} initialLocale={locale} />;
}
