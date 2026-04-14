"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
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

export function ProductGallery({ locale }: { locale: Locale }) {
  const t = translations[locale].products;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const plugin = useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );

  const products = [
    { 
      id: 'product-aio', 
      label: t.aio, 
      desc: locale === 'en' ? 'Sleek, powerful desktop integration for modern workspaces.' : '专为现代办公空间设计的强劲一体化桌面方案。' 
    },
    { 
      id: 'product-minipc', 
      label: t.minipc, 
      desc: locale === 'en' ? 'Ultra-compact performance for edge computing and business.' : '适用于边缘计算和商业应用的高性能迷你电脑。' 
    },
    { 
      id: 'product-monitor', 
      label: t.monitor, 
      desc: locale === 'en' ? 'Rugged industrial displays built for 24/7 durability.' : '专为 24/7 全天候运行设计的耐用工业级显示器。' 
    },
    { 
      id: 'product-kiosk', 
      label: t.kiosk, 
      desc: locale === 'en' ? 'Smart self-service terminals for retail and hospitality.' : '适用于零售和酒店业的高性能智能自助服务终端。' 
    },
    { 
      id: 'factory-china', 
      label: locale === 'en' ? 'Custom Hardware Design' : '定制硬件设计', 
      desc: locale === 'en' ? 'Bespoke hardware manufacturing solutions for global partners.' : '为全球合作伙伴提供的定制硬件制造解决方案。' 
    },
    { 
      id: 'factory-indonesia', 
      label: locale === 'en' ? 'Supply Chain Management' : '供应链管理', 
      desc: locale === 'en' ? 'End-to-end logistics and component sourcing services.' : '端到端的物流和元器件采购服务。' 
    },
  ];

  useEffect(() => {
    if (!api) return;

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

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
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} centered />
        
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4">
            {products.map((product) => {
              const imgData = PlaceHolderImages.find(img => img.id === product.id);
              return (
                <CarouselItem key={product.id} className="pl-4 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                  <div className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border border-border/20 h-full">
                    {/* Image Container with 11:9 Aspect Ratio */}
                    <div className="relative aspect-[11/9] w-full overflow-hidden bg-muted/20">
                      {imgData?.imageUrl && (
                        <Image
                          src={imgData.imageUrl}
                          alt={product.label}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          data-ai-hint={imgData.imageHint}
                        />
                      )}
                    </div>
                    
                    {/* Content Container */}
                    <div className="p-8 flex flex-col flex-grow relative">
                      <div className="space-y-4 mb-12 flex-grow">
                        <h3 className="text-2xl font-headline font-bold text-primary leading-tight">
                          {product.label}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {product.desc}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <button className="flex items-center gap-2 text-sm font-bold text-primary group/btn tracking-wide">
                          {t.requestQuote}
                          <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                        <FileText className="h-5 w-5 text-primary opacity-40" />
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        {/* Carousel Controls: Progress and Play/Pause */}
        <div className="mt-16 flex items-center justify-end gap-6 max-w-sm ml-auto">
          {/* Progress Indicator */}
          <div className="flex gap-2 flex-grow h-1.5 items-center">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  i === current ? "bg-primary w-12" : "bg-muted w-6"
                )}
              />
            ))}
          </div>

          {/* Play/Pause Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleAutoplay}
            className="rounded-full hover:bg-primary/10 text-primary h-12 w-12"
          >
            {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
          </Button>
        </div>
      </div>
    </section>
  );
}