import type { Metadata } from 'next';
import db from '@/lib/db';
import { getAssetUrl } from '@/lib/image-utils';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  try {
    const { locale } = await params;
    const [siteConfig, titleEntry, descEntry, keysEntry] = await Promise.all([
      db.setting.findUnique({ where: { id: 'site' } }),
      db.localizedString.findUnique({ where: { id: 'SITE_TITLE' } }),
      db.localizedString.findUnique({ where: { id: 'SITE_DESCRIPTION' } }),
      db.localizedString.findUnique({ where: { id: 'SITE_KEYWORDS' } }),
    ]);

    let config: any = {};
    if (siteConfig?.value) {
      try { config = JSON.parse(siteConfig.value); } catch (_) {}
    }

    const siteUrl = config.siteUrl ? config.siteUrl.replace(/\/$/, '') : 'https://www.heovose.com';

    const getContent = (entry: any, lang: string) => {
      const content = (entry?.content as any) || {};
      return content[lang] || entry?.[lang] || '';
    };

    const title = getContent(titleEntry, locale) || 'Heovose Elevate | Technology Manufacturing';
    const description = getContent(descEntry, locale) || 'High-end technology manufacturing solutions.';
    const keywords = getContent(keysEntry, locale) || '';

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords,
      icons: {
        icon: config.favicon ? getAssetUrl(config.favicon) : '/favicon.ico',
      },
      alternates: {
        canonical: `${siteUrl}/${locale}`,
        languages: {
          'en': `${siteUrl}/en`,
          'zh': `${siteUrl}/zh`,
          'id': `${siteUrl}/id`,
          'vi': `${siteUrl}/vi`,
        }
      },
      openGraph: {
        title,
        description,
        url: `${siteUrl}/${locale}`,
        siteName: title,
        type: 'website',
        locale: locale === 'zh' ? 'zh_CN' : `${locale}_US`,
        images: config.logoStandard ? [getAssetUrl(config.logoStandard)] : [],
      }
    };
  } catch (e) {
    console.error('[Locale Layout Metadata Error] Failed to fetch dynamic metadata:', e);
    return {
      title: 'Heovose Elevate',
      description: 'Technology Manufacturing',
    };
  }
}

export default async function LocaleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
