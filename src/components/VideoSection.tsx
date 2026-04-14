
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Reveal Progress: 0 to 1 as the section scrolls into view
      // We want the reveal to start when the top of this section is at the bottom of the viewport (windowHeight)
      // and finish when it reaches the top (0).
      const scrolledIntoView = windowHeight - rect.top;
      const revealDuration = windowHeight; // Use one viewport height for the reveal duration
      
      const currentReveal = Math.min(Math.max(scrolledIntoView / revealDuration, 0), 1);
      setRevealProgress(currentReveal);

      // Text and progress: Starts after the curtain is mostly up
      const textScrolled = scrolledIntoView - windowHeight;
      const totalTextDist = rect.height - windowHeight;
      const progress = Math.min(Math.max(textScrolled / totalTextDist, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Curtain rising effect using clip-path inset
  // Initial: 100% inset from top (hidden at bottom)
  // Final: 0% inset (fully visible)
  const clipPath = `inset(${100 - revealProgress * 100}% 0 0 0)`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[300vh] z-30 pointer-events-none"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-auto bg-transparent">
        {/* The Reveal Container */}
        <div 
          className="absolute inset-0 will-change-[clip-path]"
          style={{ 
            clipPath,
            zIndex: 10
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            key={locale}
          >
            <source src="/video/alibaba2023_x264.mp4" type="video/mp4" />
          </video>
          
          <div className="absolute inset-0 bg-black/50 z-20" />
        </div>

        {/* Text Layer */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-6xl space-y-12">
            <h2 
              className={cn(
                "text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000",
                revealProgress > 0.9 && scrollProgress > 0.1 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            <p 
              className={cn(
                "text-2xl md:text-4xl text-white/80 font-light max-w-3xl mx-auto transition-all duration-1000 delay-300",
                revealProgress > 0.9 && scrollProgress > 0.4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.8 && scrollProgress < 0.9 ? "opacity-40" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">Scroll</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
