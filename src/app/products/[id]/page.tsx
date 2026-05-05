"use client";

export const dynamic = "force-dynamic";

import React, { useState, useMemo, useEffect, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useSession } from "next-auth/react";
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Mail, 
  ChevronRight,
  Globe,
  Zap,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTranslations } from '@/hooks/use-translations';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  localizedDetails?: Record<string, string>;
  advantageTextIds?: string[];
  specGroups?: { 
    titleId: string, 
    items: { labelId: string, valueId: string }[] 
  }[];
  mainImageUrl: string;
  categoryId: string;
  galleryImageUrls: string[];
  status?: 'published' | 'draft';
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface LocalizedString {
  id: string;
  en: string;
  zh: string;
  id_?: string;
  vi?: string;
  [key: string]: any;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const searchParams = useSearchParams();

  const { data: session } = useSession();
  
  const [locale, setLocale] = useState<Locale>('en');
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: product, isLoading: isProdLoading } = useLocalDoc<Product>('products', id);
  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { t: tr, isLoading: isTransLoading } = useTranslations(locale);

  // 智能判定语种
  useEffect(() => {
    const detectLocale = () => {
      const langParam = searchParams.get('lang');
      if (langParam && ['en', 'zh', 'id', 'vi'].includes(langParam)) return langParam as Locale;
      
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && ['en', 'zh', 'id', 'vi'].includes(saved)) return saved;
      
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] as Locale : 'en';
      if (['en', 'zh', 'id', 'vi'].includes(browserLang)) return browserLang;
      
      return (langSettings?.defaultLanguage as Locale) || 'en';
    };
    
    setLocale(detectLocale());
    setIsLocaleReady(true);
  }, [searchParams, langSettings]);

  // No changes needed here, just removing the duplicate call below if it exists

  const productDetails = useMemo(() => {
    if (!product?.localizedDetails) return '';
    const content = product.localizedDetails[locale] || product.localizedDetails['en'] || product.localizedDetails['zh'] || '';
    // 检查剥离 HTML 后的实际文本内容是否存在
    const plainText = content.replace(/<[^>]*>?/gm, '').trim();
    return plainText ? content : '';
  }, [product, locale]);
  
  const categoryName = useMemo(() => {
    if (!product || !categories) return '';
    const cat = categories.find((c: any) => c.id === product.categoryId);
    return cat ? tr(cat.nameTextId) : '';
  }, [product, categories, locale]);

  useEffect(() => {
    if (product?.mainImageUrl) setActiveImage(product.mainImageUrl);
  }, [product]);

  const advantages = useMemo(() => {
    const desc = tr(product?.descriptionTextId);
    if (!desc) return [];
    // Split by various newline formats ( \n, \r\n, etc.)
    return desc.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
  }, [product, locale]);
  
  const { data: allProducts } = useLocalCollection<Product>('products');

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts) return [];
    
    const targetCat = categories?.find((c: any) => c.id === product.categoryId);
    const targetParentId = targetCat?.parentId;

    return allProducts
      .filter(p => p.id !== product.id && p.status === 'published')
      .map(p => {
        let score = 0;
        const pCat = categories?.find((c: any) => c.id === p.categoryId);
        
        // 同分类
        if (p.categoryId === product.categoryId) score += 100;
        // 同产品线 (父级分类相同)
        else if (targetParentId && pCat?.parentId === targetParentId) score += 50;
        
        // 发布时间相近 (时间戳差距越小分数越高)
        const timeDiff = Math.abs(new Date(p.createdAt || 0).getTime() - new Date(product.createdAt || 0).getTime());
        const timeScore = 10 / (1 + timeDiff / (1000 * 60 * 60 * 24)); // 每天减少一点分
        score += timeScore;

        return { ...p, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 6);
  }, [product, allProducts, categories]);

  const groupedSpecs = useMemo(() => {
    if (!product?.specGroups) return [];
    return product.specGroups.map(group => ({
      title: tr(group.titleId),
      items: (group.items || []).map((item: any) => ({
        label: tr(item.labelId),
        value: tr(item.valueId)
      })).filter(i => i.label && i.label.trim() !== '')
    })).filter(g => g.title);
  }, [product, tr]);

  if (isProdLoading || isTransLoading || !isLocaleReady) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" /></div>;
  }

  if (!product || (product.status !== 'published' && !session)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-bold">产品不存在或已下架</p>
          <Link href="/products"><Button>返回列表</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          <nav className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mb-12">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300">
              <Globe className="h-3 w-3" />
              Home
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-all duration-300">
              Products
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <span className="text-primary">{tr(product.nameTextId)}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[11/9] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group">
                <Image src={activeImage || product.mainImageUrl} alt="P" fill className="object-cover premium-zoom-image" />
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {[product.mainImageUrl, ...(product.galleryImageUrls || [])].map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(img)} className={cn("relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]", activeImage === img ? "border-primary" : "border-transparent hover:border-primary/40")}>
                    <Image src={img} alt="T" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col space-y-10">
              <div className="space-y-4">
                {categoryName && (
                  <Badge variant="outline" className="bg-primary/5 border-primary/10 text-primary text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full">
                    {categoryName}
                  </Badge>
                )}
                <h1 className="text-4xl font-headline font-bold leading-tight text-primary">{tr(product.nameTextId)}</h1>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <span className="text-xs font-bold uppercase tracking-[0.2em]">{tr('core_advantages')}</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {advantages.map((adv: string, i: number) => (
                     <div key={i} className="flex items-start gap-4 p-3 bg-muted/20 rounded-2xl border border-border/20">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground font-medium whitespace-pre-wrap">{adv}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Button className="h-16 px-10 rounded-2xl text-base font-bold flex-1 shadow-xl">{tr('product_contact_now')} <ArrowRight className="ml-2 h-5 w-5" /></Button>
                 <Button variant="outline" className="h-16 px-8 rounded-2xl"><Download className="mr-2 h-5 w-5" />{tr('product_spec_sheet')}</Button>
              </div>

              <div className="pt-8 border-t border-border/40">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2"><span className="text-[10px] font-bold text-muted-foreground uppercase">{tr('product_global_support')}</span><div className="flex items-center gap-2 text-sm font-bold text-primary"><Mail className="h-4 w-4 opacity-40" /> sales@heovose.com</div></div>
                    <div className="space-y-2"><span className="text-[10px] font-bold text-muted-foreground uppercase">{tr('product_sales_consulting')}</span><div className="flex items-center gap-2 text-sm font-bold text-primary"><Zap className="h-4 w-4 opacity-40" /> +86 0755 1234</div></div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 下半部分：全宽白色背景区域 */}
      <div className="bg-white border-t border-slate-100 mt-24">
          <div className="container mx-auto px-6 py-24 max-w-[1200px]">
            <Tabs defaultValue={productDetails ? "desc" : "specs"} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 border-b border-slate-100 w-full justify-start gap-12 rounded-none mb-16">
                {productDetails && <TabsTrigger value="desc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{tr('product_tab_desc')}</TabsTrigger>}
                <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{tr('product_tab_specs')}</TabsTrigger>
              </TabsList>
              
              {productDetails && (
                <TabsContent value="desc" className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: productDetails }} />
                </TabsContent>
              )}
              <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="space-y-16">
                    {groupedSpecs.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-8">
                        <div className="flex items-center gap-4">
                           <h3 className="text-2xl font-headline font-bold text-primary shrink-0">{group.title}</h3>
                           <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {group.items.map((item, iIdx) => (
                            <div key={iIdx} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 flex flex-col gap-3 group/spec">
                              <span className="text-xs font-bold tracking-[0.1em] text-slate-400 group-hover/spec:text-primary transition-colors">
                                {item.label}
                              </span>
                              <span className="text-sm font-normal text-slate-900 font-['JetBrains_Mono'] leading-relaxed whitespace-pre-wrap">
                                {item.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>

            {relatedProducts.length > 0 && (
              <div className="mt-40 space-y-12">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-bold text-primary uppercase tracking-tight">{tr('related_products_title') || 'Related Products'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{tr('explore_more_tech') || 'Explore more high-end technology'}</p>
                  </div>
                  <div className="h-px bg-slate-100 flex-1 mx-12 hidden md:block" />
                  <Link href="/products" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-all">
                    View All
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {relatedProducts.map((p) => (
                    <Link key={p.id} href={`/products/${p.id}?lang=${locale}`} className="group space-y-4">
                      <div className="relative aspect-[11/9] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
                        <Image src={p.mainImageUrl} alt="P" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="space-y-1 px-1">
                        <p className="text-[9px] font-bold text-primary/40 uppercase tracking-widest truncate">
                          {categories?.find((c: any) => c.id === p.categoryId) ? tr(categories.find((c: any) => c.id === p.categoryId).nameTextId) : ''}
                        </p>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{tr(p.nameTextId)}</h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      <Footer locale={locale} />
    </main>
  );
}
