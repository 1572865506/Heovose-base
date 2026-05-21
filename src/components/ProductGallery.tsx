
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Pause } from "lucide-react";
import { getAssetUrl } from '@/lib/image-utils';
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
import { useInquiry } from '@/hooks/../components/providers/InquiryProvider';
import { MessageSquare } from 'lucide-react';
import { HoverVideoPlayer } from '@/components/HoverVideoPlayer';

function GalleryCard({ 
  product, 
  locale,
  playingProductId,
  setPlayingProductId
}: { 
  product: any, 
  locale: Locale,
  playingProductId: string | null,
  setPlayingProductId: (id: string | null) => void
}) {
  const { openInquiry } = useInquiry();
  const { t: tr } = useTranslations(locale);

  return (
    <div className="group relative flex flex-col h-full max-w-[400px] mx-auto w-full bg-white rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-500 border border-border/5 overflow-hidden transform-gpu">
      <Link
        href={`/products/${product.id}`}
        className="block"
      >
        {/* Product Image - 11:9 Ratio at the top with Video Preview */}
        <div className="relative w-full aspect-[11/9] overflow-hidden rounded-t-[2.5rem] bg-muted/5 shrink-0 isolate">
          <HoverVideoPlayer
            productId={product.id}
            playingProductId={playingProductId}
            setPlayingProductId={setPlayingProductId}
            videoUrl={product.videoUrl}
            mainImageUrl={product.imageUrl}
            alt={product.label}
          />

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
        <div className="p-6 md:p-8 flex flex-col bg-white">
          <div className="space-y-2">
            <h3 className="text-xl md:text-2xl font-headline font-bold text-slate-900 leading-tight tracking-tight line-clamp-1">
              {product.label}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
              {product.desc}
            </p>
          </div>
        </div>
      </Link>

      <div className="px-6 md:px-8 pb-8 mt-auto flex items-center justify-between gap-4">
        <Button 
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            openInquiry({ productId: product.id, productName: product.label });
          }}
          className="rounded-full px-5 text-[10px] font-bold uppercase tracking-wider border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-500 gap-2 flex-1"
        >
          <MessageSquare className="h-3 w-3" />
          {tr('products_requestQuote')}
        </Button>
        <Link 
          href={`/products/${product.id}`}
          className="h-9 w-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-primary/10 hover:text-primary hover:border-primary/20 transition-all duration-500 shrink-0"
        >
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

export function ProductGallery({ locale }: { locale: Locale }) {
  const { t: tr } = useTranslations(locale);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playingProductId, setPlayingProductId] = useState<string | null>(null);
  const isPlayingRef = useRef(true);
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
          videoUrl: product.videoUrl || '',
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
          videoUrl: p.videoUrl || '',
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
      setCurrent(snapIndex);
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

  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 性能优化：观察可见性
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.05 });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // CUSTOM TIMER: Manages slide switching
  useEffect(() => {
    if (!api || !isVisible || !isPlaying || playingProductId !== null) return;

    const timer = setInterval(() => {
      api.scrollNext();
    }, AUTOPLAY_DELAY);

    return () => clearInterval(timer);
  }, [api, isVisible, isPlaying, playingProductId, current]);

  const toggleAutoplay = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  return (
    <section ref={containerRef} id="products" className="relative z-20 -mt-px py-24 bg-background overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.05)] group/carousel">
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
          <CarouselContent className="-ml-8" viewportClassName="py-8 overflow-visible">
            {products.map((product: any) => (
              <CarouselItem key={product.id} className="pl-8 shrink-0 basis-auto w-[290px] xs:w-[320px] sm:w-[350px] md:w-[380px] lg:w-[400px]">
                <GalleryCard 
                  product={product} 
                  locale={locale} 
                  playingProductId={playingProductId}
                  setPlayingProductId={setPlayingProductId}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>

        {/* Carousel Indicators & Progress Bar */}
        <div className="container mx-auto px-6 mt-8 lg:mt-12">
          <div className="flex items-center justify-center lg:justify-end gap-4 lg:gap-8 max-w-4xl ml-auto">
            {/* Progress Indicators */}
            <div className="flex gap-2 lg:gap-3 h-1.5 items-center flex-grow max-w-[180px] lg:max-w-xs">
              {count > 0 ? Array.from({ length: count }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => api?.scrollTo(i)}
                  className={cn(
                    "relative h-full rounded-full transition-all duration-500 cursor-pointer overflow-hidden flex-grow",
                    i === current ? "bg-slate-200 w-10 lg:w-16" : "bg-slate-100 w-4 lg:w-8 hover:bg-slate-200"
                  )}
                >
                  {i === current && (
                    <div
                      key={current}
                      className="absolute inset-0 bg-primary origin-left"
                      style={{
                        animation: 'hero-progress-gpu 5000ms linear forwards',
                        animationPlayState: isPlaying ? 'running' : 'paused'
                      }}
                    />
                  )}
                </button>
              )) : (
                <div className="h-full w-full bg-slate-100 rounded-full animate-pulse" />
              )}
            </div>

            {/* Digital Index */}
            <div className="flex items-center gap-2 lg:gap-3 text-primary/40 font-mono text-[10px] lg:text-sm font-bold">
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
                className="rounded-full hover:bg-primary/10 text-primary h-10 w-10 lg:h-12 lg:w-12 shrink-0 border border-border/50"
              >
                {isPlaying ? <Pause className="h-4 w-4 lg:h-5 lg:w-5" /> : <Play className="h-4 w-4 lg:h-5 lg:w-5" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
