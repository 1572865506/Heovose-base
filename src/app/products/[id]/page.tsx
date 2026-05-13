import { Metadata } from 'next';
import db from '@/lib/db';
import ProductClient from './ProductClient';
import { notFound } from 'next/navigation';
import { Locale } from '@/lib/translations';

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;
  
  // 1. Fetch Product
  const product = await db.product.findUnique({ where: { id } });
  if (!product) return { title: 'Product Not Found' };

  // 2. Fetch Site Config & SEO Template
  const [siteConfig, langSettings] = await Promise.all([
    db.setting.findUnique({ where: { id: 'site' } }),
    db.setting.findUnique({ where: { id: 'languages' } }),
  ]);
  
  const config = (siteConfig?.value as any) || {};
  const template = config.productSeoTemplate || '[ProductName] | [SiteTitle]';
  const defaultLang = (langSettings?.value as any)?.defaultLanguage || 'en';
  
  // 3. Determine Locale (Best effort on server side)
  const langParam = resolvedSearchParams.lang;
  const locale = (typeof langParam === 'string' ? langParam : defaultLang) as Locale;

  // 4. Fetch Translated Strings for Replacement
  const [nameEntry, siteTitleEntry] = await Promise.all([
    db.localizedString.findUnique({ where: { id: product.nameTextId } }),
    db.localizedString.findUnique({ where: { id: 'SITE_TITLE' } }),
  ]);

  const productName = (nameEntry?.content as any)?.[locale] || nameEntry?.[locale] || product.id;
  const siteTitle = (siteTitleEntry?.content as any)?.[locale] || siteTitleEntry?.[locale] || 'Heovose Elevate';

  // 5. Build Final Title using Template
  let title = template
    .replace('[ProductName]', productName)
    .replace('[SiteTitle]', siteTitle);

  return {
    title,
    description: (await db.localizedString.findUnique({ where: { id: product.descriptionTextId } }))?.[locale] || '',
    openGraph: {
      title,
      images: [product.mainImageUrl],
    }
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;

  const product = await db.product.findUnique({ where: { id } });
  if (!product) notFound();

  const langSettings = await db.setting.findUnique({ where: { id: 'languages' } });
  const defaultLang = (langSettings?.value as any)?.defaultLanguage || 'en';
  const locale = (typeof resolvedSearchParams.lang === 'string' ? resolvedSearchParams.lang : defaultLang) as Locale;

  return <ProductClient product={JSON.parse(JSON.stringify(product))} initialLocale={locale} />;
}
