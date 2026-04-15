
"use client";

import { useEffect, useRef, useState, useCallback } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [textProgress, setTextProgress] = useState(0); 
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Video section height is 400vh.
      // -mt-[100vh] ensures it starts under the previous section.
      const scrolledPastTop = Math.max(-rect.top, 0);
      const contentScrollableHeight = rect.height - windowHeight;
      const progress = Math.min(Math.max(scrolledPastTop / contentScrollableHeight, 0), 1);
      
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

  // Sequential text visibility logic
  const isFirstTextVisible = textProgress >= 0.15 && textProgress < 0.5;
  const isSecondTextVisible = textProgress >= 0.6 && textProgress < 0.95;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[400vh] -mt-[100vh] z-10 bg-black"
    >
      {/* 
        Sticky Container: Stays fixed at the top of the viewport.
        Because z-index is 10 and sections above are 20,
        it naturally reveals as the above section scrolls up.
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Background Video: Always fully filling and fixed */}
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
            <source src="/video/alibaba2023_x264.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-black/50 z-10" />
        </div>

        {/* Brand Headlines Layer */}
        <div className="absolute inset-0 z-30 flex items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-7xl flex items-center justify-center">
            
            {/* First Segment */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out",
                isFirstTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            {/* Second Segment */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out",
                isSecondTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.subtitle}
            </h2>

          </div>
        </div>

        {/* Video Controls - Bottom Right */}
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
            {isPlaying ? (
              <Pause className="h-8 w-8 group-hover:scale-110 transition-transform" />
            ) : (
              <Play className="h-8 w-8 ml-1 group-hover:scale-110 transition-transform" />
            )}
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
