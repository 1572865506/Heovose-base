
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { Play, Pause, Loader2 } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';

interface StepData {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  imageUrls: string[];
}

export function ProductionProcess({ locale }: { locale: Locale }) {
  const firestore = useFirestore();
  const [activeStep, setActiveStep] = useState(0);
  const [subImageIndex, setSubImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const AUTOPLAY_DELAY = 4000;

  // 1. 从 Firestore 获取动态数据
  const stepsQuery = useMemoFirebase(() => 
    firestore ? query(collection(firestore, 'productionSteps'), orderBy('order', 'asc')) : null, 
    [firestore]
  );
  const { data: remoteSteps, isLoading } = useCollection<StepData>(stepsQuery);

  // 2. 数据转换逻辑
  const steps = useMemo(() => {
    if (remoteSteps && remoteSteps.length > 0) {
      return remoteSteps.map(s => ({
        label: locale === 'zh' ? s.titleZh : s.titleEn,
        tag: s.order < 10 ? `0${s.order}` : `${s.order}`,
        images: s.imageUrls || [],
        desc: locale === 'zh' ? s.descZh : s.descEn
      }));
    }
    
    // 兜底默认数据
    const t = translations[locale].process;
    return [
      { label: t.pmc, tag: '01', images: ['https://picsum.photos/seed/p1/1200/800'], desc: t.pmc_desc },
      { label: t.procurement, tag: '02', images: ['https://picsum.photos/seed/p1/1200/800'], desc: t.procurement_desc },
      { label: t.inspection, tag: '05', images: ['https://picsum.photos/seed/p2/1200/800'], desc: t.inspection_desc },
      { label: t.manufacturing, tag: '08', images: ['https://picsum.photos/seed/p3/1200/800'], desc: t.manufacturing_desc },
      { label: t.shipment, tag: '11', images: ['https://picsum.photos/seed/p4/1200/800'], desc: t.shipment_desc },
    ];
  }, [remoteSteps, locale]);

  // 3. 动态生成视觉分段逻辑：防止相邻步骤图片完全相同时产生闪烁切换
  const imageSegments = useMemo(() => {
    const segments: { start: number, end: number, images: string[] }[] = [];
    let currentSegment: { start: number, end: number, images: string[] } | null = null;

    steps.forEach((step, index) => {
      const imagesKey = JSON.stringify(step.images);
      if (!currentSegment || JSON.stringify(currentSegment.images) !== imagesKey) {
        currentSegment = { start: index, end: index, images: step.images };
        segments.push(currentSegment);
      } else {
        currentSegment.end = index;
      }
    });

    return segments;
  }, [steps]);

  // 4. 滚动交叉观察
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    scrollRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveStep(index);
            }
          },
          { 
            threshold: 0.5,
            rootMargin: "-20% 0px -20% 0px"
          }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });
    return () => observers.forEach(o => o.disconnect());
  }, [steps]);

  // 5. 自动轮播定时器
  useEffect(() => {
    if (!isPlaying) return;
    
    const activeImages = steps[activeStep]?.images || [];
    if (activeImages.length <= 1) {
      setProgress(0);
      return;
    }

    const intervalTime = 100;
    const increment = (intervalTime / AUTOPLAY_DELAY) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setSubImageIndex((prevIdx) => (prevIdx + 1) % activeImages.length);
          return 0;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStep, isPlaying, steps]);

  // 6. 步骤改变时重置子状态
  useEffect(() => {
    setSubImageIndex(0);
    setProgress(0);
  }, [activeStep]);

  if (isLoading) {
    return (
      <div className="py-40 flex flex-col items-center justify-center gap-4 bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">同步精密制造流程中...</p>
      </div>
    );
  }

  return (
    <section id="process" className="py-32 bg-white relative overflow-x-clip">
      <div className="container mx-auto px-6">
        <SectionHeading 
          title={translations[locale].process.title} 
          subtitle={translations[locale].process.subtitle} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative mt-20">
          
          {/* 左侧大图固定展示区 */}
          <div className="lg:col-span-7 hidden lg:block relative">
            <div className={cn(
              "sticky top-32 h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-muted/20 border-y border-r border-border/40 shadow-2xl transition-all duration-500",
              "rounded-r-[3rem] rounded-l-none",
              "lg:-ml-[calc((min(100vw,1920px)-1280px)/2+1.5rem)] lg:w-[calc(100%+((min(100vw,1920px)-1280px)/2+1.5rem))]"
            )}>
              {imageSegments.map((segment, segIndex) => {
                const isSegmentActive = activeStep >= segment.start && activeStep <= segment.end;
                return (
                  <div
                    key={`seg-img-${segIndex}`}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                      isSegmentActive ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    {segment.images.map((imgUrl, iIndex) => {
                      const isCurrentSubImage = segment.images.length > 1 ? subImageIndex === iIndex : iIndex === 0;
                      return (
                        <div
                          key={`${segIndex}-${iIndex}`}
                          className={cn(
                            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                            (isSegmentActive && isCurrentSubImage)
                              ? "opacity-100" 
                              : "opacity-0"
                          )}
                        >
                          <Image
                            src={imgUrl}
                            alt="Heovose Pipeline Detail"
                            fill
                            className="object-cover"
                            unoptimized={imgUrl.startsWith('data:')}
                          />
                        </div>
                      );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </div>
                );
              })}

              {/* 多图轮播交互控制台 */}
              {steps[activeStep]?.images.length > 1 && (
                <div className="absolute bottom-8 right-8 z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex gap-1.5 items-center">
                    {steps[activeStep].images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setSubImageIndex(i); setProgress(0); }}
                        className={cn(
                          "relative h-1 rounded-full transition-all duration-500 overflow-hidden bg-white/30",
                          i === subImageIndex ? "w-8" : "w-2 hover:bg-white/50"
                        )}
                      >
                        {i === subImageIndex && (
                          <div 
                            className="absolute inset-0 bg-accent origin-left"
                            style={{ 
                              width: isPlaying ? `${progress}%` : '100%',
                              transition: (progress === 0 && isPlaying) ? 'none' : 'width 50ms linear'
                            }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground transition-all shadow-lg border border-white/10"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 右侧步骤文字列表 */}
          <div className="lg:col-span-5 space-y-[60vh] py-12">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => { scrollRefs.current[index] = el; }}
                className={cn(
                  "transition-all duration-700 space-y-8 pl-4 lg:pl-0",
                  activeStep === index ? "opacity-100 translate-x-4" : "opacity-15 translate-x-0"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 flex items-center justify-center rounded-2xl font-headline font-bold text-2xl transition-all duration-500 shrink-0",
                    activeStep === index ? "bg-primary text-white shadow-xl scale-110" : "bg-muted text-muted-foreground"
                  )}>
                    {step.tag}
                  </div>
                  <h3 className={cn(
                    "text-3xl md:text-4xl font-headline font-bold transition-colors duration-500",
                    activeStep === index ? "text-primary" : "text-muted-foreground/60"
                  )}>
                    {step.label}
                  </h3>
                </div>
                
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed pl-6 border-l-4 border-accent">
                  {step.desc}
                </p>

                {/* 移动端视觉反馈 */}
                <div className="lg:hidden w-full aspect-video rounded-3xl overflow-hidden relative border border-border/40 mt-8 shadow-lg">
                   {step.images.map((imgUrl, iIndex) => (
                      <div
                        key={`mob-${index}-${iIndex}`}
                        className={cn(
                          "absolute inset-0 transition-opacity duration-1000",
                          activeStep === index && subImageIndex === iIndex ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <Image
                          src={imgUrl}
                          alt={step.label}
                          fill
                          className="object-cover"
                          unoptimized={imgUrl.startsWith('data:')}
                        />
                      </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>
    </section>
  );
}
