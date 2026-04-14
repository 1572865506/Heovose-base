
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

  const getCardStyle = (index: number) => {
    const total = cases.length;
    let diff = Math.abs(index - current);
    
    if (diff > total / 2) {
      diff = total - diff;
    }

    if (diff === 0) {
      // Center: Large
      return "scale-105 z-30 opacity-100 shadow-[0_40px_80px_rgba(0,0,0,0.35)]";
    }
    if (diff === 1) {
      // Adjacent: Medium
      return "scale-92 z-20 opacity-80";
    }
    // Outer: Small
    return "scale-82 z-10 opacity-60";
  };

  return (
    <section id="cases" className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 mb-16 relative z-50">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8">
          <SectionHeading 
            title={t.title} 
            subtitle={t.subtitle} 
            className="mb-0 max-w-xl"
          />
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/20 bg-white hover:bg-primary hover:text-white transition-all h-14 w-14 shadow-lg active:scale-95"
              onClick={() => api?.scrollPrev()}
            >
              <MoveLeft className="h-6 w-6" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-primary/20 bg-white hover:bg-primary hover:text-white transition-all h-14 w-14 shadow-lg active:scale-95"
              onClick={() => api?.scrollNext()}
            >
              <MoveRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative w-full">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent 
            className="-ml-2 md:-ml-4 cursor-grab active:cursor-grabbing" 
            viewportClassName="py-32 -my-32 overflow-visible"
          >
            {cases.map((item, index) => {
              const imgData = PlaceHolderImages.find(img => img.id === item.id);
              const isActive = current === index;
              
              return (
                <CarouselItem 
                  key={`${item.id}-${index}`} 
                  className="pl-2 md:pl-4 basis-[85%] sm:basis-[50%] md:basis-[22%]"
                >
                  <div 
                    onClick={() => api?.scrollTo(index)}
                    className={cn(
                      "group relative overflow-hidden rounded-2xl bg-white transition-all duration-700 ease-out cursor-pointer",
                      "hover:-translate-y-4 hover:shadow-[0_30px_60px_rgba(0,91,153,0.2)]",
                      getCardStyle(index)
                    )}
                  >
                    <div className="relative aspect-[9/11] overflow-hidden">
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
                        "absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-500",
                        isActive ? "opacity-100" : "opacity-40"
                      )} />
                      
                      <div className={cn(
                        "absolute bottom-0 left-0 p-8 w-full space-y-4 transition-all duration-700",
                        isActive ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                      )}>
                        <span className="inline-block px-3 py-1 bg-accent text-accent-foreground text-[10px] font-bold rounded-sm tracking-widest uppercase">
                          {item.tag}
                        </span>
                        <h3 className="text-2xl font-headline font-bold text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
                          {item.desc}
                        </p>
                        
                        <div className="flex pt-4">
                          <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-accent-foreground group/link hover:bg-white hover:scale-110 transition-all duration-300">
                            <ArrowRight className="h-5 w-5 group-hover/link:translate-x-1 transition-transform" />
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

      <div className="container mx-auto px-6 mt-12 flex justify-center">
        <div className="w-64 bg-muted/30 h-1.5 rounded-full overflow-hidden">
          <div 
            className="bg-primary h-full transition-all duration-700 ease-out"
            style={{ width: `${((current + 1) / cases.length) * 100}%` }}
          />
        </div>
      </div>
    </section>
  );
}
