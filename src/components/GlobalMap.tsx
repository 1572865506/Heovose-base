
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Locale } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { getAssetUrl } from '@/lib/image-utils';
import { MapPin, Building2, Factory, Microscope, Globe, Loader2 } from "lucide-react";
import { useTranslations } from '@/hooks/use-translations';
import { useLocalCollection } from '@/hooks/use-local-collection';

interface GlobalMapProps {
  locale: Locale;
  homeConfig?: any;
  isLoading?: boolean;
}

export function GlobalMap({ locale, homeConfig, isLoading: isConfigLoading }: GlobalMapProps) {
  const { t: lt } = useTranslations(locale);
  const [activeLocation, setActiveLocation] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // 核心修复：直接从 mapLocations 集合读取数据，而不是从 homeConfig 读取
  const { data: remoteLocations, isLoading: isLocLoading } = useLocalCollection<any>('mapLocations', {
    enabled: true // 始终开启，确保同步
  });

  const isLoading = isConfigLoading || isLocLoading;

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

  // 优先使用 mapLocations 集合的数据
  const pins = useMemo(() => {
    const rawLocations = remoteLocations || [];
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
  }, [remoteLocations, locale, lt]);

  const [selectedLocation, setSelectedLocation] = useState<any>(null);

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

          {/* 动态网格布局：根据数量在 5-8 列之间切换 */}
          <div 
            className={cn(
              "flex overflow-x-auto snap-x snap-mandatory pb-8 -mx-6 px-6 gap-4 scrollbar-hide", // 移动端
              "sm:grid sm:overflow-visible sm:pb-0 sm:mx-0 sm:px-0 sm:snap-none", // 桌面端基础
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20",
              "transition-all duration-1000 delay-300",
              // 动态列数逻辑
              pins.length <= 5 ? "lg:grid-cols-5 sm:grid-cols-2" : 
              pins.length === 6 ? "lg:grid-cols-6 sm:grid-cols-3" :
              pins.length === 7 ? "lg:grid-cols-7 sm:grid-cols-3" :
              "lg:grid-cols-8 sm:grid-cols-4"
            )}
          >
            {pins.map((pin: any) => (
              <div
                key={`card-${pin.key}`}
                onMouseEnter={() => setActiveLocation(pin.key)}
                onMouseLeave={() => setActiveLocation(null)}
                onClick={() => setSelectedLocation(pin)}
                className={cn(
                  "group relative aspect-[4/7] rounded-[2rem] border border-border/40 overflow-hidden transition-all duration-300 cursor-pointer shadow-xl transform-gpu isolate",
                  "flex-shrink-0 w-[85vw] snap-center", // 移动端
                  "sm:w-auto sm:flex-shrink-1 sm:snap-align-none", // 桌面端
                  activeLocation === pin.key ? "z-10" : "hover:border-primary/30"
                )}
              >
                {/* 背景图片容器 - 移除内部圆角，由父级裁剪 */}
                <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-110 overflow-hidden">
                  {pin.imageUrl ? (
                    <>
                      <img 
                        src={getAssetUrl(pin.imageUrl)} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                      {/* 强化的底部遮罩确保文字清晰 */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                    </>
                  ) : (
                    <div className="w-full h-full bg-slate-50 border-inner" />
                  )}
                  
                  <div className={cn(
                    "absolute inset-0 bg-black/40 transition-opacity duration-700",
                    activeLocation === pin.key ? "opacity-100" : "opacity-0"
                  )} />
                </div>

                {/* 内容区域 - 针对高密度布局优化 Padding */}
                <div className={cn(
                  "relative z-10 h-full flex flex-col justify-between items-start",
                  pins.length > 5 ? "p-5" : "p-8"
                )}>
                  <div className="space-y-3 w-full">
                    {/* 标签 */}
                    <div className={cn(
                      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                      pin.imageUrl 
                        ? "bg-white/20 text-white border border-white/30 backdrop-blur-md"
                        : "bg-primary/5 text-primary border border-primary/10"
                    )}>
                      <pin.icon className="h-3 w-3" />
                      {pin.type}
                    </div>
                    
                    {/* 标题与地址 - 针对高密度布局优化字号 */}
                    <div className="space-y-1.5">
                      <h4 className={cn(
                        "font-headline font-bold leading-tight tracking-tight transition-all duration-500 line-clamp-2",
                        pins.length > 5 ? "text-base" : "text-2xl",
                        pin.imageUrl ? "text-white" : "text-primary"
                      )}>
                        {pin.title}
                      </h4>
                      <p className={cn(
                        "font-medium leading-relaxed transition-colors duration-500 line-clamp-2",
                        pins.length > 5 ? "text-[9px]" : "text-xs",
                        pin.imageUrl ? "text-white/60" : "text-primary/40"
                      )}>
                        {pin.address}
                      </p>
                    </div>

                    {/* 描述 - 始终限制行数防止挤压按钮 */}
                    <div className={cn(
                      "pt-3 border-t transition-all duration-500",
                      pin.imageUrl ? "border-white/20" : "border-primary/10",
                      activeLocation === pin.key ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    )}>
                      <p className={cn(
                        "leading-relaxed font-medium italic line-clamp-3",
                        pins.length > 5 ? "text-[9px]" : "text-xs",
                        pin.imageUrl ? "text-white/80" : "text-primary/60"
                      )}>
                        {pin.desc}
                      </p>
                    </div>
                  </div>

                  {/* 右下角查看按钮 - 针对高密度布局优化尺寸 */}
                  <div className={cn(
                    "w-full flex justify-end transition-all duration-300 transform-gpu",
                    activeLocation === pin.key ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90"
                  )}>
                    <div className={cn(
                      "rounded-full backdrop-blur-2xl border transition-all duration-300 flex items-center justify-center group/btn shadow-xl bg-white/20 text-white border-white/30",
                      pins.length > 5 ? "w-9 h-9" : "w-12 h-12"
                    )}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={pins.length > 5 ? "h-3 w-3" : "h-4 w-4"}>
                        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 详情模态窗 - 优化性能与同步感 */}
      <div 
        className={cn(
          "fixed inset-0 z-[100] flex items-center justify-center p-6 lg:p-20",
          selectedLocation ? "visible" : "invisible pointer-events-none"
        )}
      >
        {/* 背景遮罩 */}
        <div 
          className={cn(
            "absolute inset-0 bg-slate-950/60 transition-opacity duration-300 ease-out cursor-zoom-out",
            "backdrop-blur-md will-change-[backdrop-filter,opacity]",
            selectedLocation ? "opacity-100" : "opacity-0"
          )}
          onClick={() => setSelectedLocation(null)}
        />
        
        {/* 弹窗主体 */}
        <div 
          className={cn(
            "relative w-full max-w-5xl bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col lg:flex-row transition-all duration-500 ease-out transform will-change-transform",
            selectedLocation ? "translate-y-0 scale-100 opacity-100" : "translate-y-8 scale-95 opacity-0"
          )}
        >
          {/* 左侧大图 */}
          <div className="w-full lg:w-1/2 h-[300px] lg:h-auto relative overflow-hidden bg-slate-100">
            {selectedLocation?.imageUrl ? (
              <img 
                src={getAssetUrl(selectedLocation.imageUrl)} 
                alt={selectedLocation.title} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Building2 className="w-20 h-20 text-slate-200" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
          </div>

          {/* 右侧内容 */}
          <div className="w-full lg:w-1/2 p-8 lg:p-14 flex flex-col justify-center bg-white relative">
            <button 
              onClick={() => setSelectedLocation(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors"
            >
              <span className="text-2xl leading-none">×</span>
            </button>

            {selectedLocation && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex items-center gap-3 mb-6">
                  <span className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest">
                    {selectedLocation.type}
                  </span>
                </div>
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                  {selectedLocation.title}
                </h2>
                <p className="text-blue-600 font-medium text-sm mb-6 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {selectedLocation.address}
                </p>
                <div className="w-12 h-1 bg-blue-600 mb-8 rounded-full" />
                <p className="text-slate-600 leading-relaxed text-base lg:text-lg">
                  {selectedLocation.desc}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
