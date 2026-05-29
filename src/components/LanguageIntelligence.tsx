'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useLocalDoc } from '@/hooks/use-local-doc';

/**
 * LanguageIntelligence Component
 * 
 * Automatically detects browser language and suggests a switch if it matches 
 * a supported locale and differs from the current language.
 * 
 * Reuses existing 'languages' settings from the database.
 */
export function LanguageIntelligence() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const [hasPrompted, setHasPrompted] = useState(false);

  useEffect(() => {
    // DISABLE for Admin panel - Backend should remain in a single language
    if (pathname?.startsWith('/admin')) return;
    // Wait for settings to load and ensure we only prompt once per session/mount
    if (!langSettings || hasPrompted) return;

    const getActiveLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi', 'vn'];
      const defaultLang = langSettings?.defaultLanguage || 'en';

      // Use the same priority as the page detection
      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam;
      
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      const browserLang = typeof navigator !== 'undefined' 
        ? (navigator.languages && navigator.languages.length > 0 
           ? navigator.languages[0].split('-')[0].toLowerCase() 
           : navigator.language.split('-')[0].toLowerCase())
        : 'en';
      if (activeLangs.includes(browserLang)) return browserLang;
      
      return defaultLang;
    };

    const currentActiveLocale = getActiveLocale();
    const browserLang = navigator.language.split('-')[0].toLowerCase();
    const supportedLocales = langSettings.supportedLanguages || [];
    const supportedCodes = supportedLocales.map((l: any) => l.code.toLowerCase());
    
    // 2. Check if browser language is supported by our system
    const isSupported = supportedCodes.includes(browserLang);
    
    // 3. If supported and DIFFERENT from the currently active locale, show suggestion
    // Crucially: if currentActiveLocale already matched browserLang via auto-detection,
    // this check will correctly be false and prevent the redundant prompt.
    if (isSupported && browserLang !== currentActiveLocale.toLowerCase()) {
      // Check for 'cooldown' or dismissal in localStorage
      const dismissalKey = `dismiss_lang_prompt_${browserLang}`;
      const isDismissed = localStorage.getItem(dismissalKey);
      
      // If user previously dismissed this specific language suggestion, don't show it again
      if (isDismissed) return;

      const targetLabel = supportedLocales.find((l: any) => l.code.toLowerCase() === browserLang)?.label || browserLang;

      // Define translation table for language suggestion prompt
      const localizedPrompts: Record<string, { title: string; description: string; action: string }> = {
        zh: {
          title: "语种探测 / Language Detected",
          description: `检测到您的系统环境为 ${targetLabel}，是否切换？`,
          action: "切换",
        },
        en: {
          title: "Language Detected",
          description: `We detected your system language is ${targetLabel}. Switch to ${targetLabel}?`,
          action: "Switch",
        },
        id: {
          title: "Bahasa Terdeteksi",
          description: `Bahasa sistem Anda terdeteksi sebagai ${targetLabel}. Ubah ke ${targetLabel}?`,
          action: "Ubah",
        },
        vi: {
          title: "Phát hiện ngôn ngữ",
          description: `Phát hiện ngôn ngữ hệ thống của bạn là ${targetLabel}. Chuyển sang ${targetLabel}?`,
          action: "Chuyển",
        },
        vn: {
          title: "Phát hiện ngôn ngữ",
          description: `Phát hiện ngôn ngữ hệ thống của bạn là ${targetLabel}. Chuyển sang ${targetLabel}?`,
          action: "Chuyển",
        }
      };

      const prompt = localizedPrompts[browserLang] || localizedPrompts.en;

      // Use a non-intrusive toast notification for the suggestion
      toast({
        title: prompt.title,
        description: prompt.description,
        action: (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-[10px] font-bold h-8 px-3 rounded-lg"
              onClick={() => {
                // Update URL and refresh to apply changes
                const url = new URL(window.location.href);
                url.searchParams.set('lang', browserLang);
                // Also set cookie and localStorage to persist the choice
                localStorage.setItem('heovose-locale', browserLang);
                document.cookie = `NEXT_LOCALE=${browserLang}; path=/; max-age=${60 * 60 * 24 * 30}`;
                window.location.href = url.toString();
              }}
            >
              {prompt.action}
            </Button>
            <Button 
              size="sm" 
              variant="ghost"
              className="h-8 w-8 p-0 rounded-lg"
              onClick={() => {
                // Save dismissal to localStorage to respect user choice
                localStorage.setItem(dismissalKey, 'true');
                setHasPrompted(true);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ),
        duration: 8000,
      });
      
      setHasPrompted(true);
    }
  }, [langSettings, searchParams, hasPrompted]);

  return null; // This is a logic-only component
}
