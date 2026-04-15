
"use client";

import { useState, useEffect } from 'react';
import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "./LanguageToggle";
import { Menu, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function Navbar({ locale, setLocale }: NavbarProps) {
  const t = translations[locale].nav;
  const sub = translations[locale].nav_sub;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const wholesaleItems = [
    { label: sub.aio, href: '#products' },
    { label: sub.minipc, href: '#products' },
    { label: sub.monitor, href: '#products' },
    { label: sub.kiosk, href: '#products' },
  ];

  const projectItems = [
    { label: sub.design, href: '#process' },
    { label: sub.supply, href: '#process' },
    { label: sub.logistics, href: '#process' },
    { label: sub.quality, href: '#process' },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 glass-morphism' : 'py-8 bg-transparent'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">H</div>
          <span className="text-2xl font-headline font-bold tracking-tighter text-primary">HEOVOSE</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          <div className="flex items-center gap-8">
            {/* Wholesale Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-accent transition-colors outline-none">
                {t.wholesale} <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass-morphism border-white/20">
                {wholesaleItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a href={item.href} className="w-full cursor-pointer text-primary/70 hover:text-primary hover:bg-white/10">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Projects Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-accent transition-colors outline-none">
                {t.projects} <ChevronDown className="h-3 w-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56 glass-morphism border-white/20">
                {projectItems.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a href={item.href} className="w-full cursor-pointer text-primary/70 hover:text-primary hover:bg-white/10">
                      {item.label}
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Cases Link */}
            <a 
              href="#cases" 
              className="text-sm font-semibold text-primary/80 hover:text-accent transition-colors"
            >
              {t.cases}
            </a>
          </div>

          <div className="flex items-center gap-4 border-l border-border/40 pl-8">
            <LanguageToggle currentLocale={locale} setLocale={setLocale} />
            <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90">
              {t.contact}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          className="lg:hidden p-2 text-primary" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-border p-6 shadow-2xl animate-in slide-in-from-top duration-300">
          <div className="flex flex-col gap-6">
            <div className="space-y-4">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.wholesale}</p>
               {wholesaleItems.map((item) => (
                 <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-primary pl-4">{item.label}</a>
               ))}
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.projects}</p>
               {projectItems.map((item) => (
                 <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="block text-lg font-bold text-primary pl-4">{item.label}</a>
               ))}
            </div>
            <a href="#cases" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{t.cases}</a>
            <div className="pt-6 border-t border-border flex flex-col gap-6">
              <LanguageToggle currentLocale={locale} setLocale={setLocale} />
              <Button className="w-full rounded-xl bg-primary">{t.contact}</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
