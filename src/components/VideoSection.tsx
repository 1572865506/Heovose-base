
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
      
      // Reveal Progress: 视频板块顶端进入屏幕底部时开始（0），到达屏幕顶部时完成（1）
      // 使用负边距后，我们需要确保计算是连贯的
      const currentReveal = Math.min(Math.max((windowHeight - rect.top) / windowHeight, 0), 1);
      setRevealProgress(currentReveal);

      // Text Progress: 一旦 sticky 容器吸顶（rect.top <= 0）开始计算
      const scrolledPastTop = Math.max(-rect.top, 0);
      const contentScrollableHeight = rect.height - windowHeight;
      const currentTProgress = Math.min(Math.max(scrolledPastTop / contentScrollableHeight, 0), 1);
      setTextProgress(currentTProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 幕布揭开效果：使用 inset 裁切
  // 100% 表示从底部完全遮住，0% 表示完全露出来
  const clipPath = `inset(${Math.max(0, 100 - revealProgress * 100)}% 0 0 0)`;

  // 文字分段逻辑：两段文字在同一位置先后显示
  const isFirstTextVisible = textProgress >= 0.1 && textProgress < 0.45;
  const isSecondTextVisible = textProgress >= 0.55 && textProgress < 0.9;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[400vh] z-30 -mt-[100vh] pointer-events-none"
    >
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden will-change-[clip-path] pointer-events-auto"
        style={{ clipPath }}
      >
        {/* 背景视频层 */}
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

        {/* 滚动体验指示 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.8 && textProgress < 0.9 ? "opacity-40" : "opacity-0"
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
