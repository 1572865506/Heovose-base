"use client";

import { useMemo, useState, useEffect } from "react";
import { Locale } from "@/lib/translations";
import { useLocalDoc } from "@/hooks/use-local-doc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageOption {
  code: string;
  label: string;
}

interface LanguageSettings {
  supportedLanguages: LanguageOption[];
}

interface LanguageToggleProps {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
  headerTheme?: 'light' | 'dark';
  isNavbarActive?: boolean;
}

export function LanguageToggle({ currentLocale, setLocale, headerTheme = 'dark', isNavbarActive }: LanguageToggleProps) {
  // 1. 实时获取云端语种配置
  const { data: langSettings, isLoading } = useLocalDoc<LanguageSettings>('settings', 'languages');

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. 处理动态语种列表
  const availableLanguages = useMemo(() => {
    if (langSettings?.supportedLanguages && langSettings.supportedLanguages.length > 0) {
      return langSettings.supportedLanguages;
    }
    // 默认保底语种
    return [
      { code: 'zh', label: '中文' },
      { code: 'en', label: 'English' },
    ];
  }, [langSettings]);

  const handleLocaleChange = (code: string) => {
    // 保存到本地缓存，以便下次访问自动判定
    localStorage.setItem('heovose-locale', code);
    // 同时设置 Cookie 以便中间件 (Server-side) 识别
    document.cookie = `NEXT_LOCALE=${code}; path=/; max-age=31536000`; // 1 year
    setLocale(code as Locale);
  };

  // 确保当前显示的 locale 也是合规的
  const displayLocale = useMemo(() => {
    const activeCodes = availableLanguages.map(l => l.code);
    if (activeCodes.includes(currentLocale)) return currentLocale;
    return (activeCodes[0] || 'en') as Locale;
  }, [currentLocale, availableLanguages]);

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "!rounded-full h-9 px-5 flex items-center gap-2 transition-all group shrink-0 border outline-none",
            (isNavbarActive || headerTheme === 'light')
              ? "bg-muted/30 hover:bg-muted/50 border-border/20 text-slate-800"
              : "bg-white/10 hover:bg-white/20 border-white/10 text-white"
          )}
        >
          {(!mounted || isLoading) ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin opacity-40" />
          ) : (
            <Languages className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
          )}
          <span className="text-[11px] font-bold tracking-widest uppercase min-w-[20px] text-center">
            {displayLocale === 'zh' ? 'ZH' : displayLocale.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="w-44 p-1 bg-white/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl z-[200]"
      >
        <div className="px-3 py-2 border-b border-border/10 mb-1">
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Select Language</span>
        </div>
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`
              flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 last:mb-0
              ${displayLocale === lang.code ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-muted text-muted-foreground'}
            `}
            onClick={() => handleLocaleChange(lang.code)}
          >
            <span className="text-xs">{lang.label}</span>
            {displayLocale === lang.code && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,91,153,0.4)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
