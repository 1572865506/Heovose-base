
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
}

import { useTranslations } from '@/hooks/use-translations';

export function Hero({ locale, homeConfig }: HeroProps) {
  const { t: tr } = useTranslations(locale);

  // 1. Prepare Slides Data
  const slides: HeroSlide[] = React.useMemo(() => {
    if (homeConfig?.heroSlides && Array.isArray(homeConfig.heroSlides) && homeConfig.heroSlides.length > 0) {
      return [...homeConfig.heroSlides].sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }

    // Legacy Fallback
    return [{
      id: 'legacy-default',
      headlineZh: homeConfig?.heroHeadlineZh || tr('hero_headline'),
      headlineEn: homeConfig?.heroHeadlineEn || tr('hero_headline'),
      subheadlineZh: homeConfig?.heroSubheadlineZh || tr('hero_subheadline'),
      subheadlineEn: homeConfig?.heroSubheadlineEn || tr('hero_subheadline'),
      bgImage: "/image/hero-bg.png",
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

  // 3. Entry Cards Config
  const displayWholesaleButton = locale === 'zh'
    ? (homeConfig?.heroWholesaleButtonZh || tr('hero_wholesale'))
    : (homeConfig?.heroWholesaleButtonEn || tr('hero_wholesale'));

  const displayProjectButton = locale === 'zh'
    ? (homeConfig?.heroProjectButtonZh || tr('hero_project'))
    : (homeConfig?.heroProjectButtonEn || tr('hero_project'));

  const wholesaleHref = homeConfig?.heroWholesaleCategoryId && homeConfig.heroWholesaleCategoryId !== 'none'
    ? `/products?category=${homeConfig.heroWholesaleCategoryId}`
    : "/products";

  const projectHref = homeConfig?.heroProjectCategoryId && homeConfig.heroProjectCategoryId !== 'none'
    ? `/products?category=${homeConfig.heroProjectCategoryId}`
    : "/products?category=Industrial";

  const wholesaleBg = homeConfig?.entryCards?.wholesaleBg || "/image/Wholesale Product.png";
  const projectBg = homeConfig?.entryCards?.projectBg || "/image/Project Product-2.png";

  const headlineAnimateFrom = React.useMemo(() => ({ opacity: 0, y: 80, rotateX: 30 }), []);
  const headlineAnimateTo = React.useMemo(() => ({ opacity: 1, y: 0, rotateX: 0 }), []);
  const subheadlineAnimateFrom = React.useMemo(() => ({ opacity: 0, y: 20 }), []);
  const subheadlineAnimateTo = React.useMemo(() => ({ opacity: 1, y: 0 }), []);

  return (
    <section className="relative min-h-screen pt-20 overflow-hidden z-20 bg-black">
      {/* --- CAROUSEL LAYER --- */}
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
              {/* Slide Background */}
              <div className="absolute inset-0">
                  <Image
                    src={slide.bgImage}
                    alt={locale === 'zh' ? slide.headlineZh : slide.headlineEn}
                    fill
                    className="object-cover"
                    priority={index === 0 || slide.id === 'legacy-default'}
                    sizes="100vw"
                  />

                {/* Visual Enhancements */}
                <div className="absolute inset-0 z-10 backdrop-blur-3xl [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_50%)] opacity-60 lg:opacity-100" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-20" />
              </div>

              {/* Slide Content */}
              <div className="container mx-auto px-6 relative z-30 h-[calc(100vh-160px)] min-h-[600px] flex items-center">
                <div className="max-w-4xl space-y-6 animate-fade-in text-center md:text-left mx-auto md:mx-0">
                  <div className="relative inline-block w-full">
                    {/* Soft Overlay / Contrast Protection */}
                    <div className="absolute -inset-x-6 -inset-y-3 bg-black/10 backdrop-blur-[2px] rounded-[2rem] -z-10 hidden md:block" />

                    <SplitText
                      key={`headline-${slide.id}-${selectedIndex === index}`}
                      text={locale === 'zh' ? slide.headlineZh : slide.headlineEn}
                      className="text-4xl md:text-7xl lg:text-[120px] font-headline font-bold text-white leading-[0.9] tracking-[-0.05em] uppercase drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] gpu-accelerated"
                      tag="h1"
                      delay={40}
                      duration={0.8}
                      ease="power4.out"
                      from={headlineAnimateFrom}
                      to={headlineAnimateTo}
                      textAlign="center"
                      threshold={0.1}
                      rootMargin="0px"
                    />
                  </div>

                  <div className="block w-full">
                    <SplitText
                      key={`subheadline-${slide.id}-${selectedIndex === index}`}
                      text={locale === 'zh' ? slide.subheadlineZh : slide.subheadlineEn}
                      className="text-base md:text-xl lg:text-3xl text-white/90 font-body max-w-2xl leading-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.4)] block mx-auto md:mx-0 gpu-accelerated"
                      tag="h2"
                      delay={20}
                      duration={1}
                      ease="power3.out"
                      from={subheadlineAnimateFrom}
                      to={subheadlineAnimateTo}
                      textAlign="center"
                      threshold={0.1}
                      rootMargin="0px"
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
        <div className="container mx-auto px-6 h-full relative">

          {/* Entry Cards - Responsive & Balanced with Enhanced Hover */}
          <div className="absolute bottom-10 md:bottom-[102px] right-0 left-0 md:left-auto md:right-0 px-6 md:px-0 w-full md:max-w-2xl pointer-events-auto transform translate-z-0 z-50">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8 w-full">
              {/* Wholesale Card */}
              <Link 
                href={wholesaleHref}
                className="group relative h-32 md:h-40 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-primary/30 hover:border-primary/30 gpu-accelerated"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={wholesaleBg}
                    alt="Wholesale"
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-primary/20 transition-colors duration-700" />
                </div>
                <div className="relative z-20 h-full p-6 md:p-8 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                      <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight group-hover:text-primary-foreground transition-colors">
                        {displayWholesaleButton}
                      </h3>
                      <p className="text-white/50 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                        Standard Wholesale
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-frosted flex items-center justify-center text-white border border-white/20 group-hover:bg-primary group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  </div>
                </div>
                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              </Link>

              {/* Project Card */}
              <Link 
                href={projectHref}
                className="group relative h-32 md:h-40 rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-accent/30 hover:border-accent/30 gpu-accelerated"
              >
                <div className="absolute inset-0 z-0">
                  <Image
                    src={projectBg}
                    alt="Projects"
                    fill
                    className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-black/60 group-hover:bg-accent/20 transition-colors duration-700" />
                </div>
                <div className="relative z-20 h-full p-6 md:p-8 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                      <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight group-hover:text-accent-foreground transition-colors">
                        {displayProjectButton}
                      </h3>
                      <p className="text-white/50 text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                        Custom Projects
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full glass-frosted flex items-center justify-center text-white border border-white/20 group-hover:bg-accent group-hover:text-white group-hover:border-transparent transition-all duration-500 shadow-xl group-hover:scale-110 group-hover:rotate-45">
                      <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  </div>
                </div>
                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              </Link>
            </div>
          </div>

          {/* Minimalist Progress Indicators - Centered on Small/Tablet */}
          {slides.length > 1 && (
            <div className="absolute bottom-10 md:bottom-[102px] left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 flex items-center gap-3 pointer-events-auto transform translate-z-0">
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

      <style jsx global>{`
        @keyframes hero-progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </section>
  );
}
