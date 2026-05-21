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
        const content = (remote.content as any) || {};
        // 级联降级策略：目标语种 -> 默认语种 -> 任意第一个非空翻译 -> 空字符串
        if (content[locale] !== undefined && content[locale] !== null && content[locale] !== '') {
          val = content[locale];
        } else if (content[defaultLanguage] !== undefined && content[defaultLanguage] !== null && content[defaultLanguage] !== '') {
          val = content[defaultLanguage];
        } else {
          const availableLang = Object.keys(content).find(
            (k) => content[k] !== undefined && content[k] !== null && content[k] !== ''
          );
          if (availableLang) {
            val = content[availableLang];
          } else {
            val = '';
          }
        }
      }

      // Calculate translation result
      let finalResult = '';
      if (val !== undefined) {
        finalResult = val;
      } else if (isLoading) {
        finalResult = '';
      } else if (isSystemId) {
        finalResult = '';
        // 发现未注册的系统 ID 词条，触发后台自动注册
        registerKey(key);
      } else {
        finalResult = typeof key === 'string' ? key : '';
      }


      return finalResult;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remoteTranslations, locale, defaultLanguage, isTranslationsLoading, isSettingsLoading, isLoading]);

  return { t, isLoading, defaultLanguage, count: Array.isArray(remoteTranslations) ? remoteTranslations.length : 0 };
}
