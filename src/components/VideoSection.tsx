
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Locale } from "@/lib/translations";
import { getAssetUrl } from '@/lib/image-utils';
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useTranslations } from '@/hooks/use-translations';

interface VideoSectionProps {
  locale: Locale;
  homeConfig?: any;
  isLoading?: boolean;
}

export function VideoSection({ locale, homeConfig, isLoading }: VideoSectionProps) {
  const { t: tr, defaultLanguage } = useTranslations(locale);
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [textProgress, setTextProgress] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(true);

  const [videoUrl, setVideoUrl] = useState<string>("");
  const stickyRef = useRef<HTMLDivElement>(null);

  // Helper to check if a returned string is just a system key
  const isKey = (s: string) => /^(VIDEO_|video_|SECTION_)/i.test(s) || s.includes('_177');

  // Unified fallback logic
  const getFallback = (zh: string | undefined | null, en: string | undefined | null) => {
    if (locale === 'zh' && zh) return zh;
    if (locale === 'en' && en) return en;
    if (defaultLanguage === 'en') return en || zh || '';
    return zh || en || '';
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // 进入视野：开始加载并播放
          if (!videoUrl) {
            console.log("[Video] Sticky container entering view, injecting URL...");
            setVideoUrl(getAssetUrl(homeConfig?.videoUrl || "/video/alibaba2023_x264.mp4"));
          }
          if (videoRef.current && isPlaying) {
            videoRef.current.play().catch(() => {});
          }
        } else {
          // 离开视野：立即暂停节省性能
          if (videoRef.current) {
            console.log("[Video] Sticky container leaving view, pausing...");
            videoRef.current.pause();
          }
        }
      },
      { threshold: 0.01 } // 只要露头就加载，完全消失就暂停
    );

    if (stickyRef.current) observer.observe(stickyRef.current);
    return () => observer.disconnect();
  }, [videoUrl, homeConfig, isPlaying]);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollY = -rect.top;
      const sectionHeight = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrollY / sectionHeight));
      setTextProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  // 针对第一次加载地址后的自动播放补丁
  useEffect(() => {
    if (videoUrl && videoRef.current && isPlaying) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl]);

  if (isLoading) {
    return (
      <section className="relative h-[100vh] z-10 bg-black flex items-center justify-center">
        <div className="h-20 md:h-40 w-3/4 bg-white/10 rounded-2xl animate-pulse" />
      </section>
    );
  }

  // 动态文案回退逻辑
  const rawTitle = tr('video_section_title');
  const displayTitle = (!rawTitle || isKey(rawTitle))
    ? getFallback(homeConfig?.videoTitleZh, homeConfig?.videoTitleEn)
    : rawTitle;

  const rawSubtitle = tr('video_section_subtitle');
  const displaySubtitle = (!rawSubtitle || isKey(rawSubtitle))
    ? getFallback(homeConfig?.videoSubtitleZh, homeConfig?.videoSubtitleEn)
    : rawSubtitle;

  const isFirstTextVisible = textProgress >= 0.5 && textProgress < 0.75;
  const isSecondTextVisible = textProgress >= 0.8 && textProgress < 0.98;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[500vh] -mt-[100vh] z-10 bg-black"
    >
      <div ref={stickyRef} className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            preload="none"
            key="brand-video"
            src={videoUrl || undefined}
          />
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        {/* Brand Headlines Layer */}
        <div className="absolute inset-0 z-30 flex items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-7xl flex items-center justify-center">
            
            {/* First Segment */}
            <h2 
              className={cn(
                "absolute text-3xl xs:text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out uppercase gpu-accelerated break-words whitespace-normal px-4 w-full",
                isFirstTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {displayTitle}
            </h2>
            
            {/* Second Segment */}
            <h2 
              className={cn(
                "absolute text-3xl xs:text-4xl sm:text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out uppercase gpu-accelerated break-words whitespace-normal px-4 w-full",
                isSecondTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {displaySubtitle}
            </h2>
          </div>
        </div>

        {/* Video Controls */}
        <div className={cn(
          "absolute bottom-12 right-12 z-40 transition-all duration-700",
          textProgress > 0.1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          <Button
            onClick={togglePlay}
            variant="ghost"
            size="icon"
            className="h-16 w-16 rounded-full glass-morphism border-white/20 hover:bg-white/20 text-white shadow-2xl group"
          >
            {isPlaying ? <Pause className="h-8 w-8 group-hover:scale-110 transition-transform" /> : <Play className="h-8 w-8 ml-1 group-hover:scale-110 transition-transform" />}
          </Button>
        </div>

        {/* Scroll Indicator */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700 pointer-events-none",
          textProgress > 0.05 && textProgress < 0.9 ? "opacity-40" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">Explore</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
