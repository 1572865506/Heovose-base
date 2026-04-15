
"use client";

import { Locale } from "@/lib/translations";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Languages, ChevronDown } from "lucide-react";

interface LanguageToggleProps {
  currentLocale: Locale;
  setLocale: (locale: Locale) => void;
}

export function LanguageToggle({ currentLocale, setLocale }: LanguageToggleProps) {
  const languages = [
    { code: 'zh', label: '中文' },
    { code: 'en', label: 'English' },
    { code: 'id', label: 'Indonesia' },
    { code: 'vi', label: 'Tiếng Việt' },
  ] as const;

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="rounded-full h-9 px-4 flex items-center gap-2 bg-muted/30 hover:bg-muted/50 border border-border/20 transition-all group shrink-0"
        >
          <Languages className="h-4 w-4 text-primary/60 group-hover:text-primary transition-colors" />
          <span className="text-[11px] font-bold tracking-widest uppercase min-w-[20px] text-center">
            {currentLocale === 'zh' ? 'ZH' : currentLocale.toUpperCase()}
          </span>
          <ChevronDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        sideOffset={8}
        className="w-40 p-1 bg-white/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-xl z-[200]"
      >
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            className={`
              flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors
              ${currentLocale === lang.code ? 'bg-primary/5 text-primary font-bold' : 'hover:bg-muted text-muted-foreground'}
            `}
            onClick={() => setLocale(lang.code)}
          >
            <span className="text-xs">{lang.label}</span>
            {currentLocale === lang.code && (
              <div className="w-1.5 h-1.5 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
