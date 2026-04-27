
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { ArrowRight, Play, Pause, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

interface RemoteCase {
  id: string;
  tagZh: string;
  tagEn: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  imageUrl: string;
}

export function CaseStudies({ locale }: { locale: Locale }) {
  const t = translations[locale].cases;
  const firestore = useFirestore();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const AUTOPLAY_DELAY = 5000;

  const plugin = useRef(
    Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false })
  );

  // 1. 从 Firestore 获取云端案例
  const casesQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'caseStudies'), orderBy('order', 'asc')) : null, 
    [firestore]
  );
  const { data: remoteCases, isLoading } = useCollection<RemoteCase>(casesQuery);

  // 2. 数据处理与回退逻辑
  const cases = useMemo(() => {
    if (remoteCases && remoteCases.length > 0) {
      return remoteCases.map(c => ({
        id: c.id,
        tag: locale === 'zh' ? c.tagZh : c.tagEn,
        title: locale === 'zh' ? c.titleZh : c.titleEn,
        desc: locale === 'zh' ? c.descZh : c.descEn,
        imageUrl: c.imageUrl
      }));
    }

    // 默认回退数据
    return [
      { id: 'case-retail', tag: t.tags.retail, title: t.retail.title, desc: t.retail.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-retail')?.imageUrl },
      { id: 'case-factory', tag: t.tags.industry, title: t.industry.title, desc: t.industry.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-factory')?.imageUrl },
      { id: 'case-office', tag: t.tags.office, title: t.office.title, desc: t.office.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-office')?.imageUrl },
      { id: 'case-transport', tag: t.tags.transport, title: t.transport.title, desc: t.transport.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-transport')?.imageUrl },
    ];
  }, [remoteCases, locale, t]);

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
    if (!isPlaying || cases.length === 0) return;
    
    const intervalTime = 50;
    const step = (intervalTime / AUTOPLAY_DELAY) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + step;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isPlaying, current, cases.length]);

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

  const getCardStyle = (index: number) => {
    if (!api) return "opacity-100";
    const total = cases.length;
    let diff = Math.abs(index - current);
    if (diff > total / 2) diff = total - diff;

    if (diff === 0) return "scale-[1.12] z-30 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.3)]";
    if (diff === 1) return "scale-[0.92] z-20 opacity-70 translate-y-1";
    return "scale-[0.8] z-10 opacity-30 translate-y-2";
  };

  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (isLoading) {
    return (
      <div className="py-32 bg-background overflow-hidden">
        <div className="container mx-auto px-6 mb-16">
          <div className="space-y-4 max-w-xl">
            <div className="h-4 w-32 bg-muted rounded-full animate-pulse" />
            <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
        <div className="flex gap-6 px-6 overflow-hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div 
              key={i} 
              className={cn(
                "basis-[75%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%] shrink-0",
                "aspect-[4/5] rounded-2xl bg-muted/20 animate-pulse relative"
              )}
            >
              <div className="absolute bottom-0 left-0 p-6 w-full space-y-3">
                <div className="h-3 w-16 bg-muted rounded-sm" />
                <div className="h-5 w-32 bg-muted rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section 
      id="cases" 
      ref={sectionRef}
      className="relative py-32 bg-background overflow-hidden"
    >
      {/* 动态背景联动 */}
      <div className="absolute inset-0 z-0">
        {cases.map((item, index) => (
          <div
            key={`bg-${item.id}`}
            className={cn(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              current === index ? "opacity-30" : "opacity-0"
            )}
          >
            {item.imageUrl && (
              <Image
                src={item.imageUrl}
                alt="Background Blur"
                fill
                className="object-cover blur-[120px] scale-110"
                unoptimized={item.imageUrl.startsWith('data:')}
                priority={index === current}
              />
            )}
            <div className="absolute inset-0 bg-background/40" />
          </div>
        ))}
      </div>

      <div className="container mx-auto px-6 mb-16 relative z-10">
        <SectionHeading title={t.title} subtitle={t.subtitle} className="max-w-xl" />
      </div>

      <div className={cn(
        "relative w-full z-10 transition-all duration-1000 delay-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
      )}>
        <Carousel
          setApi={setApi}
          plugins={[plugin.current]}
          opts={{ align: "center", loop: true, skipSnaps: false }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-6" viewportClassName="py-24 overflow-visible">
            {cases.map((item, index) => {
              const isActive = current === index;
              return (
                <CarouselItem key={item.id} className="pl-4 md:pl-6 basis-[75%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%]">
                  <div 
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl bg-white transition-all duration-700 ease-out cursor-pointer",
                      getCardStyle(index)
                    )}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          unoptimized={item.imageUrl.startsWith('data:')}
                        />
                      )}
                      
                      <div className={cn("absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-opacity duration-500", isActive ? "opacity-100" : "opacity-40")} />
                      
                      <div className={cn("absolute bottom-0 left-0 p-6 w-full transition-all duration-700", isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0")}>
                        <div className="flex justify-between items-end gap-3">
                          <div className="space-y-3 flex-1">
                            <span className="inline-block px-2 py-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-sm tracking-widest uppercase">
                              {item.tag}
                            </span>
                            <h3 className="text-lg font-headline font-bold text-white leading-tight">{item.title}</h3>
                            <p className="text-white/60 text-[10px] line-clamp-2 leading-relaxed">{item.desc}</p>
                          </div>
                          <div className="shrink-0"><div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-lg transition-transform hover:scale-110"><ArrowRight className="h-4 w-4" /></div></div>
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

    </section>
  );
}
