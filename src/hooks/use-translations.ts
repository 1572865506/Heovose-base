'use client';

import { useState, useEffect, useMemo } from 'react';
import { Locale } from '@/lib/translations';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';


export function useTranslations(locale: Locale) {
  const { data: remoteTranslations, isLoading: isTranslationsLoading } = useLocalCollection<any>(`localizedStrings?lang=${locale}`);
  const { data: langSettings, isLoading: isSettingsLoading } = useLocalDoc<any>('settings', 'languages');

  const defaultLanguage = langSettings?.defaultLanguage || 'zh';
  const isLoading = isTranslationsLoading || isSettingsLoading;

  const t = useMemo(() => {
    return (key: string | null | undefined) => {
      if (!key) return '';

      const normalizedKey = key.trim().toLowerCase();

      // Resolve translations synchronously on both Server and Client during first render
      let activeTranslations = remoteTranslations;
      if (!activeTranslations) {
        const isClient = typeof window !== 'undefined';
        const publicSettings = isClient 
          ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ 
          : (typeof global !== 'undefined' ? (global as any).__HEOVOSE_PUBLIC_SETTINGS__ : null);
        if (publicSettings?.translations) {
          activeTranslations = publicSettings.translations;
        }
      }

      // 1. Try remote Database translation (Case-insensitive match)
      const remote = Array.isArray(activeTranslations) 
        ? activeTranslations.find((item: any) => {
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

        // Direct matching for the target language, with cascading fallback
        if (content[locale] !== undefined && content[locale] !== null && content[locale] !== '') {
          val = content[locale];
        } else if (content['zh'] !== undefined && content['zh'] !== null && content['zh'] !== '') {
          val = content['zh'];
        } else if (content['en'] !== undefined && content['en'] !== null && content['en'] !== '') {
          val = content['en'];
        } else {
          val = '';
        }
      }

      // Calculate translation result
      // Calculate translation result
      let finalResult = '';
      if (val !== undefined) {
        finalResult = val;
      } else if (isLoading && !activeTranslations) {
        finalResult = '';
      } else {
        const isSystemId = /^[A-Z0-9_]{5,40}$/i.test(key) || /^(psl|psg|psv|prod|cat|hero|slide|case|step|bento)_/i.test(key);
        if (isSystemId) {
          finalResult = '';
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
  }, [remoteTranslations, locale, defaultLanguage, isLoading]);

  return { t, isLoading, defaultLanguage, count: Array.isArray(remoteTranslations) ? remoteTranslations.length : 0 };
}
