
"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;
  const heroProductImage = PlaceHolderImages.find(img => img.id === 'hero-aio');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width - 0.5;
    const y = (e.clientY - top) / height - 0.5;
    setMousePos({ x, y });
  };

  const tiltStyle = {
    transform: `perspective(1000px) rotateY(${mousePos.x * 15}deg) rotateX(${-mousePos.y * 15}deg)`,
    transition: 'transform 0.1s ease-out'
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
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
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-black/20 z-10" />
      </div>

      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-20">
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <span className="text-accent font-bold tracking-widest uppercase text-sm bg-accent/10 px-3 py-1 rounded-sm inline-block">
              Heovose Elevate
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold text-white leading-tight tracking-tighter">
              {t.headline}
            </h1>
            <h2 className="text-2xl md:text-3xl text-white/70 font-light max-w-xl">
              {t.subheadline}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button size="lg" className="h-14 px-10 text-lg font-bold rounded-full bg-accent hover:bg-accent/90 text-accent-foreground shadow-xl shadow-accent/20 transition-all hover:scale-105">
              {t.cta} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-10 text-lg font-bold rounded-full border-white/30 text-white hover:bg-white/10 backdrop-blur-sm">
              {locale === 'en' ? 'View Catalog' : '查看目录'}
            </Button>
          </div>
        </div>

        <div className="relative hidden lg:flex justify-end">
          <div className="relative w-full max-w-[550px] aspect-square" style={tiltStyle}>
            {/* Soft glow behind product */}
            <div className="absolute inset-0 bg-accent/20 rounded-full blur-[120px] -z-10 animate-pulse" />
            
            {heroProductImage?.imageUrl ? (
              <Image
                src={heroProductImage.imageUrl}
                alt={heroProductImage.description || 'Product Image'}
                fill
                className="object-contain drop-shadow-[0_35px_60px_rgba(0,0,0,0.6)]"
                priority
                data-ai-hint={heroProductImage.imageHint}
              />
            ) : null}
          </div>
        </div>
      </div>

      {/* Scroll indicator for hero */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-50">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
