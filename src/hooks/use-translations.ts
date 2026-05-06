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
    // Helper to get nested value from the fallback library
    const getNested = (obj: any, path: string[]) => {
      return path.reduce((acc, part) => acc && acc[part], obj);
    };

    return (key: string | null | undefined) => {
      if (!key) return '';
      
      let result: string = key;

      // 1. Try remote Database translation
      const normalizedKey = key.trim().toLowerCase();
      const remote = Array.isArray(remoteTranslations) 
        ? remoteTranslations.find((item: any) => {
            const itemId = (item.id || '').toString().trim().toLowerCase();
            return itemId === normalizedKey;
          })
        : null;
      
      if (remote) {
        const content = (remote.content as any) || {};
        const val = content[locale] || content[defaultLanguage] || content['en'] || content['zh'];
        
        if (val && typeof val === 'string' && val.trim() !== '') {
          result = val;
        } else {
          // Try legacy fields
          const legacyLangs = ['zh', 'en', 'id', 'idn', 'vi'];
          const legacyVal = legacyLangs.includes(locale) ? (remote as any)[locale] : null;
          if (legacyVal && typeof legacyVal === 'string' && legacyVal.trim() !== '') {
            result = legacyVal;
          } else if ((remote as any).en) {
            result = (remote as any).en;
          } else if ((remote as any).zh) {
            result = (remote as any).zh;
          }
        }
      }

      // 2. Fallback to local hardcoded library (if still looks like a key)
      if (result === key) {
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
      }

      // Final safeguard: If it still looks like a raw database ID (starts with common prefixes or contains long numeric IDs), return empty string
      const isRawId = /^(psl|psg|psv|prod|cat|hero|slide)_/i.test(result) || /_[0-9]{10,}/.test(result);
      if (isRawId) return '';

      return result;
    };
  }, [remoteTranslations, locale, defaultLanguage]);

  return { t, isLoading, defaultLanguage, count: Array.isArray(remoteTranslations) ? remoteTranslations.length : 0 };
}
