
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { Play, Pause, Loader2, X, Globe } from "lucide-react";
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);
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

  const displayTitle = useMemo(() => {
    const translated = t('PROCESS_TITLE');
    return translated || (locale === 'zh' ? homeContent?.processTitleZh : homeContent?.processTitleEn) || "";
  }, [homeContent, locale, t]);

  const displaySubtitle = useMemo(() => {
    const translated = t('PROCESS_SUBTITLE');
    return translated || (locale === 'zh' ? homeContent?.processSubtitleZh : homeContent?.processSubtitleEn) || "";
  }, [homeContent, locale, t]);

  // 利用 requestAnimationFrame 实现阻尼渐变减速滚动效果（对齐证书墙做法）
  useEffect(() => {
    if (steps.length === 0) return;
    const targetSpeed = isHovered ? 0.25 : 1.2;
    let frameId: number;

    const animate = () => {
      // 阻尼缓动过渡当前速度
      speedRef.current += (targetSpeed - speedRef.current) * 0.08;
      offsetRef.current -= speedRef.current;

      if (trackRef.current) {
        // 卡片三倍排布保证无缝
        const trackWidth = trackRef.current.scrollWidth / 3;
        if (trackWidth > 0 && Math.abs(offsetRef.current) >= trackWidth) {
          offsetRef.current = 0;
        }
        trackRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      }

      frameId = requestAnimationFrame(animate);
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [isHovered, steps]);

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

  // 渲染跑马灯小卡片列表（复制多组以确保无缝无限循环）
  const renderMarquee = () => {
    // 复制 3 次以确保在超宽屏下也不会出现断裂
    const duplicatedSteps = [...steps, ...steps, ...steps];

    return (
      <div className="relative w-full overflow-hidden py-6">
        {/* 左侧边缘渐消遮罩 */}
        <div className="absolute left-0 top-0 bottom-0 w-[8vw] lg:w-[15vw] bg-gradient-to-r from-white via-white/80 to-transparent pointer-events-none z-20" />
        {/* 右侧边缘渐消遮罩 */}
        <div className="absolute right-0 top-0 bottom-0 w-[8vw] lg:w-[15vw] bg-gradient-to-l from-white via-white/80 to-transparent pointer-events-none z-20" />

        {/* 跑马灯滚动轨道 */}
        <div
          ref={trackRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="flex flex-row gap-6 w-max py-4 will-change-transform"
        >
          {duplicatedSteps.map((step: any, index: number) => {
            const previewImage = step.images[0] || '';
            return (
              <div
                key={`${step.tag}-${index}`}
                className="w-[280px] sm:w-[320px] bg-white rounded-3xl border border-slate-100/80 shadow-lg shadow-slate-100/50 overflow-hidden flex flex-col group cursor-pointer hover:shadow-xl hover:border-slate-200/50 transition-all duration-500"
                onClick={() => previewImage && setSelectedImage(previewImage)}
              >
                {/* 卡片图片区 */}
                <div className="h-44 sm:h-48 w-full relative overflow-hidden bg-slate-100">
                  {previewImage ? (
                    <Image
                      src={getAssetUrl(previewImage)}
                      alt={step.label}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      unoptimized={previewImage.startsWith('data:')}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-slate-50">
                      {t('PROCESS_NO_IMAGE')}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>

                {/* 卡片文本区 */}
                <div className="p-6 flex flex-col justify-between flex-grow space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] uppercase tracking-wider">
                        {t('PROCESS_STEP')} {step.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-headline font-bold text-slate-900 tracking-tight leading-snug group-hover:text-primary transition-colors">
                      {step.label}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed line-clamp-3">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
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

      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && setSelectedImage(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 border-none bg-transparent shadow-none [&>button:last-child]:hidden">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle>
                {t('PROCESS_VIEW_LARGE')}
              </DialogTitle>
            </DialogHeader>
          </VisuallyHidden>
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
