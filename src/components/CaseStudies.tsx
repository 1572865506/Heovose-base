"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Locale } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useTranslations } from '@/hooks/use-translations';
import { getAssetUrl } from '@/lib/image-utils';
import CircularGallery from './ui/CircularGallery';
import { PlaceHolderImages } from "@/lib/placeholder-images";

interface RemoteCase {
  id: string;
  tagZh: string;
  tagEn: string;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  tagTextId?: string;
  titleTextId?: string;
  descriptionTextId?: string;
  imageUrl: string;
  published?: boolean;
}

export function CaseStudies({ locale }: { locale: Locale }) {
  const { t: lt } = useTranslations(locale);
  const [isNear, setIsNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<any>(null);
  const unmountTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. 获取数据 - 进站即开启抓取，确保锚点跳转时数据完整
  const { data: remoteCases } = useLocalCollection<RemoteCase>('caseStudies');
  const { data: homeConfig } = useLocalDoc<any>('homepageContent', 'hero');
  const displayTitle = useMemo(() => {
    const tr = lt('CASES_TITLE');
    if (tr !== undefined && tr !== null) return tr;

    // 如果后台有配置（即使是空字符串），则使用后台配置
    const zh = homeConfig?.casesTitleZh;
    const en = homeConfig?.casesTitleEn;
    const config = locale === 'zh' ? zh : en;

    if (config !== undefined && config !== null) return config;

    // 只有在完全没有配置时才使用兜底
    return "";
  }, [homeConfig, locale, lt]);

  const displaySubtitle = useMemo(() => {
    const tr = lt('CASES_SUBTITLE');
    if (tr !== undefined && tr !== null) return tr;

    const zh = homeConfig?.casesSubtitleZh;
    const en = homeConfig?.casesSubtitleEn;
    const config = locale === 'zh' ? zh : en;

    if (config !== undefined && config !== null) return config;

    return "";
  }, [homeConfig, locale, lt]);

  // 3. 转换数据并过滤
  const cases = useMemo(() => {
    const rawData = remoteCases || [];
    if (rawData.length > 0) {
      const filtered = rawData.filter(c => c.published !== false);
      if (filtered.length > 0) {
        return filtered.map(c => {
          const getLocalized = (textId: string | null | undefined, zh: string, en: string) => {
            const translated = textId ? lt(textId) : undefined;
            if (translated && translated.trim() !== '') return translated;

            // If translation fails, use the direct field
            const direct = locale === 'zh' ? zh : en;
            if (direct && direct.trim() !== '') return direct;

            // Last resort: use the alternate language field
            return (locale === 'zh' ? en : zh) || '';
          };

          return {
            image: getAssetUrl(c.imageUrl),
            text: getLocalized(c.titleTextId, c.titleZh, c.titleEn),
            tag: getLocalized(c.tagTextId, c.tagZh, c.tagEn),
            description: getLocalized(c.descriptionTextId, c.descZh, c.descEn)
          };
        });
      }
    }

    return [];
  }, [remoteCases, locale, lt]);

  useEffect(() => {
    // Observer 1: For pre-fetching data (Viewport-relative for responsive preloading)
    const dataObserver = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsNear(true); },
      { threshold: 0, rootMargin: '150% 0px' } // 200% of viewport height
    );

    // Observer 2: For rendering and entrance animation
    const renderObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (unmountTimer.current) clearTimeout(unmountTimer.current);
          setIsVisible(true);
          setIsRendered(true);
        } else {
          unmountTimer.current = setTimeout(() => {
            setIsVisible(false);
            setIsRendered(false);
          }, 3000);
        }
      },
      { threshold: 0, rootMargin: '150% 0px' } // 150% of viewport height
    );

    if (sectionRef.current) {
      dataObserver.observe(sectionRef.current);
      renderObserver.observe(sectionRef.current);
    }

    return () => {
      dataObserver.disconnect();
      renderObserver.disconnect();
      if (unmountTimer.current) clearTimeout(unmountTimer.current);
    };
  }, []);

  const [selectedCase, setSelectedCase] = useState<any>(null);

  return (
    <section id="cases" ref={sectionRef} className="relative pt-20 pb-20 lg:pt-24 lg:pb-24 bg-[#FAFAFC] overflow-hidden">
      {/* Google Labs-style fluid background blobs */}
      <div className="absolute left-[5%] top-[15%] w-[450px] h-[450px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '10s' }} />
      <div className="absolute right-[10%] bottom-[5%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse" style={{ animationDuration: '15s' }} />
      
      <div className="container mx-auto px-6 mb-4 relative z-10 text-center lg:text-left">
        <SectionHeading
          title={displayTitle}
          subtitle={displaySubtitle}
          className="max-w-xl mx-auto lg:mx-0"
        />
      </div>

      <div className={cn("relative w-full z-10 transition-opacity duration-700", isVisible ? "opacity-100" : "opacity-0")}>
        {/* 画廊主容器 */}
        <div className="h-[700px] relative -mt-16 lg:-mt-20">
          {isRendered && cases.length > 0 && (
            <CircularGallery
              ref={galleryRef}
              items={cases}
              onItemClick={setSelectedCase}
            />
          )}

          {/* 底部居中导航按钮 */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-6 z-20">
            <button
              onClick={() => galleryRef.current?.prev()}
              className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-slate-100/80 shadow-sm flex items-center justify-center text-slate-800 hover:border-slate-200/80 transition-all duration-300 group"
            >
              <ChevronLeft className="w-6 h-6 group-hover:text-blue-600 transition-colors duration-300" />
            </button>
            <button
              onClick={() => galleryRef.current?.next()}
              className="w-14 h-14 rounded-full bg-white/80 backdrop-blur-md border border-slate-100/80 shadow-sm flex items-center justify-center text-slate-800 hover:border-slate-200/80 transition-all duration-300 group"
            >
              <ChevronRight className="w-6 h-6 group-hover:text-blue-600 transition-colors duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* 详情模态窗 - 优化性能与同步感 */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20",
          selectedCase ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* 背景遮罩：独立控制透明度，并预热滤镜 */}
        <div 
          className={cn(
            "absolute inset-0 bg-slate-950/60 transition-opacity duration-300 ease-out cursor-zoom-out",
            "backdrop-blur-md will-change-[backdrop-filter,opacity]",
            selectedCase ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSelectedCase(null)}
        />
        
        {/* 弹窗主体：稍慢一点的缩放进入，形成层次感 */}
        <div 
          className={cn(
            "relative w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row transition-all duration-500 ease-out transform will-change-transform",
            selectedCase ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
          )}
        >
          {/* 左侧/上方大图 */}
          <div className="w-full lg:w-1/2 h-[300px] lg:h-auto relative overflow-hidden">
            {selectedCase && (
              <img 
                src={selectedCase.image} 
                alt={selectedCase.text} 
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          {/* 右侧内容 */}
          <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-white relative">
            {/* 关闭按钮 */}
            <button 
              onClick={() => setSelectedCase(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <span className="text-2xl leading-none">×</span>
            </button>

            {selectedCase && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  {selectedCase.tag}
                </span>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 leading-tight">
                  {selectedCase.text}
                </h2>
                <div className="w-12 h-1 bg-blue-600 mb-8 rounded-full" />
                <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                  {selectedCase.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// 辅助函数
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
