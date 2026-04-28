"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  ArrowRight,
  Download
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

import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { LayoutGrid } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

export function Navbar({ locale, setLocale }: NavbarProps) {
  const { t: tr } = useTranslations(locale);
  const pathname = usePathname();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Unified state for Mega Menus with debounce
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menu: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 300); // Increased delay for smoother transitions
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 100);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Determine if the page has a dark/colored header area at the top
  const isTransparentHeaderPage = pathname === '/' || pathname === '/products';
  
  // Navbar is "Active" (White Opaque) if:
  // 1. Scrolled down
  // 2. A mega menu is hovered
  // 3. Mobile menu is open
  // 4. We are on a page that DOES NOT have a dark header background
  const isNavbarActive = !isTransparentHeaderPage || isScrolled || activeMenu !== null || mobileMenuOpen;

  // 1. Fetch dynamic categories
  const { data: remoteCats } = useLocalCollection<any>('productCategories');
  const { data: allTranslations } = useLocalCollection<any>('localizedStrings');
  
  // 2. Fetch dynamic navigation settings
  const { data: navSettings } = useLocalDoc<any>('settings', 'navigation');

  const getT = (id: string, field: string = locale) => {
    const entry = allTranslations?.find((item: any) => item.id === id);
    if (!entry) return id;
    return entry[field] || entry['en'] || entry['zh'] || id;
  };

  const getIcon = (id: string) => {
    const map: Record<string, any> = {
      'AIO': Monitor,
      'Laptop': Laptop,
      'MINIPC': Cpu,
      'ELECTROMECHANICAL': Zap,
      'MONITOR': Tv,
      'COMPONENTS': HardDrive,
      'CONFERENCE': Presentation,
      'KIOSK': MousePointerClick,
      'INDUSTRIAL': Factory,
      'LED': Lightbulb,
      'SHOWROOM': Store
    };
    return map[id.toUpperCase()] || LayoutGrid;
  };

  const { wholesaleItems, projectItems } = useMemo(() => {
    if (!remoteCats || remoteCats.length === 0) {
      // Return hardcoded fallbacks if no data yet to avoid empty navbar
      return {
        wholesaleItems: [
          { label: tr('nav_sub_aio'), desc: tr('nav_sub_aio_desc'), icon: Monitor, href: '/products?category=AIO' },
          { label: tr('nav_sub_laptop'), desc: tr('nav_sub_laptop_desc'), icon: Laptop, href: '/products?category=Laptop' },
          { label: tr('nav_sub_minipc'), desc: tr('nav_sub_minipc_desc'), icon: Cpu, href: '/products?category=Mini%20PC' },
          { label: tr('nav_sub_electromechanical'), desc: tr('nav_sub_electromechanical_desc'), icon: Zap, href: '/products?category=Electromechanical' },
          { label: tr('nav_sub_monitor'), desc: tr('nav_sub_monitor_desc'), icon: Tv, href: '/products?category=Monitor' },
          { label: tr('nav_sub_components'), desc: tr('nav_sub_components_desc'), icon: HardDrive, href: '/products?category=Components' },
        ],
        projectItems: [
          { label: tr('nav_sub_conference'), desc: tr('nav_sub_conference_desc'), icon: Presentation, href: '/products?category=Conference' },
          { label: tr('nav_sub_selfservice'), desc: tr('nav_sub_selfservice_desc'), icon: MousePointerClick, href: '/products?category=KIOSK' },
          { label: tr('nav_sub_industrial'), desc: tr('nav_sub_industrial_desc'), icon: Factory, href: '/products?category=Industrial' },
          { label: tr('nav_sub_led'), desc: tr('nav_sub_led_desc'), icon: Lightbulb, href: '/products?category=LED' },
          { label: tr('nav_sub_showroom'), desc: tr('nav_sub_showroom_desc'), icon: Store, href: '/products?category=Showroom' },
        ]
      };
    }

    const wholesale = remoteCats
      .filter((c: any) => c.parentId === 'WHOLESALE')
      .map((c: any) => ({
        label: getT(c.nameTextId),
        desc: getT(c.descriptionTextId),
        icon: getIcon(c.id),
        href: `/products?category=${encodeURIComponent(c.slug)}`
      }));

    const projects = remoteCats
      .filter((c: any) => c.parentId === 'PROJECT')
      .map((c: any) => ({
        label: getT(c.nameTextId),
        desc: getT(c.descriptionTextId),
        icon: getIcon(c.id),
        href: `/products?category=${encodeURIComponent(c.slug)}`
      }));

    return { wholesaleItems: wholesale, projectItems: projects };
  }, [remoteCats, allTranslations, locale, tr]);

  const MegaMenuContent = ({ items, onMouseEnter, onMouseLeave }: { items: any[], onMouseEnter: () => void, onMouseLeave: () => void }) => (
    <div 
      className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Left: Product List (8 Columns equivalent) */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between border-b border-primary/10 pb-4">
          <h4 className="text-[10px] font-bold text-primary/40 uppercase tracking-widest font-headline">
            {locale === 'en' ? 'Product Categories' : '核心产品序列'}
          </h4>
          <Link 
            href="/products" 
            className="flex items-center gap-2 text-[9px] font-bold text-primary uppercase tracking-widest cursor-pointer hover:translate-x-1 transition-transform"
          >
            {locale === 'en' ? 'View All' : '查看全部'} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        
        <div className={cn(
          "grid gap-y-10",
          navSettings?.megaMenuColumns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2",
          navSettings?.megaMenuGap ? `gap-x-${navSettings.megaMenuGap}` : "gap-x-12"
        )}>
          {items.map((item) => (
            <DropdownMenuItem key={item.label} asChild className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent transition-all duration-300">
              <Link 
                href={item.href} 
                className="flex gap-5 group cursor-pointer outline-none focus:outline-none"
              >
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-sm border border-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 group-hover:scale-110 group-hover:rotate-6">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-primary group-hover:text-primary transition-colors font-headline">{item.label}</span>
                    <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-40 -rotate-90 transition-all" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </div>
      
      {/* Right: Featured Card (4 Columns equivalent) */}
      <div className="lg:w-[380px] shrink-0">
        <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/5 h-full flex flex-col group/card transition-all duration-500 hover:bg-primary/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16" />
          
          <div className="relative z-10 space-y-6 flex flex-col h-full">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-white">
              <Image 
                src={navSettings?.featuredCoverUrl || "/image/catalog-placeholder.png"} 
                alt="Featured Catalog" 
                fill 
                className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>
            
            <div className="mt-auto">
              <Button 
                asChild
                className="w-full h-11 px-6 rounded-2xl bg-primary/5 text-primary border-none font-bold text-[10px] uppercase gap-3 hover:bg-primary hover:text-white transition-all group/download shadow-none cursor-pointer"
              >
                <Link href={navSettings?.featuredDownloadUrl || "#"}>
                  <Download className="h-3.5 w-3.5 opacity-40 group-hover/download:opacity-100 transition-opacity" /> 
                  <span>{navSettings?.featuredText || tr('nav_sub_download')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[110] transition-all duration-500 border-b h-20 flex items-center !border-t-0 !border-x-0",
      isNavbarActive 
        ? cn(
            navSettings?.navbarMaterial === 'level-03' ? "glass-deep" : "glass-frosted",
            navSettings?.showBorder ? "border-white/20" : "border-transparent",
            navSettings?.showShadow ? "shadow-sm" : "shadow-none"
          )
        : "bg-transparent border-transparent"
    )}>
      <div className="container mx-auto px-6 flex items-center w-full h-full">
        <Link href="/" className="flex items-center shrink-0">
          <Image
            src={isNavbarActive ? "/image/Heovose-color.svg" : "/image/Heovose.svg"}
            alt="Heovose Logo"
            width={160}
            height={32}
            className="h-8 w-auto object-contain transition-all duration-500"
            priority
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex h-full items-center gap-10 ml-auto">
          {/* Mega Menus with shared hover container to prevent flicker */}
          <div className="flex h-full items-center gap-4" onMouseLeave={handleMouseLeave}>
            
            {/* Wholesale Mega Menu Container */}
            <div className="h-full relative flex items-center">
              <DropdownMenu open={activeMenu === 'wholesale'} onOpenChange={(open) => !open && handleMouseLeave()} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={cn(
                      "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 font-medium whitespace-nowrap",
                      isNavbarActive 
                        ? "text-slate-800 hover:bg-slate-100" 
                        : "text-white hover:bg-white/10"
                    )}
                    onMouseEnter={() => handleMouseEnter('wholesale')}
                  >
                    <span>{tr('nav_wholesale')}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      activeMenu === 'wholesale' ? "rotate-180" : ""
                    )} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={25}
                  align="start"
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none bg-transparent p-0 overflow-visible"
                  onMouseEnter={() => handleMouseEnter('wholesale')}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="container mx-auto px-6">
                    <div className="glass-frosted rounded-[2.5rem] shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
                      <MegaMenuContent 
                        items={wholesaleItems} 
                        onMouseEnter={() => handleMouseEnter('wholesale')}
                        onMouseLeave={handleMouseLeave}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Projects Mega Menu Container */}
            <div className="h-full relative flex items-center">
              <DropdownMenu open={activeMenu === 'projects'} onOpenChange={(open) => !open && handleMouseLeave()} modal={false}>
                <DropdownMenuTrigger asChild>
                  <button 
                    className={cn(
                      "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 font-medium whitespace-nowrap",
                      isNavbarActive 
                        ? "text-slate-800 hover:bg-slate-100" 
                        : "text-white hover:bg-white/10"
                    )}
                    onMouseEnter={() => handleMouseEnter('projects')}
                  >
                    <span>{tr('nav_projects')}</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 transition-transform duration-300",
                      activeMenu === 'projects' ? "rotate-180" : ""
                    )} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={25}
                  align="start"
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none bg-transparent p-0 overflow-visible"
                  onMouseEnter={() => handleMouseEnter('projects')}
                  onOpenAutoFocus={(e) => e.preventDefault()}
                >
                  <div className="container mx-auto px-6">
                    <div className="glass-frosted rounded-[2.5rem] shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
                      <MegaMenuContent 
                        items={projectItems} 
                        onMouseEnter={() => handleMouseEnter('projects')}
                        onMouseLeave={handleMouseLeave}
                      />
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Link href="/#cases" className={cn(
              "px-4 py-2 rounded-full transition-all duration-300 font-medium whitespace-nowrap",
              isNavbarActive 
                ? "text-slate-800 hover:bg-slate-100" 
                : "text-white hover:bg-white/10"
            )}>
              {tr('nav_cases')}
            </Link>
          </div>

          <div className="flex items-center gap-6 h-full">
            <LanguageToggle currentLocale={locale} setLocale={setLocale} />
            <Link href="/products">
              <Button size="sm" className="rounded-full px-6 bg-primary hover:bg-primary/90 shadow-lg">
                {tr('nav_contact')}
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          className={cn(
            "lg:hidden ml-auto p-2 transition-colors duration-500",
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
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tr('nav_wholesale')}</p>
               <div className="grid grid-cols-2 gap-4">
                 {wholesaleItems.map((item) => (
                   <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                     <item.icon className="h-5 w-5 text-primary" />
                     <span className="text-lg font-bold text-primary">{item.label}</span>
                   </Link>
                 ))}
               </div>
            </div>
            <div className="space-y-4 pt-4 border-t border-dashed">
               <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tr('nav_projects')}</p>
               <div className="grid grid-cols-2 gap-4">
                 {projectItems.map((item) => (
                   <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                     <item.icon className="h-5 w-5 text-primary" />
                     <span className="text-lg font-bold text-primary">{item.label}</span>
                   </Link>
                 ))}
               </div>
            </div>
            <Link href="/#cases" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{tr('nav_cases')}</Link>
            
            <div className="pt-6 border-t border-slate-100 mt-auto">
              <Link href="/#contact" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl bg-primary">{tr('nav_contact')}</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
