'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Locale } from '@/lib/translations';

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [isReady, setIsReady] = useState(false);
  const searchParams = useSearchParams();
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');

  useEffect(() => {
    const detectLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || 'en';

      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] as Locale : 'en';
      if (activeLangs.includes(browserLang)) return browserLang;
      
      return defaultLang;
    };
    
    setLocale(detectLocale());
    setIsReady(true);
  }, [searchParams, langSettings]);

  return { locale, setLocale, isReady };
}
