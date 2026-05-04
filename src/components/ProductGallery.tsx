
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

export function ProductGallery({ locale }: { locale: Locale }) {
  const t = translations[locale].products;
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

  const getT = (id: string) => {
    const entry = allTranslations?.find((item: any) => item.id === id);
    if (!entry) return id;
    return entry[locale] || entry['en'] || entry['zh'] || id;
  };

  // 2. Data transformation
  const products = useMemo(() => {
    if (remoteProducts && remoteProducts.length > 0) {
      return remoteProducts.map((p: any) => ({
        id: p.id,
        label: getT(p.nameTextId),
        desc: getT(p.descriptionTextId),
        imageUrl: p.mainImageUrl || PlaceHolderImages.find(img => img.id === p.productCategoryId)?.imageUrl || '/image/product-placeholder.png',
        slug: p.productCategoryId || p.id
      }));
    }

    // Fallback if no products in DB
    return [
      { id: 'p1', label: 'Loading...', desc: '...', imageUrl: '', slug: '' }
    ];
  }, [remoteProducts, allTranslations, locale]);

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
    <section id="products" className="relative z-20 py-24 bg-background overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.1)] group/carousel">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />
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
            {products.map((product) => {
              const imgData = PlaceHolderImages.find(img => img.id === product.id);
              return (
                <CarouselItem key={product.id} className="pl-8 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="group flex flex-col bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-border/20 h-full overflow-hidden">
                    <div className="relative aspect-[11/9] w-full overflow-hidden bg-muted/20">
                      {product.imageUrl && (
                        <Image
                          src={product.imageUrl}
                          alt={product.label}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
                        />
                      )}
                    </div>
                    
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="space-y-4 mb-8 flex-grow">
                        <h3 className="text-2xl font-headline font-bold text-primary leading-tight">
                          {product.label}
                        </h3>
                        <p className="text-base text-muted-foreground/80 leading-relaxed line-clamp-3">
                          {product.desc}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto pt-6 border-t border-border/50">
                        <Link 
                          href={`/products?category=${encodeURIComponent(product.slug)}`}
                          className="flex items-center gap-2 text-sm font-bold text-primary group/btn tracking-tighter"
                        >
                          {t.viewDetails}
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Link>
                        <div className="p-2 bg-muted/30 rounded-lg group-hover:bg-primary/5 transition-colors">
                          <FileText className="h-5 w-5 text-primary/40 group-hover:text-primary transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
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
              {Array.from({ length: count }).map((_, i) => (
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
              <span>{String(count).padStart(2, '0')}</span>
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
