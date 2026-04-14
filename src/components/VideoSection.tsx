
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
      
      // 1. 整体滚动进度 (用于控制文案显现)
      // 当 section 顶部到达视口顶部时开始计算 (0 到 1)
      const scrolled = -rect.top;
      const totalDist = rect.height - windowHeight;
      const progress = Math.min(Math.max(scrolled / totalDist, 0), 1);
      setScrollProgress(progress);

      // 2. 升幕揭开进度 (用于 clip-path)
      // 核心修复：从板块进入视口底部那一刻就开始计算揭开进度
      // rect.top 从 windowHeight 减少到 0 的过程，就是视频从底部升起到填满全屏的过程
      const reveal = Math.min(Math.max((windowHeight - rect.top) / windowHeight, 0), 1);
      setRevealProgress(reveal);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 垂直揭开路径：从 100% (底部隐藏) 到 0% (全屏显示)
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
      className="relative h-[250vh] z-20"
    >
      {/* 移除背景色，确保与上方板块无缝衔接 */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 揭幕容器：通过 clip-path 实现垂直升幕，不再使用额外背景遮罩 */}
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
          
          {/* 视频上方的深色滤镜，仅用于增强文字对比度 */}
          <div className="absolute inset-0 bg-black/40 z-20" />
        </div>

        {/* 品牌文案层：在揭幕基本完成且进入 sticky 滚动阶段后显现 */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-6xl space-y-12">
            <h2 
              className={cn(
                "text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000",
                scrollProgress > 0.1 && revealProgress >= 0.95 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            <p 
              className={cn(
                "text-2xl md:text-4xl text-white/80 font-light max-w-3xl mx-auto transition-all duration-1000 delay-300",
                scrollProgress > 0.4 && revealProgress >= 0.95 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* 滚动提示 */}
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
