
"use client";

import { useState, useMemo } from 'react';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { MapPin, Building2, Factory, Microscope, Globe, Move } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from 'next/image';

interface GlobalMapProps {
  locale: Locale;
  homeConfig?: any;
}

export function GlobalMap({ locale, homeConfig }: GlobalMapProps) {
  const t = translations[locale].map;
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

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

  // 优先使用后台配置的 locations，如果没有则回退到本地默认数据
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

    // 默认回退数据（保持原有展示一致性）
    const locs = t.locations;
    return [
      { key: 'panyu', style: { top: '40%', left: '75%' }, title: locs.panyu.title, address: locs.panyu.address, desc: locs.panyu.desc, type: 'HQ', icon: Building2 },
      { key: 'shunde', style: { top: '43%', left: '76.5%' }, title: locs.shunde.title, address: locs.shunde.address, desc: locs.shunde.desc, type: 'R&D', icon: Microscope },
      { key: 'beijiao', style: { top: '46%', left: '74.5%' }, title: locs.beijiao.title, address: locs.beijiao.address, desc: locs.beijiao.desc, type: 'Factory', icon: Factory },
      { key: 'jakarta', style: { top: '65%', left: '72.5%' }, title: locs.jakarta.title, address: locs.jakarta.address, desc: locs.jakarta.desc, type: 'Factory', icon: Factory },
    ];
  }, [homeConfig, locale, t]);

  return (
    <section id="global" className="py-24 bg-white overflow-hidden relative">
      <div className="container mx-auto px-6">
        <SectionHeading title={displayTitle} subtitle={displaySubtitle} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
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
                {/* 悬停装饰光效 */}
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
            {/* 地图背景线条装饰 */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg viewBox="0 0 1000 500" className="w-full h-full fill-primary/30">
                 <rect width="1000" height="500" fill="none" />
                 <path d="M150,200 Q200,100 300,150 T500,100 T700,200 T900,150 L900,400 Q700,450 500,400 T150,400 Z" />
              </svg>
            </div>

            {/* 渲染网点 Pin 点 */}
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

            {/* 地图底部悬浮信息 */}
            <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
               <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
                 <div className="w-3 h-3 bg-accent rounded-full animate-ping" />
                 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Heovose Global Network</span>
               </div>
               
               {/* 活跃点预览图 - 仅当后台配置了图片时显示 */}
               {activeLocation && pins.find((p:any) => p.key === activeLocation)?.imageUrl && (
                 <div className="w-48 aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/80 animate-in slide-in-from-bottom-4 duration-500 hidden md:block">
                    <img 
                      src={pins.find((p:any) => p.key === activeLocation).imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover"
                    />
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

