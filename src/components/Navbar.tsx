"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Locale, getLocalizedLink } from "@/lib/translations";
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
import { injectTranslations } from '@/lib/translation-injector';

const SYSTEM_FALLBACKS: Record<string, Record<Locale, string>> = {
  NAV_WHOLESALE: { zh: '批发业务', en: 'Wholesale Business', id: 'Bisnis Grosir', vi: 'Kinh doanh bán sỉ', vn: 'Kinh doanh bán sỉ' },
  nav_wholesale: { zh: '批发业务', en: 'Wholesale Business', id: 'Bisnis Grosir', vi: 'Kinh doanh bán sỉ', vn: 'Kinh doanh bán sỉ' },
  NAV_PROJECTS: { zh: '项目工程', en: 'Project Solutions', id: 'Solusi Proyek', vi: 'Giải pháp dự án', vn: 'Giải pháp dự án' },
  nav_projects: { zh: '项目工程', en: 'Project Solutions', id: 'Solusi Proyek', vi: 'Giải pháp dự án', vn: 'Giải pháp dự án' },
  NAV_CASES: { zh: '成功案例', en: 'Case Studies', id: 'Studi Kasus', vi: 'Trường hợp thực tế', vn: 'Trường hợp thực tế' },
  NAV_SERVICE_CENTERS: { zh: '服务网点', en: 'Service Centers', id: 'Pusat Layanan', vi: 'Trung tâm dịch vụ', vn: 'Trung tâm dịch vụ' },
  NAV_ABOUT: { zh: '关于我们', en: 'About Us', id: 'Tentang Kami', vi: 'Về chúng tôi', vn: 'Về chúng tôi' },
  NAV_CONTACT: { zh: '联系我们', en: 'Contact Us', id: 'Hubungi Kami', vi: 'Liên hệ chúng tôi', vn: 'Liên hệ chúng tôi' },
  nav_mega_title: { zh: '产品分类', en: 'Product Categories', id: 'Kategori Produk', vi: 'Danh mục sản phẩm', vn: 'Danh mục sản phẩm' },
  nav_mega_view_all: { zh: '查看全部', en: 'View All', id: 'Lihat Semua', vi: 'Xem tất cả', vn: 'Xem tất cả' },
  nav_sub_download: { zh: '下载目录', en: 'Download Catalog', id: 'Unduh Katalog', vi: 'Tải tài liệu', vn: 'Tải tài liệu' },
  nav_sub_aio: { zh: '一体机', en: 'All-in-One PC', id: 'PC All-in-One', vi: 'Máy tính All-in-One', vn: 'Máy tính All-in-One' },
  nav_sub_aio_desc: { zh: '高集成度台式电脑', en: 'Highly integrated desktop computer', id: 'Komputer desktop terintegrasi tinggi', vi: 'Máy tính để bàn tích hợp cao', vn: 'Máy tính để bàn tích hợp cao' },
  nav_sub_laptop: { zh: '笔记本电脑', en: 'Laptops', id: 'Laptop', vi: 'Máy tính xách tay', vn: 'Máy tính xách tay' },
  nav_sub_laptop_desc: { zh: '便携式商务与娱乐本', en: 'Portable business & entertainment laptops', id: 'Laptop bisnis & hiburan portabel', vi: 'Máy tính xách tay kinh doanh & giải trí', vn: 'Máy tính xách tay kinh doanh & giải trí' },
  nav_sub_minipc: { zh: '迷你主机', en: 'Mini PC', id: 'Mini PC', vi: 'Mini PC', vn: 'Mini PC' },
  nav_sub_minipc_desc: { zh: '强劲性能的微型电脑', en: 'Powerful micro computer', id: 'Komputer mikro yang kuat', vi: 'Máy tính siêu nhỏ mạnh mẽ', vn: 'Máy tính siêu nhỏ mạnh mẽ' },
  nav_sub_electromechanical: { zh: '机电产品', en: 'Electromechanical', id: 'Elektromekanik', vi: 'Cơ điện', vn: 'Cơ điện' },
  nav_sub_electromechanical_desc: { zh: '高品质电源与机箱组件', en: 'High quality power supplies & chassis components', id: 'Catu daya & komponen sasis berkualitas tinggi', vi: 'Nguồn điện & linh kiện khung gầm chất lượng cao', vn: 'Nguồn điện & linh kiện khung gầm chất lượng cao' },
  nav_sub_monitor: { zh: '显示器', en: 'Monitors', id: 'Monitor', vi: 'Màn hình', vn: 'Màn hình' },
  nav_sub_monitor_desc: { zh: '高色域超清显示屏', en: 'High color gamut ultra-clear displays', id: 'Layar ultra-clear gamut warna tinggi', vi: 'Màn hình siêu nét gam màu cao', vn: 'Màn hình siêu nét gam màu cao' },
  nav_sub_components: { zh: '电脑配件', en: 'Components', id: 'Komponen', vi: 'Linh kiện', vn: 'Linh kiện' },
  nav_sub_components_desc: { zh: '核心硬件与升级配件', en: 'Core hardware & upgrade parts', id: 'Perangkat keras inti & suku cadang peningkatan', vi: 'Phần cứng cốt lõi & phụ tùng nâng cấp', vn: 'Phần cứng cốt lõi & phụ tùng nâng cấp' },
  nav_sub_conference: { zh: '会议平板', en: 'Conference Screen', id: 'Layar Konferensi', vi: 'Màn hình hội nghị', vn: 'Màn hình hội nghị' },
  nav_sub_conference_desc: { zh: '智能协作与会议系统', id: 'Sistem kolaborasi & pertemuan pintar', vi: 'Hệ thống cộng tác & hội họp thông minh', vn: 'Hệ thống cộng tác & hội họp thông minh' },
  nav_sub_selfservice: { zh: '自助终端', en: 'Kiosk', id: 'Kios', vi: 'Kiosk', vn: 'Kiosk' },
  nav_sub_selfservice_desc: { zh: '政务与零售自助一体机', en: 'Government & retail self-service terminals', id: 'Terminal mandiri pemerintah & ritel', vi: 'Thiết bị tự phục vụ chính phủ & bán lẻ', vn: 'Thiết bị tự phục vụ chính phủ & bán lẻ' },
  nav_sub_industrial: { zh: '工控主机', en: 'Industrial PC', id: 'PC Industri', vi: 'PC công nghiệp', vn: 'PC công nghiệp' },
  nav_sub_industrial_desc: { zh: '宽温防尘工业控制电脑', en: 'Wide temperature & dustproof industrial PCs', id: 'PC industri tahan debu & suhu luas', vi: 'PC công nghiệp chống bụi & nhiệt độ rộng', vn: 'PC công nghiệp chống bụi & nhiệt độ rộng' },
  nav_sub_led: { zh: 'LED显示屏', en: 'LED Display', id: 'Layar LED', vi: 'Màn hình LED', vn: 'Màn hình LED' },
  nav_sub_led_desc: { zh: '室内外高亮无缝拼接屏', en: 'Indoor & outdoor high-brightness seamless screens', id: 'Layar mulus kecerahan tinggi indoor & outdoor', vi: 'Màn hình liền mạch độ sáng cao trong nhà & ngoài trời', vn: 'Màn hình liền mạch độ sáng cao trong nhà & ngoài trời' },
  nav_sub_showroom: { zh: '展厅工程', en: 'Showroom Solutions', id: 'Solusi Ruang Pameran', vi: 'Giải pháp phòng trưng bày', vn: 'Giải pháp phòng trưng bày' },
  nav_sub_showroom_desc: { zh: '数字化多媒体展厅定制', en: 'Digital multimedia showroom customization', id: 'Kustomisasi ruang pameran multimedia digital', vi: 'Tùy chỉnh phòng trưng bày đa phương tiện kỹ thuật số', vn: 'Tùy chỉnh phòng trưng bày đa phương tiện kỹ thuật số' }
};

