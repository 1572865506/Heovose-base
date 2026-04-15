
"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { ArrowRight, Play, Pause } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CaseStudies({ locale }: { locale: Locale }) {
  const t = translations[locale].cases;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const AUTOPLAY_DELAY = 5000;

  const plugin = useRef(
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })
  );

  const cases = [
    { id: 'case-retail', tag: t.tags.retail, title: t.retail.title, desc: t.retail.desc },
    { id: 'case-factory', tag: t.tags.industry, title: t.industry.title, desc: t.industry.desc },
    { id: 'case-office', tag: t.tags.office, title: t.office.title, desc: t.office.desc },
    { id: 'case-transport', tag: t.tags.transport, title: t.transport.title, desc: t.transport.desc },
    { id: 'hero-aio', tag: t.tags.office, title: locale === 'en' ? 'Digital Hub' : '数字中心', desc: locale === 'en' ? 'Integrated workspace solutions.' : '集成工作空间方案。' },
    { id: 'product-kiosk', tag: t.tags.retail, title: locale === 'en' ? 'Global Retail' : '全球零售', desc: locale === 'en' ? 'Scalable checkout systems.' : '可扩展结账系统。' },
  ];

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
    setProgress(0);
  }, []);

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    api.on("select", () => onSelect(api));
    api.on("reInit", () => onSelect(api));
    onSelect(api);
  }, [api, onSelect]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const intervalTime = 50;
    const step = (intervalTime / AUTOPLAY_DELAY) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, current]);

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

  // Calculate distance in a circular list to ensure smooth scaling during loops
  const getCardStyle = (index: number) => {
    if (!api) return "opacity-100";
    
    const total = cases.length;
    let diff = Math.abs(index - current);
    
    // Handle circular distance
    if (diff > total / 2) {
      diff = total - diff;
    }

    if (diff === 0) {
      return "scale-[1.12] z-30 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.3)]";
    }
    if (diff === 1) {
      return "scale-[0.92] z-20 opacity-70 translate-y-1";
    }
    return "scale-[0.8] z-10 opacity-30 translate-y-2";
  };

  return (
    <section id="cases" className="relative py-32 bg-background overflow-hidden">
      {/* Dynamic Background Layer with Gaussian Blur */}
      <div className="absolute inset-0 z-0">
        {cases.map((item, index) => {
          const imgData = PlaceHolderImages.find(img => img.id === item.id);
          return (
            <div
              key={`bg-${item.id}-${index}`}
              className={cn(
                "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                current === index ? "opacity-30" : "opacity-0"
              )}
            >
              {imgData?.imageUrl && (
                <Image
                  src={imgData.imageUrl}
                  alt="Background Dynamic Blur"
                  fill
                  className="object-cover blur-[120px] scale-110"
                  priority={index === current}
                />
              )}
              <div className="absolute inset-0 bg-background/40" />
            </div>
          );
        })}
      </div>

      <div className="container mx-auto px-6 mb-16 relative z-10">
        <SectionHeading 
          title={t.title} 
          subtitle={t.subtitle} 
          className="max-w-xl"
        />
      </div>

      <div className="relative w-full z-10">
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{
            align: "center",
            loop: true,
            skipSnaps: false,
          }}
          className="w-full"
        >
          <CarouselContent 
            className="-ml-4 md:-ml-6" 
            viewportClassName="py-24 overflow-visible"
          >
            {cases.map((item, index) => {
              const imgData = PlaceHolderImages.find(img => img.id === item.id);
              const isActive = current === index;
              
              return (
                <CarouselItem 
                  key={`${item.id}-${index}`} 
                  className="pl-4 md:pl-6 basis-[75%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%]"
                >
                  <div 
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl bg-white transition-all duration-700 ease-out cursor-pointer",
                      getCardStyle(index)
                    )}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {imgData?.imageUrl && (
                        <Image
                          src={imgData.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          data-ai-hint={imgData.imageHint}
                        />
                      )}
                      
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-opacity duration-500",
                        isActive ? "opacity-100" : "opacity-40"
                      )} />
                      
                      <div className={cn(
                        "absolute bottom-0 left-0 p-6 w-full transition-all duration-700",
                        isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                      )}>
                        <div className="flex justify-between items-end gap-3">
                          <div className="space-y-3 flex-1">
                            <span className="inline-block px-2 py-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-sm tracking-widest uppercase">
                              {item.tag}
                            </span>
                            <h3 className="text-lg font-headline font-bold text-white leading-tight">
                              {item.title}
                            </h3>
                            <p className="text-white/60 text-[10px] line-clamp-2 leading-relaxed">
                              {item.desc}
                            </p>
                          </div>
                          
                          <div className="shrink-0">
                            <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-lg transition-transform hover:scale-110">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="container mx-auto px-6 mt-16 relative z-10">
        <div className="flex items-center justify-end gap-6 max-w-xl ml-auto">
          <div className="flex gap-2 h-1 items-center">
            {Array.from({ length: count }).map((_, i) => (
              <button
                key={i}
                onClick={() => api?.scrollTo(i)}
                className={cn(
                  "relative h-full rounded-full transition-all duration-500 cursor-pointer border-none p-0 outline-none overflow-hidden bg-muted-foreground/20",
                  i === current ? "w-10" : "w-3 hover:bg-muted-foreground/40"
                )}
              >
                {i === current && (
                  <div 
                    className="absolute inset-0 bg-primary origin-left"
                    style={{ 
                      width: `${progress}%`,
                      transition: progress === 0 ? 'none' : 'width 50ms linear'
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleAutoplay}
              className="rounded-full hover:bg-primary/5 text-primary h-9 w-9 shrink-0 border border-transparent"
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
