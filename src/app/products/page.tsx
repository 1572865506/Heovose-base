
"use client";

import React, { useState, useMemo, useEffect, Suspense, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ArrowRight, ChevronRight, Package, LayoutGrid, Loader2, ShoppingBag, Building2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

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

type BusinessLine = 'wholesale' | 'project';

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [locale, setLocale] = useState<Locale>('en');
  const { t: tr } = useTranslations(locale);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLine, setActiveLine] = useState<BusinessLine>('wholesale');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const categoryParam = searchParams.get('category');
  const lineParam = searchParams.get('line') as BusinessLine;
  const t = translations[locale].products;

  const { data: products, isLoading: isProdsLoading } = useLocalCollection<Product>('products');
  const { data: categories, isLoading: isCatsLoading } = useLocalCollection<Category>('productCategories');
  const { data: allTranslations } = useLocalCollection<LocalizedString>('localizedStrings');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');

  // 1. 智能判定语种
  useEffect(() => {
    const detectLocale = () => {
      const langParam = searchParams.get('lang');
      if (langParam && ['en', 'zh', 'id', 'vi'].includes(langParam)) return langParam as Locale;
      const saved = localStorage.getItem('heovose-locale') as Locale;
      if (saved && ['en', 'zh', 'id', 'vi'].includes(saved)) return saved;
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (['en', 'zh', 'id', 'vi'].includes(browserLang)) return browserLang;
      return (langSettings?.defaultLanguage as Locale) || 'en';
    };
    setLocale(detectLocale());
  }, [searchParams, langSettings]);

  // 2. 初始化业务线与分类
  useEffect(() => {
    if (lineParam) setActiveLine(lineParam);
    
    if (categoryParam && categories) {
      const found = categories.find(c => c.slug === categoryParam || c.id === categoryParam);
      if (found) {
        setSelectedCategoryId(found.id);
        // 如果该分类属于项目产品，自动切换业务线
        if (found.parentId === 'PROJECT' || found.id === 'PROJECT') setActiveLine('project');
        else setActiveLine('wholesale');
      }
    }
  }, [categoryParam, lineParam, categories]);

  const getT = (id: string | null | undefined) => {
    if (!id) return '';
    const entry = allTranslations?.find(item => item.id === id);
    if (!entry) return id || '';
    return entry[locale] || entry['en'] || entry['zh'] || id || '';
  };

  // 3. 计算当前业务线下可选的分类
  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    const parentId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    // 返回所有 parentId 匹配该业务线的分类
    return categories.filter(c => c.parentId === parentId && c.id !== parentId);
  }, [categories, activeLine]);

  // 4. 过滤产品逻辑
  const filteredProducts = useMemo(() => {
    if (!products || !categories) return [];
    
    // 递归获取所有子分类 ID
    const getAllDescendantIds = (parentId: string): string[] => {
      const children = categories.filter(c => c.parentId === parentId);
      let ids = children.map(c => c.id);
      children.forEach(child => {
        ids = [...ids, ...getAllDescendantIds(child.id)];
      });
      return ids;
    };

    // 获取当前业务线下所有的子分类 ID 列表
    const rootId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    const subCategoryIds = [rootId, ...getAllDescendantIds(rootId)];

    return products.filter(p => {
      if (p.status !== 'published') return false;

      // 语言可见性校验：如果该产品在当前语言下未启用可见性，则不显示
      const isVisibleInCurrentLocale = (p.enabledLanguages || ['zh', 'en']).includes(locale);
      if (!isVisibleInCurrentLocale) return false;
      
      // 匹配业务线逻辑：
      // 1. 如果产品有分类，检查该分类是否属于当前选中的业务线子树
      // 2. 如果产品没有分类，目前默认在“所有分类”下展示（可选逻辑）
      const belongsToActiveLine = p.categoryId ? subCategoryIds.includes(p.categoryId) : true;
      if (!belongsToActiveLine) return false;

      // 其次匹配选中的具体子分类
      const matchesCategory = !selectedCategoryId || p.categoryId === selectedCategoryId;
      
      // 最后匹配搜索
      const nameText = getT(p.nameTextId) || '';
      const matchesSearch = nameText.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, categories, activeLine, selectedCategoryId, searchQuery, allTranslations, locale]);

  const rootCategory = useMemo(() => {
    if (!categories) return null;
    const rootId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    return categories.find(c => c.id === rootId);
  }, [categories, activeLine]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return tr('products_allCategories');
    const cat = categories?.find(c => c.id === selectedCategoryId);
    return cat ? getT(cat.nameTextId) : tr('products_allCategories');
  }, [selectedCategoryId, categories, allTranslations, locale, tr]);

  const handleLineSwitch = (line: BusinessLine) => {
    setActiveLine(line);
    setSelectedCategoryId(null); // 切换大类时重置具体分类
  };

  const isLoading = isProdsLoading || isCatsLoading;

  return (
    <main className="relative min-h-screen bg-[#F8F9FA]">
      <Navbar locale={locale} setLocale={setLocale} themeLine={activeLine} />
      
      {/* Dynamic Hero Section */}
      <section className={cn(
        "pt-40 pb-20 text-white relative transition-colors duration-700 overflow-hidden",
        activeLine === 'wholesale' ? "bg-primary" : "bg-[#F97316]"
      )}>
        {/* Abstract Background Decoration */}
        <div className={cn(
          "absolute inset-0 transition-opacity duration-1000",
          rootCategory?.thumbnailImageUrl ? "opacity-30" : "opacity-0"
        )}>
          {rootCategory?.thumbnailImageUrl && (
            <Image 
              src={rootCategory.thumbnailImageUrl} 
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

      {/* Control Bar & Switcher */}
      <section className="sticky top-20 z-40 bg-white/80 backdrop-blur-md border-b border-border/40 py-4">
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
                activeLine === 'project' ? "bg-white text-[#F97316] shadow-lg" : "text-muted-foreground hover:text-[#F97316]"
              )}
            >
              <Building2 className={cn("h-3.5 w-3.5", activeLine === 'project' ? "text-[#F97316]" : "opacity-40")} />
              {tr('nav_projects')}
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-[#3C434A] text-white px-3 py-1.5 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-tighter">{filteredProducts.length} {tr('products_itemsCount')}</span>
             </div>
             <span className={cn(
                "text-sm italic font-bold transition-colors",
                activeLine === 'wholesale' ? "text-primary" : "text-[#F97316]"
             )}>
               {activeCategoryName}
             </span>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Navigation */}
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
                    selectedCategoryId === null 
                      ? (activeLine === 'wholesale' ? "bg-primary text-white" : "bg-[#F97316] text-white") 
                      : "hover:bg-muted text-muted-foreground"
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
                      selectedCategoryId === cat.id 
                        ? (activeLine === 'wholesale' ? "bg-primary text-white shadow-lg" : "bg-[#F97316] text-white shadow-lg") 
                        : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span className="group-hover:translate-x-1 transition-transform">{getT(cat.nameTextId)}</span>
                    <ChevronRight className={cn("h-4 w-4 transition-all", selectedCategoryId === cat.id ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2")} />
                  </button>
                ))}
                {filteredCategories.length === 0 && !isCatsLoading && (
                  <div className="px-5 py-8 text-center text-[10px] text-muted-foreground italic uppercase tracking-widest opacity-40">
                    {tr('products_noSubCategories')}
                  </div>
                )}
              </div>
            </div>

            {/* Support Card */}
            <div className={cn(
              "p-8 rounded-[2rem] text-white space-y-4 shadow-xl relative overflow-hidden",
              activeLine === 'wholesale' ? "bg-primary" : "bg-[#F97316]"
            )}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h4 className="font-bold text-lg leading-tight">{tr('products_needQuote')}</h4>
              <p className="text-xs opacity-70 leading-relaxed">{tr('products_expertHelp')}</p>
              <Button variant="secondary" className="w-full rounded-xl h-12 bg-white text-primary hover:bg-accent border-none font-bold uppercase text-[10px] tracking-widest">{tr('products_contactSales')}</Button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9 space-y-8 min-h-[600px]">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className={cn(
                  "h-10 w-10 animate-spin opacity-20",
                  activeLine === 'wholesale' ? "text-primary" : "text-[#F97316]"
                )} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">{tr('products_syncing')}</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group relative bg-white rounded-2xl border border-border/20 overflow-hidden hover:shadow-md hover:-translate-y-2 transition-all duration-500 flex flex-col shadow-sm min-h-[440px]"
                  >
                    <div className="relative aspect-[11/9] bg-muted/20 overflow-hidden">
                      <Image
                        src={product.mainImageUrl || '/image/product-placeholder.png'}
                        alt={getT(product.nameTextId)}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-700"
                        unoptimized={product.mainImageUrl?.startsWith('data:')}
                      />
                    </div>
                    <div className="px-8 pt-8 pb-24 space-y-4 flex flex-col">
                      <div className="space-y-1">
                        <h3 className={cn(
                          "text-xl font-headline font-bold text-slate-900 transition-colors leading-tight line-clamp-2",
                          activeLine === 'wholesale' ? "group-hover:text-primary" : "group-hover:text-[#F97316]"
                        )}>
                          {(getT(product.nameTextId) || '').length > 22 
                            ? (getT(product.nameTextId) || '').substring(0, 22) + '...' 
                            : getT(product.nameTextId)}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed opacity-60 whitespace-pre-line">
                        {getT(product.descriptionTextId)}
                      </p>
                      
                      <div className="absolute bottom-0 left-0 right-0 px-8 pb-8">
                        <div className="flex items-center justify-between">
                          <span className={cn(
                            "text-xs font-bold group-hover:translate-x-1 transition-all flex items-center gap-2",
                            activeLine === 'wholesale' ? "text-primary" : "text-[#F97316]"
                          )}>
                            {tr('products_viewDetails')} <ArrowRight className="h-3.5 w-3.5" />
                          </span>
                          <div className={cn(
                            "h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center transition-all",
                            activeLine === 'wholesale' 
                              ? "text-primary/20 group-hover:bg-primary group-hover:text-white" 
                              : "text-[#F97316]/20 group-hover:bg-[#F97316] group-hover:text-white"
                          )}>
                             <ExternalLink className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
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
