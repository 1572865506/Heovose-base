
"use client";

import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { MapPin } from "lucide-react";

export function GlobalMap({ locale }: { locale: Locale }) {
  const t = translations[locale].map;

  return (
    <section id="global" className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />
        
        <div className="relative aspect-[16/9] md:aspect-[21/9] bg-muted/30 rounded-[3rem] overflow-hidden border border-border/40">
          {/* Simple SVG Map Overlay or Styled Container */}
          <div className="absolute inset-0 opacity-20 pointer-events-none">
            <svg viewBox="0 0 1000 500" className="w-full h-full fill-primary/30">
               {/* Simplified World Outline Path Placeholder */}
               <rect width="1000" height="500" fill="none" />
               <path d="M150,200 Q200,100 300,150 T500,100 T700,200 T900,150 L900,400 Q700,450 500,400 T150,400 Z" />
            </svg>
          </div>

          {/* China HQ Pin */}
          <div className="absolute top-[40%] left-[75%] group animate-bounce">
            <div className="relative">
              <MapPin className="h-8 w-8 text-accent fill-accent/20" />
              <div className="absolute top-0 left-full ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-border/40 w-48">
                  <span className="block text-xs font-bold text-accent uppercase tracking-widest mb-1">HQ</span>
                  <p className="font-headline font-bold text-primary">{t.china}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Indonesia Pin */}
          <div className="absolute top-[65%] left-[72%] group animate-bounce [animation-delay:500ms]">
            <div className="relative">
              <MapPin className="h-8 w-8 text-accent fill-accent/20" />
              <div className="absolute top-0 left-full ml-4 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                <div className="bg-white p-4 rounded-2xl shadow-2xl border border-border/40 w-48">
                  <span className="block text-xs font-bold text-accent uppercase tracking-widest mb-1">Factory</span>
                  <p className="font-headline font-bold text-primary">{t.indonesia}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-12 left-12 space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-3 h-3 bg-accent rounded-full animate-ping" />
               <span className="text-sm font-medium text-primary">Live Operations</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
