
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { ShoppingBag, Building2, ChevronRight } from "lucide-react";

export function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;

  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-primary"
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
          
          {/* Entry Cards Left Aligned */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-8 max-w-2xl">
            {/* Wholesale Card */}
            <div className="group relative glass-morphism p-8 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-accent/20 transition-all" />
              <div className="relative flex items-center justify-between">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center text-accent group-hover:scale-110 transition-transform">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-white mb-2">
                      {t.wholesale}
                    </h3>
                    <p className="text-white/50 text-sm font-medium flex items-center gap-2 group/link">
                      {t.learnMore} <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Project Card */}
            <div className="group relative glass-morphism p-8 rounded-[2rem] border border-white/10 hover:bg-white/20 transition-all duration-500 cursor-pointer overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-all" />
              <div className="relative flex items-center justify-between">
                <div className="space-y-4">
                  <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-white group-hover:scale-110 transition-transform border border-white/10">
                    <Building2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-headline font-bold text-white mb-2">
                      {t.project}
                    </h3>
                    <p className="text-white/50 text-sm font-medium flex items-center gap-2 group/link">
                      {t.learnMore} <ChevronRight className="h-4 w-4 group-hover/link:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator - Centered horizontally */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
