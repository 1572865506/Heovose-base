
"use client";

import { useState, useMemo, useEffect, Suspense } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useCollection, useMemoFirebase, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Search, Filter, ArrowRight, FileText, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

function ProductListContent() {
  const [locale, setLocale] = useState<Locale>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const firestore = useFirestore();
  const t = translations[locale].products;

  // Fetch Categories
  const categoriesQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'product_categories'), orderBy('nameEn', 'asc'));
  }, [firestore]);
  const { data: categories, isLoading: categoriesLoading } = useCollection(categoriesQuery);

  // Handle URL category parameter
  useEffect(() => {
    if (categoryParam && categories) {
      const found = categories.find(c => 
        c.id === categoryParam || 
        c.nameEn.toLowerCase().includes(categoryParam.toLowerCase())
      );
      if (found) setSelectedCategoryId(found.id);
    }
  }, [categoryParam, categories]);

  // Fetch Active Products
  const productsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(
      collection(firestore, 'products'),
      where('status', '==', 'active'),
      orderBy('createdAt', 'desc')
    );
  }, [firestore]);
  const { data: allProducts, isLoading: productsLoading } = useCollection(productsQuery);

  // Filter products client-side for better UX responsiveness
  const filteredProducts = useMemo(() => {
    if (!allProducts) return [];
    return allProducts.filter(product => {
      const matchesCategory = !selectedCategoryId || product.productCategoryId === selectedCategoryId;
      const name = locale === 'zh' ? product.nameZh : product.nameEn;
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [allProducts, selectedCategoryId, searchQuery, locale]);

  const activeCategoryName = useMemo(() => {
    if (!selectedCategoryId) return t.allCategories;
    const cat = categories?.find(c => c.id === selectedCategoryId);
    return locale === 'zh' ? cat?.nameZh : cat?.nameEn;
  }, [selectedCategoryId, categories, locale, t.allCategories]);

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />
      
      {/* Header Section */}
      <section className="pt-32 pb-16 bg-primary text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="https://picsum.photos/seed/list-bg/1920/600"
            alt="Product List Background"
            fill
            className="object-cover"
            data-ai-hint="electronic hardware"
          />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tight">
              {t.listTitle}
            </h1>
            <p className="text-xl opacity-80 font-light">
              {t.listSubtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Sidebar Filters */}
          <aside className="lg:col-span-3 space-y-10">
            {/* Search */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Search</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.searchPlaceholder}
                  className="pl-10 rounded-xl border-border/40 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h3>
                {selectedCategoryId && (
                  <button 
                    onClick={() => setSelectedCategoryId(null)}
                    className="text-[10px] font-bold text-primary hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium",
                    !selectedCategoryId ? "bg-primary text-white shadow-lg" : "hover:bg-muted"
                  )}
                >
                  <span>{t.allCategories}</span>
                  {!selectedCategoryId && <ChevronRight className="h-4 w-4" />}
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategoryId(category.id)}
                    className={cn(
                      "flex items-center justify-between px-4 py-3 rounded-xl transition-all text-sm font-medium text-left",
                      selectedCategoryId === category.id ? "bg-primary text-white shadow-lg" : "hover:bg-muted"
                    )}
                  >
                    <span>{locale === 'zh' ? category.nameZh : category.nameEn}</span>
                    {selectedCategoryId === category.id && <ChevronRight className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8 border-b border-border/40 pb-6">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                  {filteredProducts.length} Results
                </Badge>
                <span className="text-sm text-muted-foreground italic">
                  in {activeCategoryName}
                </span>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <div 
                    key={product.id}
                    className="group bg-white rounded-3xl border border-border/40 overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-muted/20 overflow-hidden">
                      <Image
                        src={product.primaryImageUrl || 'https://picsum.photos/seed/prod/600/450'}
                        alt={locale === 'zh' ? product.nameZh : product.nameEn}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 backdrop-blur-md text-primary border-none shadow-sm text-[10px] font-bold">
                          {product.taglineEn}
                        </Badge>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-6 space-y-4 flex-grow flex flex-col">
                      <div className="space-y-1">
                        <h3 className="text-xl font-headline font-bold text-primary leading-tight">
                          {locale === 'zh' ? product.nameZh : product.nameEn}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[2.5rem]">
                          {locale === 'zh' ? product.descriptionZh : product.descriptionEn}
                        </p>
                      </div>

                      {/* Key Features */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {(locale === 'zh' ? product.keyFeaturesZh : product.keyFeaturesEn)?.slice(0, 3).map((feature: string, idx: number) => (
                          <span key={idx} className="text-[9px] font-bold text-muted-foreground uppercase border border-border/60 px-2 py-0.5 rounded-full">
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="pt-6 mt-auto flex items-center justify-between gap-4">
                        <Button variant="outline" size="sm" className="flex-1 rounded-xl text-xs font-bold tracking-tighter group/btn">
                          {t.viewDetails} <ArrowRight className="ml-2 h-3 w-3 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                        <Button size="icon" variant="ghost" className="rounded-xl h-9 w-9 bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-32 text-center space-y-6 bg-muted/10 rounded-[3rem] border-2 border-dashed border-border/40">
                <div className="h-20 w-20 bg-muted/20 rounded-full flex items-center justify-center mx-auto text-muted-foreground">
                  <Filter className="h-10 w-10 opacity-20" />
                </div>
                <div className="space-y-2">
                  <h4 className="text-xl font-bold text-primary">{t.noResults}</h4>
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
                </div>
                <Button onClick={() => { setSearchQuery(''); setSelectedCategoryId(null); }} variant="link" className="text-primary font-bold">
                  Clear all filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}

export default function ProductListPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ProductListContent />
    </Suspense>
  );
}
