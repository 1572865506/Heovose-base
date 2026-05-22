'use client';

import { useMemo } from 'react';
import { Locale } from '@/lib/translations';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';

const pendingRegistrations = new Set<string>();
let registrationTimeout: NodeJS.Timeout | null = null;

function registerKey(key: string) {
  pendingRegistrations.add(key);
  if (registrationTimeout) clearTimeout(registrationTimeout);
  registrationTimeout = setTimeout(async () => {
    const keys = Array.from(pendingRegistrations);
    pendingRegistrations.clear();
    if (keys.length === 0) return;
    
    try {
      await fetch('/api/localizedStrings/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keys }),
      });
    } catch (err) {
      console.error('[Translation Autoregister Error]', err);
    }
  }, 1500);
}

export function useTranslations(locale: Locale) {
  const { data: remoteTranslations, isLoading: isTranslationsLoading } = useLocalCollection<any>(`localizedStrings?lang=${locale}`);
  const { data: langSettings, isLoading: isSettingsLoading } = useLocalDoc<any>('settings', 'languages');

  const defaultLanguage = langSettings?.defaultLanguage || 'zh';
  const isLoading = isTranslationsLoading || isSettingsLoading;

  const t = useMemo(() => {
    return (key: string | null | undefined) => {
      if (!key) return '';
      
      const isSystemId = /^[A-Z0-9_]{5,40}$/i.test(key) || /^(psl|psg|psv|prod|cat|hero|slide|case|step)_/i.test(key);

      // 1. Try remote Database translation (Case-insensitive match)
      const normalizedKey = key.trim().toLowerCase();
      const remote = Array.isArray(remoteTranslations) 
        ? remoteTranslations.find((item: any) => {
            const itemId = (item.id || '').toString().trim().toLowerCase();
            const itemKey = (item.key || '').toString().trim().toLowerCase();
            return itemId === normalizedKey || itemKey === normalizedKey;
          })
        : null;

      
      let val: string | undefined = undefined;
      if (remote) {
        let content = (remote.content as any) || {};
        
        // Defensively extract nested translation content if present
        if (content && typeof content === 'object' && 'content' in content && typeof content.content === 'object' && !Array.isArray(content.content)) {
          content = content.content;
        }

        // Direct matching for the target language, no cascading fallback
        if (content[locale] !== undefined && content[locale] !== null) {
          val = content[locale];
        } else {
          val = '';
        }
      }

      // Calculate translation result
      let finalResult = '';
      if (val !== undefined) {
        finalResult = val;
      } else if (isLoading) {
        finalResult = '';
      } else {
        const isSystemId = /^[A-Z0-9_]{5,40}$/i.test(key) || /^(psl|psg|psv|prod|cat|hero|slide|case|step)_/i.test(key);
        if (isSystemId) {
          finalResult = '';
          // Discovered unregistered system ID entry, trigger auto-registration
          registerKey(key);
        } else {
          // If not a system ID, but matches typical key naming patterns, treat it as a machine key and return empty
          const isMachineKey = /^[a-zA-Z0-9_.-]+$/.test(key);
          if (isMachineKey) {
            finalResult = '';
          } else {
            finalResult = typeof key === 'string' ? key : '';
          }
        }
      }


      return finalResult;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteTranslations, locale, defaultLanguage, isTranslationsLoading, isSettingsLoading, isLoading]);

  return { t, isLoading, defaultLanguage, count: Array.isArray(remoteTranslations) ? remoteTranslations.length : 0 };
}
