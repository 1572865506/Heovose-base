
"use client";

import React, { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Locale } from "@/lib/translations";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAssetUrl } from '@/lib/image-utils';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Fade from 'embla-carousel-fade';
import dynamic from 'next/dynamic';
import { useLocalCollection } from '@/hooks/use-local-collection';

const SplitText = dynamic(() => import('./ui/SplitText'), { ssr: false });

const isVideoUrl = (url: string | undefined | null) => {
  if (!url) return false;
  const ext = url.split('.').pop()?.toLowerCase().split('?')[0] || '';
  return ['mp4', 'webm', 'ogg', 'mov'].includes(ext);
};

interface HeroSlide {
  id: string;
  headlineZh: string;
  headlineEn: string;
  subheadlineZh: string;
  subheadlineEn: string;
  bgImage: string;
  mobileBgImage?: string;
  linkType?: 'custom' | 'category';
  categoryId?: string | null;
  linkUrl?: string;
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
  const { data: categories } = useLocalCollection<any>('productCategories');

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
  }, [JSON.stringify(homeConfig)]);

  // 2. Carousel Setup
  const plugins = React.useMemo(() => {
    if (slides.length > 1) {
      return [
        Autoplay({ delay: 6000, stopOnInteraction: false }),
        Fade()
      ];
    }
    return [];
  }, [slides.length]);

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: slides.length > 1,
      duration: 30,
      skipSnaps: false,
      active: slides.length > 1
    },
    plugins
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('dark');
  const [allowVideo, setAllowVideo] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAllowVideo(true);
    }, 1000); // 延时 1 秒开启视频，将初始带宽全部让给网页结构和首屏大图
    return () => clearTimeout(timer);
  }, []);

  // Video autoplay controls
  const [activeDuration, setActiveDuration] = useState(6000);
  const transitionTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const slideStartTimeRef = React.useRef<number>(0);
  const videoRefs = React.useRef<Record<number, HTMLVideoElement[]>>({});

  const registerVideoRef = useCallback((index: number) => (el: HTMLVideoElement | null) => {
    if (el) {
      if (!videoRefs.current[index]) {
        videoRefs.current[index] = [];
      }
      if (!videoRefs.current[index].includes(el)) {
        videoRefs.current[index].push(el);
      }
    }
  }, []);

  const updateTransitionTimer = useCallback((durationMs: number) => {
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }
    setActiveDuration(durationMs);
    // 5-second safety buffer in case of extreme loading issues
    transitionTimeoutRef.current = setTimeout(() => {
      if (emblaApi) {
        emblaApi.scrollNext();
      }
    }, durationMs + 5000);
  }, [emblaApi]);

  const handleVideoMetadata = useCallback((index: number) => {
    if (index !== selectedIndex) return;
    const currentVideos = videoRefs.current[selectedIndex] || [];
    let detectedDuration = 0;
    for (const v of currentVideos) {
      if (v.duration && !isNaN(v.duration) && v.duration > 0) {
        detectedDuration = Math.max(detectedDuration, v.duration);
      }
    }
    if (detectedDuration > 0) {
      const durationMs = Math.max(detectedDuration * 1000, 6000);
      updateTransitionTimer(durationMs);
    }
  }, [selectedIndex, updateTransitionTimer]);

  const handleVideoEnded = useCallback((index: number) => {
    if (index !== selectedIndex) return;
    const elapsed = Date.now() - slideStartTimeRef.current;
    if (elapsed >= 6000) {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      if (emblaApi) {
        emblaApi.scrollNext();
      }
    } else {
      const remaining = 6000 - elapsed;
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      transitionTimeoutRef.current = setTimeout(() => {
        if (emblaApi) {
          emblaApi.scrollNext();
        }
      }, remaining);
    }
  }, [selectedIndex, emblaApi]);

  // Analyze brightness of the current slide
  useEffect(() => {
    if (slides.length > 0) {
      const currentSlide = slides[selectedIndex] as any;

      if (isVideoUrl(currentSlide.bgImage)) {
        setCurrentTheme('dark');
        if (onThemeChange) onThemeChange('dark');
        return;
      }

      // 优先使用预计算的明暗度
      if (currentSlide.brightness !== undefined && currentSlide.brightness !== null) {
        const theme = currentSlide.brightness > 140 ? 'light' : 'dark';
        setCurrentTheme(theme);
        if (onThemeChange) onThemeChange(theme);
        return;
      }

      analyzeImageBrightness(getAssetUrl(currentSlide.bgImage)).then((brightness) => {
        const theme = brightness > 140 ? 'light' : 'dark';
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

  useEffect(() => {
    if (!emblaApi) return;
    const autoplay = emblaApi.plugins()?.autoplay;
    const currentSlide = slides[selectedIndex];
    if (!currentSlide) return;

    const isVideo = isVideoUrl(currentSlide.bgImage) || isVideoUrl(currentSlide.mobileBgImage);

    // Pause all other videos
    Object.entries(videoRefs.current).forEach(([idx, vList]) => {
      if (Number(idx) !== selectedIndex) {
        vList.forEach(v => {
          v.pause();
          v.currentTime = 0;
        });
      }
    });

    slideStartTimeRef.current = Date.now();

    if (isVideo) {
      autoplay?.stop();

      const currentVideos = videoRefs.current[selectedIndex] || [];
      currentVideos.forEach(v => {
        // 如果视频已经在播放了，不要重复去 play() 或者重置 currentTime，防止二次闪烁/重播
        if (v.paused || v.currentTime === 0) {
          v.currentTime = 0;
          v.play().catch(() => { });
        }
      });

      let detectedDuration = 0;
      for (const v of currentVideos) {
        if (v.duration && !isNaN(v.duration) && v.duration > 0) {
          detectedDuration = Math.max(detectedDuration, v.duration);
        }
      }

      const durationMs = detectedDuration > 0 ? Math.max(detectedDuration * 1000, 6000) : 6000;
      updateTransitionTimer(durationMs);
    } else {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
      setActiveDuration(6000);
      autoplay?.play();
    }

    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, [selectedIndex, slides, emblaApi, updateTransitionTimer]);

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

  const resolveLinkUrl = useCallback((url: string | undefined | null) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      return url;
    }
    return `/${url}`;
  }, []);

  const getSlideHref = useCallback((slide: HeroSlide) => {
    if (slide.linkType === 'category') {
      if (slide.categoryId && slide.categoryId !== 'none') {
        const cat = categories?.find((c: any) => c.id === slide.categoryId);
        if (cat?.slug) {
          return `/products?category=${encodeURIComponent(cat.slug)}`;
        }
      }
      if (slide.linkUrl) {
        return resolveLinkUrl(slide.linkUrl);
      }
      if (slide.categoryId) {
        return `/products?category=${encodeURIComponent(slide.categoryId)}`;
      }
      return null;
    }

    // custom
    if (!slide.linkUrl) return null;
    return resolveLinkUrl(slide.linkUrl);
  }, [categories, resolveLinkUrl]);

  const getEntryHref = useCallback((id: string | undefined, defaultLine: string) => {
    if (!id || id === 'none') return `/products?line=${defaultLine}`;
    if (id === 'WHOLESALE' || id === 'PROJECT') return `/products?line=${id.toLowerCase()}`;
    return `/products?category=${id}`;
  }, []);

  const wholesaleHref = React.useMemo(() => {
    if (homeConfig?.heroWholesaleLinkType === 'custom') {
      return resolveLinkUrl(homeConfig?.heroWholesaleLinkUrl);
    }
    const catId = homeConfig?.heroWholesaleCategoryId;
    if (catId && catId !== 'none' && catId !== 'WHOLESALE' && catId !== 'PROJECT') {
      const cat = categories?.find((c: any) => c.id === catId);
      if (cat?.slug) {
        return `/products?category=${encodeURIComponent(cat.slug)}`;
      }
    }
    return getEntryHref(catId, 'wholesale');
  }, [homeConfig, categories, resolveLinkUrl, getEntryHref]);

  const projectHref = React.useMemo(() => {
    if (homeConfig?.heroProjectLinkType === 'custom') {
      return resolveLinkUrl(homeConfig?.heroProjectLinkUrl);
    }
    const catId = homeConfig?.heroProjectCategoryId;
    if (catId && catId !== 'none' && catId !== 'WHOLESALE' && catId !== 'PROJECT') {
      const cat = categories?.find((c: any) => c.id === catId);
      if (cat?.slug) {
        return `/products?category=${encodeURIComponent(cat.slug)}`;
      }
    }
    return getEntryHref(catId, 'project');
  }, [homeConfig, categories, resolveLinkUrl, getEntryHref]);

  const wholesaleBg = homeConfig?.heroWholesaleBg || "";
  const projectBg = homeConfig?.heroProjectBg || "";

  const hasWholesaleConfig = !!(homeConfig?.heroWholesaleButtonZh?.trim() || homeConfig?.heroWholesaleButtonEn?.trim());
  const hasProjectConfig = !!(homeConfig?.heroProjectButtonZh?.trim() || homeConfig?.heroProjectButtonEn?.trim());
  const showEntryCards = hasWholesaleConfig || hasProjectConfig;

  const headlineAnimateFrom = React.useMemo(() => ({ opacity: 0, y: 80, rotateX: 30 }), []);
  const headlineAnimateTo = React.useMemo(() => ({ opacity: 1, y: 0, rotateX: 0 }), []);
  const subheadlineAnimateFrom = React.useMemo(() => ({ opacity: 0, y: 20 }), []);
  const subheadlineAnimateTo = React.useMemo(() => ({ opacity: 1, y: 0 }), []);

  // 只有在真正没有数据 (isLoading 且 homeConfig 为空或无幻灯片) 时才展示骨架屏。
  // 如果已经有缓存的 homeConfig (例如通过 initialData 传入)，即使处于重新校验 (isLoading === true) 状态，也进行平滑渲染，从而避免二次渲染闪烁。
  const isRealLoading = isLoading && (!homeConfig || (!homeConfig.heroSlides && !homeConfig.heroHeadlineZh));

  if (isRealLoading) {
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
          {slides.map((slide, index) => {
            const slideHref = getSlideHref(slide);
            return (
              <div key={slide.id} className="relative flex-[0_0_100%] min-w-0 h-full">
                {/* Slide Background */}
                <div className="absolute inset-0">
                  {slide.mobileBgImage ? (
                    <>
                      {/* PC Poster */}
                      <div className="hidden md:block absolute inset-0">
                        {isVideoUrl(slide.bgImage) ? (
                          index === selectedIndex && allowVideo ? (
                            <video
                              ref={registerVideoRef(index)}
                              onLoadedMetadata={() => handleVideoMetadata(index)}
                              onEnded={() => handleVideoEnded(index)}
                              src={getAssetUrl(slide.bgImage)}
                              autoPlay
                              loop={false}
                              muted
                              playsInline
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-neutral-950/60" />
                          )
                        ) : (
                          <Image
                            src={getAssetUrl(slide.bgImage)}
                            alt={getFallback(slide.headlineZh, slide.headlineEn)}
                            fill
                            className="object-cover md:object-center"
                            priority={index === 0 || slide.id === 'legacy-default'}
                            quality={100}
                            sizes="100vw"
                          />
                        )}
                      </div>
                      {/* Mobile Poster */}
                      <div className="block md:hidden absolute inset-0">
                        {isVideoUrl(slide.mobileBgImage) || isVideoUrl(slide.bgImage) ? (
                          index === selectedIndex && allowVideo ? (
                            <video
                              ref={registerVideoRef(index)}
                              onLoadedMetadata={() => handleVideoMetadata(index)}
                              onEnded={() => handleVideoEnded(index)}
                              src={getAssetUrl(slide.mobileBgImage || slide.bgImage)}
                              autoPlay
                              loop={false}
                              muted
                              playsInline
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-neutral-950/60" />
                          )
                        ) : (
                          <Image
                            src={getAssetUrl(slide.mobileBgImage || slide.bgImage)}
                            alt={getFallback(slide.headlineZh, slide.headlineEn)}
                            fill
                            className="object-cover object-[66%_center]"
                            priority={index === 0 || slide.id === 'legacy-default'}
                            quality={100}
                            sizes="100vw"
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    // Default PC Poster
                    isVideoUrl(slide.bgImage) ? (
                      index === selectedIndex && allowVideo ? (
                        <video
                          ref={registerVideoRef(index)}
                          onLoadedMetadata={() => handleVideoMetadata(index)}
                          onEnded={() => handleVideoEnded(index)}
                          src={getAssetUrl(slide.bgImage)}
                          autoPlay
                          loop={false}
                          muted
                          playsInline
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-neutral-950/60" />
                      )
                    ) : (
                      <Image
                        src={getAssetUrl(slide.bgImage)}
                        alt={getFallback(slide.headlineZh, slide.headlineEn)}
                        fill
                        className="object-cover object-[66%_center] md:object-center"
                        priority={index === 0 || slide.id === 'legacy-default'}
                        quality={100}
                        sizes="100vw"
                      />
                    )
                  )}
                </div>

                {/* Clickable Overlay Link for Slide */}
                {slideHref && (
                  <Link
                    href={slideHref}
                    className="absolute inset-0 z-20 block cursor-pointer"
                    aria-label={getFallback(slide.headlineZh, slide.headlineEn)}
                  />
                )}

                {/* Slide Content */}
                <div className="max-w-[1600px] mx-auto px-6 relative z-10 pointer-events-none h-[calc(100vh-160px)] min-h-[600px] flex items-start pt-24 md:pt-0 md:items-center justify-start">
                  <div className="max-w-[50rem] flex flex-col gap-4 md:gap-6 animate-fade-in text-left mr-auto ml-0 mt-8 md:mt-32 items-start">
                    <SplitText
                      key={`headline-${slide.id}-${selectedIndex === index}-v1.1`}
                      text={tr(`hero_slide_${slide.id.replace(/^slide_/, '')}_headline`) || getFallback(slide.headlineZh, slide.headlineEn)}
                      className={cn(
                        "hero-headline text-4xl md:text-5xl lg:text-[4rem] font-headline font-black leading-[1.2] tracking-tight drop-shadow-[0_4px_30px_rgba(0,0,0,0.5)] gpu-accelerated overflow-visible",
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

                    <div className="relative w-full">
                      <style dangerouslySetInnerHTML={{
                        __html: `
                        .hero-headline {
                          line-height: 1.2 !important;
                        }
                        .hero-headline div {
                          line-height: 1.2 !important;
                          height: auto !important;
                        }
                        .hero-subheadline .split-line {
                          line-height: 1.35 !important;
                          height: auto !important;
                          padding-bottom: 0.1em;
                          justify-content: flex-start !important;
                        }
                        @keyframes arrow-slide-out-in {
                          0% {
                            transform: translate(0, 0);
                            opacity: 1;
                          }
                          8% {
                            transform: translate(160%, -160%);
                            opacity: 0;
                          }
                          9% {
                            transform: translate(-160%, 160%);
                            opacity: 0;
                          }
                          17% {
                            transform: translate(0, 0);
                            opacity: 1;
                          }
                          100% {
                            transform: translate(0, 0);
                            opacity: 1;
                          }
                        }
                        .animate-arrow-loop {
                          animation: arrow-slide-out-in 4s infinite cubic-bezier(0.25, 1, 0.5, 1);
                        }
                        .animate-arrow-loop-delay {
                          animation: arrow-slide-out-in 4s infinite cubic-bezier(0.25, 1, 0.5, 1);
                          animation-delay: 2s;
                        }
                      `}} />
                      <SplitText
                        key={`subheadline-${slide.id}-${selectedIndex === index}-${locale}-v1.35`}
                        text={tr(`hero_slide_${slide.id.replace(/^slide_/, '')}_subheadline`) || getFallback(slide.subheadlineZh, slide.subheadlineEn)}
                        className={cn(
                          "hero-subheadline text-xl md:text-2xl lg:text-[2rem] font-body max-w-full leading-[1.35] tracking-tight drop-shadow-[0_2px_15px_rgba(0,0,0,0.4)] block mr-auto ml-0 gpu-accelerated overflow-visible",
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
            );
          })}
        </div>
      </div>

      {/* --- ABSOLUTE HERO OVERLAY --- */}
      <div className="pointer-events-none absolute inset-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 absolute inset-0">

          {/* Entry Cards - Responsive & Balanced with Enhanced Hover */}
          {showEntryCards && (
            <div className={cn(
              "absolute bottom-10 md:bottom-[60px] left-1/2 -translate-x-1/2 px-4 md:px-0 w-full md:max-w-[44rem] pointer-events-auto z-50",
              (hasWholesaleConfig && hasProjectConfig)
                ? "grid grid-cols-2 gap-3 md:gap-8"
                : "flex justify-center"
            )}>
              {/* Wholesale Card */}
              {hasWholesaleConfig && (
                <Link
                  href={wholesaleHref}
                  className={cn(
                    "group relative h-24 sm:h-32 md:h-[9rem] rounded-[1.25rem] sm:rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-primary/30 hover:border-primary/30 w-full isolate",
                    (!hasProjectConfig) && "sm:max-w-[calc(50%-1rem)]"
                  )}
                  style={{ maskImage: 'radial-gradient(white, white)', WebkitMaskImage: '-webkit-radial-gradient(white, white)' }}
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
                  <div className="relative z-20 h-full p-4 sm:p-6 md:p-8 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5 sm:space-y-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                        <h3 className="text-sm xs:text-base sm:text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
                          {displayWholesaleButton}
                        </h3>
                        <p className="text-white/50 text-[6px] xs:text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                          {displayWholesaleDesc}
                        </p>
                      </div>
                      <div
                        className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full glass-frosted flex items-center justify-center text-slate-900 border border-white/20 group-hover:bg-white group-hover:text-black group-hover:border-transparent transition-all duration-500 shadow-xl group-hover:rotate-45 shrink-0 aspect-square overflow-hidden"
                        style={{
                          zoom: 0.9,
                          // 通过 CSS 变量或在 hover 状态下重置以防 zoom 不支持 transition，这里结合 zoom 的清晰度与过渡效果
                          transform: 'scale(var(--btn-scale, 1))',
                        }}
                      >
                        <style dangerouslySetInnerHTML={{
                          __html: `
                          .group:hover .glass-frosted {
                            --btn-scale: 1.1111; /* 1 / 0.9 ≈ 1.1111，使其刚好缩放回 100% (0.9 * 1.1111 = 1) */
                          }
                        `}} />
                        <ArrowUpRight className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-arrow-loop" />
                      </div>
                    </div>
                  </div>
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-10" />
                </Link>
              )}

              {/* Project Card */}
              {hasProjectConfig && (
                <Link
                  href={projectHref}
                  className={cn(
                    "group relative h-24 sm:h-32 md:h-[9rem] rounded-[1.25rem] sm:rounded-[2rem] md:rounded-[2.5rem] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer overflow-hidden shadow-2xl border border-white/10 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-primary/30 hover:border-primary/30 w-full isolate",
                    (!hasWholesaleConfig) && "sm:max-w-[calc(50%-1rem)]"
                  )}
                  style={{ maskImage: 'radial-gradient(white, white)', WebkitMaskImage: '-webkit-radial-gradient(white, white)' }}
                >
                  <div className={cn("absolute inset-0 z-0", !projectBg && "bg-primary")}>
                    {projectBg ? (
                      <>
                        <Image
                          src={getAssetUrl(projectBg)}
                          alt="Projects"
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
                  <div className="relative z-20 h-full p-4 sm:p-6 md:p-8 flex flex-col justify-end">
                    <div className="flex items-end justify-between">
                      <div className="space-y-0.5 sm:space-y-1 transform transition-transform duration-500 group-hover:-translate-y-1">
                        <h3 className="text-sm xs:text-base sm:text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
                          {displayProjectButton}
                        </h3>
                        <p className="text-white/50 text-[6px] xs:text-[8px] md:text-[10px] uppercase tracking-[0.2em] font-bold group-hover:text-white transition-colors">
                          {displayProjectDesc}
                        </p>
                      </div>
                      <div
                        className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full glass-frosted flex items-center justify-center text-slate-900 border border-white/20 group-hover:bg-white group-hover:text-black group-hover:border-transparent transition-all duration-500 shadow-xl group-hover:rotate-45 shrink-0 aspect-square overflow-hidden"
                        style={{
                          zoom: 0.9,
                          transform: 'scale(var(--btn-scale, 1))',
                        }}
                      >
                        <ArrowUpRight className="h-3.5 w-3.5 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 animate-arrow-loop-delay" />
                      </div>
                    </div>
                  </div>
                  {/* Shine Effect on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] pointer-events-none z-10" />
                </Link>
              )}
            </div>
          )}

          {/* Minimalist Progress Indicators - Positioned Horizontally Centered Below Entry Cards */}
          {slides.length > 1 && (
            <div className="absolute bottom-[12px] md:bottom-[20px] left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-auto transform translate-z-0 z-50">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => emblaApi?.scrollTo(index)}
                  className="relative h-1 w-6 md:w-16 bg-white/20 rounded-full overflow-hidden transition-all duration-300"
                >
                  {selectedIndex === index && (
                    <div
                      key={`progress-${index}-${activeDuration}`}
                      className="absolute inset-y-0 left-0 right-0 bg-white rounded-full origin-left"
                      style={{
                        animation: `hero-progress-gpu ${activeDuration}ms linear forwards`
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
