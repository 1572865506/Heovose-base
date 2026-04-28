
"use client";

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
  Zap,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

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
  productCategoryId: string;
  galleryImageUrls: string[];
  status?: 'published' | 'draft';
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
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const { data: product, isLoading: isProdLoading } = useLocalDoc<Product>('products', id);
  const { data: translationsData } = useLocalCollection<LocalizedString>('localizedStrings');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');

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

  const getT = (textId?: string) => {
    if (!textId) return '';
    const entry = translationsData?.find(t => t.id === textId);
    if (!entry) return textId;
    return entry[locale] || entry['en'] || entry['zh'] || textId;
  };

  const productDetails = useMemo(() => {
    if (!product?.localizedDetails) return getT(product?.descriptionTextId);
    return product.localizedDetails[locale] || product.localizedDetails['en'] || product.localizedDetails['zh'] || getT(product?.descriptionTextId);
  }, [product, locale, translationsData]);

  useEffect(() => {
    if (product?.mainImageUrl) setActiveImage(product.mainImageUrl);
  }, [product]);

  const advantages = useMemo(() => {
    if (!product?.advantageTextIds) return [];
    return product.advantageTextIds.map(id => getT(id)).filter(Boolean);
  }, [product, translationsData, locale]);

  const groupedSpecs = useMemo(() => {
    if (!product?.specGroups) return [];
    return product.specGroups.map(group => ({
      title: getT(group.titleId),
      items: group.items.map(item => ({
        label: getT(item.labelId),
        value: getT(item.valueId)
      })).filter(i => i.label)
    })).filter(g => g.title);
  }, [product, translationsData, locale]);

  if (isProdLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin opacity-20" /></div>;
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
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-12">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-primary">Products</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{getT(product.nameTextId)}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[4/3] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group">
                <Image src={activeImage || product.mainImageUrl} alt="P" fill className="object-contain p-8 group-hover:scale-105 transition-all" />
              </div>
              <div className="grid grid-cols-4 gap-4">
                {[product.mainImageUrl, ...(product.galleryImageUrls || [])].map((img, idx) => (
                  <button key={idx} onClick={() => setActiveImage(img)} className={cn("relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-muted/10", activeImage === img ? "border-primary" : "border-transparent")}>
                    <Image src={img} alt="T" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col space-y-10">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight text-primary">{getT(product.nameTextId)}</h1>
                <p className="text-xl text-muted-foreground font-light italic">Heovose Advanced Technology Series</p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /><span className="text-xs font-bold uppercase tracking-[0.2em]">核心优势</span></div>
                <div className="grid grid-cols-1 gap-4">
                   {advantages.map((adv, i) => (
                     <div key={i} className="flex items-start gap-4 p-5 bg-muted/20 rounded-2xl border border-border/20">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground font-medium">{adv}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Button className="h-16 px-10 rounded-2xl text-base font-bold flex-1 shadow-xl">立即咨询 <ArrowRight className="ml-2 h-5 w-5" /></Button>
                 <Button variant="outline" className="h-16 px-8 rounded-2xl"><Download className="mr-2 h-5 w-5" />规格书</Button>
              </div>

              <div className="pt-8 border-t border-border/40">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2"><span className="text-[10px] font-bold text-muted-foreground uppercase">全球支持</span><div className="flex items-center gap-2 text-sm font-bold text-primary"><Mail className="h-4 w-4 opacity-40" /> sales@heovose.com</div></div>
                    <div className="space-y-2"><span className="text-[10px] font-bold text-muted-foreground uppercase">业务咨询</span><div className="flex items-center gap-2 text-sm font-bold text-primary"><Zap className="h-4 w-4 opacity-40" /> +86 0755 1234</div></div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-32">
            <Tabs defaultValue="desc" className="w-full">
              <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-12 rounded-none mb-16">
                <TabsTrigger value="desc" className="rounded-none px-0 pb-6 text-sm font-bold uppercase">详细描述</TabsTrigger>
                <TabsTrigger value="specs" className="rounded-none px-0 pb-6 text-sm font-bold uppercase">技术规格</TabsTrigger>
              </TabsList>
              <TabsContent value="desc" className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: productDetails }} />
              </TabsContent>
              <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="space-y-16">
                    {groupedSpecs.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-8">
                        <div className="flex items-center gap-4">
                           <h3 className="text-2xl font-headline font-bold text-primary shrink-0 uppercase">{group.title}</h3>
                           <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="bg-muted/10 rounded-[3rem] border border-border/40 overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40">
                            {group.items.map((item, iIdx) => (
                              <div key={iIdx} className="flex bg-white group hover:bg-muted/5 transition-colors">
                                <div className="w-1/3 p-6 bg-muted/20 border-r border-border/10"><span className="text-xs font-bold text-primary uppercase">{item.label}</span></div>
                                <div className="flex-1 p-6"><span className="text-sm text-muted-foreground font-medium">{item.value}</span></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                 </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      <Footer locale={locale} />
    </main>
  );
}
