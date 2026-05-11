"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Locale, translations } from "@/lib/translations";
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
  const t = translations[locale].cases;
  const { t: lt } = useTranslations(locale);
  const [isNear, setIsNear] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<any>(null);
  const unmountTimer = useRef<NodeJS.Timeout | null>(null);

  // 1. 获取数据 - 仅在接近时(isNear)开启抓取，兼顾性能与加载速度
  const { data: remoteCases } = useLocalCollection<RemoteCase>('caseStudies', { enabled: isNear });
  const { data: homeConfig } = useLocalDoc<any>('homepageContent', 'hero', { enabled: isNear });
  const displayTitle = useMemo(() => {
    const tr = lt('CASES_TITLE');
    if (tr !== undefined && tr !== null) return tr;

    // 如果后台有配置（即使是空字符串），则使用后台配置
    const zh = homeConfig?.casesTitleZh;
    const en = homeConfig?.casesTitleEn;
    const config = locale === 'zh' ? zh : en;

    if (config !== undefined && config !== null) return config;

    // 只有在完全没有配置时才使用兜底
    return t.title;
  }, [homeConfig, locale, lt, t]);

  const displaySubtitle = useMemo(() => {
    const tr = lt('CASES_SUBTITLE');
    if (tr !== undefined && tr !== null) return tr;

    const zh = homeConfig?.casesSubtitleZh;
    const en = homeConfig?.casesSubtitleEn;
    const config = locale === 'zh' ? zh : en;

    if (config !== undefined && config !== null) return config;

    return t.subtitle;
  }, [homeConfig, locale, lt, t]);

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

    // 兜底数据
    return [
      { image: PlaceHolderImages.find(i => i.id === 'case-retail')?.imageUrl || '', text: t.retail.title, tag: t.tags.retail, description: t.retail.desc },
      { image: PlaceHolderImages.find(i => i.id === 'case-factory')?.imageUrl || '', text: t.industry.title, tag: t.tags.industry, description: t.industry.desc },
      { image: PlaceHolderImages.find(i => i.id === 'case-office')?.imageUrl || '', text: t.office.title, tag: t.tags.office, description: t.office.desc },
      { image: PlaceHolderImages.find(i => i.id === 'case-transport')?.imageUrl || '', text: t.transport.title, tag: t.tags.transport, description: t.transport.desc },
    ];
  }, [remoteCases, locale, lt, t]);

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

  return (
    <section id="cases" ref={sectionRef} className="relative pt-24 lg:pt-32 bg-background overflow-hidden min-h-[600px]">
      <div className="container mx-auto px-6 mb-4 relative z-10 text-center lg:text-left">
        <SectionHeading
          title={displayTitle}
          subtitle={displaySubtitle}
          className="max-w-xl mx-auto lg:mx-0"
        />
      </div>

      <div className={cn("relative w-full z-10 transition-opacity duration-700", isVisible ? "opacity-100" : "opacity-0")}>
        <div className="h-[600px] lg:h-[800px] relative lg:-mt-24">
          {isRendered && cases.length > 0 && (
            <CircularGallery
              ref={galleryRef}
              items={cases}
              bend={3}
              textColor="#ffffff"
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
            />
          )}
        </div>

        {/* Navigation Buttons - More prominent on mobile */}
        <div className="flex justify-center items-center gap-6 mt-2 pb-12 relative z-20">
          <button
            onClick={() => galleryRef.current?.prev()}
            className="w-14 h-14 rounded-full bg-slate-100/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
            aria-label="Previous case"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            onClick={() => galleryRef.current?.next()}
            className="w-14 h-14 rounded-full bg-slate-100/90 backdrop-blur-md border border-slate-200 flex items-center justify-center text-slate-900 hover:bg-slate-200 transition-all active:scale-95 shadow-lg"
            aria-label="Next case"
          >
            <ChevronRight size={28} />
          </button>
        </div>
      </div>
    </section>
  );
}

// 辅助函数
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
