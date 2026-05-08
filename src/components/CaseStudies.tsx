
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { ArrowRight, Loader2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { getAssetUrl } from '@/lib/image-utils';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useTranslations } from '@/hooks/use-translations';

interface RemoteCase {
  id: string;
  tagZh: string;
  tagEn: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  tagTextId?: string;
  titleTextId?: string;
  descriptionTextId?: string;
  imageUrl: string;
}

export function CaseStudies({ locale }: { locale: Locale }) {
  const t = translations[locale].cases;
  const { t: lt } = useTranslations(locale);
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const AUTOPLAY_DELAY = 5000;

  const plugin = useRef(Autoplay({ delay: AUTOPLAY_DELAY, stopOnInteraction: false }));

  // 1. 获取数据
  const { data: remoteCases, isLoading } = useLocalCollection<RemoteCase>('caseStudies', { enabled: isVisible });

  // 2. 转换数据
  const cases = useMemo(() => {
    if (remoteCases && remoteCases.length > 0) {
      return remoteCases.map(c => {
        const tag = c.tagTextId ? (lt(c.tagTextId) ?? (locale === 'zh' ? c.tagZh : c.tagEn)) : (locale === 'zh' ? c.tagZh : c.tagEn);
        const title = c.titleTextId ? (lt(c.titleTextId) ?? (locale === 'zh' ? c.titleZh : c.titleEn)) : (locale === 'zh' ? c.titleZh : c.titleEn);
        const desc = c.descriptionTextId ? (lt(c.descriptionTextId) ?? (locale === 'zh' ? c.descZh : c.descEn)) : (locale === 'zh' ? c.descZh : c.descEn);
        
        return {
          id: c.id,
          tag,
          title,
          desc,
          imageUrl: c.imageUrl
        };
      });
    }
    return [
      { id: 'case-retail', tag: t.tags.retail, title: t.retail.title, desc: t.retail.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-retail')?.imageUrl },
      { id: 'case-factory', tag: t.tags.industry, title: t.industry.title, desc: t.industry.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-factory')?.imageUrl },
      { id: 'case-office', tag: t.tags.office, title: t.office.title, desc: t.office.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-office')?.imageUrl },
      { id: 'case-transport', tag: t.tags.transport, title: t.transport.title, desc: t.transport.desc, imageUrl: PlaceHolderImages.find(i=>i.id==='case-transport')?.imageUrl },
    ];
  }, [remoteCases, locale, t, lt]);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrent(api.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => onSelect(api));
    api.on("reInit", () => onSelect(api));
    onSelect(api);
  }, [api, onSelect]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } },
      { threshold: 0.05, rootMargin: '200px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
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

  // 渲染逻辑拆分
  const renderLoading = () => (
    <div className="container mx-auto px-6">
      <div className="space-y-4 max-w-xl mb-16">
        <div className="h-4 w-32 bg-muted rounded-full animate-pulse" />
        <div className="h-10 w-64 bg-muted rounded-lg animate-pulse" />
      </div>
      <div className="flex gap-6 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="basis-[75%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%] shrink-0 aspect-[4/5] rounded-2xl bg-muted/20 animate-pulse" />
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    const isCarousel = cases.length > 3;

    return (
      <>
        <div className="absolute inset-0 z-0">
          {cases.map((item, index) => (
            <div key={`bg-${item.id}`} className={cn("absolute inset-0 transition-opacity duration-1000 ease-in-out", (isCarousel ? current === index : true) ? "opacity-30" : "opacity-0")}>
              {item.imageUrl && (
                <Image src={getAssetUrl(item.imageUrl)} alt="Background Blur" fill className="object-cover blur-[120px] scale-110" unoptimized={item.imageUrl.startsWith('data:')} priority={index === current} />
              )}
              <div className="absolute inset-0 bg-background/40" />
            </div>
          ))}
        </div>
        
        <div className="container mx-auto px-6 mb-16 relative z-10 text-center lg:text-left">
          <SectionHeading 
            title={lt('CASES_TITLE') ?? t.title} 
            subtitle={lt('CASES_SUBTITLE') ?? t.subtitle} 
            className="max-w-xl mx-auto lg:mx-0" 
          />
        </div>

        <div className={cn("relative w-full z-10 transition-all duration-1000 py-24", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20")}>
          {isCarousel ? (
            <Carousel setApi={setApi} plugins={[plugin.current]} opts={{ align: "center", loop: true, skipSnaps: false }} className="w-full">
              <CarouselContent className="-ml-4 md:-ml-6" viewportClassName="overflow-visible">
                {cases.map((item, index) => {
                  const isActive = current === index;
                  return (
                    <CarouselItem key={item.id} className="pl-4 md:pl-6 basis-[85%] sm:basis-[45%] md:basis-[30%] lg:basis-[22%]">
                      <div onClick={() => api?.scrollTo(index)} className={cn("group relative overflow-hidden rounded-2xl bg-white transition-all duration-700 ease-out cursor-pointer", getCardStyle(index))}>
                        <div className="relative aspect-[4/5] overflow-hidden">
                          {item.imageUrl && <Image src={getAssetUrl(item.imageUrl)} alt={item.title} fill className="object-cover transition-transform duration-[1000ms] group-hover:scale-110" unoptimized={item.imageUrl.startsWith('data:')} />}
                          <div className={cn("absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent transition-opacity duration-500", isActive ? "opacity-100" : "opacity-40")} />
                          <div className={cn("absolute bottom-0 left-0 p-6 w-full transition-all duration-700", isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0")}>
                            <div className="flex justify-between items-end gap-3">
                              <div className="space-y-3 flex-1">
                                <span className="inline-block px-2 py-1 bg-accent text-accent-foreground text-[9px] font-bold rounded-sm tracking-widest uppercase">{item.tag}</span>
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
          ) : (
            <div className="container mx-auto px-6">
              <div className={cn(
                "flex flex-wrap justify-center gap-8 md:gap-12",
                cases.length === 1 ? "max-w-2xl mx-auto" : "w-full"
              )}>
                {cases.map((item) => (
                  <div 
                    key={item.id} 
                    className={cn(
                      "group relative overflow-hidden rounded-3xl bg-white transition-all duration-700 ease-out cursor-pointer shadow-xl border border-white/10",
                      cases.length === 1 ? "basis-full md:basis-[60%] scale-105" : 
                      cases.length === 2 ? "basis-full sm:basis-[45%] lg:basis-[35%]" :
                      "basis-full sm:basis-[45%] lg:basis-[28%]"
                    )}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      {item.imageUrl && <Image src={getAssetUrl(item.imageUrl)} alt={item.title} fill className="object-cover transition-transform duration-[1000ms] group-hover:scale-110" unoptimized={item.imageUrl.startsWith('data:')} />}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="absolute bottom-0 left-0 p-8 w-full transition-all duration-700 group-hover:translate-y-0">
                        <div className="flex justify-between items-end gap-4">
                          <div className="space-y-4 flex-1">
                            <span className="inline-block px-3 py-1.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-sm tracking-widest uppercase shadow-sm">{item.tag}</span>
                            <h3 className="text-2xl font-headline font-bold text-white leading-tight">{item.title}</h3>
                            <p className="text-white/70 text-xs line-clamp-2 leading-relaxed">{item.desc}</p>
                          </div>
                          <div className="shrink-0">
                            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-xl transition-all group-hover:scale-110 group-hover:rotate-[-45deg]">
                              <ArrowRight className="h-5 w-5" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <section id="cases" ref={sectionRef} className="relative py-32 bg-background overflow-hidden min-h-[400px]">
      {isLoading ? renderLoading() : (cases.length > 0 && isVisible ? renderContent() : <div className="h-[400px]" />)}
    </section>
  );
}
