
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Pause } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useTranslations } from '@/hooks/use-translations';

function GalleryCard({ product, locale }: { product: any, locale: Locale }) {
  return (
    <Link
      href={`/products?category=${encodeURIComponent(product.slug)}`}
      className="group relative flex flex-col h-full bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-border/5 overflow-hidden transform-gpu"
    >
      {/* Product Image - 11:9 Ratio at the top */}
      <div className="relative w-full aspect-[11/9] overflow-hidden bg-muted/5 shrink-0">
        {product.imageUrl && (
          <Image
            src={product.imageUrl}
            alt={product.label}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        )}

        {/* Floating Badge */}
        {product.badge && (
          <div className="absolute top-6 left-6 z-10">
            <span className={cn(
              "inline-block px-3 py-1 text-[10px] font-bold tracking-wider uppercase rounded-full border shadow-lg backdrop-blur-md",
              product.badgeType === 'NEW' 
                ? "bg-blue-600/90 text-white border-blue-400/50" 
                : "bg-red-600/90 text-white border-red-400/50"
            )}>
              {product.badge}
            </span>
          </div>
        )}
      </div>

      {/* Content Area - Below the image */}
      <div className="p-6 md:p-8 flex flex-col flex-grow justify-between bg-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-headline font-bold text-slate-900 leading-tight tracking-tight line-clamp-1">
              {product.label}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {product.desc}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-6">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-primary/30 group-hover:text-primary transition-all duration-500 transform-gpu group-hover:scale-110">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductGallery({ locale }: { locale: Locale }) {
  const { t: tr } = useTranslations(locale);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const isPlayingRef = useRef(true); 
  const [progress, setProgress] = useState(0);
  const AUTOPLAY_DELAY = 5000;

  // Sync ref with state
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // 1. Fetch dynamic data
  const { data: remoteProducts, isLoading } = useLocalCollection<any>('products?status=published&limit=8');
  const { data: allTranslations } = useLocalCollection<any>(`localizedStrings?lang=${locale}`);
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  
  const { data: galleryConfig, mutate: mutateGallery } = useLocalDoc<any>('homepageContent', 'gallery');
  


  // Unified translation helper with multi-level fallback
  const getT = useCallback((id: string) => {
    if (!allTranslations) return id;
    const entry = allTranslations.find((item: any) => item.id === id || item.key === id);
    if (!entry || !entry.content) return id;

    const content = typeof entry.content === 'string' ? JSON.parse(entry.content) : entry.content;
    const defaultLang = langSettings?.defaultLanguage || 'en';
    const allLocales: Locale[] = ['en', 'zh', 'id', 'vi'];

    if (content[locale]) return content[locale];
    if (content[defaultLang]) return content[defaultLang];
    for (const l of allLocales) {
      if (content[l]) return content[l];
    }
    return id;
  }, [allTranslations, locale, langSettings]);

  // Helper for dynamic section configuration
  const getSectionConfig = useCallback((prefix: string, fallbackKey: string) => {
    const dynamicTranslation = (tr as any)(fallbackKey);
    if (dynamicTranslation && dynamicTranslation !== fallbackKey) {
      return dynamicTranslation;
    }

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
    // 优先级 1: 手动配置的项目 (GalleryItems)
    if (galleryConfig?.galleryItems && Array.isArray(galleryConfig.galleryItems) && galleryConfig.galleryItems.length > 0 && remoteProducts) {
      return galleryConfig.galleryItems.map((item: any) => {
        const product = remoteProducts.find((p: any) => p.id === item.productId);
        if (!product) return null;
        
        // 翻译 Badge
        let badgeLabel = item.badge;
        if (item.badge === 'NEW') badgeLabel = getT('BADGE_NEW');
        if (item.badge === 'HOT') badgeLabel = getT('BADGE_HOT');

        return {
          id: product.id,
          label: getT(product.nameTextId),
          desc: getT(product.descriptionTextId),
          category: product.categoryId || '',
          slug: product.categoryId || product.id,
          imageUrl: product.mainImageUrl || '/image/product-placeholder.png',
          badge: badgeLabel,
          badgeType: item.badge // Pass raw type for color logic
        };
      }).filter(Boolean);
    }

    // 优先级 2: 自动拉取最新产品
    if (remoteProducts && remoteProducts.length > 0) {
      return remoteProducts.map((p: any, idx: number) => {
        // Mocked badges for fallback mode
        let badge = null;
        let badgeType = null;
        if (idx % 4 === 0) {
          badge = getT('BADGE_NEW');
          badgeType = 'NEW';
        } else if (idx % 4 === 1) {
          badge = getT('BADGE_HOT');
          badgeType = 'HOT';
        }

        return {
          id: p.id,
          label: getT(p.nameTextId),
          desc: getT(p.descriptionTextId),
          imageUrl: p.mainImageUrl || '/image/product-placeholder.png',
          slug: p.categoryId || p.id,
          category: p.categoryId || '',
          badge: badge,
          badgeType: badgeType
        };
      });
    }

    return [];
  }, [remoteProducts, getT, galleryConfig]);

  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      const snapIndex = api.selectedScrollSnap();
      setCurrent((prev) => {
        if (prev !== snapIndex) {
          setProgress(0); 
          return snapIndex;
        }
        return prev;
      });
    };

    const onReInit = () => {
      const newCount = api.scrollSnapList().length;
      setCount((prev) => (prev !== newCount ? newCount : prev));
    };

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", onSelect);
    api.on("reInit", onReInit);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api]);

  // CUSTOM TIMER: Manages both progress and slide switching
  useEffect(() => {
    if (!api) return;

    const intervalTime = 50;
    const step = (intervalTime / AUTOPLAY_DELAY) * 100;

    const timer = setInterval(() => {
      if (isPlayingRef.current) {
        setProgress((prev) => {
          if (prev >= 100) return 100; // Stay at 100 until onSelect resets it
          
          const next = prev + step;
          if (next >= 100) {
            api.scrollNext();
            return 100;
          }
          return next;
        });
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [api]); 

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => !prev);
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
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full overflow-visible"
        >
          <CarouselContent className="-ml-8" viewportClassName="py-16 overflow-visible">
            {products.map((product: any) => (
              <CarouselItem key={product.id} className="pl-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <GalleryCard product={product} locale={locale} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Carousel Indicators & Progress Bar */}
        <div className="container mx-auto px-6 mt-12">
          <div className="flex items-center justify-center lg:justify-end gap-8 max-w-4xl ml-auto">
            {/* Progress Indicators */}
            <div className="flex gap-3 h-1.5 items-center flex-grow max-w-xs">
              {count > 0 ? Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "relative h-full rounded-full transition-all duration-500 cursor-pointer overflow-hidden flex-grow",
                    i === current ? "bg-slate-200 w-16" : "bg-slate-100 w-8 hover:bg-slate-200"
                  )}
                >
                  {i === current && (
                    <div
                      className="absolute inset-0 bg-primary origin-left transition-all duration-[50ms] linear"
                      style={{ width: `${progress}%` }}
                    />
                  )}
                </button>
              )) : (
                <div className="h-full w-full bg-slate-100 rounded-full animate-pulse" />
              )}
            </div>

            {/* Digital Index */}
            <div className="flex items-center gap-3 text-primary/40 font-mono text-sm font-bold">
              <span className="text-primary">{String(current + 1).padStart(2, '0')}</span>
              <span className="h-4 w-[1px] bg-border" />
              <span>{String(count || products.length || 0).padStart(2, '0')}</span>
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
