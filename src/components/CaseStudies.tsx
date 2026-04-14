
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

  // 计算卡片样式：实现五级阶梯效果
  const getCardStyle = (index: number) => {
    const total = cases.length;
    let diff = Math.abs(index - current);
    if (diff > total / 2) diff = total - diff;

    if (diff === 0) return "scale-110 z-30 opacity-100 shadow-[0_30px_60px_rgba(0,0,0,0.4)]"; // 中心大
    if (diff === 1) return "scale-95 z-20 opacity-60 grayscale-[0.4]"; // 两侧中
    return "scale-85 z-10 opacity-30 grayscale-[0.8]"; // 边缘小
  };

  return (
    <section id="cases" className="py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6 mb-16">
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

      <div className="relative w-full px-0">
        <Carousel
          setApi={setApi}
          opts={{
            align: "center",
            loop: true,
          }}
          className="w-full"
        >
          {/* 增加 -ml-8 为桌面端预留间距 */}
          <CarouselContent 
            className="-ml-4 md:-ml-8 cursor-grab active:cursor-grabbing" 
            viewportClassName="py-24 -my-24 overflow-visible"
          >
            {cases.map((item, index) => {
              const imgData = PlaceHolderImages.find(img => img.id === item.id);
              const isActive = current === index;
              
              return (
                <CarouselItem 
                  key={`${item.id}-${index}`} 
                  // 增加 pl-8 并微调 basis 比例，确保 5 张卡片有呼吸空间
                  className="pl-4 md:pl-8 basis-[75%] sm:basis-[45%] md:basis-[22%]"
                >
                  <div 
                    className={cn(
                      "group relative overflow-hidden rounded-xl bg-white transition-all duration-700 ease-out cursor-pointer",
                      "hover:-translate-y-4 hover:shadow-[0_20px_50px_rgba(0,91,153,0.3)]",
                      getCardStyle(index)
                    )}
                  >
                    <div className="relative aspect-[3/4.5] overflow-hidden">
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
                        <p className="text-white/70 text-sm line-clamp-3 leading-relaxed">
                          {item.desc}
                        </p>
                        <button className="flex items-center gap-2 text-accent text-xs font-bold tracking-tighter group/link mt-4">
                          {t.viewCase}
                          <ArrowRight className="h-4 w-4 group-hover/link:translate-x-2 transition-transform" />
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

      <div className="container mx-auto px-6 mt-20 flex justify-center">
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
