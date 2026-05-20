'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  ArrowRight, 
  Star, 
  ShieldCheck, 
  Download, 
  Mail, 
  ChevronRight,
  Globe,
  Zap,
  Phone,
  Loader2,
  Play,
  ZoomIn,
  ZoomOut,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { getAssetUrl } from '@/lib/image-utils';
import { useTranslations } from '@/hooks/use-translations';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useInquiry } from '@/components/providers/InquiryProvider';
import { HoverVideoPlayer } from '@/components/HoverVideoPlayer';

const isVideoUrl = (url: string) => {
  if (!url) return false;
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url);
};

export default function ProductClient({ product, initialLocale }: { product: any, initialLocale: Locale }) {
  const searchParams = useSearchParams();
  const { openInquiry } = useInquiry();
  
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: 'image' | 'video' }>(() => {
    if (product?.videoUrl) {
      return { url: product.videoUrl, type: 'video' };
    }
    const galleryVideo = product?.galleryImageUrls?.find((url: string) => isVideoUrl(url));
    if (galleryVideo) {
      return { url: galleryVideo, type: 'video' };
    }
    return {
      url: product?.mainImageUrl || '',
      type: isVideoUrl(product?.mainImageUrl) ? 'video' : 'image'
    };
  });
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (product?.videoUrl) {
      setActiveMedia({ url: product.videoUrl, type: 'video' });
    } else {
      const galleryVideo = product?.galleryImageUrls?.find((url: string) => isVideoUrl(url));
      if (galleryVideo) {
        setActiveMedia({ url: galleryVideo, type: 'video' });
      } else if (product?.mainImageUrl) {
        setActiveMedia({ 
          url: product.mainImageUrl, 
          type: isVideoUrl(product.mainImageUrl) ? 'video' : 'image' 
        });
      }
    }
  }, [product?.mainImageUrl, product?.videoUrl, product?.galleryImageUrls]);

  const { data: categories } = useLocalCollection<any>('productCategories');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { t: tr, isLoading: isTransLoading } = useTranslations(locale);

  const companyEmail = tr('COMPANY_EMAIL') || 'sales@heovose.com';
  const companyPhone = tr('COMPANY_PHONE') || '+86 0755 1234';

  // 智能判定语种
  useEffect(() => {
    const detectLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || initialLocale;

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
  }, [searchParams, langSettings, initialLocale]);

  const productDetails = useMemo(() => {
    if (!product?.localizedDetails) return '';
    const content = product.localizedDetails[locale] || product.localizedDetails['en'] || product.localizedDetails['zh'] || '';
    const plainText = content.replace(/<[^>]*>?/gm, '').trim();
    return plainText ? content : '';
  }, [product, locale]);
  
  const categoryName = useMemo(() => {
    if (!product || !categories) return '';
    const cat = categories.find((c: any) => c.id === product.categoryId);
    return cat ? tr(cat.nameTextId) : '';
  }, [product, categories, locale, tr]);

  const advantages = useMemo(() => {
    const desc = tr(product?.descriptionTextId);
    if (!desc) return [];
    return desc.split(/\r?\n/).map((line: string) => line.trim()).filter((line: string) => line.length > 0);
  }, [product, locale, tr]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    return [product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean) as string[];
  }, [product]);
  
  const { data: allProducts } = useLocalCollection<any>('products');

  const relatedProducts = useMemo(() => {
    if (!product || !allProducts || !categories) return [];
    
    const targetCat = categories.find((c: any) => c.id === product.categoryId);
    const targetParentId = targetCat?.parentId;

    return allProducts
      .filter((p: any) => p.id !== product.id && p.status === 'published')
      .map((p: any) => {
        let score = 0;
        const pCat = categories.find((c: any) => c.id === p.categoryId);
        if (p.categoryId === product.categoryId) score += 100;
        else if (targetParentId && pCat?.parentId === targetParentId) score += 50;
        
        const timeDiff = Math.abs(new Date(p.createdAt || 0).getTime() - new Date(product.createdAt || 0).getTime());
        const timeScore = 10 / (1 + timeDiff / (1000 * 60 * 60 * 24));
        score += timeScore;
        return { ...p, score };
      })
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, 6);
  }, [product, allProducts, categories]);

  const groupedSpecs = useMemo(() => {
    if (!product?.specGroups) return [];
    return product.specGroups.map((group: any) => ({
      title: tr(group.titleId),
      items: (group.items || []).map((item: any) => ({
        label: tr(item.labelId),
        value: tr(item.valueId)
      })).filter((i: any) => i.label && i.label.trim() !== '')
    })).filter((g: any) => g.title);
  }, [product, tr]);

  if (!isLocaleReady) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-10 w-10 animate-spin opacity-20 text-primary" /></div>;

  return (
    <main className="min-h-screen bg-background">
      <Navbar locale={locale} setLocale={setLocale} />

      <div className="pt-32 pb-20">
        <div className="container mx-auto px-6">
          {/* Print Only Header */}
          <div className="print-header hidden print:flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
            <span className="text-xl font-bold tracking-widest text-primary">HEOVOSE ELEVATE</span>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Product Specification</span>
          </div>
          <nav className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest mb-12 no-print">
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all duration-300">
              <Globe className="h-3 w-3" />
              {tr('nav_home') || 'Home'}
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <Link href="/products" className="text-muted-foreground hover:text-primary transition-all duration-300">
              {tr('nav_products') || 'Products'}
            </Link>
            <ChevronRight className="h-3 w-3 text-primary/20" />
            <span className="text-primary">{tr(product.nameTextId)}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            <div className="lg:col-span-7 space-y-6">
              <div className="relative aspect-[11/9] bg-muted/20 rounded-[2.5rem] overflow-hidden border border-border/40 shadow-inner group flex items-center justify-center">
                {activeMedia.type === 'video' ? (
                  <video src={getAssetUrl(activeMedia.url)} controls autoPlay playsInline muted className="w-full h-full object-cover rounded-[2.5rem]" />
                ) : (
                  <Image 
                    src={getAssetUrl(activeMedia.url || product.mainImageUrl || '/image/product-placeholder.png')} 
                    alt={tr(product.nameTextId)} 
                    fill 
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 50vw"
                    className="object-cover premium-zoom-image cursor-zoom-in" 
                    onClick={() => setIsZoomOpen(true)}
                  />
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4 no-print">
                {[product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean).map((img, idx) => {
                  const isVid = isVideoUrl(img);
                  const isActive = activeMedia.url === img;

                  return (
                    <button 
                      key={`img-${idx}`} 
                      onClick={() => setActiveMedia({ url: img, type: isVid ? 'video' : 'image' })} 
                      className={cn(
                        "relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center group/media-thumb", 
                        isActive ? "border-primary" : "border-transparent hover:border-primary/40"
                      )}
                    >
                      {isVid ? (
                        <>
                          <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                            <Image src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Video Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover opacity-60" />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/media-thumb:scale-110 transition-transform duration-300">
                              <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <Image src={getAssetUrl(img || '/image/product-placeholder.png')} alt="Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover" />
                      )}
                    </button>
                  );
                })}

                {product.videoUrl && ![product.mainImageUrl, ...(product.galleryImageUrls || [])].filter(Boolean).includes(product.videoUrl) && (
                  <button 
                    onClick={() => setActiveMedia({ url: product.videoUrl, type: 'video' })} 
                    className={cn(
                      "relative aspect-[11/9] rounded-2xl overflow-hidden border-2 bg-muted/10 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-center justify-center group/vid-thumb", 
                      activeMedia.type === 'video' && activeMedia.url === product.videoUrl ? "border-primary" : "border-transparent hover:border-primary/40"
                    )}
                  >
                    <div className="absolute inset-0 bg-slate-900 flex items-center justify-center">
                      <Image src={getAssetUrl(product.mainImageUrl || '/image/product-placeholder.png')} alt="Video Thumbnail" fill sizes="(max-width: 768px) 25vw, (max-width: 1200px) 15vw, 10vw" className="object-cover opacity-60 animate-fade-in" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 group-hover/vid-thumb:scale-110 transition-transform duration-300">
                        <Play className="h-3.5 w-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </button>
                )}
              </div>

              {/* Print Only Gallery Grid (Images only) */}
              {galleryImages.filter(img => !isVideoUrl(img)).length > 0 && (
                <div className="hidden print:grid grid-cols-3 gap-4 mt-4">
                  {galleryImages.filter(img => !isVideoUrl(img)).map((img, idx) => (
                    <div key={idx} className="relative aspect-[11/9] border border-slate-200 rounded-2xl overflow-hidden bg-muted/5">
                      <Image src={getAssetUrl(img)} alt="Product Gallery" fill sizes="(max-width: 768px) 33vw, 25vw" className="object-cover" />
                    </div>
                  ))}
                </div>
              )}

              {/* High-quality Zoom overlay modal */}
              {isZoomOpen && activeMedia.type === 'image' && (
                <div 
                  className="fixed inset-0 z-[9999] bg-black/90 flex flex-col items-center justify-center cursor-zoom-out animate-in fade-in duration-300"
                  onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
                >
                  <div className="absolute top-6 right-6 flex items-center gap-4" onClick={e => e.stopPropagation()}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
                      onClick={() => setZoomScale(s => Math.min(3, s + 0.25))}
                    >
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
                      onClick={() => setZoomScale(s => Math.max(0.5, s - 0.25))}
                    >
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 border-white/20 text-white backdrop-blur-md"
                      onClick={() => { setIsZoomOpen(false); setZoomScale(1); }}
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  
                  <div className="relative w-[90vw] h-[80vh] flex items-center justify-center overflow-auto pointer-events-none">
                    <div 
                      className="relative transition-transform duration-300 ease-out pointer-events-auto"
                      style={{ transform: `scale(${zoomScale})` }}
                    >
                      <img 
                        src={getAssetUrl(activeMedia.url || product.mainImageUrl || '/image/product-placeholder.png')} 
                        alt="Product Zoom"
                        className="max-w-[90vw] max-h-[80vh] object-contain rounded-2xl select-none"
                        draggable={false}
                      />
                    </div>
                  </div>
                </div>
              )}
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
                        <Star className="h-5 w-5 mt-0.5 shrink-0 text-primary fill-primary/10" />
                        <span className="text-sm text-muted-foreground font-medium whitespace-pre-wrap">{adv}</span>
                     </div>
                   ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-6 no-print">
                  <Button 
                    onClick={() => openInquiry({ 
                      productId: product.id, 
                      productName: tr(product.nameTextId) 
                    })} 
                    className="h-16 px-10 rounded-2xl text-base font-bold flex-1 shadow-xl"
                  >
                    {tr('product_contact_now')} <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                 <Button onClick={() => window.print()} variant="outline" className="h-16 px-8 rounded-2xl"><Download className="mr-2 h-5 w-5" />{tr('product_spec_sheet')}</Button>
              </div>

              <div className="pt-8 border-t border-border/40 no-print">
                 <div className="space-y-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{tr('nav_contact')}</span>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                       <a href={`mailto:${companyEmail}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                          <Mail className="h-4 w-4 opacity-40" /> {companyEmail}
                       </a>
                       <a href={`tel:${companyPhone}`} className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors">
                          <Phone className="h-4 w-4 opacity-40" /> {companyPhone}
                       </a>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-t border-slate-100 mt-24">
          <div className="container mx-auto px-6 py-24 max-w-[1200px]">
            <Tabs defaultValue={productDetails ? "desc" : "specs"} className="w-full">
              <TabsList className="bg-transparent h-auto p-0 border-b border-slate-100 w-full justify-start gap-12 rounded-none mb-16 no-print">
                {productDetails && <TabsTrigger value="desc" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{tr('product_tab_desc')}</TabsTrigger>}
                <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-6 text-sm font-bold text-slate-400 data-[state=active]:text-primary transition-all tracking-widest">{tr('product_tab_specs')}</TabsTrigger>
              </TabsList>
              
              {productDetails && (
                <TabsContent value="desc" forceMount className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 data-[state=inactive]:hidden print:data-[state=inactive]:block">
                  <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: productDetails }} />
                </TabsContent>
              )}
              <TabsContent value="specs" forceMount className="animate-in fade-in slide-in-from-bottom-4 duration-700 data-[state=inactive]:hidden print:data-[state=inactive]:block">
                 <div className="space-y-16">
                    {groupedSpecs.map((group: any, gIdx: number) => (
                      <div key={gIdx} className="space-y-8">
                        <div className="flex items-center gap-4">
                           <h3 className="text-2xl font-headline font-bold text-primary shrink-0">{group.title}</h3>
                           <div className="h-px bg-border flex-1" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {group.items.map((item: any, iIdx: number) => (
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
              <div className="mt-40 space-y-12 no-print">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-headline font-bold text-primary uppercase tracking-tight">{tr('related_products_title') || 'Related Products'}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">{tr('explore_more_tech') || 'Explore more high-end technology'}</p>
                  </div>
                  <div className="h-px bg-slate-100 flex-1 mx-12 hidden md:block" />
                  <Link href="/products" className="group flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:opacity-70 transition-all">
                    {tr('view_all') || 'View All'}
                    <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                  {relatedProducts.map((p: any) => (
                    <Link key={p.id} href={`/products/${p.id}?lang=${locale}`} className="group space-y-4">
                      <div className="relative aspect-[11/9] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/10">
                        <HoverVideoPlayer
                          videoUrl={p.videoUrl}
                          mainImageUrl={p.mainImageUrl}
                          alt={tr(p.nameTextId)}
                        />
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
