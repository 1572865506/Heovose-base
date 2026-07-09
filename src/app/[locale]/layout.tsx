import type { Metadata } from 'next';
import db from '@/lib/db';
import { getAssetUrl } from '@/lib/image-utils';
import { redirect } from 'next/navigation';

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  try {
    const { locale } = await params;
    const [siteConfig, titleEntry, descEntry, keysEntry, langSettings] = await Promise.all([
      db.setting.findUnique({ where: { id: 'site' } }),
      db.localizedString.findUnique({ where: { id: 'SITE_TITLE' } }),
      db.localizedString.findUnique({ where: { id: 'SITE_DESCRIPTION' } }),
      db.localizedString.findUnique({ where: { id: 'SITE_KEYWORDS' } }),
      db.setting.findUnique({ where: { id: 'languages' } }),
    ]);

    let config: any = {};
    if (siteConfig?.value) {
      try { config = JSON.parse(siteConfig.value); } catch (_) {}
    }

    // 从配置中或环境变量中获取真实的站点 URL，避免硬编码域名
    const envUrl = process.env.AUTH_URL || process.env.NEXTAUTH_URL || 'http://localhost:9002';
    const siteUrl = config.siteUrl ? config.siteUrl.replace(/\/$/, '') : envUrl.replace(/\/$/, '');

    const getContent = (entry: any, lang: string) => {
      const content = (entry?.content as any) || {};
      return content[lang] || entry?.[lang] || '';
    };

    const title = getContent(titleEntry, locale) || 'Heovose Elevate | Technology Manufacturing';
    const description = getContent(descEntry, locale) || 'High-end technology manufacturing solutions.';
    const keywords = getContent(keysEntry, locale) || '';

    // 动态生成多语言 alternate 链接
    const alternatesLanguages: Record<string, string> = {};
    if (langSettings?.value) {
      try {
        const parsed = JSON.parse(langSettings.value);
        if (Array.isArray(parsed.supportedLanguages)) {
          parsed.supportedLanguages.forEach((l: any) => {
            if (l.code) {
              alternatesLanguages[l.code] = `${siteUrl}/${l.code}`;
            }
          });
        }
      } catch (_) {}
    }

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
        languages: alternatesLanguages,
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

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 从数据库动态读取系统支持的语言列表与默认语言，完全不进行硬编码
  let supportedCodes: string[] = ['en', 'zh', 'id', 'vi', 'vn'];
  let defaultLang = 'en';
  try {
    const langSetting = await db.setting.findUnique({
      where: { id: 'languages' },
    });
    if (langSetting?.value) {
      const parsed = JSON.parse(langSetting.value);
      if (Array.isArray(parsed.supportedLanguages)) {
        supportedCodes = parsed.supportedLanguages.map((l: any) => l.code);
      }
      defaultLang = parsed.defaultLanguage || 'en';
    }
  } catch (e) {
    console.error('[LocaleLayout] Failed to load dynamic languages from DB:', e);
  }

  // 如果访问的路由不在后台启用的语言列表中，自动重定向到后台设置的默认语种
  if (!supportedCodes.includes(locale)) {
    return redirect(`/${defaultLang}`);
  }

  return <>{children}</>;
}
