
"use client";

import React, { useState, useMemo, useEffect, Suspense, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ArrowRight, ChevronRight, Package, LayoutGrid, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
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
  thumbnailImageUrl?: string;
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
}

function ProductListContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  
  const [locale, setLocale] = useState<Locale>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const categoryParam = searchParams.get('category');
  const t = translations[locale].products;

  const prodsRef = useMemoFirebase(() => collection(firestore, 'products'), [firestore]);
  const catsRef = useMemoFirebase(() => collection(firestore, 'productCategories'), [firestore]);
  const transRef = useMemoFirebase(() => collection(firestore, 'localizedStrings'), [firestore]);
  const langConfigRef = useMemoFirebase(() => doc(firestore, 'settings', 'languages'), [firestore]);

  const { data: products, isLoading: isProdsLoading } = useCollection<Product>(prodsRef);
  const { data: categories, isLoading: isCatsLoading } = useCollection<Category>(catsRef);
  const { data: allTranslations } = useCollection<LocalizedString>(transRef);
  const { data: langSettings } = useDoc<any>(langConfigRef);

  // 智能判定语种
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

  const getT = (id: string) => {
    const entry = allTranslations?.find(item => item.id === id);
    if (!entry) return id;
    // 动态回退逻辑
    return entry[locale] || entry['en'] || entry['zh'] || id;
  };

  useEffect(() => {
    if (categoryParam && categories) {
      const found = categories.find(c => c.slug === categoryParam || c.id === categoryParam);
      if (found) setSelectedCategoryId(found.id);
    }
  }, [categoryParam, categories]);

  const filteredProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      if (p.status !== 'published') return false;
      const matchesCategory = !selectedCategoryId || p.productCategoryId === selectedCategoryId;
      const name = getT(p.nameTextId).toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategoryId, searchQuery, allTranslations, locale]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return t.allCategories;
    const cat = categories?.find(c => c.id === selectedCategoryId);
    return cat ? getT(cat.nameTextId) : t.allCategories;
  }, [selectedCategoryId, categories, allTranslations, locale, t.allCategories]);

  const isLoading = isProdsLoading || isCatsLoading;

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />
      
      <section className="pt-32 pb-16 bg-primary text-white relative">
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              {t.listTitle}
            </h1>
            <p className="text-xl opacity-80 font-light max-w-xl">
              {t.listSubtitle}
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <aside className="lg:col-span-3 space-y-10">
            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">搜索</h3>
              <Input
                placeholder={t.searchPlaceholder}
                className="rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">产品分类</h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl transition-all text-sm font-medium",
                    selectedCategoryId === null ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {t.allCategories}
                </button>
                {categories?.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={cn(
                      "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium text-left",
                      selectedCategoryId === cat.id ? "bg-primary text-white" : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <span>{getT(cat.nameTextId)}</span>
                    <ChevronRight className={cn("h-4 w-4", selectedCategoryId === cat.id ? "opacity-100" : "opacity-0")} />
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-4">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold uppercase">
                  {filteredProducts.length} 条目
                </Badge>
                <span className="text-sm italic font-medium text-primary">
                  {activeCategoryName}
                </span>
              </div>
            </div>

            {isLoading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-4 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin opacity-20" />
                <p className="text-xs font-bold uppercase tracking-widest">正在同步云端数据...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <Link 
                    href={`/products/${product.id}`}
                    key={product.id}
                    className="group bg-white rounded-3xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] bg-muted/20">
                      <Image
                        src={product.mainImageUrl || 'https://picsum.photos/seed/placeholder/600/450'}
                        alt={product.id}
                        fill
                        className="object-contain p-4 group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                    <div className="p-6 space-y-4 flex-grow flex flex-col">
                      <h3 className="text-xl font-headline font-bold text-primary">
                        {getT(product.nameTextId)}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {getT(product.descriptionTextId)}
                      </p>
                      <div className="mt-auto pt-6 flex items-center justify-between">
                        <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold group-hover:bg-primary group-hover:text-white transition-colors">
                          {t.viewDetails} <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center text-muted-foreground border-2 border-dashed rounded-[3rem]">
                <p>{t.noResults}</p>
                <Button onClick={() => setSelectedCategoryId(null)} variant="link" className="text-primary">重置筛选</Button>
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
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
