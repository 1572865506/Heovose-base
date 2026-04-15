
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "./LanguageToggle";
import { Menu, X, ChevronDown, Monitor, Cpu, Tv, Layout, PenTool, Truck, Globe, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface NavbarProps {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export function Navbar({ locale, setLocale }: NavbarProps) {
  const t = translations[locale].nav;
  const sub = translations[locale].nav_sub;
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Hover states for Mega Menus
  const [openWholesale, setOpenWholesale] = useState(false);
  const [openProjects, setOpenProjects] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const wholesaleItems = [
    { label: sub.aio, desc: sub.aio_desc, icon: Monitor, href: '#products' },
    { label: sub.minipc, desc: sub.minipc_desc, icon: Cpu, href: '#products' },
    { label: sub.monitor, desc: sub.monitor_desc, icon: Tv, href: '#products' },
    { label: sub.kiosk, desc: sub.kiosk_desc, icon: Layout, href: '#products' },
  ];

  const projectItems = [
    { label: sub.design, desc: sub.design_desc, icon: PenTool, href: '#process' },
    { label: sub.supply, desc: sub.supply_desc, icon: Truck, href: '#process' },
    { label: sub.logistics, desc: sub.logistics_desc, icon: Globe, href: '#process' },
    { label: sub.quality, desc: sub.quality_desc, icon: ShieldCheck, href: '#process' },
  ];

  const MegaMenuContent = ({ items, onMouseEnter, onMouseLeave }: { items: any[], onMouseEnter: () => void, onMouseLeave: () => void }) => (
    <div 
      className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
        <div className="col-span-full border-b border-border pb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {locale === 'en' ? 'Portfolio' : '产品组合'}
          </span>
        </div>
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild className="p-0 bg-transparent hover:bg-transparent">
            <a 
              href={item.href} 
              className="flex gap-4 group cursor-pointer focus:bg-transparent"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-primary mb-1 group-hover:translate-x-1 transition-transform">{item.label}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
              </div>
            </a>
          </DropdownMenuItem>
        ))}
      </div>
      
      {/* Featured Card */}
      <div className="lg:w-80 shrink-0">
        <div className="bg-muted/30 rounded-3xl p-6 border border-border/50 h-full flex flex-col">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
            {sub.featured}
          </span>
          <div className="relative aspect-video rounded-2xl overflow-hidden mb-6 shadow-lg">
            <Image 
              src="https://picsum.photos/seed/nav-featured/400/225" 
              alt="Featured"
              fill
              className="object-cover"
            />
          </div>
          <h4 className="text-sm font-bold text-primary mb-2 leading-tight">
            {sub.catalog_title}
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            {sub.catalog_desc}
          </p>
          <Button variant="ghost" size="sm" className="mt-auto w-fit text-primary font-bold text-[10px] p-0 hover:bg-transparent hover:translate-x-1 transition-all">
            {sub.download} <ArrowRight className="ml-2 h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
      isScrolled ? "py-4 glass-morphism border-b border-white/20" : "py-8 bg-transparent"
    )}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">H</div>
          <span className="text-2xl font-headline font-bold tracking-tighter text-primary">HEOVOSE</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-12">
          <div className="flex items-center gap-8">
            
            {/* Wholesale Mega Menu */}
            <div 
              onMouseEnter={() => setOpenWholesale(true)} 
              onMouseLeave={() => setOpenWholesale(false)}
              className="relative flex items-center h-full"
            >
              <DropdownMenu open={openWholesale} onOpenChange={setOpenWholesale} modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-accent transition-colors outline-none focus:outline-none focus:ring-0 py-2">
                  {t.wholesale} <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", openWholesale && "rotate-180")} />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={0}
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none animate-in fade-in slide-in-from-top-1 duration-300 bg-transparent p-0"
                  onMouseEnter={() => setOpenWholesale(true)}
                  onMouseLeave={() => setOpenWholesale(false)}
                >
                  <div className={cn(
                    "w-full transition-all duration-300",
                    isScrolled ? "pt-4" : "pt-8"
                  )}>
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl border-b border-border">
                      <MegaMenuContent 
                        items={wholesaleItems} 
                        onMouseEnter={() => setOpenWholesale(true)}
                        onMouseLeave={() => setOpenWholesale(false)}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Projects Mega Menu */}
            <div 
              onMouseEnter={() => setOpenProjects(true)} 
              onMouseLeave={() => setOpenProjects(false)}
              className="relative flex items-center h-full"
            >
              <DropdownMenu open={openProjects} onOpenChange={setOpenProjects} modal={false}>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-accent transition-colors outline-none focus:outline-none focus:ring-0 py-2">
                  {t.projects} <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", openProjects && "rotate-180")} />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={0}
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none animate-in fade-in slide-in-from-top-1 duration-300 bg-transparent p-0"
                  onMouseEnter={() => setOpenProjects(true)}
                  onMouseLeave={() => setOpenProjects(false)}
                >
                  <div className={cn(
                    "w-full transition-all duration-300",
                    isScrolled ? "pt-4" : "pt-8"
                  )}>
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl border-b border-border">
                      <MegaMenuContent 
                        items={projectItems} 
                        onMouseEnter={() => setOpenProjects(true)}
                        onMouseLeave={() => setOpenProjects(false)}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <a href="#cases" className="text-sm font-semibold text-primary/80 hover:text-accent transition-colors">
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
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t border-border p-6 shadow-2xl animate-in slide-in-from-top duration-300 h-screen overflow-y-auto">
          <div className="flex flex-col gap-8 pb-32">
            <div className="space-y-4">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.wholesale}</p>
               <div className="grid grid-cols-1 gap-4 pl-4">
                 {wholesaleItems.map((item) => (
                   <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                     <item.icon className="h-5 w-5 text-primary" />
                     <span className="text-lg font-bold text-primary">{item.label}</span>
                   </a>
                 ))}
               </div>
            </div>
            <div className="space-y-4">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.projects}</p>
               <div className="grid grid-cols-1 gap-4 pl-4">
                 {projectItems.map((item) => (
                   <a key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                     <item.icon className="h-5 w-5 text-primary" />
                     <span className="text-lg font-bold text-primary">{item.label}</span>
                   </a>
                 ))}
               </div>
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
