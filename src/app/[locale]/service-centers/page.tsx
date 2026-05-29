import ServiceCentersContent from "@/app/service-centers/ServiceCentersContent";
import { Locale } from "@/lib/translations";
import db from '@/lib/db';

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
    console.error('[ISR generateStaticParams ServiceCenters] Failed to load supported languages:', e);
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

export default async function ServiceCentersPage({ params }: PageProps) {
  const { locale } = await params;
  return <ServiceCentersContent initialLocale={locale as Locale} />;
}
