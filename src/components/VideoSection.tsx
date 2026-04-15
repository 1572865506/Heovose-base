
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const [textProgress, setTextProgress] = useState(0); 

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 视频板块总高度 400vh。
      // 前 100vh 是产品板块离开的过程（揭幕）。
      // 后 300vh 用于处理文案动效。
      const scrolledPastTop = Math.max(-rect.top, 0);
      const contentScrollableHeight = rect.height - windowHeight;
      const progress = Math.min(Math.max(scrolledPastTop / contentScrollableHeight, 0), 1);
      
      setTextProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 文案分段显示逻辑：在 400vh 的滚动行程中分配
  const isFirstTextVisible = textProgress >= 0.15 && textProgress < 0.5;
  const isSecondTextVisible = textProgress >= 0.6 && textProgress < 0.95;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[400vh] -mt-[100vh] z-10 bg-black"
    >
      {/* 
        Sticky 容器：它会固定在视口顶端。
        由于 z-index 为 10，而上方板块为 20，
        所以当上方板块向上滚动时，会自然而然露出这个固定在背后的容器。
      */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 背景视频：始终完全填充并固定 */}
        <div className="absolute inset-0 w-full h-full">
          <video
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

        {/* 品牌文案层 */}
        <div className="absolute inset-0 z-30 flex items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-7xl flex items-center justify-center">
            
            {/* 第一段文字 */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000 ease-in-out",
                isFirstTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            {/* 第二段文字 */}
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

        {/* 滚动提示 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
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
