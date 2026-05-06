
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
import { useLocalDoc } from '@/hooks/use-local-doc';

import { useTranslations } from '@/hooks/use-translations';

export function ProductBento({ locale }: { locale: Locale }) {
  const { t: tr } = useTranslations(locale);
  const { data: bentoConfig } = useLocalDoc<any>('homepageContent', 'bento');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');

  // Fetch independent bento items
  const { data: bentoItems, isLoading } = useLocalCollection<any>('bentoItems');


  const items = useMemo(() => {
    if (bentoItems && bentoItems.length > 0) {
      return bentoItems.map((item: any) => {
        let grid = 'lg:col-span-1 lg:row-span-1';
        if (item.gridSize === 'wide') grid = 'lg:col-span-2 lg:row-span-1';
        if (item.gridSize === 'tall') grid = 'lg:col-span-1 lg:row-span-2';
        if (item.gridSize === 'large') grid = 'lg:col-span-2 lg:row-span-2';

        // Dynamic helper to get localized field with fallback respecting settings
        const getLocalized = (prefix: string) => {
          const defaultLang = langSettings?.defaultLanguage || 'en';
          const allLocales: Locale[] = ['en', 'zh', 'id', 'vi'];
          
          const getVal = (l: string) => {
            const suffix = l.charAt(0).toUpperCase() + l.slice(1);
            return item[`${prefix}${suffix}`];
          };

          // 1. Current Locale
          const currentVal = getVal(locale);
          if (currentVal) return currentVal;
          
          // 2. Global Default Locale
          const defaultVal = getVal(defaultLang);
          if (defaultVal) return defaultVal;
          
          // 3. Any other available locale
          for (const l of allLocales) {
            if (l === locale || l === defaultLang) continue;
            const val = getVal(l);
            if (val) return val;
          }
          return '';
        };

        return {
          id: item.id,
          label: getLocalized('title'),
          category: getLocalized('tag'),
          slug: item.linkUrl || '#',
          imageUrl: item.imageUrl || PlaceHolderImages[0].imageUrl,
          grid
        };
      });
    }

    // Static fallback if no items in DB yet
    return [
      { label: tr('nav_sub_aio'), id: 'product-aio', grid: 'lg:col-span-2 lg:row-span-2', category: tr('nav_wholesale'), slug: `/${locale}/products?category=AIO`, imageUrl: PlaceHolderImages[0].imageUrl },
      { label: tr('nav_sub_minipc'), id: 'product-minipc', grid: 'lg:col-span-1 lg:row-span-2', category: tr('nav_wholesale'), slug: `/${locale}/products?category=Mini%20PC`, imageUrl: PlaceHolderImages[1].imageUrl },
      { label: tr('nav_sub_monitor'), id: 'product-monitor', grid: 'lg:col-span-1 lg:row-span-1', category: tr('nav_wholesale'), slug: `/${locale}/products?category=Monitor`, imageUrl: PlaceHolderImages[2].imageUrl },
      { label: tr('nav_sub_laptop'), id: 'product-laptop', grid: 'lg:col-span-1 lg:row-span-1', category: tr('nav_wholesale'), slug: `/${locale}/products?category=Laptop`, imageUrl: PlaceHolderImages[3].imageUrl },
    ];
  }, [bentoItems, locale, tr, langSettings]);

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
          title={
            locale === 'zh' 
              ? bentoConfig?.bentoTitleZh || tr('products_title')
              : bentoConfig?.bentoTitleEn || tr('products_title')
          } 
          subtitle={
            locale === 'zh' 
              ? bentoConfig?.bentoSubtitleZh || tr('products_subtitle')
              : bentoConfig?.bentoSubtitleEn || tr('products_subtitle')
          }
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
                  href={item.slug.startsWith('http') ? item.slug : (item.slug.startsWith('/') ? item.slug : `/${locale}/${item.slug}`)}
                  className={cn(
                    "group relative rounded-[2.5rem] overflow-hidden border border-border/40 bg-muted/5 transition-all duration-700 transform-gpu translate-z-0",
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
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  )}
                  
                  {/* Bottom Premium Neutral-Frosted Gradient Overlay - 40px Vibrancy */}
                  <div className={cn(
                    "absolute inset-x-0 bottom-0 bg-white/10 backdrop-blur-[40px] [mask-image:linear-gradient(to_top,black,transparent)] pointer-events-none transition-all duration-500 will-change-[backdrop-filter] transform-gpu translate-z-0",
                    item.category ? "h-[38%]" : "h-[25%]"
                  )} />

                  {/* Content Area - Minimal Style */}
                  <div className="absolute inset-0 p-5 pb-5 flex flex-col justify-end transition-transform duration-500 group-hover:-translate-y-1">
                    <div className="space-y-3">
                      {item.category && (
                        <span className="inline-block px-3 py-1 bg-white/80 backdrop-blur-md text-slate-800 text-[10px] font-bold tracking-[0.2em] uppercase rounded-full border border-slate-200/50 shadow-sm">
                          {item.category}
                        </span>
                      )}
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-xl md:text-2xl font-headline font-bold text-black leading-tight tracking-tight">
                          {item.label}
                        </h3>
                        <div className="h-10 w-10 aspect-square rounded-full bg-[#DADADA]/50 backdrop-blur-sm flex items-center justify-center text-black opacity-0 group-hover:opacity-100 transition-all duration-500 hover:scale-110">
                          <ArrowUpRight className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                </Link>
              );
            })
          )}
        </div>
      </div>
    </section>

  );
}
