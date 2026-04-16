
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { ShoppingBag, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;

  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 overflow-hidden z-20"
    >
      {/* Background Image with Dynamic Glass Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image/whiteboard02.png"
          alt="Heovose Hero Background"
          fill
          className="object-cover opacity-100"
          priority
        />
        
        {/* Left-to-Right Glass Blur Gradient - Optimized for responsive clear view */}
        <div 
          className="absolute inset-0 z-10 backdrop-blur-3xl [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_50%)]" 
        />
        
        {/* Subtle color overlay for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent z-20" />
      </div>

      <div className="container mx-auto px-6 relative z-30">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 max-w-xl">
            {/* Wholesale Card */}
            <div className="group relative bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 hover:border-accent/40 transition-all duration-700 cursor-pointer overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              {/* Gradient Border Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              {/* Internal Content */}
              <div className="relative space-y-4">
                {/* Icon Box */}
                <div className="w-14 h-14 bg-[#6b7c7c]/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-accent shadow-inner transition-transform duration-500">
                  <ShoppingBag className="h-7 w-7 stroke-[1.5]" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
                  {t.wholesale}
                </h3>
              </div>
            </div>

            {/* Project Card */}
            <div className="group relative bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 hover:border-accent/40 transition-all duration-700 cursor-pointer overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
              {/* Gradient Border Glow Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent/30 via-transparent to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
              
              <div className="relative space-y-4">
                {/* Icon Box */}
                <div className="w-14 h-14 bg-[#6b7c7c]/40 backdrop-blur-sm rounded-xl flex items-center justify-center text-white/90 shadow-inner transition-transform duration-500">
                  <Building2 className="h-7 w-7 stroke-[1.5]" />
                </div>
                
                <h3 className="text-xl md:text-2xl font-headline font-bold text-white leading-tight tracking-tight">
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
