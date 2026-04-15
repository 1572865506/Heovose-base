
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealProgress, setRevealProgress] = useState(0); // 0 to 1 for the curtain reveal
  const [textProgress, setTextProgress] = useState(0); // 0 to 1 for the text sequences

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const totalHeight = rect.height;
      
      // 1. Reveal Progress: Starts when the section top enters from screen bottom
      // Ends when the section top reaches screen top (sticky point)
      const reveal = Math.min(Math.max((windowHeight - rect.top) / windowHeight, 0), 1);
      setRevealProgress(reveal);

      // 2. Text Progress: Starts once the section hits the top and becomes sticky
      const scrolledPastTop = Math.max(-rect.top, 0);
      const contentScrollableHeight = totalHeight - windowHeight;
      const tProgress = Math.min(Math.max(scrolledPastTop / contentScrollableHeight, 0), 1);
      setTextProgress(tProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Use inset to create the "curtain lifting" effect.
  // 100% means hidden at bottom, 0% means fully revealed.
  const clipPath = `inset(${Math.max(0, 100 - revealProgress * 100)}% 0 0 0)`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // Text timing logic based on textProgress
  const isFirstTextVisible = textProgress >= 0.1 && textProgress < 0.45;
  const isSecondTextVisible = textProgress >= 0.55 && textProgress < 0.9;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[400vh] z-30 bg-background"
    >
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden will-change-[clip-path]"
        style={{ clipPath }}
      >
        {/* The video stays fixed at the top while being revealed */}
        <div className="absolute inset-0 w-full h-full bg-black">
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

        {/* Brand Text Layer */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
            
            {/* Segment 1 */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-700 ease-in-out",
                isFirstTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.title}
            </h2>
            
            {/* Segment 2 */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-700 ease-in-out",
                isSecondTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </h2>

          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.5 && textProgress < 0.9 ? "opacity-40" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">Experience</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
