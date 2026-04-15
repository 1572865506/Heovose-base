
"use client";

import { useEffect, useRef, useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";

export function VideoSection({ locale }: { locale: Locale }) {
  const t = translations[locale].video;
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [revealProgress, setRevealProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      
      const rect = sectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // 计算板块在视口中的进度
      // 当板块底部刚露出时进度为 0，当板块完全滚出顶部时进度为 1
      const totalHeight = rect.height;
      const progress = Math.min(Math.max(-rect.top / (totalHeight - windowHeight), 0), 1);
      
      setRevealProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 揭幕效果：使用 clip-path 开启一个“窗口”，显示背后的固定视频
  const clipPath = `inset(${Math.max(0, 100 - revealProgress * 200)}% 0 0 0)`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  // 文本显示逻辑：基于 revealProgress 分段控制
  const isFirstTextVisible = revealProgress >= 0.35 && revealProgress < 0.6;
  const isSecondTextVisible = revealProgress >= 0.7 && revealProgress < 0.95;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[400vh] z-30 bg-background"
    >
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden will-change-[clip-path]"
        style={{ clipPath }}
      >
        {/* 固定视频层 */}
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

        {/* 品牌文案图层 - 分段交替显示 */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="relative w-full max-w-7xl h-full flex items-center justify-center">
            
            {/* 第一段文字 */}
            <h2 
              className={cn(
                "absolute text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-700 ease-in-out",
                isFirstTextVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.title}
            </h2>
            
            {/* 第二段文字 */}
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

        {/* 滚动提示 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.1 && revealProgress < 0.9 ? "opacity-40" : "opacity-0"
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
