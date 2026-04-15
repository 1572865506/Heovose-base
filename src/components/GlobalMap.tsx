
"use client";

import { useState } from 'react';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { MapPin, Building2, Factory, Microscope, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalMap({ locale }: { locale: Locale }) {
  const t = translations[locale].map;
  const locs = t.locations;
  const [activeLocation, setActiveLocation] = useState<string | null>(null);

  const pins = [
    { 
      key: 'panyu', 
      pos: 'top-[40%] left-[75%]', 
      data: locs.panyu, 
      type: 'HQ',
      icon: Building2,
      delay: '0ms'
    },
    { 
      key: 'shunde', 
      pos: 'top-[43%] left-[76.5%]', 
      data: locs.shunde, 
      type: 'R&D',
      icon: Microscope,
      delay: '200ms'
    },
    { 
      key: 'beijiao', 
      pos: 'top-[46%] left-[74.5%]', 
      data: locs.beijiao, 
      type: 'Factory',
      icon: Factory,
      delay: '400ms'
    },
    { 
      key: 'jakarta', 
      pos: 'top-[65%] left-[72.5%]', 
      data: locs.jakarta, 
      type: 'Factory',
      icon: Globe,
      delay: '600ms'
    },
  ];

  return (
    <section id="global" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Address Information Cards */}
          <div className="lg:col-span-4 space-y-4">
            {pins.map((pin) => (
              <div
                key={`card-${pin.key}`}
                onMouseEnter={() => setActiveLocation(pin.key)}
                onMouseLeave={() => setActiveLocation(null)}
                className={cn(
                  "p-6 rounded-3xl border transition-all duration-500 cursor-pointer group relative overflow-hidden",
                  activeLocation === pin.key 
                    ? "bg-primary border-primary shadow-2xl -translate-y-1 lg:-translate-x-2" 
                    : "bg-white border-border/40 hover:border-primary/50"
                )}
              >
                {/* Active Accent background decorative element */}
                <div className={cn(
                  "absolute top-0 right-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl -mr-12 -mt-12 transition-opacity duration-500",
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
                        "text-[10px] font-bold uppercase tracking-[0.2em] transition-colors duration-500",
                        activeLocation === pin.key ? "text-accent" : "text-accent"
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
                      {pin.data.title}
                    </h4>
                    <p className={cn(
                      "text-[10px] font-medium leading-relaxed transition-colors duration-500",
                      activeLocation === pin.key ? "text-white/60" : "text-muted-foreground"
                    )}>
                      {pin.data.address}
                    </p>
                    <div className={cn(
                      "mt-4 pt-4 border-t transition-all duration-500",
                      activeLocation === pin.key ? "border-white/10 opacity-100" : "border-border/40 opacity-60"
                    )}>
                      <p className={cn(
                        "text-[11px] leading-relaxed font-medium italic",
                        activeLocation === pin.key ? "text-white/80" : "text-primary/70"
                      )}>
                        {pin.data.desc}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Interactive Map */}
          <div className="lg:col-span-8 relative aspect-[16/9] bg-muted/30 rounded-[3rem] overflow-hidden border border-border/40 shadow-inner">
            {/* Simple SVG Map Overlay */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg viewBox="0 0 1000 500" className="w-full h-full fill-primary/30">
                 <rect width="1000" height="500" fill="none" />
                 <path d="M150,200 Q200,100 300,150 T500,100 T700,200 T900,150 L900,400 Q700,450 500,400 T150,400 Z" />
              </svg>
            </div>

            {/* Map Pins */}
            {pins.map((pin) => (
              <div 
                key={`pin-${pin.key}`} 
                onMouseEnter={() => setActiveLocation(pin.key)}
                onMouseLeave={() => setActiveLocation(null)}
                className={cn(
                  "absolute transition-all duration-500 z-10 cursor-pointer",
                  pin.pos,
                  activeLocation === pin.key ? "scale-150 z-20" : "hover:scale-125"
                )}
              >
                <div className="relative">
                  <div className={cn(
                    activeLocation === pin.key ? "animate-none" : "animate-bounce"
                  )} style={{ animationDelay: pin.delay }}>
                    <MapPin className={cn(
                      "h-8 w-8 transition-all duration-500",
                      activeLocation === pin.key 
                        ? "text-accent fill-accent shadow-2xl" 
                        : pin.type === 'HQ' ? "text-accent fill-accent/20" : "text-primary fill-primary/20"
                    )} />
                  </div>
                  
                  {/* Ripple Effect for active pin */}
                  {activeLocation === pin.key && (
                    <>
                      <div className="absolute inset-0 -z-10 bg-accent/60 rounded-full animate-ping scale-150" />
                      <div className="absolute inset-0 -z-10 bg-accent/30 rounded-full animate-ping scale-[2.5] duration-1000" />
                    </>
                  )}
                </div>
              </div>
            ))}

            <div className="absolute bottom-12 left-12 space-y-4">
               <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-lg">
                 <div className="w-3 h-3 bg-accent rounded-full animate-ping" />
                 <span className="text-[10px] font-bold text-primary uppercase tracking-[0.3em]">Heovose Global Network</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
