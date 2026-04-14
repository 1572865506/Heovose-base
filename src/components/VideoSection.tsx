
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
      
      // 当板块顶部进入视口底部时开始揭幕 (progress 0)
      // 当板块顶部到达视口顶部时完成揭幕 (progress 1)
      const distFromBottom = windowHeight - rect.top;
      const progress = Math.min(Math.max(distFromBottom / windowHeight, 0), 1);
      
      setRevealProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); 
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 核心动效：使用 clip-path 开启一个“窗口”，显示背后的固定视频
  // 这种方式让视频看起来始终固定在幕后，只是被上方的板块揭开了
  const clipPath = `inset(${100 - revealProgress * 100}% 0 0 0)`;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  return (
    <section 
      ref={sectionRef} 
      className="relative h-[250vh] z-30"
    >
      {/* 揭幕容器：sticky 在顶部，但通过进度动态调整可见区域 */}
      <div 
        className="sticky top-0 h-screen w-full overflow-hidden will-change-[clip-path]"
        style={{ clipPath }}
      >
        {/* 固定视频层：真正的“银幕” */}
        <div className="absolute inset-0 w-full h-full">
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
          {/* 渐变遮罩 */}
          <div className="absolute inset-0 bg-black/40 z-10" />
        </div>

        {/* 巨幅装饰文字 (类似参考图效果) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden select-none">
          <span className={cn(
            "text-[30vw] font-bold text-white/[0.07] tracking-tighter leading-none transition-transform duration-700 ease-out",
            revealProgress > 0.1 ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          )}>
            QUALITY
          </span>
        </div>

        {/* 品牌文案图层 */}
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="max-w-6xl space-y-12">
            <h2 
              className={cn(
                "text-5xl md:text-8xl lg:text-9xl font-headline font-bold text-white tracking-tighter leading-none transition-all duration-1000",
                revealProgress >= 0.8 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
              )}
            >
              {t.title}
            </h2>
            
            <p 
              className={cn(
                "text-2xl md:text-4xl text-white/80 font-light max-w-3xl mx-auto transition-all duration-1000 delay-300",
                revealProgress >= 0.9 ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              )}
            >
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* 滚动提示 */}
        <div className={cn(
          "absolute bottom-12 left-1/2 -translate-x-1/2 z-40 transition-opacity duration-700",
          revealProgress > 0.5 && revealProgress < 0.95 ? "opacity-40" : "opacity-0"
        )}>
          <div className="flex flex-col items-center gap-4">
            <span className="text-[10px] text-white uppercase tracking-[0.3em] font-bold">Discover</span>
            <div className="w-[1px] h-16 bg-gradient-to-b from-white to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
