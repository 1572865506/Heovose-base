"use client";

import React, { useState, useMemo, useEffect, Suspense, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocalCollection, globalCache } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ArrowRight, ChevronRight, ChevronLeft, LayoutGrid, Loader2, ShoppingBag, Building2, MessageSquare, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import { useTranslations } from '@/hooks/use-translations';
import { useInquiry } from '@/components/providers/InquiryProvider';
import { HoverVideoPlayer } from '@/components/HoverVideoPlayer';
import { injectTranslations } from '@/lib/translation-injector';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  mainImageUrl: string;
  videoUrl?: string;
  galleryImageUrls?: string[];
  categoryId: string;
  tags?: string[];
  status?: 'published' | 'draft';
  enabledLanguages?: string[];
}

interface Category {
  id: string;
  nameTextId: string;
  slug: string;
  parentId?: string | null;
  thumbnailImageUrl?: string;
}

interface LanguageOption {
  code: string;
  label: string;
}

interface LanguageSettings {
  supportedLanguages: LanguageOption[];
  defaultLanguage?: string;
}

type BusinessLine = 'wholesale' | 'project';

interface ProductListClientProps {
  initialLocale: Locale;
  initialProducts: any[];
  initialTotal: number;
  initialCategories: any[];
  initialLangSettings: any;
  initialTranslations: Record<string, any[]>;
}

