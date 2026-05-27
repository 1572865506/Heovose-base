import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import db from '@/lib/db';
import { getAssetUrl } from '@/lib/image-utils';

export async function generateMetadata(): Promise<Metadata> {
  try {
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

    let defaultLang = 'en';
    if (langSettings?.value) {
      try {
        const parsed = JSON.parse(langSettings.value);
        defaultLang = parsed.defaultLanguage || 'en';
      } catch (_) {}
    }

    const siteUrl = config.siteUrl ? config.siteUrl.replace(/\/$/, '') : 'https://www.heovose.com';

    // Helper to extract content
    const getContent = (entry: any, lang: string) => {
      const content = (entry?.content as any) || {};
      return content[lang] || entry?.[lang] || '';
    };

    const title = getContent(titleEntry, defaultLang) || 'Heovose Elevate | Technology Manufacturing';
    const description = getContent(descEntry, defaultLang) || 'High-end technology manufacturing solutions.';
    const keywords = getContent(keysEntry, defaultLang) || '';

    return {
      metadataBase: new URL(siteUrl),
      title,
      description,
      keywords,
      icons: {
        icon: config.favicon ? getAssetUrl(config.favicon) : '/favicon.ico',
      },
      alternates: {
        canonical: siteUrl,
      },
      openGraph: {
        title,
        description,
        url: siteUrl,
        siteName: title,
        type: 'website',
        locale: defaultLang === 'zh' ? 'zh_CN' : 'en_US',
        images: config.logoStandard ? [getAssetUrl(config.logoStandard)] : [],
      }
    };
  } catch (e) {
    console.error('[Metadata Error] Failed to fetch dynamic metadata:', e);
    return {
      title: 'Heovose Elevate',
      description: 'Technology Manufacturing',
    };
  }
}

import { AuthProvider } from '@/components/providers/session-provider';
import { SystemConfigProvider } from '@/components/providers/system-config-provider';
import { InquiryProvider } from '@/components/providers/InquiryProvider';
import { AdminThemeProvider } from '@/components/admin/AdminThemeProvider';

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  // 统一在服务端获取公开配置，不再通过 API 终点暴露给外部
  let publicSettings = {};
  try {
    const [siteConfig, navConfig, aboutConfig, serviceConfig, storageConfig, langConfig] = await Promise.all([
      db.setting.findUnique({ where: { id: 'site' } }),
      db.setting.findUnique({ where: { id: 'navigation' } }),
      db.setting.findUnique({ where: { id: 'about_page_content' } }),
      db.setting.findUnique({ where: { id: 'service_centers' } }),
      db.setting.findUnique({ where: { id: 'storage' } }),
      db.setting.findUnique({ where: { id: 'languages' } }),
    ]);

    const parseSafeJson = (str: string | null) => {
      if (!str) return null;
      try {
        const parsed = JSON.parse(str);
        if (parsed && typeof parsed === 'object') {
          // 彻底脱敏防泄漏
          const { secret, accessKey, secretKey, password, smtp_password, smtp_user, ...rest } = parsed;
          return rest;
        }
        return parsed;
      } catch {
        return str;
      }
    };

    publicSettings = {
      site: parseSafeJson(siteConfig?.value ?? null) || {},
      navigation: parseSafeJson(navConfig?.value ?? null) || {},
      about_page_content: parseSafeJson(aboutConfig?.value ?? null) || {},
      service_centers: parseSafeJson(serviceConfig?.value ?? null) || {},
      storage: parseSafeJson(storageConfig?.value ?? null) || { baseUrl: '/storage' },
      languages: parseSafeJson(langConfig?.value ?? null) || {
        supportedLanguages: [
          { code: 'en', name: 'English' },
          { code: 'zh', name: '简体中文' },
          { code: 'id', name: 'Indonesian' },
          { code: 'vi', name: 'Vietnamese' }
        ],
        defaultLanguage: 'zh'
      },
    };
  } catch (e) {
    console.error('[Layout Error] Failed to load public settings:', e);
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href={(publicSettings as any).site?.favicon ? getAssetUrl((publicSettings as any).site.favicon) : '/favicon.ico'} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__HEOVOSE_PUBLIC_SETTINGS__ = ${JSON.stringify(publicSettings).replace(/</g, '\\u003c')};`
          }}
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <SystemConfigProvider>
            <AdminThemeProvider>
              <InquiryProvider>
                {children}
              </InquiryProvider>
              <Toaster />
            </AdminThemeProvider>
          </SystemConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
