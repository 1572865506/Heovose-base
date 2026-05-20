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

      // 1. 优先 URL 参数
      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      // 2. 其次检查本地存储
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      // 3. 检查浏览器语言
      const browserLang = typeof navigator !== 'undefined' 
        ? (navigator.languages && navigator.languages.length > 0 
           ? navigator.languages[0].split('-')[0].toLowerCase() 
           : navigator.language.split('-')[0].toLowerCase()) as Locale
        : 'en';
      if (activeLangs.includes(browserLang)) return browserLang;
      
      return defaultLang;
    };
    
    setLocale(detectLocale());
    setIsReady(true);
  }, [searchParams, langSettings]);

  return { locale, setLocale, isReady };
}
