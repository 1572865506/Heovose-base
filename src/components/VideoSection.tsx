
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealProgress, setRevealProgress] = useState(0); 
  const [textProgress, setTextProgress] = useState(0); 

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Reveal Progress: 从板块顶端进入屏幕底部（0）到板块顶端到达屏幕顶部（1）
      // 这一段距离刚好是 100vh
      const currentReveal = Math.min(Math.max((windowHeight - rect.top) / windowHeight, 0), 1);
      setRevealProgress(currentReveal);

      // Text Progress: 当板块顶端到达或超过屏幕顶部（rect.top <= 0）时开始计算
      const scrolledPastTop = Math.max(-rect.top, 0);
      const contentScrollableHeight = rect.height - windowHeight;
      const currentTProgress = Math.min(Math.max(scrolledPastTop / contentScrollableHeight, 0), 1);
      setTextProgress(currentTProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 揭幕效果：使用 inset 裁切，从 100%（底部隐藏）过渡到 0%（全屏显示）
  // 这种方式能产生“视频固定在背景，上层内容将其推开”的视觉错觉
  const clipPath = `inset(${Math.max(0, 100 - revealProgress * 100)}% 0 0 0)`;

  // 文字分段显示逻辑
  const isFirstTextVisible = textProgress >= 0.1 && textProgress < 0.45;
  const isSecondTextVisible = textProgress >= 0.55 && textProgress < 0.9;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[400vh] z-30 bg-transparent"
    >
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden will-change-[clip-path]"
        style={{ clipPath }}
      >
        {/* 背景视频层：保持完全静止 */}
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
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        {/* 品牌文案层：在视频背景上居中显示 */}
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

        {/* 滚动体验指示 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.8 && textProgress < 0.9 ? "opacity-40" : "opacity-0"
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