function ProductListContent(props: ProductListClientProps) {
  const { initialLocale, initialProducts, initialTotal, initialCategories, initialLangSettings, initialTranslations } = props;

  // 必须在渲染期间同步向全局内存缓存写入初始数据！
  // 如果在客户端挂载后的 useEffect 中异步写入，挂载前的第一帧 Hook 会因为找不到缓存项而去触发 api 请求，
  // 导致挂载完后第一帧是空（闪烁为 Loading 或兜底为空），或者由于延迟覆盖使原本有数据的分类在第二帧变空。
  if (typeof window !== 'undefined' || typeof global !== 'undefined') {
    if (!globalCache.has('productCategories')) {
      globalCache.set('productCategories', { data: initialCategories, timestamp: Date.now() });
    }
    const wholesalePath = 'productCategories?parentId=WHOLESALE';
    if (!globalCache.has(wholesalePath)) {
      globalCache.set(wholesalePath, { data: initialCategories.filter((c: any) => c.parentId === 'WHOLESALE' || c.id === 'WHOLESALE'), timestamp: Date.now() });
    }
    const projectPath = 'productCategories?parentId=PROJECT';
    if (!globalCache.has(projectPath)) {
      globalCache.set(projectPath, { data: initialCategories.filter((c: any) => c.parentId === 'PROJECT' || c.id === 'PROJECT'), timestamp: Date.now() });
    }
    
    if (initialLangSettings && !globalCache.has('settings/languages')) {
      globalCache.set('settings/languages', { data: initialLangSettings, timestamp: Date.now() });
    }
    
    if (initialTranslations) {
      Object.entries(initialTranslations).forEach(([lang, trans]) => {
        const transPath = `localizedStrings?lang=${lang}`;
        if (!globalCache.has(transPath)) {
          globalCache.set(transPath, { data: trans, timestamp: Date.now() });
        }
      });
    }
  }

  // 移出渲染主干，统一在客户端挂载后的首个 useEffect 中填充缓存，
  // 避免服务端与客户端在 Concurrent 渲染阶段修改全局变量带来的并发状态冲突副作用
  useEffect(() => {
    // 依然保留挂载后的双重确认注入
    globalCache.set('productCategories', { data: initialCategories, timestamp: Date.now() });
    globalCache.set('productCategories?parentId=WHOLESALE', { data: initialCategories.filter((c: any) => c.parentId === 'WHOLESALE' || c.id === 'WHOLESALE'), timestamp: Date.now() });
    globalCache.set('productCategories?parentId=PROJECT', { data: initialCategories.filter((c: any) => c.parentId === 'PROJECT' || c.id === 'PROJECT'), timestamp: Date.now() });
    
    if (initialLangSettings) {
      globalCache.set('settings/languages', { data: initialLangSettings, timestamp: Date.now() });
    }
    
    if (initialTranslations) {
      Object.entries(initialTranslations).forEach(([lang, trans]) => {
        globalCache.set(`localizedStrings?lang=${lang}`, { data: trans, timestamp: Date.now() });
      });
    }
  }, [initialCategories, initialLangSettings, initialTranslations]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { openInquiry } = useInquiry();
  
  const defaultLangCode = (initialLangSettings?.defaultLanguage as Locale) || 'en';
  // 遵循单一事实源原则：直接使用服务端解出的 initialLocale，不执行二次挂载语言检测切换，
  // 从根本上避免 SSR 与 Hydration HTML 的内容失匹错误
  const locale = initialLocale || defaultLangCode;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  const [isMobileCatOpen, setIsMobileCatOpen] = useState(false);
  const ITEMS_PER_PAGE = 12;
  const [playingProductId, setPlayingProductId] = useState<string | null>(null);
  
  // Navigation visibility tracking for sticky alignment
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 同步手动修改地址栏后的 initialLocale 到 Cookie
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('heovose-locale', initialLocale);
      document.cookie = `NEXT_LOCALE=${initialLocale}; path=/; max-age=31536000`;
    }
  }, [initialLocale]);

  const categoryParam = searchParams.get('category');
  const lineParam = searchParams.get('line') as BusinessLine;

  // Deriving states directly from URL and category mappings to prevent race conditions and layout mismatch
  const activeLine = useMemo<BusinessLine>(() => {
    if (lineParam === 'wholesale' || lineParam === 'project') {
      return lineParam;
    }
    if (categoryParam) {
      const found = initialCategories?.find((c: any) => c.slug === categoryParam || c.id === categoryParam);
      if (found) {
        if (found.parentId === 'PROJECT') return 'project';
        if (found.parentId === 'WHOLESALE') return 'wholesale';
      }
    }
    return 'wholesale';
  }, [lineParam, categoryParam, initialCategories]);

  // Using useLocalCollection/useLocalDoc but they will hit globalCache instantly
  const { data: categories, isLoading: isCatsLoading } = useLocalCollection<Category>(
    categoryParam 
      ? 'productCategories' 
      : `productCategories?parentId=${activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT'}`
  );
  const { data: langSettings } = useLocalDoc<LanguageSettings>('settings', 'languages');
  const { t: tr, isLoading: isTrLoading } = useTranslations(locale);

  const selectedCategoryId = useMemo(() => {
    if (!categoryParam) return null;
    const currentCats = categories || initialCategories;
    if (!currentCats) return null;
    const found = currentCats.find(c => c.slug === categoryParam || c.id === categoryParam);
    return found ? found.id : null;
  }, [categoryParam, categories, initialCategories]);

  const currentPage = useMemo(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(page) || page < 1 ? 1 : page;
  }, [searchParams]);

  // 判断是否为默认页面状态（非搜索、无特定分类、批发产品线且处于第1页）
  const isDefaultState = currentPage === 1 && 
                         !categoryParam && 
                         !searchParams.get('search') && 
                         activeLine === 'wholesale';

  // Initialize products using the server-rendered preloaded data
  const [productsData, setProductsData] = useState<{ products: Product[], pagination: { total: number, page: number, limit: number, totalPages: number } } | null>(() => {
    if (!isDefaultState) {
      return null;
    }
    return {
      products: initialProducts,
      pagination: {
        total: initialTotal,
        page: 1,
        limit: ITEMS_PER_PAGE,
        totalPages: Math.ceil(initialTotal / ITEMS_PER_PAGE)
      }
    };
  });
  const [isProdsLoading, setIsProdsLoading] = useState(!isDefaultState);
  const isFirstRender = useRef(true);

  // 快速搜索 300ms 防抖处理
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle Search Input Change: Reset URL page param to 1 on search change
  const prevSearchRef = useRef(debouncedSearchQuery);
  useEffect(() => {
    if (debouncedSearchQuery !== prevSearchRef.current) {
      setProductsData(null);
      setIsProdsLoading(true);
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        params.set('page', '1');
        router.replace(`${window.location.pathname}?${params.toString()}`, { scroll: false });
      }
      prevSearchRef.current = debouncedSearchQuery;
    }
  }, [debouncedSearchQuery, router]);

  const getT = tr;

  // 3. 计算当前业务线下可选的分类
  const filteredCategories = useMemo(() => {
    const currentCats = (categories && categories.length > 0) ? categories : initialCategories;
    if (!currentCats) return [];
    const parentId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    return currentCats.filter(c => c.parentId === parentId && c.id !== parentId);
  }, [categories, initialCategories, activeLine]);

  // 当筛选参数或语种改变时，从后端分页拉取产品数据
  useEffect(() => {
    // Skip duplicate initial API fetch on mount when params are matching default wholesale states
    if (isFirstRender.current) {
      isFirstRender.current = false;
      const isDefault = currentPage === 1 && 
                        selectedCategoryId === null && 
                        debouncedSearchQuery === '' && 
                        activeLine === 'wholesale' && 
                        locale === defaultLangCode;
      if (isDefault) {
        return;
      }
    }

    let isMounted = true;
    setIsProdsLoading(true);
    
    const params = new URLSearchParams();
    params.set('page', String(currentPage));
    params.set('limit', String(ITEMS_PER_PAGE));
    params.set('status', 'published');
    params.set('lang', locale);
    
    if (selectedCategoryId) {
      params.set('categoryId', selectedCategoryId);
    } else {
      const rootId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
      params.set('categoryId', rootId);
    }
    
    if (debouncedSearchQuery) {
      params.set('search', debouncedSearchQuery);
    }
    
    fetch(`/api/products?${params.toString()}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch paginated products');
        return res.json();
      })
      .then(data => {
        if (!isMounted) return;
        setProductsData(data);
        setIsProdsLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch paginated products:', err);
        if (isMounted) setIsProdsLoading(false);
      });
      
    return () => {
      isMounted = false;
    };
  }, [currentPage, selectedCategoryId, debouncedSearchQuery, activeLine, locale, defaultLangCode]);

  // 注入产品翻译到本地全局缓存
  useEffect(() => {
    if (productsData?.products) {
      const trans = productsData.products.flatMap((p: any) => [p.nameText, p.descriptionText].filter(Boolean));
      injectTranslations(locale, trans);
    }
  }, [productsData, locale]);

  // 注入分类翻译到本地全局缓存
  useEffect(() => {
    const currentCats = categories || initialCategories;
    if (currentCats && Array.isArray(currentCats)) {
      const trans = currentCats.flatMap((c: any) => [c.nameText, c.descriptionText].filter(Boolean));
      injectTranslations(locale, trans);
    }
  }, [categories, initialCategories, locale]);

  const filteredProducts = {
    length: productsData?.pagination.total || 0
  };
  const paginatedProducts = productsData?.products || [];
  const totalPages = productsData?.pagination.totalPages || 0;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 1) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      let adjustedStart = start;
      let adjustedEnd = end;
      if (currentPage <= 3) {
        adjustedEnd = 4;
      }
      if (currentPage >= totalPages - 2) {
        adjustedStart = totalPages - 3;
      }

      for (let i = Math.max(2, adjustedStart); i <= Math.min(totalPages - 1, adjustedEnd); i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }
    return pages;
  };

  const rootCategory = useMemo(() => {
    const currentCats = (categories && categories.length > 0) ? categories : initialCategories;
    if (!currentCats) return null;
    const rootId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    return currentCats.find(c => c.id === rootId);
  }, [categories, initialCategories, activeLine]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return tr('products_allCategories');
    const currentCats = (categories && categories.length > 0) ? categories : initialCategories;
    const cat = currentCats?.find(c => c.id === selectedCategoryId);
    return cat ? getT(cat.nameTextId) : tr('products_allCategories');
  }, [selectedCategoryId, categories, initialCategories, locale, tr]);

  if (isTrLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" /></div>;
  }

  const updateCategoryFilter = (catId: string | null) => {
    setProductsData(null);
    setIsProdsLoading(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (catId) {
        const currentCats = categories || initialCategories;
        const cat = currentCats?.find(c => c.id === catId);
        params.set('category', cat?.slug || catId);
      } else {
        params.delete('category');
      }
      params.set('page', '1'); // Force page back to 1 on category change to prevent out-of-bound errors
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  };

  const handleLineSwitch = (line: BusinessLine) => {
    setProductsData(null);
    setIsProdsLoading(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('line', line);
      params.delete('category');
      params.set('page', '1'); // Force page back to 1 on line change
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
    }
  };

  const handlePageChange = (newPage: number) => {
    setProductsData(null);
    setIsProdsLoading(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(newPage));
      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl, { scroll: false });
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <main className="relative min-h-screen bg-[#F8F9FA]">
      <Navbar locale={locale} setLocale={(newLoc) => {
        if (typeof window !== 'undefined') {
          document.cookie = `NEXT_LOCALE=${newLoc}; path=/; max-age=31536000`;
          window.location.pathname = window.location.pathname.replace(/^\/[a-z]{2,3}/i, `/${newLoc}`);
        }
      }} themeLine={activeLine} />
      
      {/* Hero Section */}
      <section className="pt-40 pb-20 bg-primary text-white relative transition-colors duration-700 overflow-hidden">
        <div className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          rootCategory?.thumbnailImageUrl ? "opacity-30" : "opacity-0"
        )}>
          {rootCategory?.thumbnailImageUrl && (
            <Image 
              src={getAssetUrl(rootCategory.thumbnailImageUrl)} 
              alt="" 
              fill 
              className="object-cover mix-blend-overlay" 
              unoptimized
            />
          )}
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1">
              {activeLine === 'wholesale' ? tr('products_wholesaleLine') : tr('products_projectSolutions')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight leading-[0.9]">
              {tr('products_listTitle')}
            </h1>
            <p className="text-xl opacity-70 font-light max-w-xl">
              {tr('products_listSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Control Bar */}
      <section className={cn(
        "sticky z-40 bg-white/80 backdrop-blur-md border-b border-border/40 py-4 transition-all duration-700 ease-in-out",
        isNavVisible ? "top-20" : "top-0"
      )}>
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex bg-muted/40 p-1 rounded-full border border-border/40 w-full md:w-auto">
            <button 
              onClick={() => handleLineSwitch('wholesale')}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                activeLine === 'wholesale' ? "bg-white text-primary shadow-lg" : "text-muted-foreground hover:text-primary"
              )}
            >
              <ShoppingBag className={cn("h-3.5 w-3.5", activeLine === 'wholesale' ? "text-primary" : "opacity-40")} />
              {tr('nav_wholesale')}
            </button>
            <button 
              onClick={() => handleLineSwitch('project')}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                activeLine === 'project' ? "bg-white text-primary shadow-lg" : "text-muted-foreground hover:text-primary"
              )}
            >
              <Building2 className={cn("h-3.5 w-3.5", activeLine === 'project' ? "text-primary" : "opacity-40")} />
              {tr('nav_projects')}
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-[#3C434A] text-white px-3 py-1.5 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-tighter">{filteredProducts.length} {tr('products_itemsCount')}</span>
             </div>
             <span className="text-sm italic font-bold text-primary transition-colors">
               {activeCategoryName}
             </span>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3 space-y-10 lg:sticky lg:top-44 h-fit">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Search className="h-3 w-3" /> {tr('products_quickSearch')}
              </h3>
              <div className="relative">
                <Input
                  placeholder={tr('products_searchPlaceholder')}
                  className="rounded-xl pl-10 border-none bg-white shadow-sm h-12 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
              </div>
            </div>

            {/* PC 端分类列表 */}
            <div className="hidden lg:block space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" /> {tr('products_categories')}
              </h3>
              <div className="space-y-1 bg-white p-2 rounded-2xl shadow-sm border border-border/20">
                <button
                  onClick={() => updateCategoryFilter(null)}
                  className={cn(
                    "w-full text-left px-5 py-3.5 rounded-xl transition-all text-sm font-bold flex items-center justify-between group",
                    selectedCategoryId === null ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span>{tr('products_allCategories')}</span>
                  {selectedCategoryId === null && <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />}
                </button>
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => updateCategoryFilter(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all text-sm font-bold text-left group",
                      selectedCategoryId === cat.id ? "bg-primary text-white shadow-lg" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{getT(cat.nameTextId)}</span>
                    <ChevronRight className={cn("h-4 w-4 transition-all", selectedCategoryId === cat.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                  </button>
                ))}
              </div>
            </div>

            {/* 移动端分类折叠面板 */}
            <div className="block lg:hidden space-y-2">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" /> {tr('products_categories')}
              </h3>
              <button
                onClick={() => setIsMobileCatOpen(!isMobileCatOpen)}
                className="w-full bg-white px-5 py-4 rounded-2xl shadow-sm border border-border/20 flex items-center justify-between font-bold text-sm text-slate-800 transition-all hover:bg-slate-50"
              >
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-normal">{tr('products_categories')}:</span>
                  <span className="text-primary font-bold">{activeCategoryName}</span>
                </span>
                <ChevronDown className={cn("h-4 w-4 text-slate-500 transition-transform duration-300", isMobileCatOpen ? "rotate-180" : "")} />
              </button>
              
              {isMobileCatOpen && (
                <div className="bg-white p-2 rounded-2xl shadow-sm border border-border/20 space-y-1 mt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                  <button
                    onClick={() => {
                      updateCategoryFilter(null);
                      setIsMobileCatOpen(false);
                    }}
                    className={cn(
                      "w-full text-left px-5 py-3 rounded-xl transition-all text-sm font-bold flex items-center justify-between",
                      selectedCategoryId === null ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span>{tr('products_allCategories')}</span>
                  </button>
                  {filteredCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        updateCategoryFilter(cat.id);
                        setIsMobileCatOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-5 py-3 rounded-xl transition-all text-sm font-bold text-left",
                        selectedCategoryId === cat.id ? "bg-primary text-white font-bold" : "hover:bg-muted text-muted-foreground"
                      )}
                    >
                      <span>{getT(cat.nameTextId)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* PC 端侧栏报价卡片 */}
            <div className="hidden lg:block p-8 rounded-[2rem] bg-primary text-white space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h4 className="font-bold text-lg leading-tight">{tr('products_needQuote')}</h4>
              <p className="text-xs opacity-70 leading-relaxed">{tr('products_expertHelp')}</p>
              <Button 
                onClick={() => openInquiry()}
                variant="secondary" 
                className="w-full rounded-xl h-12 bg-white text-primary hover:bg-accent border-none font-bold uppercase text-[10px] tracking-widest"
              >
                {tr('products_contactSales')}
              </Button>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-8 min-h-[600px] relative">
            {isProdsLoading && paginatedProducts.length === 0 ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{tr('products_syncing')}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="space-y-16 relative">
                {isProdsLoading && (
                  <div className="absolute inset-0 bg-[#F8F9FA]/40 backdrop-blur-[1px] flex justify-center z-10 rounded-3xl transition-opacity duration-300 pt-20 pointer-events-none">
                    <div className="bg-white/90 backdrop-blur-md rounded-full px-6 py-3 shadow-xl border border-border/40 flex items-center gap-3 h-fit">
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                      <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{tr('products_syncing')}</span>
                    </div>
                  </div>
                )}
                <div className={cn(
                  "grid grid-cols-2 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8 animate-in fade-in duration-700 transition-opacity duration-300",
                  isProdsLoading ? "opacity-40 pointer-events-none" : "opacity-100"
                )}>
                  {paginatedProducts.map((product) => {
                    const videoSrc = product.videoUrl || product.galleryImageUrls?.find(url => /\.(mp4|webm|ogg|mov|m4v)$/i.test(url)) || '';
                    return (
                      <div 
                        key={product.id}
                        className="group relative bg-white rounded-xl md:rounded-2xl border border-border/20 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-[transform,box-shadow] duration-500 flex flex-col shadow-sm min-h-[300px] md:min-h-[440px] transform-gpu backface-hidden"
                        style={{ transform: 'translateZ(0)' }}
                      >
                        <Link href={`/products/${product.id}`} className="block">
                          <div className="relative aspect-[11/9] bg-muted/20 overflow-hidden">
                            <HoverVideoPlayer
                              productId={product.id}
                              videoUrl={videoSrc}
                              mainImageUrl={product.mainImageUrl}
                              alt={getT(product.nameTextId) || 'Product Image'}
                            />
                          </div>
                        <div className="px-3 md:px-8 pt-3 md:pt-8 pb-20 md:pb-24 space-y-2 md:space-y-4 flex flex-col flex-1">
                          <div className="space-y-1">
                            <h3 className="text-xs md:text-xl font-headline font-bold text-slate-900 transition-colors leading-tight line-clamp-2 group-hover:text-primary">
                              {(getT(product.nameTextId) || '').length > 22 
                                ? (getT(product.nameTextId) || '').substring(0, 22) + '...' 
                                : getT(product.nameTextId)}
                            </h3>
                          </div>
                          <p className="text-[10px] md:text-xs text-muted-foreground line-clamp-2 md:line-clamp-3 leading-relaxed opacity-60 whitespace-pre-line">
                            {getT(product.descriptionTextId)}
                          </p>
                        </div>
                      </Link>
                      
                      {/* Action Area */}
                      <div className="absolute bottom-0 left-0 right-0 px-3 md:px-8 pb-3 md:pb-8">
                        <div className="flex items-center justify-between gap-2 md:gap-4">
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              openInquiry({ productId: product.id, productName: getT(product.nameTextId) });
                            }}
                            className="rounded-full px-2 md:px-5 text-[9px] md:text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-500 gap-1 md:gap-2 flex-1 h-8 md:h-10 justify-center"
                          >
                            <MessageSquare className="h-3 w-3 shrink-0" />
                            <span className="hidden sm:inline">{tr('products_requestQuote')}</span>
                          </Button>
                          <Link 
                            href={`/products/${product.id}`}
                            className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-500 shrink-0"
                          >
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>

                {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-16 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-primary/10 pt-8">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    {locale === 'zh' 
                      ? `显示第 ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} 个产品，共 ${filteredProducts.length} 个`
                      : `SHOWING ${Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredProducts.length)} - ${Math.min(currentPage * ITEMS_PER_PAGE, filteredProducts.length)} OF ${filteredProducts.length} PRODUCTS`}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === 1}
                      onClick={() => {
                        handlePageChange(Math.max(currentPage - 1, 1));
                      }}
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all duration-300",
                        currentPage === 1 
                          ? "text-muted-foreground/30 border-border/40 cursor-not-allowed opacity-50" 
                          : "text-primary border-border/60 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum, idx) => {
                        if (pageNum === '...') {
                          return (
                            <span key={`dots-${idx}`} className="px-2 text-muted-foreground select-none">
                              ...
                            </span>
                          );
                        }
                        const isSelected = currentPage === pageNum;
                        return (
                          <Button
                            key={`page-${pageNum}`}
                            variant={isSelected ? "outline" : "ghost"}
                            onClick={() => {
                              handlePageChange(pageNum as number);
                            }}
                            className={cn(
                              "h-10 w-10 p-0 rounded-xl transition-all duration-300",
                              isSelected 
                                ? "border-primary/20 bg-primary/10 text-primary font-bold shadow-sm hover:bg-primary/20 hover:text-primary" 
                                : "text-muted-foreground hover:bg-primary/5 hover:text-primary font-medium"
                            )}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      disabled={currentPage === totalPages}
                      onClick={() => {
                        handlePageChange(Math.min(currentPage + 1, totalPages));
                      }}
                      className={cn(
                        "h-10 w-10 rounded-xl transition-all duration-300",
                        currentPage === totalPages 
                          ? "text-muted-foreground/30 border-border/40 cursor-not-allowed opacity-50" 
                          : "text-primary border-border/60 hover:bg-primary/5 hover:text-primary"
                      )}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Mobile Quote Card */}
              <div className="block lg:hidden mt-8 p-8 rounded-[2rem] bg-primary text-white space-y-4 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
                <h4 className="font-bold text-lg leading-tight">{tr('products_needQuote')}</h4>
                <p className="text-xs opacity-70 leading-relaxed">{tr('products_expertHelp')}</p>
                <Button 
                  variant="secondary" 
                  onClick={() => openInquiry()}
                  className="w-full rounded-xl h-12 bg-white text-primary hover:bg-accent border-none font-bold uppercase text-[10px] tracking-widest"
                >
                  {tr('products_contactSales')}
                </Button>
              </div>
            </div>
            ) : (
              <div className="py-32 text-center flex flex-col items-center justify-center gap-6 bg-white rounded-[3rem] border border-dashed border-border/60 px-6">
                <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                   <LayoutGrid className="h-10 w-10 opacity-10" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-primary">{tr('products_noResults')}</p>
                  <p className="text-xs text-muted-foreground">{tr('products_listSubtitle')}</p>
                </div>
                <div className="flex flex-col items-center gap-4">
                  <Button onClick={() => { updateCategoryFilter(null); setSearchQuery(''); }} variant="outline" className="rounded-xl px-8">{tr('products_resetFilters')}</Button>
                  
                  {filteredCategories && filteredCategories.length > 0 && (
                    <div className="space-y-3 pt-6 border-t border-dashed border-border/60 w-full max-w-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {tr('products_orTryCategories') || (locale === 'zh' ? '或者尝试以下分类' : 'Or try these categories')}
                      </p>
                      <div className="flex flex-wrap justify-center gap-2">
                        {filteredCategories.slice(0, 4).map((cat) => (
                          <Button
                            key={cat.id}
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSearchQuery('');
                              updateCategoryFilter(cat.id);
                            }}
                            className="rounded-full text-xs font-semibold px-4 py-1.5 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-primary transition-all duration-300"
                          >
                            {getT(cat.nameTextId)}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

export default function ProductListClient(props: ProductListClientProps) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="h-10 w-10 animate-spin opacity-10" /></div>}>
      <ProductListContent {...props} />
    </Suspense>
  );
}
