
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate total scrollable distance for this 300vh section
      const totalDist = rect.height;
      const currentPos = -rect.top;
      
      // Calculate progress from 0 to 1 as the section passes through the viewport
      const progress = Math.min(Math.max(currentPos / (totalDist - windowHeight), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Vertical Reveal (Curtain Rising) Logic:
  // 0.0 to 0.4: The curtain "rises" from bottom to top.
  // We use inset(top right bottom left). 
  // To reveal from bottom to top, the 'top' inset value goes from 100% to 0%.
  const revealProgress = Math.min(scrollProgress / 0.4, 1);
  const clipPath = `inset(${100 - revealProgress * 100}% 0 0 0)`;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[300vh] bg-background z-0"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video Layer with Vertical Rising Reveal */}
        <div 
          className="absolute inset-0 transition-all duration-300 ease-out will-change-[clip-path]"
          style={{ clipPath }}
        >
          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black/40 z-10" />
          
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover scale-105"
          >
            <source src="/video/alibaba2023_x264.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Cinematic Text Overlays - Only show after curtain starts rising */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-6xl space-y-12">
            <h2 
              className={cn(
                "text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000",
                scrollProgress > 0.35 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            <p 
              className={cn(
                "text-2xl md:text-4xl text-white/80 font-light max-w-3xl mx-auto transition-all duration-1000 delay-300",
                scrollProgress > 0.65 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Dynamic Scroll Indicator */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-30 transition-all duration-700",
          scrollProgress > 0.05 && scrollProgress < 0.9 ? "opacity-40" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">Scroll</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      </div>

      {/* Background visual continuity */}
      <div className="absolute inset-0 -z-10 bg-primary/5" />
    </section>
  );
}
