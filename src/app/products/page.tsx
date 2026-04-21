
"use client";

import React, { useState, useMemo, useEffect, Suspense, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ArrowRight, ChevronRight, Package, LayoutGrid, Loader2, ShoppingBag, Building2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  mainImageUrl: string;
  productCategoryId: string;
  tags?: string[];
  status?: 'published' | 'draft';
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
}

type BusinessLine = 'wholesale' | 'project';

function ProductListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const firestore = useFirestore();
  
  const [locale, setLocale] = useState<Locale>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLine, setActiveLine] = useState<BusinessLine>('wholesale');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const categoryParam = searchParams.get('category');
  const lineParam = searchParams.get('line') as BusinessLine;
  const t = translations[locale].products;

  const prodsRef = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const catsRef = useMemoFirebase(() => collection(firestore, 'productCategories'), [firestore]);
  const transRef = useMemoFirebase(() => collection(firestore, 'localizedStrings'), [firestore]);
  const langConfigRef = useMemoFirebase(() => doc(firestore, 'settings', 'languages'), [firestore]);

  const { data: products, isLoading: isProdsLoading } = useCollection<Product>(prodsRef);
  const { data: categories, isLoading: isCatsLoading } = useCollection<Category>(catsRef);
  const { data: allTranslations } = useCollection<LocalizedString>(transRef);
  const { data: langSettings } = useDoc<any>(langConfigRef);

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

  const getT = (id: string) => {
    const entry = allTranslations?.find(item => item.id === id);
    if (!entry) return id;
    return entry[locale] || entry['en'] || entry['zh'] || id;
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
    
    // 获取当前业务线下所有的子分类 ID 列表
    const parentId = activeLine === 'wholesale' ? 'WHOLESALE' : 'PROJECT';
    const subCategoryIds = categories.filter(c => c.parentId === parentId).map(c => c.id);
    // 包含顶级分类本身（以防万一产品直接挂在顶级分类下）
    subCategoryIds.push(parentId);

    return products.filter(p => {
      if (p.status !== 'published') return false;
      
      // 首先必须属于当前业务线
      const belongsToActiveLine = subCategoryIds.includes(p.productCategoryId);
      if (!belongsToActiveLine) return false;

      // 其次匹配选中的子分类
      const matchesCategory = !selectedCategoryId || p.productCategoryId === selectedCategoryId;
      
      // 最后匹配搜索
      const name = getT(p.nameTextId).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }, [products, categories, activeLine, selectedCategoryId, searchQuery, allTranslations, locale]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return t.allCategories;
    const cat = categories?.find(c => c.id === selectedCategoryId);
    return cat ? getT(cat.nameTextId) : t.allCategories;
  }, [selectedCategoryId, categories, allTranslations, locale, t.allCategories]);

  const handleLineSwitch = (line: BusinessLine) => {
    setActiveLine(line);
    setSelectedCategoryId(null); // 切换大类时重置具体分类
  };

  const isLoading = isProdsLoading || isCatsLoading;

  return (
    <main className="relative min-h-screen bg-[#F8F9FA]">
      <Navbar locale={locale} setLocale={setLocale} />
      
      {/* Dynamic Hero Section */}
      <section className={cn(
        "pt-40 pb-20 text-white relative transition-colors duration-700 overflow-hidden",
        activeLine === 'wholesale' ? "bg-primary" : "bg-[#F97316]"
      )}>
        {/* Abstract Background Decoration */}
        <div className="absolute inset-0 opacity-20">
          <Image src="/image/whiteboard02.png" alt="" fill className="object-cover mix-blend-overlay" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-[10px] font-bold uppercase tracking-[0.2em] px-4 py-1">
              {activeLine === 'wholesale' ? 'Wholesale Line' : 'Project Solutions'}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-headline font-bold tracking-tight leading-[0.9]">
              {t.listTitle}
            </h1>
            <p className="text-xl opacity-70 font-light max-w-xl">
              {t.listSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Control Bar & Switcher */}
      <section className="sticky top-24 z-40 bg-white/80 backdrop-blur-md border-b border-border/40 py-4">
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
              {translations[locale].nav.wholesale}
            </button>
            <button 
              onClick={() => handleLineSwitch('project')}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300",
                activeLine === 'project' ? "bg-white text-[#F97316] shadow-lg" : "text-muted-foreground hover:text-[#F97316]"
              )}
            >
              <Building2 className={cn("h-3.5 w-3.5", activeLine === 'project' ? "text-[#F97316]" : "opacity-40")} />
              {translations[locale].nav.projects}
            </button>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="flex items-center gap-2 bg-[#3C434A] text-white px-3 py-1.5 rounded-lg">
                <span className="text-[10px] font-bold uppercase tracking-tighter">{filteredProducts.length} Items</span>
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
                <Search className="h-3 w-3" /> Quick Search
              </h3>
              <div className="relative">
                <Input
                  placeholder={t.searchPlaceholder}
                  className="rounded-xl pl-10 border-none bg-white shadow-sm h-12 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 opacity-20" />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <LayoutGrid className="h-3 w-3" /> Categories
              </h3>
              <div className="space-y-1 bg-white p-2 rounded-[1.5rem] shadow-sm border border-border/20">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "w-full text-left px-5 py-3.5 rounded-xl transition-all text-sm font-bold flex items-center justify-between group",
                    selectedCategoryId === null 
                      ? (activeLine === 'wholesale' ? "bg-primary text-white" : "bg-[#F97316] text-white") 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  <span>{t.allCategories}</span>
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
                    No sub-categories defined
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
              <h4 className="font-bold text-lg leading-tight">Need a custom quote?</h4>
              <p className="text-xs opacity-70 leading-relaxed">Our experts are ready to help you with large-scale deployment and technical specs.</p>
              <Button variant="secondary" className="w-full rounded-xl h-12 bg-white text-primary hover:bg-accent border-none font-bold uppercase text-[10px] tracking-widest">Contact Sales</Button>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9 space-y-8 min-h-[600px]">
            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Synchronizing Global Inventory...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in duration-700">
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group bg-white rounded-[2.5rem] border border-border/20 overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col shadow-sm"
                  >
                    <div className="relative aspect-[4/3] bg-muted/20">
                      <Image
                        src={product.mainImageUrl || 'https://picsum.photos/seed/placeholder/600/450'}
                        alt={product.id}
                        fill
                        className="object-contain p-6 group-hover:scale-110 transition-transform duration-700"
                        unoptimized={product.mainImageUrl.startsWith('data:')}
                      />
                    </div>
                    <div className="p-8 space-y-4 flex-grow flex flex-col">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-primary/40 uppercase tracking-widest">{activeCategoryName}</span>
                        <h3 className="text-xl font-headline font-bold text-primary group-hover:text-accent transition-colors leading-tight">
                          {getT(product.nameTextId)}
                        </h3>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed opacity-60">
                        {getT(product.descriptionTextId)}
                      </p>
                      <div className="mt-auto pt-6 flex items-center justify-between border-t border-dashed">
                        <span className={cn(
                          "text-xs font-bold group-hover:translate-x-1 transition-all flex items-center gap-2",
                          activeLine === 'wholesale' ? "text-primary" : "text-[#F97316]"
                        )}>
                          {t.viewDetails} <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                        <div className="h-8 w-8 rounded-full bg-muted/30 flex items-center justify-center text-primary/20 group-hover:bg-primary group-hover:text-white transition-all">
                           <Package className="h-4 w-4" />
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
                  <p className="font-bold text-primary">{t.noResults}</p>
                  <p className="text-xs text-muted-foreground">Please try another category or clear your search query.</p>
                </div>
                <Button onClick={() => { setSelectedCategoryId(null); setSearchQuery(''); }} variant="outline" className="rounded-xl px-8">Reset All Filters</Button>
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
