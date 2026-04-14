
"use client";

import { useState } from 'react';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductionProcess } from '@/components/ProductionProcess';
import { GlobalMap } from '@/components/GlobalMap';
import { Footer } from '@/components/Footer';

export default function Home() {
  const [locale, setLocale] = useState<Locale>('en');

  return (
    <main className="relative min-h-screen">
      <Navbar locale={locale} setLocale={setLocale} />
      
      <Hero locale={locale} />
      
      <ProductGallery locale={locale} />
      
      <ProductionProcess locale={locale} />
      
      <GlobalMap locale={locale} />
      
      <Footer locale={locale} />

      {/* Global decorative elements */}
      <div className="fixed inset-0 pointer-events-none -z-50 opacity-[0.03] select-none overflow-hidden">
        <span className="absolute top-[20%] left-[5%] text-[20rem] font-bold">INNOVATE</span>
        <span className="absolute bottom-[10%] right-[5%] text-[20rem] font-bold">QUALITY</span>
      </div>
    </main>
  );
}
