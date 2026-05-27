import { Metadata } from 'next';
import db from '@/lib/db';
import ProductListClient from './ProductListClient';

export const revalidate = 3600; // Enable hourly Incremental Static Regeneration (ISR)

export async function generateMetadata(): Promise<Metadata> {
  let siteUrl = 'https://www.heovose.com';
  try {
    const siteConfig = await db.setting.findUnique({ where: { id: 'site' } });
    if (siteConfig?.value) {
      const parsed = JSON.parse(siteConfig.value);
      if (parsed.siteUrl) {
        siteUrl = parsed.siteUrl.replace(/\/$/, '');
      }
    }
  } catch (_) {}

  const title = 'Products | Heovose Elevate';
  const description = 'Explore high-end tech hardware, computers, laptops, mini PCs, and interactive kiosks.';

  return {
    metadataBase: new URL(siteUrl),
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/products`,
      languages: {
        'en': `${siteUrl}/products?lang=en`,
        'zh-Hans': `${siteUrl}/products?lang=zh`,
        'id': `${siteUrl}/products?lang=id`,
        'vi': `${siteUrl}/products?lang=vi`,
      }
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/products`,
      type: 'website',
    }
  };
}

export default async function ProductListPage() {
  // 1. Fetch all product categories
  const categories = await db.productCategory.findMany({
    include: {
      nameText: true,
      descriptionText: true,
    },
    orderBy: {
      order: 'asc',
    },
  });

  // Helper to recursively find all descendant category IDs
  const getAllDescendantIds = (parentId: string): string[] => {
    const children = categories.filter((c: any) => c.parentId === parentId);
    let ids = children.map((c: any) => c.id);
    children.forEach((child: any) => {
      ids = [...ids, ...getAllDescendantIds(child.id)];
    });
    return ids;
  };
  const wholesaleSubCategoryIds = ['WHOLESALE', ...getAllDescendantIds('WHOLESALE')];

  // 2. Fetch initial products (first page limit = 12, wholesale line)
  const initialProducts = await db.product.findMany({
    where: {
      status: 'published',
      categoryId: { in: wholesaleSubCategoryIds },
    },
    include: {
      nameText: true,
      descriptionText: true,
    },
    take: 12,
    orderBy: {
      updatedAt: 'desc',
    },
  });

  const initialTotal = await db.product.count({
    where: {
      status: 'published',
      categoryId: { in: wholesaleSubCategoryIds },
    },
  });

  // 3. Fetch system language settings
  let initialLangSettings: any = null;
  try {
    const langSetting = await db.setting.findUnique({
      where: { id: 'languages' },
    });
    if (langSetting && langSetting.value) {
      initialLangSettings = JSON.parse(langSetting.value);
    }
  } catch (e) {
    console.error('Failed to parse language settings:', e);
  }

  // 4. Fetch translations and pre-compile pruned languages data
  const allStrings = await db.localizedString.findMany({
    take: 5000,
    orderBy: { id: 'asc' },
  });

  const bizPrefixes = [
    'prod_', 'cat_', 'spec_', 'biz_tr_', 'psl_', 'psv_', 'psg_', 
    'adv_', 'case_', 'step_', 'hero_slide_', 'slide_', 
    'hero_wholesale_', 'hero_project_', 'MAP_LOC_'
  ];

  // Filter out system UI strings
  const sysStrings = allStrings.filter((item: any) => {
    const itemId = item.id || '';
    const itemKey = item.key || '';
    return !bizPrefixes.some(prefix => 
      itemId.startsWith(prefix) || itemKey.startsWith(prefix)
    );
  });

  const getPrunedItem = (item: any, lang: string) => {
    if (!item) return null;
    let content = item.content || {};
    if (typeof content === 'string') {
      try {
        content = JSON.parse(content);
      } catch (e) {
        content = {};
      }
    }
    if (content && typeof content === 'object' && 'content' in content && typeof content.content === 'object' && !Array.isArray(content.content)) {
      content = content.content;
    }
    return {
      id: item.id,
      key: item.key,
      content: {
        [lang]: content[lang] || ""
      }
    };
  };

  const initialTranslations: Record<string, any[]> = {};
  const supportedLangs = ['en', 'zh', 'id', 'vi'];

  supportedLangs.forEach(lang => {
    // a. System translation items
    const sysTrans = sysStrings.map((item: any) => getPrunedItem(item, lang)).filter(Boolean);
    // b. Preloaded products translation items
    const prodTrans = initialProducts.flatMap((p: any) => [
      getPrunedItem(p.nameText, lang),
      getPrunedItem(p.descriptionText, lang)
    ]).filter(Boolean);
    // c. Categories translation items
    const catTrans = categories.flatMap((c: any) => [
      getPrunedItem(c.nameText, lang),
      getPrunedItem(c.descriptionText, lang)
    ]).filter(Boolean);

    initialTranslations[lang] = [...sysTrans, ...prodTrans, ...catTrans];
  });

  // Serialize models into plain JSON objects to prevent Next.js hydration serialization issues (e.g. Date objects)
  const serializedProducts = JSON.parse(JSON.stringify(initialProducts));
  const serializedCategories = JSON.parse(JSON.stringify(categories));
  const serializedTranslations = JSON.parse(JSON.stringify(initialTranslations));

  return (
    <ProductListClient
      initialProducts={serializedProducts}
      initialTotal={initialTotal}
      initialCategories={serializedCategories}
      initialLangSettings={initialLangSettings}
      initialTranslations={serializedTranslations}
    />
  );
}