export function Navbar({ locale, setLocale, headerTheme = 'dark', themeLine }: NavbarProps) {
  const { t: tr } = useTranslations(locale);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getSystemText = (key: string) => {
    const fromDb = tr(key);
    if (fromDb) return fromDb;
    const fallback = SYSTEM_FALLBACKS[key];
    if (fallback) {
      return fallback[locale] || fallback['en'] || '';
    }
    return key;
  };
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

  const handleMouseEnter = (menu: string, e?: React.MouseEvent) => {
    // 过滤掉浏览器界面的边界鬼畜 hover 事件（例如鼠标在收藏夹、标签页移动时 Y 坐标接近 0 产生的越界事件）
    if (e && e.clientY !== undefined && e.clientY < 10) {
      return;
    }
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

  // Determine if the page has a dark/colored header area at the top (dynamically supporting the active locale)
  const isTransparentHeaderPage = useMemo(() => {
    const cleanPath = pathname.replace(new RegExp(`^\\/${locale}`), '') || '/';
    return cleanPath === '/' || cleanPath === '/products';
  }, [pathname, locale]);

  // Navbar is "Active" (White Opaque) if:
  // 1. Scrolled down
  // 2. A mega menu is hovered
  // 3. Mobile menu is open
  // 4. We are on a page that DOES NOT have a dark header background
  const isNavbarActive = !isTransparentHeaderPage || isScrolled || activeMenu !== null || mobileMenuOpen;

  // 1. Fetch dynamic categories
  const { data: remoteCats } = useLocalCollection<any>('productCategories');

  // Inject category translations to global cache for dynamic page switching and SSR fallback
  useEffect(() => {
    if (remoteCats && Array.isArray(remoteCats)) {
      const trans = remoteCats.flatMap((c: any) => [c.nameText, c.descriptionText].filter(Boolean));
      injectTranslations(locale, trans);
    }
  }, [remoteCats, locale]);

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
    // 优先使用 Hook 数据，其次使用全局预加载的公开数据
    const isClient = typeof window !== 'undefined';
    const publicSettings = isClient 
      ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ 
      : (typeof global !== 'undefined' ? (global as any).__HEOVOSE_PUBLIC_SETTINGS__ : null);
    
    const availableCats = (remoteCats && remoteCats.length > 0) 
      ? remoteCats 
      : (publicSettings?.productCategories || []);

    if (!availableCats || availableCats.length === 0) {
      // Return hardcoded fallbacks if no data yet to avoid empty navbar
      return {
        wholesaleItems: [
          { id: 'aio', label: getSystemText('nav_sub_aio'), desc: getSystemText('nav_sub_aio_desc'), icon: Monitor, href: '/products?category=AIO' },
          { id: 'laptop', label: getSystemText('nav_sub_laptop'), desc: getSystemText('nav_sub_laptop_desc'), icon: Laptop, href: '/products?category=Laptops' },
          { id: 'minipc', label: getSystemText('nav_sub_minipc'), desc: getSystemText('nav_sub_minipc_desc'), icon: Cpu, href: '/products?category=Mini%20PC' },
          { id: 'electromechanical', label: getSystemText('nav_sub_electromechanical'), desc: getSystemText('nav_sub_electromechanical_desc'), icon: Zap, href: '/products?category=Electromechanical' },
          { id: 'monitor', label: getSystemText('nav_sub_monitor'), desc: getSystemText('nav_sub_monitor_desc'), icon: Tv, href: '/products?category=Monitors' },
          { id: 'components', label: getSystemText('nav_sub_components'), desc: getSystemText('nav_sub_components_desc'), icon: HardDrive, href: '/products?category=Components' },
        ],
        projectItems: [
          { id: 'conference', label: getSystemText('nav_sub_conference'), desc: getSystemText('nav_sub_conference_desc'), icon: Presentation, href: '/products?category=Conference' },
          { id: 'selfservice', label: getSystemText('nav_sub_selfservice'), desc: getSystemText('nav_sub_selfservice_desc'), icon: MousePointerClick, href: '/products?category=KIOSK' },
          { id: 'industrial', label: getSystemText('nav_sub_industrial'), desc: getSystemText('nav_sub_industrial_desc'), icon: Factory, href: '/products?category=Industrial' },
          { id: 'led', label: getSystemText('nav_sub_led'), desc: getSystemText('nav_sub_led_desc'), icon: Lightbulb, href: '/products?category=LED' },
          { id: 'showroom', label: getSystemText('nav_sub_showroom'), desc: getSystemText('nav_sub_showroom_desc'), icon: Store, href: '/products?category=Showroom' },
        ]
      };
    }

    const wholesale = availableCats
      .filter((c: any) => c.parentId === 'WHOLESALE')
      .map((c: any) => ({
        id: c.id,
        label: tr(c.nameTextId),
        desc: tr(c.descriptionTextId),
        icon: getIcon(c.id),
        href: `/products?category=${encodeURIComponent(c.slug)}`
      }));

    const projects = availableCats
      .filter((c: any) => c.parentId === 'PROJECT')
      .map((c: any) => ({
        id: c.id,
        label: tr(c.nameTextId),
        desc: tr(c.descriptionTextId),
        icon: getIcon(c.id),
        href: `/products?category=${encodeURIComponent(c.slug)}`
      }));

    return { wholesaleItems: wholesale, projectItems: projects };
  }, [remoteCats, locale, getSystemText, tr]);

  const logoStandard = siteConfig?.logoStandard ? getAssetUrl(siteConfig.logoStandard) : "/image/Heovose-color.svg";
  const logoInverted = siteConfig?.logoInverted ? getAssetUrl(siteConfig.logoInverted) : "/image/Heovose.svg";

  return (
    <>
      {/* 1. Top Scrim & Gradient Blur Layer - The "Advanced Glass" Layer */}
      <div className={cn(
        "fixed top-0 left-0 right-0 z-[105] h-48 pointer-events-none transition-all duration-700 ease-out",
        (!isNavbarActive && isTransparentHeaderPage && isVisible)
          ? (headerTheme === 'light' ? "opacity-60 translate-y-0" : "opacity-80 translate-y-0")
          : "opacity-0 -translate-y-full"
      )}>
        {/* The Scrim: Suble gradient to ensure contrast */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-transparent transition-all duration-500",
          headerTheme === 'light' && "from-white/70 via-white/30"
        )} />
      </div>

      <nav 
        style={{ transform: isVisible ? 'translateY(0)' : 'translateY(-100%)' }}
        className={cn(
        "fixed top-0 left-0 right-0 z-[110] transition-[transform,background-color,border-color] duration-500 ease-out h-20 flex items-center !border-t-0 !border-x-0",
        isNavbarActive
          ? cn(
              (mounted && navSettings?.navbarMaterial === 'level-03') ? "glass-deep" : "glass-frosted",
              (mounted && navSettings?.showBorder) ? "border-b border-white/20" : "border-b border-transparent",
              (mounted && navSettings?.showShadow) ? "shadow-[0_0px_30px_-12px_rgba(0,0,0,0.25)]" : "shadow-none"
            )
          : "bg-transparent border-b border-transparent"
      )}>
        <div className="container mx-auto px-6 flex items-center w-full h-full">
          <Link href={getLocalizedLink("/", locale)} className="flex items-center shrink-0">
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
                {mounted ? (
                  <DropdownMenu open={activeMenu === 'wholesale'} onOpenChange={(open) => !open && handleMouseLeave()} modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap outline-none cursor-pointer",
                          (isNavbarActive || headerTheme === 'light')
                            ? "text-slate-800 hover:bg-slate-100"
                            : "text-white hover:bg-white/10"
                        )}
                        onMouseEnter={(e) => handleMouseEnter('wholesale', e)}
                        onClick={() => {
                          setActiveMenu(null);
                          router.push(getLocalizedLink('/products?line=wholesale', locale));
                        }}
                      >
                        <span>{getSystemText('NAV_WHOLESALE')}</span>
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
                      onMouseEnter={(e) => handleMouseEnter('wholesale', e)}
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
                          getSystemText={getSystemText}
                          line="wholesale"
                          onMouseEnter={(e) => handleMouseEnter('wholesale', e)}
                          onMouseLeave={handleMouseLeave}
                        />
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    className={cn(
                      "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap outline-none cursor-pointer",
                      (isNavbarActive || headerTheme === 'light')
                        ? "text-slate-800 hover:bg-slate-100"
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    <span>{getSystemText('NAV_WHOLESALE')}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Projects Mega Menu Container */}
              <div className="h-full relative flex items-center">
                {mounted ? (
                  <DropdownMenu open={activeMenu === 'projects'} onOpenChange={(open) => !open && handleMouseLeave()} modal={false}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap outline-none cursor-pointer",
                          (isNavbarActive || headerTheme === 'light')
                            ? "text-slate-800 hover:bg-slate-100"
                            : "text-white hover:bg-white/10"
                        )}
                        onMouseEnter={(e) => handleMouseEnter('projects', e)}
                        onClick={() => {
                          setActiveMenu(null);
                          router.push(getLocalizedLink('/products?line=project', locale));
                        }}
                      >
                        <span>{getSystemText('NAV_PROJECTS')}</span>
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
                      onMouseEnter={(e) => handleMouseEnter('projects', e)}
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
                          getSystemText={getSystemText}
                          line="project"
                          onMouseEnter={(e) => handleMouseEnter('projects', e)}
                          onMouseLeave={handleMouseLeave}
                        />
                        </div>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    className={cn(
                      "flex items-center space-x-1 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap outline-none cursor-pointer",
                      (isNavbarActive || headerTheme === 'light')
                        ? "text-slate-800 hover:bg-slate-100"
                        : "text-white hover:bg-white/10"
                    )}
                  >
                    <span>{getSystemText('NAV_PROJECTS')}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                )}
              </div>

              <Link 
                href={getLocalizedLink("/#cases", locale)} 
                onMouseEnter={handleMouseLeave}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap",
                  (isNavbarActive || headerTheme === 'light')
                    ? "text-slate-800 hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                )}
              >
                {getSystemText('NAV_CASES')}
              </Link>
              <Link 
                href={getLocalizedLink("/service-centers", locale)} 
                onMouseEnter={handleMouseLeave}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap",
                  (isNavbarActive || headerTheme === 'light')
                    ? "text-slate-800 hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                )}
              >
                {getSystemText('NAV_SERVICE_CENTERS')}
              </Link>
              <Link 
                href={getLocalizedLink("/about", locale)} 
                onMouseEnter={handleMouseLeave}
                className={cn(
                  "px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium whitespace-nowrap",
                  (isNavbarActive || headerTheme === 'light')
                    ? "text-slate-800 hover:bg-slate-100"
                    : "text-white hover:bg-white/10"
                )}
              >
                {getSystemText('NAV_ABOUT')}
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
                  {getSystemText('NAV_CONTACT')}
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
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getSystemText('nav_wholesale')}</p>
                <div className="grid grid-cols-2 gap-4">
                  {wholesaleItems.map((item: any) => (
                    <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="text-lg font-bold text-primary">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-dashed">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{getSystemText('nav_projects')}</p>
                <div className="grid grid-cols-2 gap-4">
                  {projectItems.map((item: any) => (
                    <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3">
                      <item.icon className="h-5 w-5 text-primary" />
                      <span className="text-lg font-bold text-primary">{item.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
              <Link href={getLocalizedLink("/#cases", locale)} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{getSystemText('NAV_CASES')}</Link>
              <Link href={getLocalizedLink("/service-centers", locale)} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{getSystemText('NAV_SERVICE_CENTERS')}</Link>
              <Link href={getLocalizedLink("/about", locale)} onClick={() => setMobileMenuOpen(false)} className="text-lg font-bold text-primary">{getSystemText('NAV_ABOUT')}</Link>

              <div className="pt-6 border-t border-slate-100 mt-auto">
                <Button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openInquiry();
                  }}
                  className="w-full rounded-xl bg-primary flex items-center justify-center gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  {getSystemText('NAV_CONTACT')}
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
  getSystemText,
  line,
  onMouseEnter,
  onMouseLeave
}: {
  items: any[],
  navSettings: any,
  locale: Locale,
  tr: any,
  getSystemText: (key: string) => string,
  line: 'wholesale' | 'project',
  onMouseEnter: (e: React.MouseEvent) => void,
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
            {getSystemText('nav_mega_title')}
          </h4>
          <Link 
            href={getLocalizedLink(`/products?line=${line}`, locale)} 
            className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest cursor-pointer hover:translate-x-1 transition-transform text-primary"
          >
            {getSystemText('nav_mega_view_all')} <ArrowRight className="h-3 w-3" />
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
          {items.map((item: any) => (
            <DropdownMenuItem key={item.id} asChild className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent data-[highlighted]:bg-transparent data-[highlighted]:text-initial transition-all duration-300">
              <Link
                href={getLocalizedLink(item.href, locale)}
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
                  <span>{getSystemText('nav_sub_download')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
