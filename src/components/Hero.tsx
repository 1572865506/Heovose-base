
"use client";

import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Locale, translations } from "@/lib/translations";
import { ArrowRight } from "lucide-react";

export function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;

  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 overflow-hidden"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/video/hero-bg.png"
          alt="Heovose Factory Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/40 to-primary/90 z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl mx-auto text-center space-y-10 animate-fade-in-up">
          <div className="space-y-6">
            <span className="text-accent font-bold tracking-widest uppercase text-sm bg-accent/10 px-4 py-1.5 rounded-full inline-block border border-accent/20 backdrop-blur-sm">
              Heovose Elevate
            </span>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-headline font-bold text-white leading-none tracking-tighter">
              {t.headline}
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
              {t.subheadline}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
            <Button size="lg" className="h-16 px-12 text-lg font-bold rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-2xl shadow-accent/20 transition-all hover:scale-105">
              {t.cta} <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-12 text-lg font-bold rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              {locale === 'en' ? 'View Catalog' : '查看目录'}
            </Button>
          </div>
        </div>
      </div>

      {/* Scroll indicator for hero */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
