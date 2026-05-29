import { Suspense } from "react";
import db from "@/lib/db";
import { prepareSettingDataForGet } from "@/lib/settings-occ";
import { Locale } from "@/lib/translations";
import HomeContent from "./HomeContent";

// ISR Config: Revalidate every 60 seconds
export const revalidate = 60;
export const dynamicParams = true;

interface PageProps {
  params: Promise<{ locale: string }>;
}

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
    console.error('[ISR generateStaticParams] Failed to load supported languages, using default fallback:', e);
  }
  return [
    { locale: 'en' },
    { locale: 'zh' },
    { locale: 'id' },
    { locale: 'vi' }
  ];
}

export default async function Home({ params }: PageProps) {
  const { locale } = await params;
  const targetLocale = locale as Locale;

  // Pre-fetch all necessary home configurations & translation dictionary on the server
  let initialTranslations: any[] = [];
  let heroConfig: any = null;
  let videoConfig: any = null;
  let mapConfig: any = null;
  let langSettings: any = null;

  try {
    const [rawStrings, rawHero, rawVideo, rawMap, rawLang] = await Promise.all([
      db.localizedString.findMany({ orderBy: { id: 'asc' }, take: 5000 }),
      db.homepageContent.findUnique({ where: { id: 'hero' } }),
      db.homepageContent.findUnique({ where: { id: 'video' } }),
      db.homepageContent.findUnique({ where: { id: 'map' }, include: { locations: true } }),
      db.setting.findUnique({ where: { id: 'languages' } }),
    ]);

    // Filter translation strings to prune payload (identical to API filter logic)
    const bizPrefixes = [
      'prod_', 'cat_', 'spec_', 'biz_tr_', 'psl_', 'psv_', 'psg_', 
      'adv_'
    ];

    const filteredStrings = rawStrings.filter((item: any) => {
      const itemId = item.id || '';
      const itemKey = item.key || '';
      return !bizPrefixes.some(prefix => 
        itemId.startsWith(prefix) || itemKey.startsWith(prefix)
      );
    });

    initialTranslations = filteredStrings.map((item: any) => {
      let content = (item.content as any) || {};
      if (content && typeof content === 'object' && 'content' in content && typeof content.content === 'object' && !Array.isArray(content.content)) {
        content = content.content;
      }
      return {
        id: item.id,
        key: item.key,
        content: {
          [targetLocale]: content[targetLocale] || ""
        }
      };
    });

    heroConfig = rawHero;
    videoConfig = rawVideo;
    mapConfig = rawMap;
    langSettings = prepareSettingDataForGet(rawLang?.value ?? null);
  } catch (e) {
    console.error('[ISR Page] Failed to pre-fetch homepage configs from DB:', e);
  }

  return (
    <Suspense fallback={<main className="relative min-h-screen" />}>
      <HomeContent 
        initialLocale={targetLocale}
        initialTranslations={initialTranslations}
        initialConfigs={{
          hero: heroConfig,
          video: videoConfig,
          map: mapConfig,
          languages: langSettings
        }}
      />
    </Suspense>
  );
}
