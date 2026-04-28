'use client';

import { useMemo } from 'react';
import { Locale, translations as fallbackLibrary } from '@/lib/translations';
import { useLocalCollection } from '@/hooks/use-local-collection';

export function useTranslations(locale: Locale) {
  const { data: remoteTranslations } = useLocalCollection<any>('localizedStrings');

  const t = useMemo(() => {
    // Helper to get nested value from the fallback library
    const getNested = (obj: any, path: string[]) => {
      return path.reduce((acc, part) => acc && acc[part], obj);
    };

    return (key: string) => {
      // 1. Try remote Database translation
      const remote = remoteTranslations?.find((item: any) => item.id === key);
      if (remote) {
        return remote[locale] || remote['en'] || remote['zh'] || key;
      }

      // 2. Fallback to local hardcoded library
      // Convert flat key (nav_wholesale) to nested path (nav.wholesale)
      const path = key.split('_');
      const local = getNested((fallbackLibrary as any)[locale], path);
      
      if (local && typeof local === 'string') return local;

      return key;
    };
  }, [remoteTranslations, locale]);

  return { t };
}
