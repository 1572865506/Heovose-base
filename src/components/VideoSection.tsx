
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 计算当前板块相对于视口的滚动进度
      // 总滚动距离为 section 的高度
      const scrolled = -rect.top;
      const totalDist = rect.height - windowHeight;
      
      const progress = Math.min(Math.max(scrolled / totalDist, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 升幕逻辑：在前 35% 的滚动行程中，完成从底部向上的揭示
  // 此时不再有黑色遮罩，直接揭示底层的视频
  const revealProgress = Math.min(Math.max(scrollProgress / 0.35, 0), 1);
  const clipPath = `inset(${100 - revealProgress * 100}% 0 0 0)`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // 自动播放受阻处理
      });
    }
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[300vh] z-20 bg-background"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 揭幕容器：移除了 bg-black，背景色由 section 提供的 bg-background（与产品板块一致）填充 */}
        <div 
          className="absolute inset-0 transition-all duration-75 ease-linear will-change-[clip-path]"
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
          
          {/* 视频上方的深色遮罩：仅在视频区域显现，用于增强文字可读性 */}
          <div className="absolute inset-0 bg-black/40 z-20" />
        </div>

        {/* 品牌文案层 */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-6xl space-y-12">
            <h2 
              className={cn(
                "text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000",
                scrollProgress > 0.4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            <p 
              className={cn(
                "text-2xl md:text-4xl text-white/80 font-light max-w-3xl mx-auto transition-all duration-1000 delay-300",
                scrollProgress > 0.7 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.1 && scrollProgress < 0.9 ? "opacity-40" : "opacity-0"
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
