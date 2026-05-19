"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Locale } from "@/lib/translations";
import { LanguageToggle } from "./LanguageToggle";
import {
  Menu,
  X,
  ChevronDown,
  MessageSquare,
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
  headerTheme?: 'light' | 'dark';
  themeLine?: 'wholesale' | 'project';
}

import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { LayoutGrid } from 'lucide-react';
import { getAssetUrl } from '@/lib/image-utils';

import { useTranslations } from '@/hooks/use-translations';
import { useInquiry } from '@/components/providers/InquiryProvider';

export function Navbar({ locale, setLocale, headerTheme = 'dark', themeLine }: NavbarProps) {
  const { t: tr } = useTranslations(locale);
  const { openInquiry } = useInquiry();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

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
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Update isScrolled for background opacity
      setIsScrolled(currentScrollY > 100);

      // Smart Show/Hide Logic
      if (currentScrollY > lastScrollY.current && currentScrollY > 100 && !mobileMenuOpen && !activeMenu) {
        // Scrolling Down & past header -> Hide
        setIsVisible(false);
      } else {
        // Scrolling Up or at the top -> Show
        setIsVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [mobileMenuOpen, activeMenu]);

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

  // 2. Fetch dynamic navigation settings
  const { data: navSettings } = useLocalDoc<any>('settings', 'navigation');

  // 3. Fetch dynamic site settings for Logo
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');

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
          { id: 'aio', label: tr('nav_sub_aio'), desc: tr('nav_sub_aio_desc'), icon: Monitor, href: '/products?category=AIO' },
          { id: 'laptop', label: tr('nav_sub_laptop'), desc: tr('nav_sub_laptop_desc'), icon: Laptop, href: '/products?category=Laptop' },
          { id: 'minipc', label: tr('nav_sub_minipc'), desc: tr('nav_sub_minipc_desc'), icon: Cpu, href: '/products?category=Mini%20PC' },
          { id: 'electromechanical', label: tr('nav_sub_electromechanical'), desc: tr('nav_sub_electromechanical_desc'), icon: Zap, href: '/products?category=Electromechanical' },
          { id: 'monitor', label: tr('nav_sub_monitor'), desc: tr('nav_sub_monitor_desc'), icon: Tv, href: '/products?category=Monitor' },
          { id: 'components', label: tr('nav_sub_components'), desc: tr('nav_sub_components_desc'), icon: HardDrive, href: '/products?category=Components' },
        ],
        projectItems: [
          { id: 'conference', label: tr('nav_sub_conference'), desc: tr('nav_sub_conference_desc'), icon: Presentation, href: '/products?category=Conference' },
          { id: 'selfservice', label: tr('nav_sub_selfservice'), desc: tr('nav_sub_selfservice_desc'), icon: MousePointerClick, href: '/products?category=KIOSK' },
          { id: 'industrial', label: tr('nav_sub_industrial'), desc: tr('nav_sub_industrial_desc'), icon: Factory, href: '/products?category=Industrial' },
          { id: 'led', label: tr('nav_sub_led'), desc: tr('nav_sub_led_desc'), icon: Lightbulb, href: '/products?category=LED' },
          { id: 'showroom', label: tr('nav_sub_showroom'), desc: tr('nav_sub_showroom_desc'), icon: Store, href: '/products?category=Showroom' },
        ]
      };
    }

    const wholesale = remoteCats
      .filter((c: any) => c.parentId === 'WHOLESALE')
      .map((c: any) => ({
        id: c.id,
        label: tr(c.nameTextId),
        desc: tr(c.descriptionTextId),
        icon: getIcon(c.id),
        href: `/products?category=${encodeURIComponent(c.slug)}`
      }));

    const projects = remoteCats
      .filter((c: any) => c.parentId === 'PROJECT')
      .map((c: any) => ({
        id: c.id,
        label: tr(c.nameTextId),
        desc: tr(c.descriptionTextId),
        icon: getIcon(c.id),
        href: `/products?category=${encodeURIComponent(c.slug)}`
      }));

    return { wholesaleItems: wholesale, projectItems: projects };
  }, [remoteCats, locale, tr]);

  const logoStandard = siteConfig?.logoStandard ? getAssetUrl(siteConfig.logoStandard) : "/image/Heovose-color.svg";
  const logoInverted = siteConfig?.logoInverted ? getAssetUrl(siteConfig.logoInverted) : "/image/Heovose.svg";

  return (
    <>
      {/* 1. Top Scrim & Gradient Blur Layer - The "Advanced Glass" Layer */}
      {!isNavbarActive && isTransparentHeaderPage && (
        <div className={cn(
          "fixed top-0 left-0 right-0 z-[105] h-48 pointer-events-none transition-all duration-700",
          headerTheme === 'light' ? "opacity-60" : "opacity-80",
          !isVisible && "opacity-0 -translate-y-full"
        )}>
          {/* The Scrim: Suble gradient to ensure contrast */}
          <div className={cn(
            "absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-transparent",
            headerTheme === 'light' && "from-white/60 via-white/20"
          )} />

          {/* The Gradient Blur: Frosted glass that fades out */}
          <div className="absolute inset-0 backdrop-blur-xl [mask-image:linear-gradient(to_bottom,black_0%,black_30%,transparent_100%)]" />
        </div>
      )}

      <nav 
        style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
        className={cn(
        "fixed top-0 left-0 right-0 z-[110] transition-all duration-700 h-20 flex items-center !border-t-0 !border-x-0",
        isNavbarActive
          ? cn(
              navSettings?.navbarMaterial === 'level-03' ? "glass-deep" : "glass-frosted",
              navSettings?.showBorder ? "border-b border-white/20" : "border-b border-transparent",
              navSettings?.showShadow ? "shadow-[0_0px_30px_-12px_rgba(0,0,0,0.25)]" : "shadow-none"
            )
          : "bg-transparent border-b border-transparent"
      )}>
        <div className="container mx-auto px-6 flex items-center w-full h-full">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src={isNavbarActive || headerTheme === 'light' ? logoStandard : logoInverted}
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
                        "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap outline-none",
                        (isNavbarActive || headerTheme === 'light')
                          ? "text-slate-800 hover:bg-slate-100"
                          : "text-white hover:bg-white/10"
                      )}
                      onMouseEnter={() => handleMouseEnter('wholesale')}
                    >
                      <span>{tr('NAV_WHOLESALE')}</span>
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
                  >
                    <div className="container mx-auto px-6">
                      <div className={cn(
                        "rounded-[2.5rem] shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-500",
                        navSettings?.navbarMaterial === 'level-03' ? "glass-deep" : "glass-frosted",
                        navSettings?.showBorder ? "border-white/20" : "border-transparent"
                      )}>
                        <MegaMenuContent 
                        items={wholesaleItems} 
                        navSettings={navSettings}
                        locale={locale}
                        tr={tr}
                        line="wholesale"
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
                        "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap outline-none",
                        (isNavbarActive || headerTheme === 'light')
                          ? "text-slate-800 hover:bg-slate-100"
                          : "text-white hover:bg-white/10"
                      )}
                      onMouseEnter={() => handleMouseEnter('projects')}
                    >
                      <span>{tr('NAV_PROJECTS')}</span>
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
                  >
                    <div className="container mx-auto px-6">
                      <div className={cn(
                        "rounded-[2.5rem] shadow-2xl border animate-in fade-in slide-in-from-top-4 duration-500",
                        navSettings?.navbarMaterial === 'level-03' ? "glass-deep" : "glass-frosted",
                        navSettings?.showBorder ? "border-white/20" : "border-transparent"
                      )}>
                        <MegaMenuContent 
                        items={projectItems} 
                        navSettings={navSettings}
                        locale={locale}
                        tr={tr}
                        line="project"
                        onMouseEnter={() => handleMouseEnter('projects')}
                        onMouseLeave={handleMouseLeave}
                      />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Link href="/#cases" className={cn(
                "px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap",
                (isNavbarActive || headerTheme === 'light')
                  ? "text-slate-800 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              )}>
                {tr('NAV_CASES')}
              </Link>
              <Link href="/service-centers" className={cn(
                "px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap",
                (isNavbarActive || headerTheme === 'light')
                  ? "text-slate-800 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              )}>
                {tr('NAV_SERVICE_CENTERS')}
              </Link>
              <Link href="/about" className={cn(
                "px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap",
                (isNavbarActive || headerTheme === 'light')
                  ? "text-slate-800 hover:bg-slate-100"
                  : "text-white hover:bg-white/10"
              )}>
                {tr('NAV_ABOUT')}
              </Link>
            </div>

            <div className="flex items-center gap-6 h-full">
              <LanguageToggle currentLocale={locale} setLocale={setLocale} headerTheme={headerTheme} isNavbarActive={isNavbarActive} />
              <Button 
                size="sm" 
                onClick={() => openInquiry()}
                className={cn(
                  "rounded-full px-6 shadow-lg transition-all duration-500 text-sm font-medium bg-primary hover:bg-primary/90"
                )}
              >
                <span className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {tr('NAV_CONTACT')}
                </span>
              </Button>
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
              <Link href="/#cases" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{tr('NAV_CASES')}</Link>
              <Link href="/service-centers" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{tr('NAV_SERVICE_CENTERS')}</Link>
              <Link href="/about" onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{tr('NAV_ABOUT')}</Link>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <Button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openInquiry();
                  }}
                  className="w-full rounded-xl bg-primary flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {tr('NAV_CONTACT')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

// Sub-component extracted to prevent unnecessary re-renders and closure issues
function MegaMenuContent({
  items,
  navSettings,
  locale,
  tr,
  line,
  onMouseEnter,
  onMouseLeave
}: {
  items: any[],
  navSettings: any,
  locale: string,
  tr: any,
  line: 'wholesale' | 'project',
  onMouseEnter: () => void,
  onMouseLeave: () => void
}) {
  return (
    <div
      className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-16"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {/* Left: Product List (8 Columns equivalent) */}
      <div className="flex-1 space-y-8">
        <div className="flex items-center justify-between border-b pb-4 border-primary/10">
          <h4 className="text-[10px] font-bold uppercase tracking-widest font-headline text-primary/40">
            {tr('nav_mega_title')}
          </h4>
          <Link 
            href={`/products?line=${line}`} 
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:translate-x-1 transition-transform text-primary"
          >
            {tr('nav_mega_view_all')} <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div
          className={cn(
            "grid gap-y-10 grid-cols-1",
            navSettings?.megaMenuColumns === 1 ? "md:grid-cols-1" :
              navSettings?.megaMenuColumns === 3 ? "md:grid-cols-3" :
                navSettings?.megaMenuColumns === 4 ? "md:grid-cols-4" :
                  "md:grid-cols-2"
          )}
          style={{
            columnGap: `${navSettings?.megaMenuGap || 48}px`
          }}
        >
          {items.map((item) => (
            <DropdownMenuItem key={item.id} asChild className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent transition-all duration-300">
              <Link
                href={item.href}
                className={cn(
                  "flex gap-5 group cursor-pointer outline-none focus:outline-none",
                  !item.desc && "items-center"
                )}
              >
                <div className="h-14 w-14 shrink-0 rounded-2xl bg-white shadow-sm border flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 border-primary/5 text-primary group-hover:bg-primary group-hover:text-white">
                  <item.icon className="h-7 w-7" />
                </div>
                <div className={cn("space-y-1", !item.desc && "space-y-0")}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold transition-colors font-headline text-primary">{item.label}</span>
                    <ChevronDown className="h-3 w-3 opacity-0 group-hover:opacity-40 -rotate-90 transition-all" />
                  </div>
                  {item.desc && (
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">{item.desc}</p>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>
      </div>

      {/* Right: Featured Card (4 Columns equivalent) */}
      <div className="lg:w-[380px] shrink-0">
          <div className="rounded-[2.5rem] p-8 h-full flex flex-col group/card transition-all duration-500 relative overflow-hidden bg-primary/5 border-primary/5 hover:bg-primary/10">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl -mr-16 -mt-16 bg-primary/5" />

          <div className="relative z-10 space-y-6 flex flex-col h-full">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 shadow-sm bg-white">
              <Image
                src={getAssetUrl(navSettings?.featuredCoverUrl || "/image/catalog-placeholder.png")}
                alt="Featured Catalog"
                fill
                className="object-contain p-4 transition-transform duration-700 group-hover:scale-110"
                unoptimized={!!navSettings?.featuredCoverUrl}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="mt-auto">
              <Button
                asChild
                className="w-full h-11 px-6 rounded-2xl border-none font-bold text-[10px] uppercase gap-3 transition-all group/download shadow-none cursor-pointer bg-primary/5 text-primary hover:bg-primary hover:text-white"
              >
                <Link href={navSettings?.featuredDownloadUrl || "#"}>
                  <Download className="h-3.5 w-3.5 opacity-40 group-hover/download:opacity-100 transition-opacity" />
                  <span>{tr('nav_sub_download')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
