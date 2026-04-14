
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Locale, translations } from "@/lib/translations";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { ArrowRight } from "lucide-react";

export function Hero({ locale }: { locale: Locale }) {
  const t = translations[locale].hero;
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero-aio');
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
    transform: `perspective(1000px) rotateY(${mousePos.x * 20}deg) rotateX(${-mousePos.y * 20}deg)`,
    transition: 'transform 0.1s ease-out'
  };

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden"
    >
      <div className="container mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <div className="space-y-8 animate-fade-in-up">
          <div className="space-y-4">
            <span className="text-accent font-semibold tracking-wider uppercase text-sm">Heovose Elevate</span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-headline font-bold text-primary leading-tight">
              {t.headline}
            </h1>
            <h2 className="text-2xl md:text-3xl text-muted-foreground font-light">
              {t.subheadline}
              {locale === 'en' && <span className="block mt-2 text-xl opacity-60">先进技术制造</span>}
              {locale === 'zh' && <span className="block mt-2 text-xl opacity-60">Advanced Technology Manufacturing</span>}
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="h-14 px-8 text-lg font-medium rounded-full bg-primary hover:bg-primary/90">
              {t.cta} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-medium rounded-full border-primary/20 hover:bg-accent/5">
              {locale === 'en' ? 'View Catalog' : '查看目录'}
            </Button>
          </div>
        </div>

        <div className="relative flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[600px] aspect-square" style={tiltStyle}>
            <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl -z-10 animate-pulse" />
            <Image
              src={heroImage?.imageUrl || ''}
              alt={heroImage?.description || ''}
              fill
              className="object-contain drop-shadow-2xl"
              priority
              data-ai-hint={heroImage?.imageHint}
            />
          </div>
        </div>
      </div>

      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent -z-10" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />
    </section>
  );
}
