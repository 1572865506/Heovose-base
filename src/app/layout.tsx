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

    const config = (siteConfig?.value as any) || {};
    const defaultLang = (langSettings?.value as any)?.defaultLanguage || 'en';
    
    // Helper to extract content
    const getContent = (entry: any, lang: string) => {
      const content = (entry?.content as any) || {};
      return content[lang] || entry?.[lang] || '';
    };

    const title = getContent(titleEntry, defaultLang) || 'Heovose Elevate | Technology Manufacturing';
    const description = getContent(descEntry, defaultLang) || 'High-end technology manufacturing solutions.';
    const keywords = getContent(keysEntry, defaultLang) || '';

    return {
      title,
      description,
      keywords,
      icons: {
        icon: config.favicon ? getAssetUrl(config.favicon) : '/favicon.ico',
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
import { LanguageIntelligence } from '@/components/LanguageIntelligence';
import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { InquiryProvider } from '@/components/providers/InquiryProvider';
import CookieConsent from '@/components/CookieConsent';
import SmoothScrollProvider from '@/components/providers/SmoothScrollProvider';
import { Suspense } from 'react';

import { cookies } from "next/headers";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://picsum.photos" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <AuthProvider>
          <SystemConfigProvider>
            <Suspense fallback={null}>
              <LanguageIntelligence />
            </Suspense>
            <InquiryProvider>
              <AnalyticsTracker />
              {children}
            </InquiryProvider>
            <CookieConsent />
            <Toaster />
          </SystemConfigProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
