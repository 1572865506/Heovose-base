
"use client";

import { useState } from 'react';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductGallery } from '@/components/ProductGallery';
import { VideoSection } from '@/components/VideoSection';
import { ProductionProcess } from '@/components/ProductionProcess';
import { CaseStudies } from '@/components/CaseStudies';
import { GlobalMap } from '@/components/GlobalMap';
import { Footer } from '@/components/Footer';

export default function Home() {
  // 预设中文为默认语言
  const [locale, setLocale] = useState<Locale>('zh');

  return (
    <main className="relative min-h-screen">
      <Navbar locale={locale} setLocale={setLocale} />
      
      <Hero locale={locale} />
      
      <ProductGallery locale={locale} />
      
      <VideoSection locale={locale} />
      
      <ProductionProcess locale={locale} />
      
      <CaseStudies locale={locale} />
      
      <GlobalMap locale={locale} />
      
      <Footer locale={locale} />
    </main>
  );
}
