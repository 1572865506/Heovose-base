
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Play, Pause, Loader2, X, Globe, ChevronRight, ChevronLeft } from "lucide-react";
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

// 引入 GSAP 相关依赖
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// 注册 GSAP 插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface StepData {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  imageUrls: string[];
}

import { SectionHeading } from "./SectionHeading";

export function ProductionProcess({ locale }: { locale: Locale }) {
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isHovered, setIsHovered] = useState(false);

  // 双跑马灯轨道 refs 与 offsets
  const trackRefImages = useRef<HTMLDivElement>(null);
  const trackRefTexts = useRef<HTMLDivElement>(null);
  const offsetImagesRef = useRef(0);
  const offsetTextsRef = useRef(0);
  const speedRef = useRef(1.2);

  // 获取步骤数据与首页配置
  const { data: remoteSteps, isLoading } = useLocalCollection<StepData>('productionSteps', { enabled: true });
  const { data: homeContent } = useLocalDoc<any>('homepageContent', 'hero', { enabled: true });

  const { t } = useTranslations(locale);

  // 转换数据格式
  const steps = useMemo(() => {
    if (remoteSteps && remoteSteps.length > 0) {
      return remoteSteps.map(s => {
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
    return [];
  }, [remoteSteps, locale, t]);

  // 提取全部图片并建立所属步骤映射（并进行 URL 去重）
  const uniqueImages = useMemo(() => {
    const list: { url: string; stepIndex: number; imageIndex: number }[] = [];
    const seen = new Set<string>();
    steps.forEach((step, sIdx) => {
      step.images.forEach((img, imgIdx) => {
        if (img && !seen.has(img)) {
          seen.add(img);
          list.push({
            url: img,
            stepIndex: sIdx,
            imageIndex: imgIdx
          });
        }
      });
    });
    return list;
  }, [steps]);

  const displayTitle = useMemo(() => {
    const translated = t('PROCESS_TITLE');
    return translated || (locale === 'zh' ? homeContent?.processTitleZh : homeContent?.processTitleEn) || "";
  }, [homeContent, locale, t]);

  const displaySubtitle = useMemo(() => {
    const translated = t('PROCESS_SUBTITLE');
    return translated || (locale === 'zh' ? homeContent?.processSubtitleZh : homeContent?.processSubtitleEn) || "";
  }, [homeContent, locale, t]);

  // 使用 Ref 同步 hover 状态，避免 hover 时反复销毁重建动画 loop 导致微卡顿
  const isHoveredRef = useRef(isHovered);
  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  // 缓存滚动轨道的宽度，避免在 animate() 中每帧调用 .scrollWidth 触发 forced reflow (Layout Thrashing)
  const scrollWidthImagesRef = useRef(0);
  const scrollWidthTextsRef = useRef(0);

  useEffect(() => {
    if (isLoading || steps.length === 0) return;

    const measureWidths = () => {
      if (trackRefImages.current) {
        scrollWidthImagesRef.current = trackRefImages.current.scrollWidth / 3;
      }
      if (trackRefTexts.current) {
        scrollWidthTextsRef.current = trackRefTexts.current.scrollWidth / 3;
      }
    };

    // 延迟测量，确保布局和图片完全渲染
    const timer = setTimeout(measureWidths, 500);

    // 监听窗口大小变化重新测量
    window.addEventListener('resize', measureWidths);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measureWidths);
    };
  }, [isLoading, steps.length, uniqueImages.length]);

  // 双跑马灯视差滚动逻辑
  useEffect(() => {
    if (isLoading || steps.length === 0) return;
    let frameId: number;

    const animate = () => {
      const targetSpeed = isHoveredRef.current ? 0.25 : 1.2;
      speedRef.current += (targetSpeed - speedRef.current) * 0.08;

      // 图片跑马灯滚动（稍快，1.35x，使用 translate3d 开启 GPU 硬件加速）
      if (trackRefImages.current && scrollWidthImagesRef.current > 0) {
        offsetImagesRef.current -= speedRef.current * 1.35;
        if (Math.abs(offsetImagesRef.current) >= scrollWidthImagesRef.current) {
          offsetImagesRef.current = 0;
        }
        trackRefImages.current.style.transform = `translate3d(${offsetImagesRef.current}px, 0, 0)`;
      }

      // 文本跑马灯滚动（标准，0.95x，使用 translate3d 开启 GPU 硬件加速）
      if (trackRefTexts.current && scrollWidthTextsRef.current > 0) {
        offsetTextsRef.current -= speedRef.current * 0.95;
        if (Math.abs(offsetTextsRef.current) >= scrollWidthTextsRef.current) {
          offsetTextsRef.current = 0;
        }
        trackRefTexts.current.style.transform = `translate3d(${offsetTextsRef.current}px, 0, 0)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    // 延时 100ms 启动，确保 DOM 节点尺寸计算稳定
    const startTimeout = setTimeout(() => {
      frameId = requestAnimationFrame(animate);
    }, 100);

    return () => {
      clearTimeout(startTimeout);
      cancelAnimationFrame(frameId);
    };
  }, [isLoading, steps.length]);

  const renderLoading = () => (
    <div className="container mx-auto px-6">
      <div className="py-24 flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-30" />
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">
          {t('PROCESS_LOADING')}
        </p>
      </div>
    </div>
  );

  const renderPlaceholder = () => (
    <div className="container mx-auto px-6">
      <div className="py-24 flex flex-col items-center justify-center opacity-0"></div>
    </div>
  );

  const renderMarquee = () => {
    const duplicatedImages = [...uniqueImages, ...uniqueImages, ...uniqueImages];
    const duplicatedSteps = [...steps, ...steps, ...steps];

    return (
      <div className="relative w-full overflow-hidden py-10 flex flex-col gap-12 select-none">
        {/* 第一行：图片流动线 */}
        {uniqueImages.length > 0 && (
          <div className="relative w-full overflow-hidden">
            <div
              ref={trackRefImages}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className="flex flex-row gap-6 w-max py-6 px-4 will-change-transform"
            >
              {duplicatedImages.map((item, index) => (
                <div
                  key={`img-${item.url}-${index}`}
                  className="w-[200px] h-[130px] sm:w-[240px] sm:h-[160px] rounded-[2rem] overflow-hidden border border-slate-100/80 shadow-lg shadow-slate-100/50 hover:shadow-xl hover:border-slate-200/50 transition-all duration-500 relative group cursor-pointer bg-slate-50 shrink-0"
                  onClick={() => {
                    setActiveStepIndex(item.stepIndex);
                    setActiveImageIndex(item.imageIndex);
                  }}
                >
                  <Image
                    src={getAssetUrl(item.url)}
                    alt="Production process detail"
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    unoptimized={item.url.startsWith('data:')}
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 第二行：步骤文本引导线 */}
        <div className="relative w-full overflow-hidden">
          <div
            ref={trackRefTexts}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="flex flex-row gap-6 w-max py-6 px-4 will-change-transform items-center"
          >
            {duplicatedSteps.map((step: any, index: number) => {
              const stepIndex = index % steps.length;
              const isLastStep = stepIndex === steps.length - 1;

              return (
                <div key={`txt-${step.tag}-${index}`} className="flex items-center gap-6 shrink-0">
                  <div
                    className="w-[250px] sm:w-[290px] bg-white rounded-[2rem] border border-slate-100/80 shadow-lg shadow-slate-100/40 p-6 flex flex-col justify-between space-y-4 hover:shadow-xl hover:border-slate-200/45 transition-all duration-500 group cursor-pointer"
                    onClick={() => {
                      setActiveStepIndex(stepIndex);
                      setActiveImageIndex(0);
                    }}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                          {t('PROCESS_STEP')} {step.tag}
                        </span>
                      </div>
                      <h3 className="text-sm sm:text-base font-headline font-bold text-slate-900 tracking-tight leading-snug group-hover:text-primary transition-colors truncate">
                        {step.label}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium leading-relaxed line-clamp-2">
                        {step.desc}
                      </p>
                    </div>
                  </div>

                  {/* 引导箭头或首尾循环分割线 */}
                  {isLastStep ? (
                    <div className="flex flex-col items-center justify-center px-4 self-stretch shrink-0">
                      <div className="h-16 w-px border-l-2 border-dashed border-slate-300" />
                      <span className="text-[8px] font-black text-slate-450 uppercase tracking-[0.25em] mt-3 whitespace-nowrap">
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center shrink-0 w-8">
                      <div className="h-[2px] w-8 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                          <ChevronRight className="h-3 w-3 text-primary/60 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="process" className="bg-white py-20 relative overflow-hidden">
      {/* 静态标题区域 */}
      <div className="container mx-auto px-6 text-center">
        <SectionHeading
          title={displayTitle}
          subtitle={displaySubtitle || undefined}
          centered={true}
        />
      </div>

      {/* 自动滚动卡片轨道 */}
      <div className="w-full">
        {isLoading ? renderLoading() : (steps.length > 0 ? renderMarquee() : renderPlaceholder())}
      </div>

      <Dialog open={activeStepIndex !== null} onOpenChange={(open) => { if (!open) { setActiveStepIndex(null); setActiveImageIndex(0); } }}>
        {(() => {
          const activeStep = activeStepIndex !== null ? steps[activeStepIndex] : null;
          const activeImages = activeStep?.images || [];
          const currentImage = activeImages[activeImageIndex] || '';

          return (
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none [&>button:last-child]:hidden select-none">
              <VisuallyHidden>
                <DialogHeader>
                  <DialogTitle>
                    {t('PROCESS_VIEW_LARGE')}
                  </DialogTitle>
                </DialogHeader>
              </VisuallyHidden>
              <div className="relative w-full h-[90vh] flex items-center justify-center group">
                {currentImage && (
                  <div className="relative w-full h-full animate-in zoom-in-95 fade-in duration-300 ease-out" onClick={() => { setActiveStepIndex(null); setActiveImageIndex(0); }}>
                    <Image src={getAssetUrl(currentImage)} alt="Enlarged View" fill className="object-contain cursor-zoom-out-custom" unoptimized={currentImage.startsWith('data:')} />
                  </div>
                )}
                <button onClick={() => { setActiveStepIndex(null); setActiveImageIndex(0); }} className="absolute top-4 right-4 w-12 h-12 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-all border border-white/10 z-50">
                  <X className="h-6 w-6" />
                </button>

                {activeImages.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50 bg-black/45 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/10 shadow-2xl">
                    {/* Left Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === 0 ? activeImages.length - 1 : prev - 1));
                      }}
                      className="text-white/60 hover:text-white hover:scale-110 active:scale-95 transition-all p-1"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="flex gap-2">
                      {activeImages.map((_, i) => (
                        <button
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageIndex(i);
                          }}
                          className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            activeImageIndex === i ? "w-4 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
                          )}
                        />
                      ))}
                    </div>

                    {/* Right Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImageIndex((prev) => (prev === activeImages.length - 1 ? 0 : prev + 1));
                      }}
                      className="text-white/60 hover:text-white hover:scale-110 active:scale-95 transition-all p-1"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </DialogContent>
          );
        })()}
      </Dialog>
    </section>
  );
}
