"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 1. 获取数据
  const { data: remoteCases, isLoading } = useLocalCollection<RemoteCase>('caseStudies', { enabled: isVisible });
  const { data: homeConfig } = useLocalDoc<any>('homepageContent', 'hero', { enabled: isVisible });

  // 2. 标题与副标题逻辑 (对接后台配置 - 严格尊重空值)
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
      { image: PlaceHolderImages.find(i=>i.id==='case-retail')?.imageUrl || '', text: t.retail.title, tag: t.tags.retail, description: t.retail.desc },
      { image: PlaceHolderImages.find(i=>i.id==='case-factory')?.imageUrl || '', text: t.industry.title, tag: t.tags.industry, description: t.industry.desc },
      { image: PlaceHolderImages.find(i=>i.id==='case-office')?.imageUrl || '', text: t.office.title, tag: t.tags.office, description: t.office.desc },
      { image: PlaceHolderImages.find(i=>i.id==='case-transport')?.imageUrl || '', text: t.transport.title, tag: t.tags.transport, description: t.transport.desc },
    ];
  }, [remoteCases, locale, lt, t]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { 
        console.log('CaseStudies Visibility:', entry.isIntersecting);
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 如果正在加载且没有兜底数据，可以显示一个占位高度
  if (isLoading && !remoteCases) {
    return <section ref={sectionRef} className="py-32 min-h-[600px]" />;
  }

  return (
    <section id="cases" ref={sectionRef} className="relative pt-32 bg-background overflow-hidden min-h-[600px]">
      <div className="container mx-auto px-6 mb-16 relative z-10 text-center lg:text-left">
        <SectionHeading 
          title={displayTitle} 
          subtitle={displaySubtitle} 
          className="max-w-xl mx-auto lg:mx-0" 
        />
      </div>

      <div className={cn("relative w-full z-10 transition-all duration-1000", isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20")}>
        <div style={{ height: '700px', position: 'relative' }}>
          {isVisible && cases.length > 0 && (
            <CircularGallery 
              items={cases}
              bend={3} 
              textColor="#ffffff" 
              borderRadius={0.05}
              scrollSpeed={2}
              scrollEase={0.05}
            />
          )}
        </div>
      </div>
    </section>
  );
}

// 辅助函数
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
