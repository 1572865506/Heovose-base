
"use client";

import { useState, useEffect } from 'react';
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

import { useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import { LayoutGrid } from 'lucide-react';

import { useTranslations } from '@/hooks/use-translations';

export function Navbar({ locale, setLocale }: NavbarProps) {
  const { t: tr } = useTranslations(locale);
  const pathname = usePathname();
  const firestore = useFirestore();
  
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

  // Determine if the page has a dark/colored header area at the top
  const isTransparentHeaderPage = pathname === '/' || pathname === '/products';
  
  // Navbar is "Active" (White Opaque) if:
  // 1. Scrolled down
  // 2. A mega menu is hovered
  // 3. Mobile menu is open
  // 4. We are on a page that DOES NOT have a dark header background
  const isNavbarActive = !isTransparentHeaderPage || isScrolled || openWholesale || openProjects || mobileMenuOpen;

  // 1. Fetch dynamic categories
  const catsQuery = useMemoFirebase(() => firestore ? collection(firestore, 'productCategories') : null, [firestore]);
  const transQuery = useMemoFirebase(() => firestore ? collection(firestore, 'localizedStrings') : null, [firestore]);

  const { data: remoteCats } = useCollection<any>(catsQuery);
  const { data: allTranslations } = useCollection<any>(transQuery);

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
      className="container mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
        <div className="col-span-full border-b border-border/50 pb-4">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            {locale === 'en' ? 'Portfolio' : '产品组合'}
          </span>
        </div>
        {items.map((item) => (
          <DropdownMenuItem key={item.label} asChild className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent transition-all duration-300">
            <Link 
              href={item.href} 
              className="flex gap-4 group cursor-pointer outline-none focus:outline-none"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 group-hover:scale-110">
                <item.icon className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-primary mb-1 group-hover:translate-x-1 transition-transform">{item.label}</h4>
                <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2">{item.desc}</p>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
      </div>
      
      {/* Featured Card */}
      <div className="lg:w-80 shrink-0">
        <div className="bg-primary/5 rounded-[2rem] p-6 border border-primary/10 h-full flex flex-col group/card transition-all duration-500 hover:bg-primary/10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
            {tr('nav_sub_featured')}
          </span>
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg border border-white/20">
            <Image 
              src="/image/whiteboard01.png" 
              alt="Featured Catalog" 
              fill 
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          <div className="space-y-2">
            <h4 className="text-white font-headline font-bold text-lg leading-tight">
            {tr('nav_sub_catalog_title')}
            </h4>
            <p className="text-white/60 text-xs leading-relaxed">
            {tr('nav_sub_catalog_desc')}
            </p>
            <Button variant="link" className="p-0 h-auto text-accent text-[10px] font-bold uppercase tracking-widest hover:text-white transition-colors">
            {tr('nav_sub_download')} <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-[110] transition-all duration-500 border-b border-t-0 border-x-0",
      isNavbarActive 
        ? "glass-frosted border-white/20 shadow-sm" 
        : "bg-transparent border-transparent"
    )}>
      <div className={cn(
        "container mx-auto px-6 flex justify-between items-center transition-all duration-500",
        isScrolled ? "h-16" : "h-24"
      )}>
        <Link href="/" className="flex items-center">
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
        <div className="hidden lg:flex h-full items-center gap-12">
          <div className="flex h-full items-center gap-8">
            
            {/* Wholesale Mega Menu Container */}
            <div 
              onMouseEnter={() => setOpenWholesale(true)} 
              onMouseLeave={() => setOpenWholesale(false)}
              className="h-full relative flex items-center"
            >
              <DropdownMenu open={openWholesale} onOpenChange={setOpenWholesale} modal={false}>
                <DropdownMenuTrigger asChild>
                <button 
                  onMouseEnter={() => { setOpenWholesale(true); setOpenProjects(false); }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                    isNavbarActive ? "text-primary hover:bg-primary/5" : "text-white hover:bg-white/10"
                  )}
                >
                  {tr('nav_wholesale')} <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", openWholesale && "rotate-180")} />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={0}
                  align="start"
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none bg-transparent p-0 overflow-visible"
                  onMouseEnter={() => setOpenWholesale(true)}
                  onMouseLeave={() => setOpenWholesale(false)}
                >
                  <div className="container mx-auto px-6 py-4">
                    <div className="glass-deep rounded-[2.5rem] shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
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
                <DropdownMenuTrigger asChild>
                <button 
                  onMouseEnter={() => { setOpenProjects(true); setOpenWholesale(false); }}
                  className={cn(
                    "flex items-center gap-2 px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all",
                    isNavbarActive ? "text-primary hover:bg-primary/5" : "text-white hover:bg-white/10"
                  )}
                >
                  {tr('nav_projects')} <ChevronDown className={cn("h-3 w-3 transition-transform duration-300", openProjects && "rotate-180")} />
                </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  sideOffset={0}
                  align="start"
                  className="w-screen max-w-none left-0 right-0 border-none rounded-none shadow-none bg-transparent p-0 overflow-visible"
                  onMouseEnter={() => setOpenProjects(true)}
                  onMouseLeave={() => setOpenProjects(false)}
                >
                  <div className="container mx-auto px-6 py-4">
                    <div className="glass-deep rounded-[2.5rem] shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
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

            <Link href="/#cases" className={cn(
                "text-xs font-bold uppercase tracking-widest transition-all",
                isNavbarActive ? "text-primary hover:text-accent" : "text-white/80 hover:text-white"
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
