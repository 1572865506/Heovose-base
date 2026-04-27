
"use client";

import { useMemo } from "react";
import { Locale } from "@/lib/translations";
import { useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages, ChevronDown, Loader2 } from "lucide-react";

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
}

export function LanguageToggle({ currentLocale, setLocale }: LanguageToggleProps) {
  const firestore = useFirestore();
  
  // 1. 实时获取云端语种配置
  const langConfigRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'languages') : null, 
    [firestore]
  );
  const { data: langSettings, isLoading } = useDoc<LanguageSettings>(langConfigRef);

  // 2. 处理动态语种列表
  const availableLanguages = useMemo(() => {
    if (langSettings?.supportedLanguages && langSettings.supportedLanguages.length > 0) {
      return langSettings.supportedLanguages;
    }
    return [
      { code: 'zh', label: '中文' },
      { code: 'en', label: 'English' },
    ];
  }, [langSettings]);

  const handleLocaleChange = (code: string) => {
    // 保存到本地缓存，以便下次访问自动判定
    localStorage.setItem('heovose-locale', code);
    setLocale(code as Locale);
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="!rounded-full h-9 px-5 flex items-center gap-2 bg-muted/30 hover:bg-muted/50 border border-border/20 transition-all group shrink-0"
        >
          {isLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin opacity-40" />
          ) : (
            <Languages className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
          )}
          <span className="text-[11px] font-bold tracking-widest uppercase min-w-[20px] text-center">
            {currentLocale === 'zh' ? 'ZH' : currentLocale.toUpperCase()}
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
              ${currentLocale === lang.code ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-muted text-muted-foreground'}
            `}
            onClick={() => handleLocaleChange(lang.code)}
          >
            <div className="flex flex-col">
              <span className="text-xs">{lang.label}</span>
              <span className="text-[8px] opacity-40 font-mono uppercase">{lang.code}</span>
            </div>
            {currentLocale === lang.code && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(0,91,153,0.4)]" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
