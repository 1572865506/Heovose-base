
"use client";

import { useState } from 'react';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductBento } from '@/components/ProductBento';
import { ProductGallery } from '@/components/ProductGallery';
import { VideoSection } from '@/components/VideoSection';
import { ProductionProcess } from '@/components/ProductionProcess';
import { CaseStudies } from '@/components/CaseStudies';
import { GlobalMap } from '@/components/GlobalMap';
import { Footer } from '@/components/Footer';

export default function Home() {
  // 默认语言改为英文
  const [locale, setLocale] = useState<Locale>('en');

  return (
    <main className="relative min-h-screen">
      <Navbar locale={locale} setLocale={setLocale} />
      
      <Hero locale={locale} />
      
      <ProductBento locale={locale} />
      
      <ProductGallery locale={locale} />
      
      <VideoSection locale={locale} />
      
      <ProductionProcess locale={locale} />
      
      <CaseStudies locale={locale} />
      
      <GlobalMap locale={locale} />
      
      <Footer locale={locale} />
    </main>
  );
}
