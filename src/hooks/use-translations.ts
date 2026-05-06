'use client';

import { useMemo } from 'react';
import { Locale, translations as fallbackLibrary } from '@/lib/translations';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';

export function useTranslations(locale: Locale) {
  const { data: remoteTranslations, isLoading: isTranslationsLoading } = useLocalCollection<any>('localizedStrings');
  const { data: langSettings, isLoading: isSettingsLoading } = useLocalDoc<any>('settings', 'languages');

  const defaultLanguage = langSettings?.defaultLanguage || 'zh';
  const isLoading = isTranslationsLoading || isSettingsLoading;

  const t = useMemo(() => {
    // console.log('[useTranslations] Re-calculating with count:', Array.isArray(remoteTranslations) ? remoteTranslations.length : 0);
    
    // Helper to get nested value from the fallback library
    const getNested = (obj: any, path: string[]) => {
      return path.reduce((acc, part) => acc && acc[part], obj);
    };

    return (key: string | null | undefined) => {
      if (!key) return '';
      
      // If we are still loading, you might want to wait, but usually we return the fallback
      let result: string = key;

      // 1. Try remote Database translation (Case-insensitive match)
      const normalizedKey = key.trim().toLowerCase();
      const remote = Array.isArray(remoteTranslations) 
        ? remoteTranslations.find((item: any) => {
            const itemId = (item.id || '').toString().trim().toLowerCase();
            const itemKey = (item.key || '').toString().trim().toLowerCase();
            return itemId === normalizedKey || itemKey === normalizedKey;
          })
        : null;
      
      if (remote) {
        const content = (remote.content as any) || {};
        const val = content[locale] || content[defaultLanguage] || content['en'] || content['zh'];
        
        if (val && typeof val === 'string' && val.trim() !== '') {
          return val;
        }
      }

      // 2. Fallback to local hardcoded library
      const library = (fallbackLibrary as any)[locale] || (fallbackLibrary as any)[defaultLanguage] || (fallbackLibrary as any)['en'];
      if (library[key] && typeof library[key] === 'string') {
        result = library[key];
      } else {
        const path = key.split('_');
        const localNested = getNested(library, path);
        if (localNested && typeof localNested === 'string') {
          result = localNested;
        }
      }

      // Final safeguard: Avoid showing ugly system IDs
      if (result === key) {
        const isSystemId = /^[A-Z0-9_]{5,30}$/.test(result) || /^(psl|psg|psv|prod|cat|hero|slide)_/i.test(result);
        if (isSystemId) return '';
      }

      return result;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteTranslations, locale, defaultLanguage, isTranslationsLoading]);

  return { t, isLoading, defaultLanguage, count: Array.isArray(remoteTranslations) ? remoteTranslations.length : 0 };
}
