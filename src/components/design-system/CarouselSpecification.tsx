"use client";

import React, { useState, useEffect } from 'react';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from '@/components/ui/badge';
import { GalleryHorizontal, Zap, ShieldCheck, Layout } from 'lucide-react';

export const CarouselSpecification = React.memo(() => {
  // Countdown Carousel state
  const [countdownApi, setCountdownApi] = useState<CarouselApi>();
  const [countdownCurrent, setCountdownCurrent] = useState(0);
  const [countdownCount, setCountdownCount] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!countdownApi) return;
    
    setCountdownCount(countdownApi.scrollSnapList().length);
    setCountdownCurrent(countdownApi.selectedScrollSnap() + 1);

    countdownApi.on("select", () => {
      setCountdownCurrent(countdownApi.selectedScrollSnap() + 1);
      setProgress(0);
    });
  }, [countdownApi]);

  useEffect(() => {
    if (!countdownApi) return;
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (5000 / 50)); // 5s duration, 50ms interval
      });
    }, 50);

    return () => clearInterval(interval);
  }, [countdownApi]);

  // Enhanced Carousel state
  const [enhancedApi, setEnhancedApi] = useState<CarouselApi>();
  const [enhancedCurrent, setEnhancedCurrent] = useState(0);
  const [enhancedCount, setEnhancedCount] = useState(0);
  const [enhancedProgress, setEnhancedProgress] = useState(0);

  useEffect(() => {
    if (!enhancedApi) return;
    
    setEnhancedCount(enhancedApi.scrollSnapList().length);
    setEnhancedCurrent(enhancedApi.selectedScrollSnap() + 1);

    enhancedApi.on("select", () => {
      setEnhancedCurrent(enhancedApi.selectedScrollSnap() + 1);
      setEnhancedProgress(0);
    });
  }, [enhancedApi]);

  useEffect(() => {
    if (!enhancedApi) return;
    
    const interval = setInterval(() => {
      setEnhancedProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (5000 / 50)); // 5s duration, 50ms interval
      });
    }, 50);

    return () => clearInterval(interval);
  }, [enhancedApi]);

  // Large Carousel state
  const [largeApi, setLargeApi] = useState<CarouselApi>();
  const [largeCurrent, setLargeCurrent] = useState(0);
  const [largeCount, setLargeCount] = useState(0);
  const [largeProgress, setLargeProgress] = useState(0);

  useEffect(() => {
    if (!largeApi) return;
    
    setLargeCount(largeApi.scrollSnapList().length);
    setLargeCurrent(largeApi.selectedScrollSnap() + 1);

    largeApi.on("select", () => {
      setLargeCurrent(largeApi.selectedScrollSnap() + 1);
      setLargeProgress(0);
    });
  }, [largeApi]);

  useEffect(() => {
    if (!largeApi) return;
    
    const interval = setInterval(() => {
      setLargeProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + (100 / (5000 / 50)); // 5s duration, 50ms interval
      });
    }, 50);

    return () => clearInterval(interval);
  }, [largeApi]);

  return (
    <section id="section-11" className="space-y-10 pb-40">
      <div className="flex items-center gap-4 border-b pb-4 border-primary/10">
        <div className="h-2 w-10 bg-primary rounded-full" />
        <h2 className="text-2xl font-headline font-bold uppercase tracking-widest text-primary">11. 轮播组件系统规范 (Carousel)</h2>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border border-border/40 shadow-sm space-y-20">
        <div className="grid grid-cols-1 gap-20">
          
          {/* 11.1 基础型：导航模式 (Basic Navigation) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <GalleryHorizontal className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.1 基础型：导航模式 (Basic Navigation)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 内置切换按钮 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">内置切换按钮 (Internal Overlay Controls)</p>
                <div className="bg-muted/5 p-8 rounded-3xl border border-border/40 shadow-inner">
                  <Carousel className="w-full max-w-xs mx-auto group">
                    <CarouselContent>
                      {Array.from({ length: 3 }).map((_, index) => (
                        <CarouselItem key={index}>
                          <div className="p-1">
                            <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/10 bg-white">
                              <span className="text-2xl font-headline font-bold text-primary/20">{index + 1}</span>
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious className="left-4 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm border-border/40 text-primary opacity-0 group-hover:opacity-100 disabled:hidden transition-all duration-300" />
                    <CarouselNext className="right-4 h-10 w-10 rounded-xl bg-white/80 backdrop-blur-sm border-border/40 text-primary opacity-0 group-hover:opacity-100 disabled:hidden transition-all duration-300" />
                  </Carousel>
                </div>
                <p className="text-[9px] text-muted-foreground italic mt-2">按钮内置于容器内，仅在 Hover 时显现，减少视觉干扰。</p>
              </div>

              {/* 倒计时指示器 */}
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">倒计时指示器 (Countdown Indicators)</p>
                <div className="bg-muted/5 p-8 rounded-3xl border border-border/40 shadow-inner">
                  <div className="relative w-full max-w-xs mx-auto">
                    <Carousel 
                      setApi={setCountdownApi} 
                      className="w-full"
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                    >
                      <CarouselContent>
                        {Array.from({ length: 3 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/10 bg-white">
                                <span className="text-2xl font-headline font-bold text-primary/20">{index + 1}</span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    
                    <div className="mt-8 flex items-center justify-center gap-3">
                      {Array.from({ length: countdownCount }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => countdownApi?.scrollTo(i)}
                          className="relative w-12 h-1 bg-primary/10 rounded-full overflow-hidden group transition-all"
                        >
                          {countdownCurrent === i + 1 && (
                            <div 
                              className="absolute inset-0 bg-primary transition-all duration-[50ms] ease-linear"
                              style={{ width: `${progress}%` }}
                            />
                          )}
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic mt-2">指示器带有自动步进的倒计时进度条，增强交互的可预测性。</p>
              </div>
            </div>
          </div>

          {/* 11.2 增强型：进度与指示 (Enhanced Indicators) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Zap className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.2 增强型：进度与指示 (Enhanced Indicators)</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">索引右置模式 (Index Aligned Right of Indicators)</p>
                <div className="bg-muted/5 p-12 rounded-3xl border border-border/40 shadow-inner">
                  <div className="relative w-full max-w-xs mx-auto">
                    <Carousel 
                      setApi={setEnhancedApi} 
                      className="w-full"
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                    >
                      <CarouselContent>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="flex aspect-video items-center justify-center rounded-2xl border-2 border-dashed border-primary/10 bg-white">
                                <span className="text-2xl font-headline font-bold text-primary/20">{index + 1}</span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                    </Carousel>
                    
                    <div className="mt-8 flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: enhancedCount }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => enhancedApi?.scrollTo(i)}
                            className="relative w-8 h-1 bg-primary/10 rounded-full overflow-hidden group transition-all"
                          >
                            {enhancedCurrent === i + 1 && (
                              <div 
                                className="absolute inset-0 bg-primary transition-all duration-[50ms] ease-linear"
                                style={{ width: `${enhancedProgress}%` }}
                              />
                            )}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                      
                      <div className="h-6 flex items-center pl-4 border-l border-primary/10">
                        <span className="text-[10px] font-mono font-bold text-primary tracking-tighter">
                          {enhancedCurrent.toString().padStart(2, '0')} <span className="opacity-20 mx-1">/</span> {enhancedCount.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-[9px] text-muted-foreground italic mt-2">索引编号移至指示器右侧并由竖线分隔，视觉结构更清晰。</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10">
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">轮播切换逻辑规范</span>
                  </div>
                  <ul className="space-y-4">
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">自动播放步进 (Auto-play)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">OPTIONAL</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">建议间隔为 3000ms - 5000ms，检测到鼠标悬停时应暂停。</p>
                    </li>
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">切换过渡动画 (Transition)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">SPRING</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">采用弹性物理模拟 (Spring Physics)，避免生硬的匀速线性移动。</p>
                    </li>
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">手势交互 (Gestures)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">MANDATORY</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">全平台支持 Drag/Touch 拖拽切换，具备越界回弹效果。</p>
                    </li>
                    <li className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase">对齐规范 (Alignment)</span>
                        <Badge className="h-4 text-[7px] bg-primary/10 text-primary border-none">SIZE-BASED</Badge>
                      </div>
                      <p className="text-[9px] text-muted-foreground">宽 &lt; 1200px 居中；宽 &ge; 1200px 右对齐（限 1400px 容器）。</p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 11.3 大型组件：对齐模式 (Large Component Alignment) */}
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <Layout className="h-4 w-4 text-primary" />
              <span className="text-[11px] font-bold text-primary uppercase tracking-[0.2em]">11.3 大型组件：对齐模式 (Large Component Alignment)</span>
            </div>

            <div className="space-y-8">
              <div className="bg-muted/5 p-12 rounded-[2.5rem] border border-border/40 shadow-inner overflow-hidden">
                <div className="max-w-[1400px] mx-auto w-full">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase mb-6">大型组件右对齐演示 (Width &gt; 1200px, Right Aligned Indicators)</p>
                  <div className="relative w-full">
                    <Carousel 
                      setApi={setLargeApi} 
                      className="w-full"
                      plugins={[Autoplay({ delay: 5000, stopOnInteraction: false })]}
                    >
                      <CarouselContent>
                        {Array.from({ length: 4 }).map((_, index) => (
                          <CarouselItem key={index}>
                            <div className="p-1">
                              <div className="flex h-[360px] items-center justify-center rounded-[2.5rem] border-2 border-dashed border-primary/10 bg-white shadow-sm overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                                <span className="text-4xl font-headline font-bold text-primary/10 relative z-10">Large Hero Slide {index + 1}</span>
                              </div>
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      {/* 大型组件导航按钮通常位于边缘内部 */}
                      <CarouselPrevious className="left-8 h-12 w-12 rounded-2xl bg-white/90 shadow-lg border-primary/5 text-primary" />
                      <CarouselNext className="right-8 h-12 w-12 rounded-2xl bg-white/90 shadow-lg border-primary/5 text-primary" />
                    </Carousel>
                    
                    {/* 指示器右对齐 UI - 保持在 1400px 约束内 */}
                    <div className="mt-10 flex items-center justify-end gap-8 px-4">
                      <div className="flex items-center gap-3">
                        {Array.from({ length: largeCount }).map((_, i) => (
                          <button
                            key={i}
                            onClick={() => largeApi?.scrollTo(i)}
                            className="relative w-14 h-1 bg-primary/10 rounded-full overflow-hidden group transition-all"
                          >
                            {largeCurrent === i + 1 && (
                              <div 
                                className="absolute inset-0 bg-primary transition-all duration-[50ms] ease-linear"
                                style={{ width: `${largeProgress}%` }}
                              />
                            )}
                            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                      
                      <div className="h-8 flex items-center pl-6 border-l border-primary/10">
                        <span className="text-[12px] font-mono font-bold text-primary tracking-tighter">
                          {largeCurrent.toString().padStart(2, '0')} <span className="opacity-20 mx-1">/</span> {largeCount.toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-primary block mb-1">对齐逻辑限制：</strong>
                  对于组件宽度 &lt; 1200px 的中小型轮播，指示器应强制居中以保持视觉重心稳定。
                  当宽度 &ge; 1200px 时，指示器转为右对齐，以 match 大型 Hero 区块的视觉流向。
                </p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  <strong className="text-primary block mb-1">内容宽度约束：</strong>
                  右对齐的指示器依然必须遵循全局最大内容宽度（1400px）的约束，不可贴合浏览器屏幕边缘。
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
});
