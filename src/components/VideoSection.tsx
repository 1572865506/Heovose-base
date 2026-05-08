
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Locale, translations } from "@/lib/translations";
import { getAssetUrl } from '@/lib/image-utils';
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoSectionProps {
  locale: Locale;
  homeConfig?: any;
  isLoading?: boolean;
}

export function VideoSection({ locale, homeConfig, isLoading }: VideoSectionProps) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [textProgress, setTextProgress] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(true);

  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '200px' } // Start loading 200px before it enters
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let requestRunning = false;

    const handleScroll = () => {
      if (requestRunning) return;
      requestRunning = true;

      requestAnimationFrame(() => {
        if (!sectionRef.current) {
          requestRunning = false;
          return;
        }
        
        const rect = sectionRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        
        const scrolledPastTop = Math.max(-rect.top, 0);
        const contentScrollableHeight = rect.height - windowHeight;
        const progress = Math.min(Math.max(scrolledPastTop / contentScrollableHeight, 0), 1);
        
        setTextProgress(prev => {
          if (Math.abs(prev - progress) > 0.001) {
            return progress;
          }
          return prev;
        });
        
        requestRunning = false;
      });
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

  if (isLoading) {
    return (
      <section className="relative h-[100vh] z-10 bg-black flex items-center justify-center">
        <div className="h-20 md:h-40 w-3/4 bg-white/10 rounded-2xl animate-pulse" />
      </section>
    );
  }

  // 动态文案回退逻辑
  const displayTitle = locale === 'zh'
    ? (homeConfig?.videoTitleZh || t.title)
    : (homeConfig?.videoTitleEn || t.title);

  const displaySubtitle = locale === 'zh'
    ? (homeConfig?.videoSubtitleZh || t.subtitle)
    : (homeConfig?.videoSubtitleEn || t.subtitle);

  const isFirstTextVisible = textProgress >= 0.5 && textProgress < 0.75;
  const isSecondTextVisible = textProgress >= 0.8 && textProgress < 0.98;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[500vh] -mt-[100vh] z-10 bg-black"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
            key={locale}
          >
            {isInView && (
              <source src={getAssetUrl(homeConfig?.videoUrl || "/video/alibaba2023_x264.mp4")} type="video/mp4" />
            )}
          </video>
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        {/* Brand Headlines Layer */}
        <div className="absolute inset-0 z-30 flex items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-7xl flex items-center justify-center">
            
            {/* First Segment */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out uppercase gpu-accelerated",
                isFirstTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {displayTitle}
            </h2>
            
            {/* Second Segment */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out uppercase gpu-accelerated",
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
