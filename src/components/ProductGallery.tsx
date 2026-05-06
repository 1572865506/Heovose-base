
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight, FileText, Play, Pause } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useTranslations } from '@/hooks/use-translations';

export function ProductGallery({ locale }: { locale: Locale }) {
  const { t: tr } = useTranslations(locale);
  const t = translations[locale].gallery;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);

  const plugin = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false })
  );

  // 1. Fetch dynamic data
  const { data: remoteProducts, isLoading } = useLocalCollection<any>('products?status=published&limit=8');
  const { data: allTranslations } = useLocalCollection<any>('localizedStrings');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  
  // Use a cache-busting key or ensure revalidation
  const { data: galleryConfig, mutate: mutateGallery } = useLocalDoc<any>('homepageContent', 'gallery');
  
  useEffect(() => {
    // Force revalidate on mount
    mutateGallery();
    console.log('[DEBUG] Gallery Config Attempt:', galleryConfig);
  }, [mutateGallery, galleryConfig]);

  // Unified translation helper with multi-level fallback
  const getT = useCallback((id: string) => {
    if (!allTranslations) return id;
    const entry = allTranslations.find((item: any) => item.id === id || item.key === id);
    if (!entry || !entry.content) return id;

    const content = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
    const defaultLang = langSettings?.defaultLanguage || 'en';
    const allLocales: Locale[] = ['en', 'zh', 'id', 'vi'];

    // 1. Current Locale
    if (content[locale]) return content[locale];
    // 2. Default Locale
    if (content[defaultLang]) return content[defaultLang];
    // 3. Fallback to any available
    for (const l of allLocales) {
      if (content[l]) return content[l];
    }
    return id;
  }, [allTranslations, locale, langSettings]);

  // Helper for dynamic section configuration
  const getSectionConfig = useCallback((prefix: string, fallbackKey: string) => {
    // 1. HIGH PRIORITY: Global translation system
    const dynamicTranslation = (tr as any)(fallbackKey);
    if (dynamicTranslation && dynamicTranslation !== fallbackKey) {
      return dynamicTranslation;
    }

    // 2. MEDIUM PRIORITY: Private section configuration
    const defaultLang = langSettings?.defaultLanguage || 'en';
    const allLocales: Locale[] = ['en', 'zh', 'id', 'vi'];

    const getVal = (l: string) => {
      const suffix = l.charAt(0).toUpperCase() + l.slice(1);
      const field = `${prefix}${suffix}`;
      return galleryConfig?.[field] || (galleryConfig as any)?.data?.[field];
    };

    return getVal(locale) || getVal(defaultLang) || allLocales.map(getVal).find(v => !!v) || (tr as any)(fallbackKey) || '';
  }, [galleryConfig, locale, langSettings, tr]);

  // 2. Data transformation
  const products = useMemo(() => {
    if (remoteProducts && remoteProducts.length > 0) {
      return remoteProducts.map((p: any) => ({
        id: p.id,
        label: getT(p.nameTextId),
        desc: getT(p.descriptionTextId),
        imageUrl: p.mainImageUrl || PlaceHolderImages.find(img => img.id === p.productCategoryId)?.imageUrl || '/image/product-placeholder.png',
        slug: p.productCategoryId || p.id,
        category: p.productCategoryId || ''
      }));
    }

    return [];
  }, [remoteProducts, getT]);

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
      setProgress(0);
    });
  }, [api]);

  useEffect(() => {
    if (!isPlaying || !api) return;
    
    const intervalTime = 50;
    const step = (intervalTime / 5000) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, current, api]);

  const toggleAutoplay = useCallback(() => {
    const autoplay = plugin.current;
    if (autoplay.isPlaying()) {
      autoplay.stop();
      setIsPlaying(false);
    } else {
      autoplay.play();
      setIsPlaying(true);
    }
  }, []);

  return (
    <section id="products" className="relative z-20 py-24 bg-background overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.05)] group/carousel">
      <div className="container mx-auto px-6">
        <SectionHeading 
          key={count}
          title={getSectionConfig('galleryTitle', 'GALLERY_TITLE')} 
          subtitle={getSectionConfig('gallerySubtitle', 'GALLERY_SUBTITLE')} 
        />
      </div>
      
      <div className="relative px-4 md:px-12 lg:px-24">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full overflow-visible"
        >
          <CarouselContent className="-ml-8" viewportClassName="py-16 overflow-visible">
            {products.map((product: any) => {
              return (
                <CarouselItem key={product.id} className="pl-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <Link
                    href={`/products?category=${encodeURIComponent(product.slug)}`}
                    className="group relative flex flex-col aspect-[4/5] bg-white rounded-[3rem] shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all duration-700 border border-border/10 overflow-hidden transform-gpu"
                  >
                    {/* Product Image */}
                    <div className="absolute inset-0 w-full h-full overflow-hidden bg-muted/5">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.label}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out"
                        />
                      )}
                    </div>
                    
                    {/* High-Fidelity Frosted Glass Overlay */}
                    <div 
                      className="absolute inset-x-0 bottom-0 h-[45%] pointer-events-none transition-all duration-500 bg-white/10 backdrop-blur-[24px] [-webkit-backdrop-filter:blur(24px)] saturate-[160%]"
                      style={{
                        WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='100' preserveAspectRatio='none'%3E%3ClinearGradient id='g' x1='0' y1='1' x2='0' y2='0'%3E%3Cstop offset='0' stop-color='black'/%3E%3Cstop offset='1' stop-color='black' stop-opacity='0'/%3E%3C/linearGradient%3E%3Crect width='1' height='100' fill='url(%23g)'/%3E%3C/svg%3E")`,
                        maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='100' preserveAspectRatio='none'%3E%3ClinearGradient id='g' x1='0' y1='1' x2='0' y2='0'%3E%3Cstop offset='0' stop-color='black'/%3E%3Cstop offset='1' stop-color='black' stop-opacity='0'/%3E%3C/linearGradient%3E%3Crect width='1' height='100' fill='url(%23g)'/%3E%3C/svg%3E")`,
                        WebkitMaskSize: '100% 100%',
                        maskSize: '100% 100%',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat'
                      }}
                    />

                    {/* Content Area */}
                    <div className="absolute inset-0 p-8 pb-10 flex flex-col justify-end transform-gpu will-change-transform [backface-visibility:hidden]">
                      <div className="space-y-4">
                        {product.category && (
                          <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-md text-slate-800 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-slate-200/50 shadow-sm opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                            {product.category}
                          </span>
                        )}
                        <div className="flex items-end justify-between gap-4">
                          <div className="flex-grow">
                            <h3 className="text-2xl font-headline font-bold text-slate-900 leading-tight tracking-tight mb-2 drop-shadow-[0_5px_5px_rgba(255,255,255,0.5)]">
                              {product.label}
                            </h3>
                            <p className="text-sm text-black/60 leading-relaxed line-clamp-2 max-w-[90%] opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-700 delay-75">
                              {product.desc}
                            </p>
                          </div>
                          <div className="h-12 w-12 shrink-0 rounded-full bg-white/90 shadow-lg backdrop-blur-sm flex items-center justify-center text-slate-900 translate-y-12 group-hover:translate-y-0 transition-all duration-500 delay-150 hover:scale-110">
                            <ArrowRight className="h-6 w-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Carousel Indicators & Progress Bar */}
        <div className="container mx-auto px-6 mt-12">
          <div className="flex items-center justify-center lg:justify-end gap-8 max-w-4xl ml-auto">
            {/* Progress Indicators */}
            <div className="flex gap-3 h-1.5 items-center flex-grow max-w-xs">
              {count > 0 && Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "relative h-full rounded-full transition-all duration-500 cursor-pointer overflow-hidden flex-grow",
                    i === current ? "bg-muted w-16" : "bg-muted w-8 hover:bg-muted-foreground/20"
                  )}
                >
                  {i === current && (
                    <div 
                      className="absolute inset-0 bg-primary origin-left transition-all duration-[50ms] linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Digital Index */}
            <div className="flex items-center gap-3 text-primary/40 font-mono text-sm font-bold">
              <span className="text-primary">{String(current + 1).padStart(2, '0')}</span>
              <span className="h-4 w-[1px] bg-border" />
              <span>{String(count || 0).padStart(2, '0')}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleAutoplay}
                className="rounded-full hover:bg-primary/10 text-primary h-12 w-12 shrink-0 border border-border/50"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
