
"use client";

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { Locale, translations } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  Mail, 
  ChevronRight,
  Maximize2,
  Zap,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  nameTextId: string;
  descriptionTextId: string;
  detailsTextId?: string;
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
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useUser();
  const [locale, setLocale] = useState<Locale>('en');
  const [activeImage, setActiveImage] = useState<string | null>(null);

  const firestore = useFirestore();
  
  // 1. 获取文档与翻译
  const prodRef = useMemoFirebase(() => id ? doc(firestore, 'products', id as string) : null, [firestore, id]);
  const transRef = useMemoFirebase(() => collection(firestore, 'localizedStrings'), [firestore]);

  const { data: product, isLoading: isProdLoading } = useDoc<Product>(prodRef);
  const { data: translationsData } = useCollection<LocalizedString>(transRef);

  // 2. 翻译工具
  const getT = (textId?: string) => {
    if (!textId) return '';
    const entry = translationsData?.find(t => t.id === textId);
    return entry ? (locale === 'zh' ? entry.zh : entry.en) : textId;
  };

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
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
      </div>
    );
  }

  // 如果产品未发布且当前不是管理员，则视为不存在
  if (!product || (product.status !== 'published' && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground font-bold uppercase tracking-widest">产品不存在或已下架</p>
          <Link href="/products"><Button>返回产品列表</Button></Link>
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
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-primary">{getT(product.nameTextId)}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[4/3] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group">
                <Image
                  src={activeImage || product.mainImageUrl}
                  alt="Product Image"
                  fill
                  className="object-contain p-8 group-hover:scale-105 transition-transform duration-700"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[product.mainImageUrl, ...(product.galleryImageUrls || [])].map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(img)}
                    className={cn(
                      "relative aspect-square rounded-2xl overflow-hidden border-2 transition-all bg-muted/10",
                      activeImage === img ? "border-primary" : "border-transparent hover:border-muted"
                    )}
                  >
                    <Image src={img} alt="Thumb" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col space-y-10">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-headline font-bold leading-tight text-primary">
                  {getT(product.nameTextId)}
                </h1>
                <p className="text-xl text-muted-foreground font-light italic">
                   Heovose Advanced Technology Series
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-2">
                   <ShieldCheck className="h-5 w-5 text-primary" />
                   <span className="text-xs font-bold uppercase tracking-[0.2em]">核心优势</span>
                </div>
                <div className="grid grid-cols-1 gap-4">
                   {advantages.length > 0 ? advantages.map((adv, i) => (
                     <div key={i} className="flex items-start gap-4 p-5 bg-muted/20 rounded-2xl border border-border/20">
                        <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                        <span className="text-sm text-muted-foreground font-medium">{adv}</span>
                     </div>
                   )) : (
                     <>
                        <div className="flex items-start gap-4 p-5 bg-muted/20 rounded-2xl border border-border/20">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground font-medium">工业级稳定性设计，支持 24/7 全天候运行</span>
                        </div>
                        <div className="flex items-start gap-4 p-5 bg-muted/20 rounded-2xl border border-border/20">
                          <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground font-medium">高性能计算核心，满足复杂业务需求</span>
                        </div>
                     </>
                   )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                 <Button className="h-16 px-10 rounded-2xl text-base font-bold flex-1 shadow-xl">
                   立即咨询 <ArrowRight className="ml-2 h-5 w-5" />
                 </Button>
                 <Button variant="outline" className="h-16 px-8 rounded-2xl">
                   <Download className="mr-2 h-5 w-5" />
                   规格书
                 </Button>
              </div>

              <div className="pt-8 border-t border-border/40">
                 <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">全球支持</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Mail className="h-4 w-4 opacity-40" /> sales@heovose.com
                      </div>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">业务咨询</span>
                      <div className="flex items-center gap-2 text-sm font-bold text-primary">
                        <Zap className="h-4 w-4 opacity-40" /> +86 0755 1234
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          <div className="mt-32">
            <Tabs defaultValue="desc" className="w-full">
              <TabsList className="bg-transparent h-auto p-0 border-b border-border/40 w-full justify-start gap-12 rounded-none mb-16">
                <TabsTrigger value="desc" className="rounded-none px-0 pb-6 text-sm font-bold uppercase tracking-widest">详细描述</TabsTrigger>
                <TabsTrigger value="specs" className="rounded-none px-0 pb-6 text-sm font-bold uppercase tracking-widest">技术规格</TabsTrigger>
              </TabsList>
              
              <TabsContent value="desc" className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="prose prose-lg dark:prose-invert">
                  <p className="text-xl text-muted-foreground leading-relaxed font-light italic border-l-4 border-accent pl-8 whitespace-pre-wrap">
                    {getT(product.descriptionTextId)}
                  </p>
                  {product.detailsTextId && (
                    <div className="mt-8 text-base text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">
                      {getT(product.detailsTextId)}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="specs" className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="space-y-16">
                    {groupedSpecs.length > 0 ? groupedSpecs.map((group, gIdx) => (
                      <div key={gIdx} className="space-y-8">
                        <div className="flex items-center gap-4">
                           <h3 className="text-2xl font-headline font-bold text-primary shrink-0 uppercase tracking-wide">{group.title}</h3>
                           <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="bg-muted/10 rounded-[3rem] border border-border/40 overflow-hidden">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/40">
                            {group.items.map((item, iIdx) => (
                              <div key={iIdx} className="flex bg-white group hover:bg-muted/5 transition-colors">
                                <div className="w-1/3 p-6 bg-muted/20 border-r border-border/10">
                                  <span className="text-xs font-bold text-primary uppercase tracking-wider">{item.label}</span>
                                </div>
                                <div className="flex-1 p-6">
                                  <span className="text-sm text-muted-foreground font-medium whitespace-pre-wrap">{item.value}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="p-12 text-center italic text-muted-foreground border-2 border-dashed rounded-[3rem]">
                        技术规格正在同步中，请联系销售获取最新 PDF 规格书。
                      </div>
                    )}
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
