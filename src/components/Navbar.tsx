
"use client";

import { useState, useEffect } from 'react';
import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "./LanguageToggle";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function Navbar({ locale, setLocale }: NavbarProps) {
  const t = translations[locale].nav;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: t.products, href: '#products' },
    { label: t.process, href: '#process' },
    { label: t.global, href: '#global' },
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
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="text-sm font-semibold text-primary/80 hover:text-accent transition-colors"
              >
                {item.label}
              </a>
            ))}
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
            {navItems.map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-bold text-primary"
              >
                {item.label}
              </a>
            ))}
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
