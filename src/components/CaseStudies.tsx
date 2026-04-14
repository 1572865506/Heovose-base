
"use client";

import { useState, useEffect } from 'react';
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

export function CaseStudies({ locale }: { locale: Locale }) {
  const t = translations[locale].cases;
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const cases = [
    { id: 'case-retail', tag: t.tags.retail, title: t.retail.title, desc: t.retail.desc },
    { id: 'case-factory', tag: t.tags.industry, title: t.industry.title, desc: t.industry.desc },
    { id: 'case-office', tag: t.tags.office, title: t.office.title, desc: t.office.desc },
    { id: 'case-transport', tag: t.tags.transport, title: t.transport.title, desc: t.transport.desc },
  ];

  useEffect(() => {
    if (!api) return;
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  return (
    <section id="cases" className="py-32 bg-background">
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

      <div className="px-6 md:px-12 lg:px-24">
        <Carousel
          setApi={setApi}
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-8">
            {cases.map((item) => {
              const imgData = PlaceHolderImages.find(img => img.id === item.id);
              return (
                <CarouselItem key={item.id} className="pl-8 md:basis-1/2 lg:basis-2/3 xl:basis-1/2">
                  <div className="group relative overflow-hidden rounded-[3rem] bg-white border border-border/20">
                    <div className="relative aspect-[16/10] overflow-hidden">
                      {imgData?.imageUrl && (
                        <Image
                          src={imgData.imageUrl}
                          alt={item.title}
                          fill
                          className="object-cover transition-transform duration-1000 group-hover:scale-110"
                          data-ai-hint={imgData.imageHint}
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                      
                      <div className="absolute bottom-0 left-0 p-8 md:p-12 w-full space-y-4">
                        <span className="inline-block px-4 py-1 bg-accent text-accent-foreground text-xs font-bold rounded-full tracking-widest">
                          {item.tag}
                        </span>
                        <h3 className="text-3xl md:text-4xl font-headline font-bold text-white leading-tight">
                          {item.title}
                        </h3>
                        <p className="text-white/70 text-lg max-w-lg">
                          {item.desc}
                        </p>
                        <button className="flex items-center gap-3 text-white font-bold tracking-tighter hover:text-accent transition-colors group/link mt-4">
                          {t.viewCase}
                          <ArrowRight className="h-5 w-5 group-hover/link:translate-x-2 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>

        <div className="container mx-auto px-6 mt-16">
          <div className="w-full bg-muted/30 h-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 ease-out"
              style={{ width: `${((current + 1) / count) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
