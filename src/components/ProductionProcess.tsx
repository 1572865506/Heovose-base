
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Play, Pause, Loader2, X, Maximize } from "lucide-react";
import { getAssetUrl } from '@/lib/image-utils';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useTranslations } from '@/hooks/use-translations';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

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
  const [activeStep, setActiveStep] = useState(0);
  const [carouselState, setCarouselState] = useState({ subIndex: 0, progress: 0 });
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const AUTOPLAY_DELAY = 4000;

  // 1. 获取数据 - 改为默认开启预加载，不再等待进入视口
  const { data: remoteSteps, isLoading } = useLocalCollection<StepData>('productionSteps', { enabled: true });
  const { data: homeContent } = useLocalDoc<any>('homepageContent', 'hero', { enabled: true });

  const { t } = useTranslations(locale);

  // 2. 转换数据
  const steps = useMemo(() => {
    if (remoteSteps && remoteSteps.length > 0) {
      return remoteSteps.map(s => {
        // 优先使用翻译 ID，如果没有则回退到 titleZh/titleEn
        const label = (s as any).titleTextId ? t((s as any).titleTextId) : (locale === 'zh' ? s.titleZh : s.titleEn);
        const desc = (s as any).descriptionTextId ? t((s as any).descriptionTextId) : (locale === 'zh' ? s.descZh : s.descEn);
        
        return {
          label: label || (locale === 'zh' ? s.titleZh : s.titleEn),
          tag: s.order < 10 ? `0${s.order}` : `${s.order}`,
          images: s.imageUrls || [],
          desc: desc || (locale === 'zh' ? s.descZh : s.descEn)
        };
      });
    }
    // 回退到 translations.ts 中的硬编码步骤
    const localSteps = (translations[locale].process as any).steps || [];
    return localSteps.map((s: any, idx: number) => ({
      label: s.title,
      desc: s.desc,
      tag: (idx + 1) < 10 ? `0${idx + 1}` : `${idx + 1}`,
      images: []
    }));
  }, [remoteSteps, locale, t]);

  const displayTitle = useMemo(() => {
    // 优先从翻译资产获取 (Zero-Hardcoding 体系)
    const translated = t('PROCESS_TITLE');
    
    // 如果翻译资产存在 (包括空字符串)，则返回翻译资产内容
    // 只有在 translated 为 undefined (即 key 不存在) 时才回退
    return translated ?? (locale === 'zh' ? homeContent?.processTitleZh : homeContent?.processTitleEn) ?? translations[locale].process.title;
  }, [homeContent, locale, t]);

  const displaySubtitle = useMemo(() => {
    // 优先从翻译资产获取
    const translated = t('PROCESS_SUBTITLE');
    
    return translated ?? (locale === 'zh' ? homeContent?.processSubtitleZh : homeContent?.processSubtitleEn) ?? translations[locale].process.subtitle;
  }, [homeContent, locale, t]);

  // 3. 观察可见性 - 提前 800px 触发渲染，确保滚动到时已经完全加载
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.05, rootMargin: '800px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 4. 观察滚动位置
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    scrollRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => { if (entry.isIntersecting) setActiveStep(index); },
          { threshold: 0.1, rootMargin: "-10% 0px -10% 0px" }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });
    return () => observers.forEach(o => o.disconnect());
  }, [steps]);

  // 5. 轮播逻辑
  const imageSegments = useMemo(() => {
    const segments: { start: number, end: number, images: string[] }[] = [];
    let currentSegment: { start: number, end: number, images: string[] } | null = null;
      steps.forEach((step: any, index: number) => {
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

  const activeImages = useMemo(() => steps[activeStep]?.images || [], [steps, activeStep]);
  const imagesKey = useMemo(() => JSON.stringify(activeImages), [activeImages]);
  const imagesRef = useRef(activeImages);
  const keyRef = useRef(imagesKey);

  useEffect(() => { imagesRef.current = activeImages; }, [activeImages]);

  useEffect(() => {
    if (!isPlaying || !isVisible) return;
    let lastTick = Date.now();
    let timerId: NodeJS.Timeout;
    const tick = () => {
      const now = Date.now();
      const delta = now - lastTick;
      lastTick = now;
      setCarouselState((prev) => {
        if (keyRef.current !== imagesKey) {
          keyRef.current = imagesKey;
          return { subIndex: 0, progress: 0 };
        }
        const len = imagesRef.current.length;
        if (len <= 1) return { subIndex: 0, progress: 0 };
        const increment = (delta / AUTOPLAY_DELAY) * 100;
        const nextProgress = prev.progress + increment;
        if (nextProgress >= 100) return { subIndex: (prev.subIndex + 1) % len, progress: 0 };
        return { ...prev, progress: nextProgress };
      });
      timerId = setTimeout(tick, 50);
    };
    timerId = setTimeout(tick, 50);
    return () => clearTimeout(timerId);
  }, [imagesKey, isPlaying, isVisible]);

  const subImageIndex = carouselState.subIndex;
  const progress = carouselState.progress;

  // 渲染逻辑拆分
  const renderLoading = () => (
    <div className="container mx-auto px-6">
      <div className="py-40 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">同步精密制造流程中...</p>
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div className="container mx-auto px-6">
      <div className="py-40 flex flex-col items-center justify-center opacity-0"></div>
    </div>
  );

  const renderContent = () => (
    <div className="container mx-auto px-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative">
        <div className="lg:col-span-7 lg:sticky lg:top-32 h-fit space-y-16 pb-12">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-slate-900 tracking-tight leading-none">
              {displayTitle}
            </h2>
            {displaySubtitle && (
              <p className="text-lg md:text-xl text-slate-400 font-medium transition-all duration-700">
                {displaySubtitle}
              </p>
            )}
          </div>

          <div className="hidden lg:block relative group">
            <div className={cn(
              "relative h-[60vh] min-h-[450px] max-h-[700px] overflow-hidden shadow-2xl transition-all duration-500 rounded-[3rem] lg:-ml-12 lg:w-[calc(100%+3rem)] will-change-transform"
            )}>
              {imageSegments.map((segment, segIndex) => {
                const isSegmentActive = activeStep >= segment.start && activeStep <= segment.end;
                return (
                  <div key={`seg-img-${segIndex}`} className={cn("absolute inset-0 transition-opacity duration-1000 ease-in-out", isSegmentActive ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none")}>
                    {segment.images.map((imgUrl, iIndex) => {
                      const isVisibleSub = isSegmentActive && (segment.images.length > 1 ? subImageIndex === iIndex : iIndex === 0);
                      return (
                        <div key={`${segIndex}-${iIndex}-${imgUrl}`} className={cn("absolute inset-0 transition-opacity duration-1000 ease-in-out will-change-[opacity,transform] cursor-fullscreen", isVisibleSub ? "opacity-100" : "opacity-0")} onClick={() => setSelectedImage(imgUrl)} style={{ zIndex: isVisibleSub ? 20 : 10, transform: 'translateZ(0)' }}>
                          <Image src={getAssetUrl(imgUrl)} alt="Process Detail" fill className="object-cover" unoptimized={imgUrl.startsWith('data:')} />
                        </div>
                      );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                  </div>
                );
              })}

              {activeImages.length > 1 && (
                <div className="absolute bottom-4 right-4 lg:bottom-8 lg:right-8 z-50 flex items-center gap-3 lg:gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-default">
                  <div className="flex gap-1.5 items-center">
                    {activeImages.map((_: any, i: number) => (
                      <button 
                        key={i} 
                        onClick={() => setCarouselState({ subIndex: i, progress: 0 })} 
                        className={cn(
                          "relative h-1 rounded-full transition-all duration-500 overflow-hidden bg-white/30", 
                          i === subImageIndex ? "w-6 lg:w-8" : "w-1.5 lg:w-2 hover:bg-white/50"
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
                    className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground transition-all shadow-lg border border-white/10"
                  >
                    {isPlaying ? <Pause className="h-4 w-4 lg:h-5 lg:w-5" /> : <Play className="h-4 w-4 lg:h-5 lg:w-5 ml-0.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-[60vh] pt-12 lg:pt-[40vh] pb-[60vh]">
          {steps.map((step: any, index: number) => (
            <div key={index} ref={(el) => { scrollRefs.current[index] = el; }} className={cn("relative transition-all duration-1000 pl-4 lg:pl-0 min-h-[30vh] flex flex-col justify-center", activeStep === index ? "opacity-100" : "opacity-10")}>
              <span className={cn("absolute -left-12 -top-12 text-[15rem] font-black pointer-events-none select-none transition-all duration-1000 font-headline leading-none", activeStep === index ? "text-primary/[0.08] translate-y-0 scale-100 opacity-100" : "text-slate-200/0 translate-y-20 scale-90 opacity-0")}>
                {step.tag}
              </span>
              <div className="relative z-10 space-y-8">
                <h3 className={cn("text-4xl lg:text-5xl font-headline font-bold text-slate-900 tracking-tight transition-all duration-700", activeStep === index ? "translate-x-0" : "-translate-x-4")}>
                  {step.label}
                </h3>
                <div className={cn("flex gap-6 transition-all duration-1000 delay-100", activeStep === index ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
                  <div className="w-1.5 h-auto bg-accent/40 rounded-full shrink-0" />
                  <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl">{step.desc}</p>
                </div>
              </div>
              <div className="lg:hidden w-full aspect-video rounded-3xl overflow-hidden relative border border-border/40 mt-8 shadow-lg">
                {step.images.map((imgUrl: string, iIndex: number) => (
                  <div key={`mob-${index}-${iIndex}`} className={cn("absolute inset-0 transition-opacity duration-1000 cursor-fullscreen", activeStep === index && subImageIndex === iIndex ? "opacity-100" : "opacity-0")} onClick={() => setSelectedImage(imgUrl)}>
                    <Image src={getAssetUrl(imgUrl)} alt={step.label} fill className="object-cover" unoptimized={imgUrl.startsWith('data:')} />
                  </div>
                ))}
                {/* 移动端轮播控制 */}
                {step.images.length > 1 && activeStep === index && (
                  <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2 animate-in fade-in duration-500">
                    <div className="flex gap-1 items-center">
                      {step.images.map((_: any, i: number) => (
                        <div key={i} className={cn("h-0.5 rounded-full bg-white/30 overflow-hidden transition-all duration-500", i === subImageIndex ? "w-4" : "w-1")}>
                          {i === subImageIndex && <div className="h-full bg-accent origin-left" style={{ width: isPlaying ? `${progress}%` : '100%' }} />}
                        </div>
                      ))}
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-7 h-7 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center text-white border border-white/10">
                      {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <section id="process" ref={sectionRef} className="pt-16 pb-24 lg:py-32 bg-white relative overflow-x-clip min-h-[400px]">
      {isLoading ? renderLoading() : (steps.length > 0 ? renderContent() : renderPlaceholder())}

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none [&>button:last-child]:hidden">
          <VisuallyHidden><DialogHeader><DialogTitle>查看大图</DialogTitle></DialogHeader></VisuallyHidden>
          <div className="relative w-full h-[90vh] flex items-center justify-center group">
            {selectedImage && (
              <div className="relative w-full h-full animate-in zoom-in-95 fade-in duration-300 ease-out" onClick={() => setSelectedImage(null)}>
                <Image src={getAssetUrl(selectedImage)} alt="Enlarged View" fill className="object-contain cursor-zoom-out-custom" unoptimized={selectedImage.startsWith('data:')} />
              </div>
            )}
            <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all border border-white/10 z-50">
              <X className="h-6 w-6" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
