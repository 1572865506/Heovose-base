
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
      
      // 计算板块在视口中的滚动进度
      const totalDist = rect.height + windowHeight;
      const currentPos = windowHeight - rect.top;
      
      const progress = Math.min(Math.max(currentPos / totalDist, 0), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 幕布上升效果逻辑：
  // 0.05 到 0.35 的滚动范围内完成垂直揭幕
  const revealProgress = Math.min(Math.max((scrollProgress - 0.05) / 0.3, 0), 1);
  // inset(top right bottom left) -> 100% 表示顶部裁剪 100%（隐藏），0% 表示不裁剪（显示）
  const clipPath = `inset(${100 - revealProgress * 100}% 0 0 0)`;

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[300vh] bg-black z-10"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {/* 视频层：带垂直上升揭幕动效 */}
        <div 
          className="absolute inset-0 transition-all duration-150 ease-out will-change-[clip-path]"
          style={{ 
            clipPath,
            zIndex: 10
          }}
        >
          {/* 深色遮罩：提升文字可读性 */}
          <div className="absolute inset-0 bg-black/40 z-20" />
          
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="h-full w-full object-cover"
            key={locale} // 切换语言时重置视频状态
          >
            {/* 注意：视频必须位于 public/video/ 目录下才能访问 */}
            <source src="/video/alibaba2023_x264.mp4" type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
        </div>

        {/* 电影感文字图层 */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-6xl space-y-12">
            <h2 
              className={cn(
                "text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000",
                revealProgress > 0.4 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            <p 
              className={cn(
                "text-2xl md:text-4xl text-white/80 font-light max-w-3xl mx-auto transition-all duration-1000 delay-300",
                revealProgress > 0.7 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* 滚动指示器 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-all duration-700",
          revealProgress > 0.1 && revealProgress < 0.9 ? "opacity-40" : "opacity-0"
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
