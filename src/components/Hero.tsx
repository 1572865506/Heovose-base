
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { ShoppingBag, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;

  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary z-20"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/video/hero-bg.png"
          alt="Heovose Factory Background"
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent z-10" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl space-y-12 animate-fade-in-up">
          {/* Headline and Subheadline */}
          <div className="space-y-6">
            <span className="text-accent font-bold tracking-[0.3em] uppercase text-xs bg-accent/20 px-5 py-2 rounded-full inline-block border border-accent/30 backdrop-blur-md">
              Heovose Elevate
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold text-white leading-[0.85] tracking-tighter">
              {t.headline}
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/80 font-light max-w-xl leading-relaxed">
              {t.subheadline}
            </h2>
          </div>
          
          {/* Entry Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-8 max-w-3xl">
            {/* Wholesale Card */}
            <div className="group relative bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:scale-[1.03] hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
              {/* Animated Glow on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative space-y-8">
                {/* Icon Box - Styled as per screenshot */}
                <div className="w-20 h-20 bg-[#6b7c7c]/40 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center text-accent shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-headline font-bold text-white leading-tight tracking-tight">
                  {t.wholesale}
                </h3>
              </div>
            </div>

            {/* Project Card */}
            <div className="group relative bg-white/10 backdrop-blur-2xl p-10 rounded-[3rem] border border-white/20 hover:border-white/40 transition-all duration-700 cursor-pointer overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.3)] hover:scale-[1.03] hover:shadow-[0_40px_80px_rgba(0,0,0,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <div className="relative space-y-8">
                {/* Icon Box */}
                <div className="w-20 h-20 bg-[#6b7c7c]/40 backdrop-blur-sm rounded-[1.5rem] flex items-center justify-center text-white/90 shadow-inner group-hover:scale-110 transition-transform duration-500">
                  <Building2 className="h-10 w-10 stroke-[1.5]" />
                </div>
                
                <h3 className="text-3xl md:text-4xl font-headline font-bold text-white leading-tight tracking-tight">
                  {t.project}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
