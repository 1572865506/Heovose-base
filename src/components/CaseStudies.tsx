
"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { ArrowRight, MoveLeft, MoveRight } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CaseStudies({ locale }: { locale: Locale }) {
  const t = translations[locale].cases;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

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
  }, []);

  useEffect(() => {
    if (!api) return;
    api.on("select", () => onSelect(api));
    onSelect(api);
  }, [api, onSelect]);

  return (
    <section id="cases" className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <SectionHeading 
            title={t.title} 
            subtitle={t.subtitle} 
            className="mb-0 max-w-xl"
          />
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-all h-12 w-12"
              onClick={() => api?.scrollPrev()}
            >
              <MoveLeft className="h-5 w-5" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/20 hover:bg-primary hover:text-white transition-all h-12 w-12"
              onClick={() => api?.scrollNext()}
            >
              <MoveRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Full width container to let cards bleed to edges */}
      <div className="relative w-full">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-4 md:-ml-8 cursor-grab active:cursor-grabbing">
            {cases.map((item, index) => {
              const imgData = PlaceHolderImages.find(img => img.id === item.id);
              const isActive = current === index;
              
              return (
                <CarouselItem 
                  key={`${item.id}-${index}`} 
                  className="pl-4 md:pl-8 basis-[85%] sm:basis-[45%] md:basis-[30%] lg:basis-[20%]"
                >
                  <div 
                    className={cn(
                      "group relative overflow-hidden rounded-2xl bg-white border border-border/20 transition-all duration-700 ease-out",
                      isActive ? "scale-110 z-10 opacity-100 shadow-2xl" : "scale-90 opacity-40 grayscale-[0.5]"
                    )}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {imgData?.imageUrl && (
                        <Image
                          src={imgData.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          data-ai-hint={imgData.imageHint}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                      
                      <div className={cn(
                        "absolute bottom-0 left-0 p-6 w-full space-y-3 transition-all duration-500",
                        isActive ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                      )}>
                        <span className="inline-block px-3 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full tracking-widest uppercase">
                          {item.tag}
                        </span>
                        <h3 className="text-xl font-headline font-bold text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/60 text-xs line-clamp-2">
                          {item.desc}
                        </p>
                        <button className="flex items-center gap-2 text-white text-xs font-bold tracking-tighter hover:text-accent transition-colors group/link mt-2">
                          {t.viewCase}
                          <ArrowRight className="h-3 w-3 group-hover/link:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Global progress indicator centered */}
      <div className="container mx-auto px-6 mt-16 flex justify-center">
        <div className="w-64 bg-muted/30 h-1 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-500 ease-out"
            style={{ width: `${((current + 1) / cases.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
