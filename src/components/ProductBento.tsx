
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function ProductBento({ locale }: { locale: Locale }) {
  const t = translations[locale].nav;
  const sub = translations[locale].nav_sub;

  const items = [
    { label: sub.aio, id: 'product-aio', grid: 'lg:col-span-2 lg:row-span-2', category: t.wholesale },
    { label: sub.minipc, id: 'product-minipc', grid: 'lg:col-span-1 lg:row-span-2', category: t.wholesale },
    { label: sub.monitor, id: 'product-monitor', grid: 'lg:col-span-1 lg:row-span-1', category: t.wholesale },
    { label: sub.laptop, id: 'product-laptop', grid: 'lg:col-span-1 lg:row-span-1', category: t.wholesale },
    { label: sub.conference, id: 'case-office', grid: 'lg:col-span-1 lg:row-span-2', category: t.projects },
    { label: sub.selfservice, id: 'product-kiosk', grid: 'lg:col-span-2 lg:row-span-2', category: t.projects },
    { label: sub.industrial, id: 'case-factory', grid: 'lg:col-span-1 lg:row-span-1', category: t.projects },
    { label: sub.led, id: 'case-transport', grid: 'lg:col-span-1 lg:row-span-1', category: t.projects },
    { label: sub.showroom, id: 'case-retail', grid: 'lg:col-span-1 lg:row-span-2', category: t.projects },
    { label: sub.electromechanical, id: 'product-minipc', grid: 'lg:col-span-2 lg:row-span-2', category: t.wholesale },
    { label: sub.components, id: 'factory-china', grid: 'lg:col-span-2 lg:row-span-1', category: t.wholesale },
  ];

  return (
    <section id="portfolio" className="py-24 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={translations[locale].products.title} 
          subtitle={translations[locale].products.subtitle}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
          {items.map((item, index) => {
            const imgData = PlaceHolderImages.find(img => img.id === item.id);
            return (
              <div
                key={index}
                className={cn(
                  "group relative rounded-[2rem] overflow-hidden border border-border/40 bg-muted/20 transition-all duration-700 hover:shadow-2xl hover:border-primary/20",
                  item.grid
                )}
              >
                {imgData?.imageUrl && (
                  <Image
                    src={imgData.imageUrl}
                    alt={item.label}
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                    data-ai-hint={imgData.imageHint}
                  />
                )}
                
                {/* Overlay with glass effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content Area */}
                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                  <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-2 py-0.5 bg-accent/20 backdrop-blur-md text-accent text-[9px] font-bold tracking-widest uppercase rounded-sm border border-accent/20">
                      {item.category}
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-headline font-bold text-white leading-tight">
                        {item.label}
                      </h3>
                      <div className="h-8 w-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-accent hover:text-accent-foreground">
                        <ArrowUpRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
