
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
      
      // Calculate how much of the section has been scrolled through
      // Section is 300vh, so we want progress from 0 to 1 as it passes through the viewport
      const totalDist = rect.height;
      const currentPos = -rect.top;
      
      const progress = Math.min(Math.max(currentPos / (totalDist - windowHeight), 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Curtain effect: clip-path from narrow center strip to full screen
  // progress 0 to 0.4: Opening animation
  // progress 0.4 to 0.7: First text fade in
  // progress 0.7 to 1: Second text fade in
  
  const curtainWidth = scrollProgress < 0.4 
    ? 20 + (scrollProgress / 0.4) * 80 
    : 100;

  const clipPath = `inset(0 ${50 - (curtainWidth / 2)}% 0 ${50 - (curtainWidth / 2)}%)`;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[300vh] bg-background"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Video Layer */}
        <div 
          className="absolute inset-0 transition-all duration-300 ease-out will-change-transform"
          style={{ clipPath }}
        >
          <div className="absolute inset-0 bg-black/40 z-10" />
          <video
            autoPlay
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          >
            <source src="https://assets.mixkit.co/videos/preview/mixkit-electronic-circuit-board-close-up-1574-large.mp4" type="video/mp4" />
          </video>
        </div>

        {/* Text Overlays */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="space-y-6">
            <h2 
              className={cn(
                "text-4xl md:text-7xl lg:text-8xl font-headline font-bold text-white transition-all duration-1000",
                scrollProgress > 0.4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            <p 
              className={cn(
                "text-xl md:text-3xl text-white/70 font-light transition-all duration-1000 delay-300",
                scrollProgress > 0.6 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Bottom indicator for continuity */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-30 transition-opacity duration-500",
          scrollProgress > 0.1 && scrollProgress < 0.9 ? "opacity-40" : "opacity-0"
        )}>
          <div className="w-[1px] h-24 bg-gradient-to-b from-white to-transparent" />
        </div>
      </div>
    </section>
  );
}
