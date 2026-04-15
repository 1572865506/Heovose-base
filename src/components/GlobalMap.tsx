
"use client";

import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

export function GlobalMap({ locale }: { locale: Locale }) {
  const t = translations[locale].map;
  const locs = t.locations;

  const pins = [
    { 
      key: 'panyu', 
      pos: 'top-[40%] left-[75%]', 
      data: locs.panyu, 
      type: 'HQ',
      delay: '0ms'
    },
    { 
      key: 'shunde', 
      pos: 'top-[43%] left-[76.5%]', 
      data: locs.shunde, 
      type: 'R&D',
      delay: '200ms'
    },
    { 
      key: 'beijiao', 
      pos: 'top-[46%] left-[74.5%]', 
      data: locs.beijiao, 
      type: 'Factory',
      delay: '400ms'
    },
    { 
      key: 'jakarta', 
      pos: 'top-[65%] left-[72.5%]', 
      data: locs.jakarta, 
      type: 'Factory',
      delay: '600ms'
    },
  ];

  return (
    <section id="global" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />
        
        <div className="relative aspect-[16/9] md:aspect-[21/9] bg-muted/30 rounded-[3rem] overflow-hidden border border-border/40">
          {/* Simple SVG Map Overlay or Styled Container */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 1000 500" className="w-full h-full fill-primary/30">
               <rect width="1000" height="500" fill="none" />
               <path d="M150,200 Q200,100 300,150 T500,100 T700,200 T900,150 L900,400 Q700,450 500,400 T150,400 Z" />
            </svg>
          </div>

          {/* Map Pins */}
          {pins.map((pin) => (
            <div 
              key={pin.key} 
              className={cn(
                "absolute group transition-transform duration-500 hover:scale-125 z-10",
                pin.pos
              )}
            >
              <div className="relative">
                <div className="animate-bounce" style={{ animationDelay: pin.delay }}>
                  <MapPin className={cn(
                    "h-8 w-8",
                    pin.type === 'HQ' ? "text-accent fill-accent/20" : "text-primary fill-primary/20"
                  )} />
                </div>
                
                {/* Tooltip Card */}
                <div className="absolute top-0 left-full ml-4 opacity-0 scale-90 translate-x-4 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none z-50">
                  <div className="bg-white p-5 rounded-3xl shadow-2xl border border-border/40 w-64 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-3">
                      <span className="block text-[10px] font-bold text-accent uppercase tracking-[0.2em]">
                        {pin.type}
                      </span>
                      <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    </div>
                    <h4 className="font-headline font-bold text-primary text-lg mb-1">{pin.data.title}</h4>
                    <p className="text-[10px] font-medium text-muted-foreground mb-3">{pin.data.address}</p>
                    <p className="text-[11px] text-primary/60 leading-relaxed border-t border-border/40 pt-3">
                      {pin.data.desc}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-12 left-12 space-y-4">
             <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
               <div className="w-2 h-2 bg-accent rounded-full animate-ping" />
               <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Global Manufacturing Network</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
