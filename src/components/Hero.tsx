
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssetUrl } from '@/lib/image-utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import SplitText from './ui/SplitText';

interface HeroSlide {
  id: string;
  headlineZh: string;
  headlineEn: string;
  subheadlineZh: string;
  subheadlineEn: string;
  bgImage: string;
  priority?: number;
}

interface HeroProps {
  locale: Locale;
  homeConfig?: any;
  isLoading?: boolean;
  onThemeChange?: (theme: 'light' | 'dark') => void;
}

import { analyzeImageBrightness } from '@/lib/image-analysis';

import { useTranslations } from '@/hooks/use-translations';

export function Hero({ locale, homeConfig, isLoading, onThemeChange }: HeroProps) {
  const { t: tr, defaultLanguage } = useTranslations(locale);

  // 1. Prepare Slides Data
  const slides: HeroSlide[] = React.useMemo(() => {
    if (homeConfig?.heroSlides && Array.isArray(homeConfig.heroSlides) && homeConfig.heroSlides.length > 0) {
      return [...homeConfig.heroSlides].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    // Legacy Fallback
    return [{
      id: 'legacy-default',
      headlineZh: homeConfig?.heroHeadlineZh || '',
      headlineEn: homeConfig?.heroHeadlineEn || '',
      subheadlineZh: homeConfig?.heroSubheadlineZh || '',
      subheadlineEn: homeConfig?.heroSubheadlineEn || '',
      bgImage: homeConfig?.heroBgImage || "",
    }];
  }, [homeConfig, tr]);

  // 2. Carousel Setup
  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      duration: 30,
      skipSnaps: false
    },
    [
      Autoplay({ delay: 6000, stopOnInteraction: false }),
      Fade()
    ]
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');

  // Analyze brightness of the current slide
  useEffect(() => {
    if (slides.length > 0) {
      const currentSlide = slides[selectedIndex] as any;
      
      // 优先使用预计算的明暗度
      if (currentSlide.brightness !== undefined && currentSlide.brightness !== null) {
        const theme = currentSlide.brightness > 160 ? 'light' : 'dark';
        setCurrentTheme(theme);
        if (onThemeChange) onThemeChange(theme);
        return;
      }

      analyzeImageBrightness(getAssetUrl(currentSlide.bgImage)).then((brightness) => {
        const theme = brightness > 160 ? 'light' : 'dark';
        setCurrentTheme(theme);
        if (onThemeChange) onThemeChange(theme);
      });
    }
  }, [selectedIndex, slides, onThemeChange]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

  // 3. Prepare Entry Card Data
  const isKey = (s: string) => /^(HERO_|hero_|slide_|SLIDE_)/i.test(s) || s.includes('_177');

  const getFallback = (zh: string | undefined | null, en: string | undefined | null) => {
    if (locale === 'zh' && zh) return zh;
    if (locale === 'en' && en) return en;
    // Follow background default setting
    if (defaultLanguage === 'en') return en || zh || '';
    return zh || en || '';
  };

  const rawWholesaleTitle = tr('hero_wholesale_title');
  const displayWholesaleButton = (!rawWholesaleTitle || isKey(rawWholesaleTitle))
    ? getFallback(homeConfig?.heroWholesaleButtonZh, homeConfig?.heroWholesaleButtonEn)
    : rawWholesaleTitle;

  const rawWholesaleDesc = tr('hero_wholesale_desc');
  const displayWholesaleDesc = (!rawWholesaleDesc || isKey(rawWholesaleDesc))
    ? getFallback(homeConfig?.heroWholesaleDescriptionZh, homeConfig?.heroWholesaleDescriptionEn)
    : rawWholesaleDesc;

  const rawProjectTitle = tr('hero_project_title');
  const displayProjectButton = (!rawProjectTitle || isKey(rawProjectTitle))
    ? getFallback(homeConfig?.heroProjectButtonZh, homeConfig?.heroProjectButtonEn)
    : rawProjectTitle;

  const rawProjectDesc = tr('hero_project_desc');
  const displayProjectDesc = (!rawProjectDesc || isKey(rawProjectDesc))
    ? getFallback(homeConfig?.heroProjectDescriptionZh, homeConfig?.heroProjectDescriptionEn)
    : rawProjectDesc;

  const displayExploreCTA = ''; // Removed redundant global CTA

  const getEntryHref = (id: string | undefined, defaultLine: string) => {
    if (!id || id === 'none') return `/products?line=${defaultLine}`;
    if (id === 'WHOLESALE' || id === 'PROJECT') return `/products?line=${id.toLowerCase()}`;
    return `/products?category=${id}`;
  };

  const wholesaleHref = getEntryHref(homeConfig?.heroWholesaleCategoryId, 'wholesale');
  const projectHref = getEntryHref(homeConfig?.heroProjectCategoryId, 'project');

  const wholesaleBg = homeConfig?.heroWholesaleBg || "";
  const projectBg = homeConfig?.heroProjectBg || "";

  const hasWholesaleConfig = !!(homeConfig?.heroWholesaleButtonZh?.trim() || homeConfig?.heroWholesaleButtonEn?.trim());
  const hasProjectConfig = !!(homeConfig?.heroProjectButtonZh?.trim() || homeConfig?.heroProjectButtonEn?.trim());
  const showEntryCards = hasWholesaleConfig || hasProjectConfig;

  const headlineAnimateFrom = React.useMemo(() => ({ opacity: 0, y: 80, rotateX: 30 }), []);
  const headlineAnimateTo = React.useMemo(() => ({ opacity: 1, y: 0, rotateX: 0 }), []);
  const subheadlineAnimateFrom = React.useMemo(() => ({ opacity: 0, y: 20 }), []);
  const subheadlineAnimateTo = React.useMemo(() => ({ opacity: 1, y: 0 }), []);

  if (isLoading) {
    return (
      <section className="relative min-h-screen pt-20 overflow-hidden bg-background flex items-center">
        <div className="container mx-auto px-6 space-y-8 relative z-10">
          <div className="space-y-4 max-w-4xl">
            <div className="h-16 md:h-24 w-full max-w-3xl bg-white/10 rounded-2xl animate-pulse" />
            <div className="h-16 md:h-24 w-2/3 bg-white/10 rounded-2xl animate-pulse" />
            <div className="h-10 md:h-16 w-1/2 bg-white/10 rounded-xl animate-pulse mt-8" />
          </div>
          <div className="absolute bottom-10 right-6 left-6 md:left-auto md:right-6 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full md:max-w-2xl">
            <div className="h-32 md:h-40 rounded-[2.5rem] bg-white/5 animate-pulse" />
            <div className="h-32 md:h-40 rounded-[2.5rem] bg-white/5 animate-pulse" />
          </div>
        </div>
        {/* Loading Overlay Removed */}
      </section>
    );
  }

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden z-20 bg-background">
      {/* --- CAROUSEL LAYER --- */}
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {/* Slide Background */}
              <div className="absolute inset-0">
                  <Image
                    src={getAssetUrl(slide.bgImage)}
                    alt={getFallback(slide.headlineZh, slide.headlineEn)}
                    fill
                    className="object-cover object-[66%_center] md:object-center"
                    priority={index === 0 || slide.id === 'legacy-default'}
                    quality={100}
                    sizes="100vw"
                  />

                {/* Visual Enhancements Removed */}
              </div>

              {/* Slide Content */}
              <div className="max-w-[1600px] mx-auto px-6 relative z-30 h-[calc(100vh-160px)] min-h-[600px] flex items-center">
                <div className="max-w-[50rem] flex flex-col gap-4 md:gap-6 animate-fade-in text-center md:text-left mx-auto md:mx-0 mt-20 md:mt-32">
                  <SplitText
                    key={`headline-${slide.id}-${selectedIndex === index}-v1.1`}
                    text={tr(`hero_slide_${slide.id.replace(/^slide_/, '')}_headline`) || getFallback(slide.headlineZh, slide.headlineEn)}
                    className={cn(
                      "text-4xl md:text-5xl lg:text-[4rem] font-headline font-black leading-[1.1] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] gpu-accelerated overflow-visible",
                      currentTheme === 'light' ? "text-slate-900" : "text-white"
                    )}
                    tag="h1"
                    delay={40}
                    duration={0.8}
                    ease="power4.out"
                    from={headlineAnimateFrom}
                    to={headlineAnimateTo}
                    textAlign="left"
                    threshold={0.1}
                    rootMargin="0px"
                    splitType="chars"
                  />

                  <div className="relative">
                    <style dangerouslySetInnerHTML={{ __html: `
                      .hero-subheadline .split-line {
                        line-height: 1.35 !important;
                        height: auto !important;
                        padding-bottom: 0.1em;
                      }
                    `}} />
                    <SplitText
                      key={`subheadline-${slide.id}-${selectedIndex === index}-${locale}-v1.35`}
                      text={tr(`hero_slide_${slide.id.replace(/^slide_/, '')}_subheadline`) || getFallback(slide.subheadlineZh, slide.subheadlineEn)}
                      className={cn(
                        "hero-subheadline text-xl md:text-2xl lg:text-[3rem] font-body max-w-full leading-[1.35] tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.4)] block mx-auto md:mx-0 gpu-accelerated overflow-visible",
                        currentTheme === 'light' ? "text-slate-800/80" : "text-white/90"
                      )}
                      tag="h2"
                      delay={20}
                      duration={1}
                      ease="power3.out"
                      from={subheadlineAnimateFrom}
                      to={subheadlineAnimateTo}
                      textAlign="left"
                      threshold={0.1}
                      rootMargin="0px"
                      splitType="lines"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- ABSOLUTE HERO OVERLAY --- */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-full relative">

          {/* Entry Cards - Responsive & Balanced with Enhanced Hover */}
          {showEntryCards && (
            <div className={cn(
              "absolute bottom-10 md:bottom-[102px] right-0 left-0 md:left-auto md:right-0 px-6 md:px-0 w-full md:max-w-2xl pointer-events-auto transform translate-z-0 z-50",
              (hasWholesaleConfig && hasProjectConfig) 
                ? "grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8" 
                : "flex justify-end"
            )}>
              {/* Wholesale Card */}
              {hasWholesaleConfig && (
                <Link 
                  href={wholesaleHref}
                  className={cn(
                    "group relative h-32 md:h-40 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-primary/30 hover:border-primary/30 gpu-accelerated w-full",
                    (!hasProjectConfig) && "sm:max-w-[calc(50%-1rem)]"
                  )}
                >
                  <div className={cn("absolute inset-0 z-0", !wholesaleBg && "bg-primary")}>
                    {wholesaleBg ? (
                      <>
                        <Image
                          src={getAssetUrl(wholesaleBg)}
                          alt="Wholesale"
                          fill
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 group-hover:bg-primary/10 transition-colors duration-700" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/80 to-primary/60" />
                    )}
                  </div>
                  <div className="relative z-20 h-full p-6 md:p-8 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                        <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
                          {displayWholesaleButton}
                        </h3>
                        <p className="text-white/50 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                          {displayWholesaleDesc}
                        </p>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-frosted flex items-center justify-center text-white border border-white/20 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-45 shrink-0 aspect-square">
                        <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                    </div>
                  </div>
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                </Link>
              )}

              {/* Project Card */}
              {hasProjectConfig && (
                <Link 
                  href={projectHref}
                  className={cn(
                    "group relative h-32 md:h-40 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-accent/30 hover:border-accent/30 gpu-accelerated w-full",
                    (!hasWholesaleConfig) && "sm:max-w-[calc(50%-1rem)]"
                  )}
                >
                  <div className={cn("absolute inset-0 z-0", !projectBg && "bg-accent")}>
                    {projectBg ? (
                      <>
                        <Image
                          src={getAssetUrl(projectBg)}
                          alt="Projects"
                          fill
                          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                          sizes="(max-width: 768px) 100vw, 50vw"
                        />
                        <div className="absolute inset-0 group-hover:bg-accent/10 transition-colors duration-700" />
                      </>
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-accent via-accent/80 to-accent/60" />
                    )}
                  </div>
                  <div className="relative z-20 h-full p-6 md:p-8 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                        <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
                          {displayProjectButton}
                        </h3>
                        <p className="text-white/50 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                          {displayProjectDesc}
                        </p>
                      </div>
                      <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-frosted flex items-center justify-center text-white border border-white/20 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-45 shrink-0 aspect-square">
                        <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                      </div>
                    </div>
                  </div>
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                </Link>
              )}
            </div>
          )}

          {/* Minimalist Progress Indicators - Centered on Small/Tablet */}
          {slides.length > 1 && (
            <div className="absolute bottom-10 md:bottom-[102px] left-1/2 -translate-x-1/2 min-[1600px]:left-0 md:left-6 min-[1600px]:translate-x-0 flex items-center gap-3 pointer-events-auto transform translate-z-0">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className="relative h-1 w-10 md:w-16 bg-white/20 rounded-full overflow-hidden transition-all duration-300"
                >
                  {selectedIndex === index && (
                    <div 
                      key={`progress-${index}`}
                      className="absolute inset-y-0 left-0 bg-white rounded-full"
                      style={{ 
                        animation: 'hero-progress 6000ms linear forwards'
                      }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
