
"use client";

import { useMemo, useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";
import { useLocalCollection } from '@/hooks/use-local-collection';

import { useTranslations } from '@/hooks/use-translations';

export function ProductBento({ locale }: { locale: Locale }) {
  const { t: tr } = useTranslations(locale);

  // Fetch dynamic categories
  const { data: remoteCats, isLoading } = useLocalCollection<any>('productCategories');
  const { data: allTranslations } = useLocalCollection<any>('localizedStrings');

  const getT = (id: string) => {
    const entry = allTranslations?.find((item: any) => item.id === id);
    if (!entry) return id;
    return entry[locale] || entry['en'] || entry['zh'] || id;
  };

  const items = useMemo(() => {
    if (remoteCats && remoteCats.length > 0) {
      // Map remote categories to bento layout
      const layouts = [
        'lg:col-span-2 lg:row-span-2',
        'lg:col-span-1 lg:row-span-2',
        'lg:col-span-1 lg:row-span-1',
        'lg:col-span-1 lg:row-span-1',
        'lg:col-span-1 lg:row-span-2',
        'lg:col-span-2 lg:row-span-2',
        'lg:col-span-1 lg:row-span-1',
        'lg:col-span-1 lg:row-span-1',
        'lg:col-span-1 lg:row-span-2',
        'lg:col-span-2 lg:row-span-2',
        'lg:col-span-2 lg:row-span-1',
      ];

      return remoteCats.slice(0, layouts.length).map((cat: any, index: number) => ({
        label: getT(cat.nameTextId),
        id: cat.id,
        grid: layouts[index % layouts.length],
        category: cat.parentId === 'PROJECT' ? tr('nav_projects') : tr('nav_wholesale'),
        slug: cat.slug || cat.id,
        imageUrl: cat.thumbnailImageUrl || cat.imageUrl || PlaceHolderImages[index % PlaceHolderImages.length].imageUrl
      }));
    }

    // Static fallback if no categories yet
    return [
      { label: tr('nav_sub_aio'), id: 'product-aio', grid: 'lg:col-span-2 lg:row-span-2', category: tr('nav_wholesale'), slug: 'AIO' },
      { label: tr('nav_sub_minipc'), id: 'product-minipc', grid: 'lg:col-span-1 lg:row-span-2', category: tr('nav_wholesale'), slug: 'Mini PC' },
      { label: tr('nav_sub_monitor'), id: 'product-monitor', grid: 'lg:col-span-1 lg:row-span-1', category: tr('nav_wholesale'), slug: 'Monitor' },
      { label: tr('nav_sub_laptop'), id: 'product-laptop', grid: 'lg:col-span-1 lg:row-span-1', category: tr('nav_wholesale'), slug: 'Laptop' },
      { label: tr('nav_sub_conference'), id: 'case-office', grid: 'lg:col-span-1 lg:row-span-2', category: tr('nav_projects'), slug: 'Conference' },
      { label: tr('nav_sub_selfservice'), id: 'product-kiosk', grid: 'lg:col-span-2 lg:row-span-2', category: tr('nav_projects'), slug: 'KIOSK' },
      { label: tr('nav_sub_industrial'), id: 'case-factory', grid: 'lg:col-span-1 lg:row-span-1', category: tr('nav_projects'), slug: 'Industrial' },
      { label: tr('nav_sub_led'), id: 'case-transport', grid: 'lg:col-span-1 lg:row-span-1', category: tr('nav_projects'), slug: 'LED' },
      { label: tr('nav_sub_showroom'), id: 'case-retail', grid: 'lg:col-span-1 lg:row-span-2', category: tr('nav_projects'), slug: 'Showroom' },
      { label: tr('nav_sub_electromechanical'), id: 'product-minipc', grid: 'lg:col-span-2 lg:row-span-2', category: tr('nav_wholesale'), slug: 'Electromechanical' },
      { label: tr('nav_sub_components'), id: 'factory-china', grid: 'lg:col-span-2 lg:row-span-1', category: tr('nav_wholesale'), slug: 'Components' },
    ];
  }, [remoteCats, allTranslations, locale, tr]);

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

  return (
    <section 
      id="portfolio" 
      ref={sectionRef}
      className="py-24 bg-background overflow-hidden"
    >
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={tr('products_title')} 
          subtitle={tr('products_subtitle')}
        />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 auto-rows-[180px] lg:auto-rows-[220px]">
          {isLoading ? (
            // Skeleton Loader
            Array.from({ length: 6 }).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "relative rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/20 animate-pulse",
                  i === 0 ? "lg:col-span-2 lg:row-span-2" : 
                  i === 1 ? "lg:col-span-1 lg:row-span-2" :
                  "lg:col-span-1 lg:row-span-1"
                )}
              >
                <div className="absolute inset-0 p-8 flex flex-col justify-end gap-3">
                  <div className="h-4 w-20 bg-muted rounded-full" />
                  <div className="h-6 w-32 bg-muted rounded-md" />
                </div>
              </div>
            ))
          ) : (
            items.map((item, index) => {
              return (
                <Link
                  key={index}
                  href={`/products?category=${encodeURIComponent(item.slug)}`}
                  className={cn(
                    "group relative rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/5 transition-all duration-700 hover:shadow-2xl hover:border-primary/20",
                    "opacity-0 translate-y-12",
                    isVisible && "opacity-100 translate-y-0",
                    item.grid
                  )}
                  style={{ 
                    transitionDelay: isVisible ? `${index * 50}ms` : '0ms'
                  }}
                >
                  {item.imageUrl && (
                    <Image
                      src={item.imageUrl}
                      alt={item.label}
                      fill
                      className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            })
          )}
        </div>
      </div>
    </section>

  );
}
