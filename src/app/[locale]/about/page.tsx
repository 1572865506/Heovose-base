import AboutContent from "@/app/about/AboutContent";
import { Locale } from "@/lib/translations";
import db from '@/lib/db';
import { Suspense } from 'react';

export async function generateStaticParams() {
  try {
    const langSetting = await db.setting.findUnique({ where: { id: 'languages' } });
    if (langSetting?.value) {
      const parsed = JSON.parse(langSetting.value);
      if (Array.isArray(parsed.supportedLanguages)) {
        return parsed.supportedLanguages.map((l: any) => ({ locale: l.code }));
      }
    }
  } catch (e) {
    console.error('[ISR generateStaticParams About] Failed to load supported languages:', e);
  }
  return [
    { locale: 'en' },
    { locale: 'zh' },
    { locale: 'id' },
    { locale: 'vi' }
  ];
}

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function AboutPage({ params }: PageProps) {
  const { locale } = await params;
  return (
    <Suspense fallback={null}>
      <AboutContent initialLocale={locale as Locale} />
    </Suspense>
  );
}
