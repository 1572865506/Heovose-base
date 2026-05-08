
"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { getAssetUrl } from '@/lib/image-utils';
import { MapPin, Building2, Factory, Microscope, Globe, Loader2 } from "lucide-react";
import Image from 'next/image';

interface GlobalMapProps {
  locale: Locale;
  homeConfig?: any;
  isLoading?: boolean;
}

export function GlobalMap({ locale, homeConfig, isLoading }: GlobalMapProps) {
  const t = translations[locale].map;
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

  // 动态数据解析与匹配
  const displayTitle = locale === 'zh'
    ? (homeConfig?.mapTitleZh || t.title)
    : (homeConfig?.mapTitleEn || t.title);

  const displaySubtitle = locale === 'zh'
    ? (homeConfig?.mapSubtitleZh || t.subtitle)
    : (homeConfig?.mapSubtitleEn || t.subtitle);

  // 优先使用后台配置的 locations
  const pins = useMemo(() => {
    if (homeConfig?.locations && homeConfig.locations.length > 0) {
      return homeConfig.locations.map((loc: any) => ({
        key: loc.id,
        style: { top: loc.posTop, left: loc.posLeft },
        type: loc.type,
        icon: getIcon(loc.type),
        title: locale === 'zh' ? loc.titleZh : loc.titleEn,
        address: locale === 'zh' ? loc.addressZh : loc.addressEn,
        desc: locale === 'zh' ? loc.descZh : loc.descEn,
        imageUrl: loc.imageUrl
      }));
    }

    // 回退到 translations.ts 中的硬编码网点
    const locs = translations[locale].map.locations;
    return locs.map(loc => ({
      key: loc.id,
      style: { top: loc.posTop, left: loc.posLeft },
      type: loc.type,
      icon: getIcon(loc.type as any),
      title: loc.title,
      address: loc.address,
      desc: loc.desc,
      imageUrl: ''
    }));
  }, [homeConfig, locale]);

  return (
    <section id="global" ref={sectionRef} className="py-24 bg-white overflow-hidden relative min-h-[400px]">
      {(isLoading || pins.length === 0) ? (
        <div className="container mx-auto px-6 flex items-center justify-center py-40">
          {isLoading && <Loader2 className="h-10 w-10 animate-spin text-primary opacity-20" />}
        </div>
      ) : (
        <div className="container mx-auto px-6">
          <SectionHeading title={displayTitle} subtitle={displaySubtitle} />

          <div className={cn(
            "grid grid-cols-1 lg:grid-cols-12 gap-12 items-start transition-all duration-1000 delay-300",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-20"
          )}>
            {/* 左侧卡片列表 */}
            <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-minimal">
              {pins.map((pin: any) => (
                <div
                  key={`card-${pin.key}`}
                  onMouseEnter={() => setActiveLocation(pin.key)}
                  onMouseLeave={() => setActiveLocation(null)}
                  className={cn(
                    "p-6 rounded-3xl border transition-all duration-500 cursor-pointer group relative overflow-hidden",
                    activeLocation === pin.key
                      ? "bg-primary border-primary shadow-2xl -translate-y-1"
                      : "bg-white border-border/40 hover:border-primary/50"
                  )}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity duration-500",
                    activeLocation === pin.key ? "opacity-100" : "opacity-0"
                  )} />

                  <div className="flex gap-4 relative z-10">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500",
                      activeLocation === pin.key ? "bg-white text-primary scale-110 shadow-lg" : "bg-primary/5 text-primary"
                    )}>
                      <pin.icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-[0.2em]",
                          activeLocation === pin.key ? "text-accent" : "text-primary/60"
                        )}>
                          {pin.type}
                        </span>
                        {activeLocation === pin.key && (
                          <div className="w-2 h-2 bg-accent rounded-full animate-pulse shadow-[0_0_10px_rgba(252,220,0,0.8)]" />
                        )}
                      </div>
                      <h4 className={cn(
                        "font-headline font-bold text-lg leading-tight transition-colors duration-500",
                        activeLocation === pin.key ? "text-white" : "text-primary"
                      )}>
                        {pin.title}
                      </h4>
                      <p className={cn(
                        "text-[10px] font-medium leading-relaxed transition-colors duration-500",
                        activeLocation === pin.key ? "text-white/60" : "text-muted-foreground"
                      )}>
                        {pin.address}
                      </p>

                      <div className={cn(
                        "mt-4 pt-4 border-t transition-all duration-500",
                        activeLocation === pin.key ? "border-white/10 opacity-100" : "border-border/40 opacity-60"
                      )}>
                        <p className={cn(
                          "text-[11px] leading-relaxed font-medium italic",
                          activeLocation === pin.key ? "text-white/80" : "text-primary/70"
                        )}>
                          {pin.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 右侧交互地图 */}
            <div className="lg:col-span-8 relative aspect-[16/9] bg-muted/30 rounded-[3rem] overflow-hidden border border-border/40 shadow-inner">
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <svg viewBox="0 0 1000 500" className="w-full h-full fill-primary/30">
                  <rect width="1000" height="500" fill="none" />
                  <path d="M150,200 Q200,100 300,150 T500,100 T700,200 T900,150 L900,400 Q700,450 500,400 T150,400 Z" />
                </svg>
              </div>

              {pins.map((pin: any) => (
                <div
                  key={`pin-${pin.key}`}
                  onMouseEnter={() => setActiveLocation(pin.key)}
                  onMouseLeave={() => setActiveLocation(null)}
                  className={cn(
                    "absolute transition-all duration-500 z-10 cursor-pointer",
                    activeLocation === pin.key ? "scale-150 z-20" : "hover:scale-125"
                  )}
                  style={pin.style}
                >
                  <div className="relative">
                    <div className={cn(
                      activeLocation === pin.key ? "animate-none" : "animate-bounce"
                    )}>
                      <MapPin className={cn(
                        "h-8 w-8 transition-all duration-500",
                        activeLocation === pin.key
                          ? "text-accent fill-accent shadow-2xl"
                          : "text-primary fill-primary/20"
                      )} />
                    </div>
                    {activeLocation === pin.key && (
                      <>
                        <div className="absolute inset-0 -z-10 bg-accent/60 rounded-full animate-ping scale-150" />
                        <div className="absolute inset-0 -z-10 bg-accent/30 rounded-full animate-ping scale-[2.5] duration-1000" />
                      </>
                    )}
                  </div>
                </div>
              ))}

              <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                <div className="flex items-center gap-3 bg-white/90 px-6 py-3 rounded-full border border-white/20 shadow-lg">
                  <div className="w-3 h-3 bg-accent rounded-full animate-ping" />
                  <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Heovose Global Network</span>
                </div>

                {activeLocation && pins.find((p: any) => p.key === activeLocation)?.imageUrl && (
                  <div className="w-48 aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 animate-in slide-in-from-bottom-4 duration-500 hidden md:block">
                    <img
                      src={getAssetUrl(pins.find((p: any) => p.key === activeLocation).imageUrl)}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
