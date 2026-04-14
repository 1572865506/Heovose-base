
"use client";

import { Button } from "@/components/ui/button";
import { Locale } from "@/lib/translations";

interface LanguageToggleProps {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
}

export function LanguageToggle({ currentLocale, setLocale }: LanguageToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/40">
      <Button
        variant={currentLocale === 'en' ? 'secondary' : 'ghost'}
        size="sm"
        className={`rounded-full h-8 px-3 text-xs font-semibold ${currentLocale === 'en' ? 'shadow-sm bg-background' : ''}`}
        onClick={() => setLocale('en')}
      >
        EN
      </Button>
      <Button
        variant={currentLocale === 'zh' ? 'secondary' : 'ghost'}
        size="sm"
        className={`rounded-full h-8 px-3 text-xs font-semibold ${currentLocale === 'zh' ? 'shadow-sm bg-background' : ''}`}
        onClick={() => setLocale('zh')}
      >
        中文
      </Button>
    </div>
  );
}
