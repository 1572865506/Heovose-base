
"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo, useEffect, Suspense, use, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ArrowRight, ChevronRight, Package, LayoutGrid, Loader2, ShoppingBag, Building2, ExternalLink, MessageSquare } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import { useTranslations } from '@/hooks/use-translations';
import { useInquiry } from '@/components/providers/InquiryProvider';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  mainImageUrl: string;
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

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
  id_?: string; // Note: 'id' is already used for the doc ID, so we use 'id_' or similar if needed, but the Locale type uses 'id'.
  vi?: string;
  [key: string]: any;
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

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { openInquiry } = useInquiry();
  
  const [locale, setLocale] = useState<Locale>('en');
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLine, setActiveLine] = useState<BusinessLine>('wholesale');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
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
  
  const categoryParam = searchParams.get('category');
  const lineParam = searchParams.get('line') as BusinessLine;

  const { data: products, isLoading: isProdsLoading } = useLocalCollection<Product>('products');
  const { data: categories, isLoading: isCatsLoading } = useLocalCollection<Category>('productCategories');
  const { data: langSettings } = useLocalDoc<LanguageSettings>('settings', 'languages');
  const { t: tr, isLoading: isTrLoading } = useTranslations(locale);

  // 1. 智能判定语种
  useEffect(() => {
    const detectLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map(l => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || 'en';

      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] as Locale : 'en';
      if (activeLangs.includes(browserLang)) return browserLang;
      
      return defaultLang;
    };
    
    setLocale(detectLocale());
    setIsLocaleReady(true);
  }, [searchParams, langSettings]);

  // 2. 初始化业务线与分类
  useEffect(() => {
    if (lineParam) setActiveLine(lineParam);
    
    if (categoryParam && categories) {
      const found = categories.find(c => c.slug === categoryParam || c.id === categoryParam);
      if (found) {
        setSelectedCategoryId(found.id);
        if (found.parentId === 'PROJECT' || found.id === 'PROJECT') setActiveLine('project');
        else setActiveLine('wholesale');
      }
    }
  }, [categoryParam, lineParam, categories]);

  const getT = tr;

  // 3. 计算当前业务线下可选的分类
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const parentId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    return categories.filter(c => c.parentId === parentId && c.id !== parentId);
  }, [categories, activeLine]);

  // 4. 过滤产品逻辑
  const filteredProducts = useMemo(() => {
    if (!products || !categories || !isLocaleReady) return [];
    
    const getAllDescendantIds = (parentId: string): string[] => {
      const children = categories.filter(c => c.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(child => {
        ids = [...ids, ...getAllDescendantIds(child.id)];
      });
      return ids;
    };

    const rootId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    const subCategoryIds = [rootId, ...getAllDescendantIds(rootId)];

    return products.filter(p => {
      if (p.status !== 'published') return false;
      const isVisibleInCurrentLocale = (p.enabledLanguages || ['zh', 'en']).includes(locale);
      if (!isVisibleInCurrentLocale) return false;
      
      const belongsToActiveLine = p.categoryId ? subCategoryIds.includes(p.categoryId) : true;
      if (!belongsToActiveLine) return false;

      const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId;
      const productName = getT(p.nameTextId) || '';
      const matchSearch = productName.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchSearch;
    });
  }, [products, categories, activeLine, selectedCategoryId, searchQuery, locale, isLocaleReady]);

  const rootCategory = useMemo(() => {
    if (!categories) return null;
    const rootId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    return categories.find(c => c.id === rootId);
  }, [categories, activeLine]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return tr('products_allCategories');
    const cat = categories?.find(c => c.id === selectedCategoryId);
    return cat ? getT(cat.nameTextId) : tr('products_allCategories');
  }, [selectedCategoryId, categories, locale, tr]);

  if (isProdsLoading || isCatsLoading || isTrLoading || !isLocaleReady) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" /></div>;
  }

  const handleLineSwitch = (line: BusinessLine) => {
    setActiveLine(line);
    setSelectedCategoryId(null);
  };

  const isLoading = isProdsLoading || isCatsLoading || isTrLoading;

  return (
    <main className="relative min-h-screen bg-[#F8F9FA]">
      <Navbar locale={locale} setLocale={setLocale} themeLine={activeLine} />
      
      {/* Hero Section - Unified to Primary Blue */}
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
          <aside className="lg:col-span-3 space-y-10">
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

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" /> {tr('products_categories')}
              </h3>
              <div className="space-y-1 bg-white p-2 rounded-2xl shadow-sm border border-border/20">
                <button
                  onClick={() => setSelectedCategoryId(null)}
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
                    onClick={() => setSelectedCategoryId(cat.id)}
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

            <div className="p-8 rounded-[2rem] bg-primary text-white space-y-4 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h4 className="font-bold text-lg leading-tight">{tr('products_needQuote')}</h4>
              <p className="text-xs opacity-70 leading-relaxed">{tr('products_expertHelp')}</p>
              <Button variant="secondary" className="w-full rounded-xl h-12 bg-white text-primary hover:bg-accent border-none font-bold uppercase text-[10px] tracking-widest">{tr('products_contactSales')}</Button>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-8 min-h-[600px]">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{tr('products_syncing')}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="group relative bg-white rounded-2xl border border-border/20 overflow-hidden hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2 transition-[transform,box-shadow] duration-500 flex flex-col shadow-sm min-h-[440px] transform-gpu backface-hidden"
                    style={{ transform: 'translateZ(0)' }}
                  >
                    <Link href={`/products/${product.id}`} className="block">
                      <div className="relative aspect-[11/9] bg-muted/20 overflow-hidden">
                        <Image
                          src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')}
                          alt={getT(product.nameTextId) || 'Product Image'}
                          fill
                          className="object-cover hover:scale-110 transition-transform duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                          unoptimized={product.mainImageUrl?.startsWith('data:')}
                        />
                      </div>
                      <div className="px-8 pt-8 pb-24 space-y-4 flex flex-col">
                        <div className="space-y-1">
                          <h3 className="text-xl font-headline font-bold text-slate-900 transition-colors leading-tight line-clamp-2 group-hover:text-primary">
                            {(getT(product.nameTextId) || '').length > 22 
                              ? (getT(product.nameTextId) || '').substring(0, 22) + '...' 
                              : getT(product.nameTextId)}
                          </h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed opacity-60 whitespace-pre-line">
                          {getT(product.descriptionTextId)}
                        </p>
                      </div>
                    </Link>
                    
                    {/* Action Area - Homepage Style */}
                    <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
                      <div className="flex items-center justify-between gap-4">
                        <Button 
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            openInquiry({ productId: product.id, productName: getT(product.nameTextId) });
                          }}
                          className="rounded-full px-5 text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-500 gap-2 flex-1 h-10"
                        >
                          <MessageSquare className="h-3 w-3" />
                          {tr('products_requestQuote')}
                        </Button>
                        <Link 
                          href={`/products/${product.id}`}
                          className="h-10 w-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-500 shrink-0"
                        >
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-40 text-center flex flex-col items-center justify-center gap-6 bg-white rounded-[3rem] border border-dashed border-border/60">
                <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
                   <LayoutGrid className="h-10 w-10 opacity-10" />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-primary">{tr('products_noResults')}</p>
                  <p className="text-xs text-muted-foreground">{tr('products_listSubtitle')}</p>
                </div>
                <Button onClick={() => { setSelectedCategoryId(null); setSearchQuery(''); }} variant="outline" className="rounded-xl px-8">{tr('products_resetFilters')}</Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

export default function ProductListPage({ searchParams }: { searchParams: Promise<any> }) {
  use(searchParams);
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="h-10 w-10 animate-spin opacity-10" /></div>}>
      <ProductListContent />
    </Suspense>
  );
}
