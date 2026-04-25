
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export function ProductBento({ locale }: { locale: Locale }) {
  const t = translations[locale].nav;
  const sub = translations[locale].nav_sub;

  const items = [
    { label: sub.aio, id: 'product-aio', grid: 'lg:col-span-2 lg:row-span-2', category: t.wholesale, slug: 'AIO' },
    { label: sub.minipc, id: 'product-minipc', grid: 'lg:col-span-1 lg:row-span-2', category: t.wholesale, slug: 'Mini PC' },
    { label: sub.monitor, id: 'product-monitor', grid: 'lg:col-span-1 lg:row-span-1', category: t.wholesale, slug: 'Monitor' },
    { label: sub.laptop, id: 'product-laptop', grid: 'lg:col-span-1 lg:row-span-1', category: t.wholesale, slug: 'Laptop' },
    { label: sub.conference, id: 'case-office', grid: 'lg:col-span-1 lg:row-span-2', category: t.projects, slug: 'Conference' },
    { label: sub.selfservice, id: 'product-kiosk', grid: 'lg:col-span-2 lg:row-span-2', category: t.projects, slug: 'KIOSK' },
    { label: sub.industrial, id: 'case-factory', grid: 'lg:col-span-1 lg:row-span-1', category: t.projects, slug: 'Industrial' },
    { label: sub.led, id: 'case-transport', grid: 'lg:col-span-1 lg:row-span-1', category: t.projects, slug: 'LED' },
    { label: sub.showroom, id: 'case-retail', grid: 'lg:col-span-1 lg:row-span-2', category: t.projects, slug: 'Showroom' },
    { label: sub.electromechanical, id: 'product-minipc', grid: 'lg:col-span-2 lg:row-span-2', category: t.wholesale, slug: 'Electromechanical' },
    { label: sub.components, id: 'factory-china', grid: 'lg:col-span-2 lg:row-span-1', category: t.wholesale, slug: 'Components' },
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
              <Link
                key={index}
                href={`/products?category=${encodeURIComponent(item.slug)}`}
                className={cn(
                  "group relative rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/5 transition-all duration-700 hover:shadow-2xl hover:border-primary/20",
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content Area */}
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="space-y-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <span className="inline-block px-3 py-1 glass-crystal text-accent text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-white/10">
                      {item.category}
                    </span>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
                        {item.label}
                      </h3>
                      <div className="h-10 w-10 rounded-full glass-frosted flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-500 hover:bg-primary hover:text-white hover:scale-110">
                        <ArrowUpRight className="h-5 w-5" />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
