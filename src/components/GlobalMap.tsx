
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Locale } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { getAssetUrl } from '@/lib/image-utils';
import { MapPin, Building2, Factory, Microscope, Globe, Loader2 } from "lucide-react";
import { useTranslations } from '@/hooks/use-translations';

interface GlobalMapProps {
  locale: Locale;
  homeConfig?: any;
  isLoading?: boolean;
}

export function GlobalMap({ locale, homeConfig, isLoading }: GlobalMapProps) {
  const { t: lt } = useTranslations(locale);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // 映射图标逻辑
  const getIcon = (type: string) => {
    switch (type) {
      case 'HQ': return Building2;
      case 'R&D': return Microscope;
      case 'Factory': return Factory;
      case 'Global': return Globe;
      default: return MapPin;
    }
  };

  // 动态标题与副标题解析 - 采用 0 硬编码逻辑
  const displayTitle = useMemo(() => {
    // 1. 优先使用后台配置的特定翻译 ID
    const customId = homeConfig?.mapTitleTextId;
    const tr = customId ? lt(customId) : lt('MAP_TITLE');
    if (tr && tr.trim() !== '') return tr;

    // 2. 其次使用后台直填的文案
    const zh = homeConfig?.mapTitleZh;
    const en = homeConfig?.mapTitleEn;
    const config = locale === 'zh' ? zh : en;
    if (config && config.trim() !== '') return config;

    return null;
  }, [homeConfig, locale, lt]);

  const displaySubtitle = useMemo(() => {
    const customId = homeConfig?.mapSubtitleTextId;
    const tr = customId ? lt(customId) : lt('MAP_SUBTITLE');
    if (tr && tr.trim() !== '') return tr;

    const zh = homeConfig?.mapSubtitleZh;
    const en = homeConfig?.mapSubtitleEn;
    const config = locale === 'zh' ? zh : en;
    if (config && config.trim() !== '') return config;

    return null;
  }, [homeConfig, locale, lt]);

  // 优先使用后台配置的 locations，无硬编码兜底
  const pins = useMemo(() => {
    const rawLocations = homeConfig?.locations || [];
    if (rawLocations.length === 0) return [];

    return rawLocations.map((loc: any) => {
      const getLocalized = (textId: string | null | undefined, zh: string, en: string) => {
        const translated = textId ? lt(textId) : undefined;
        if (translated && translated.trim() !== '') return translated;
        
        const direct = locale === 'zh' ? zh : en;
        if (direct && direct.trim() !== '') return direct;
        
        return (locale === 'zh' ? en : zh) || '';
      };

      return {
        key: loc.id,
        style: { top: loc.posTop, left: loc.posLeft },
        type: loc.type,
        icon: getIcon(loc.type),
        title: getLocalized(loc.titleTextId, loc.titleZh, loc.titleEn),
        address: getLocalized(loc.addressTextId, loc.addressZh, loc.addressEn),
        desc: getLocalized(loc.descTextId, loc.descZh, loc.descEn),
        imageUrl: loc.imageUrl
      };
    });
  }, [homeConfig, locale, lt]);

  // 如果没有配置地点且不是加载中，直接不渲染整个板块
  if (!isLoading && pins.length === 0) return null;

  return (
    <section id="global" ref={sectionRef} className="py-24 bg-white overflow-hidden relative min-h-[400px]">
      {isLoading ? (
        <div className="container mx-auto px-6 flex items-center justify-center py-40">
          <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />
        </div>
      ) : (
        <div className="container mx-auto px-6">
          {displayTitle && (
            <SectionHeading title={displayTitle} subtitle={displaySubtitle || undefined} />
          )}

          <div className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start transition-all duration-1000 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          )}>
            {pins.map((pin: any) => (
              <div
                key={`card-${pin.key}`}
                onMouseEnter={() => setActiveLocation(pin.key)}
                onMouseLeave={() => setActiveLocation(null)}
                style={{ maskImage: 'radial-gradient(white, black)' }}
                className={cn(
                  "group relative h-[240px] rounded-[2rem] border border-border/40 overflow-hidden transition-all duration-700 cursor-pointer shadow-xl transform-gpu isolate",
                  activeLocation === pin.key ? "shadow-primary/30 -translate-y-2 scale-[1.03] z-10" : "hover:border-primary/30"
                )}
              >
                {/* 背景图片 */}
                <div className="absolute inset-0 z-0 transition-transform duration-1000 group-hover:scale-110 overflow-hidden rounded-[2rem]">
                  {pin.imageUrl ? (
                    <>
                      <img 
                        src={getAssetUrl(pin.imageUrl)} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      {/* 仅在有图时提供一个统一的微弱暗化，代替渐变 */}
                      <div className="absolute inset-0 bg-slate-950/20" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-50 border-inner" />
                  )}
                  
                  <div className={cn(
                    "absolute inset-0 bg-primary/10 transition-opacity duration-700",
                    activeLocation === pin.key ? "opacity-100" : "opacity-0"
                  )} />
                </div>

                {/* 内容区域 */}
                <div className="relative z-10 h-full p-8 flex flex-col justify-between items-start">
                  {/* 左上角主要信息 */}
                  <div className="space-y-3 max-w-[80%]">
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                      pin.imageUrl 
                        ? "bg-white/10 text-white/80 border border-white/20 backdrop-blur-md"
                        : "bg-primary/5 text-primary border border-primary/10"
                    )}>
                      <pin.icon className="h-3 w-3" />
                      {pin.type}
                    </div>
                    
                    <div className="space-y-1.5">
                      <h4 className={cn(
                        "font-headline font-bold text-xl leading-tight tracking-tight transition-colors duration-500",
                        pin.imageUrl ? "text-white" : "text-primary"
                      )}>
                        {pin.title}
                      </h4>
                      <p className={cn(
                        "text-[10px] font-medium leading-relaxed line-clamp-1 transition-colors duration-500",
                        pin.imageUrl ? "text-white/50" : "text-primary/40"
                      )}>
                        {pin.address}
                      </p>
                    </div>

                    <div className={cn(
                      "pt-3 border-t overflow-hidden transition-all duration-500",
                      pin.imageUrl ? "border-white/10" : "border-primary/5",
                      activeLocation === pin.key ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <p className={cn(
                        "text-[10px] leading-relaxed font-medium italic line-clamp-2",
                        pin.imageUrl ? "text-white/70" : "text-primary/60"
                      )}>
                        {pin.desc}
                      </p>
                    </div>
                  </div>

                  {/* 右下角全屏/查看按钮 - 默认隐藏 */}
                  <div className={cn(
                    "absolute bottom-6 right-6 transition-all duration-500 transform-gpu",
                    activeLocation === pin.key ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90"
                  )}>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl backdrop-blur-2xl border transition-all duration-500 flex items-center justify-center group/btn shadow-xl bg-primary/20 text-white border-white/20"
                    )}>
                      <div className={cn(
                        "transition-all duration-500 transform-gpu",
                        activeLocation === pin.key ? "scale-[1.3]" : "scale-100"
                      )}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
