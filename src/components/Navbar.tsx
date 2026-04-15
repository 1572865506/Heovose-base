
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { LanguageToggle } from "./LanguageToggle";
import { 
  Menu, 
  X, 
  ChevronDown, 
  Monitor, 
  Cpu, 
  Tv, 
  Laptop, 
  Zap, 
  HardDrive, 
  Presentation, 
  MousePointerClick, 
  Factory, 
  Lightbulb, 
  Store,
  ArrowRight 
} from "lucide-react";
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

  const isNavbarActive = isScrolled || openWholesale || openProjects || mobileMenuOpen;

  const wholesaleItems = [
    { label: sub.aio, desc: sub.aio_desc, icon: Monitor, href: '#products' },
    { label: sub.laptop, desc: sub.laptop_desc, icon: Laptop, href: '#products' },
    { label: sub.minipc, desc: sub.minipc_desc, icon: Cpu, href: '#products' },
    { label: sub.electromechanical, desc: sub.electromechanical_desc, icon: Zap, href: '#products' },
    { label: sub.monitor, desc: sub.monitor_desc, icon: Tv, href: '#products' },
    { label: sub.components, desc: sub.components_desc, icon: HardDrive, href: '#products' },
  ];

  const projectItems = [
    { label: sub.conference, desc: sub.conference_desc, icon: Presentation, href: '#process' },
    { label: sub.selfservice, desc: sub.selfservice_desc, icon: MousePointerClick, href: '#process' },
    { label: sub.industrial, desc: sub.industrial_desc, icon: Factory, href: '#process' },
    { label: sub.led, desc: sub.led_desc, icon: Lightbulb, href: '#process' },
    { label: sub.showroom, desc: sub.showroom_desc, icon: Store, href: '#process' },
  ];

  const MegaMenuContent = ({ items, onMouseEnter, onMouseLeave }: { items: any[], onMouseEnter: () => void, onMouseLeave: () => void }) => (
    <div 
      className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
        <div className="col-span-full border-b border-border pb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {locale === 'en' ? 'Portfolio' : '产品组合'}
          </span>
        </div>
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent">
            <a 
              href={item.href} 
              className="flex gap-4 group cursor-pointer outline-none focus:outline-none"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-primary mb-1 group-hover:translate-x-1 transition-transform">{item.label}</h4>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{item.desc}</p>
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
              data-ai-hint="tech product"
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
      "fixed top-0 left-0 right-0 z-[110] transition-all duration-500 border-b",
      isNavbarActive 
        ? "bg-white/70 backdrop-blur-xl border-white/20" 
        : "bg-transparent border-transparent"
    )}>
      <div className={cn(
        "container mx-auto px-6 flex justify-between items-center transition-all duration-500",
        isScrolled ? "h-16" : "h-24"
      )}>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">H</div>
          <span className={cn(
            "text-2xl font-headline font-bold tracking-tighter transition-colors duration-500",
            isNavbarActive ? "text-primary" : "text-white"
          )}>HEOVOSE</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:flex h-full items-center gap-12">
          <div className="flex h-full items-center gap-8">
            
            {/* Wholesale Mega Menu Container */}
            <div 
              onMouseEnter={() => setOpenWholesale(true)} 
              onMouseLeave={() => setOpenWholesale(false)}
              className="h-full relative flex items-center"
            >
              <DropdownMenu open={openWholesale} onOpenChange={setOpenWholesale} modal={false}>
                <DropdownMenuTrigger className={cn(
                  "h-full flex items-center gap-1 text-sm font-semibold transition-colors outline-none focus:outline-none focus:ring-0 px-2",
                  isNavbarActive ? "text-primary/80" : "text-white/90",
                  "hover:text-accent"
                )}>
                  {t.wholesale} <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", openWholesale && "rotate-180")} />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={0}
                  align="start"
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none bg-transparent p-0 overflow-visible"
                  onMouseEnter={() => setOpenWholesale(true)}
                  onMouseLeave={() => setOpenWholesale(false)}
                >
                  <div className="w-full">
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl border-b border-border animate-in fade-in slide-in-from-top-2 duration-300">
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

            {/* Projects Mega Menu Container */}
            <div 
              onMouseEnter={() => setOpenProjects(true)} 
              onMouseLeave={() => setOpenProjects(false)}
              className="h-full relative flex items-center"
            >
              <DropdownMenu open={openProjects} onOpenChange={setOpenProjects} modal={false}>
                <DropdownMenuTrigger className={cn(
                  "h-full flex items-center gap-1 text-sm font-semibold transition-colors outline-none focus:outline-none focus:ring-0 px-2",
                  isNavbarActive ? "text-primary/80" : "text-white/90",
                  "hover:text-accent"
                )}>
                  {t.projects} <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", openProjects && "rotate-180")} />
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={0}
                  align="start"
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none bg-transparent p-0 overflow-visible"
                  onMouseEnter={() => setOpenProjects(true)}
                  onMouseLeave={() => setOpenProjects(false)}
                >
                  <div className="w-full">
                    <div className="bg-white/95 backdrop-blur-xl shadow-2xl border-b border-border animate-in fade-in slide-in-from-top-2 duration-300">
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

            <a 
              href="#cases" 
              className={cn(
                "text-sm font-semibold transition-colors h-full flex items-center px-2",
                isNavbarActive ? "text-primary/80" : "text-white/90",
                "hover:text-accent"
              )}
            >
              {t.cases}
            </a>
          </div>

          <div className="flex items-center gap-6 h-full">
            <LanguageToggle currentLocale={locale} setLocale={setLocale} />
            <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-lg">
              {t.contact}
            </Button>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          className={cn(
            "lg:hidden p-2 transition-colors duration-500",
            isNavbarActive ? "text-primary" : "text-white"
          )} 
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
