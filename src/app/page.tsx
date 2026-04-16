
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductBento } from '@/components/ProductBento';
import { ProductGallery } from '@/components/ProductGallery';
import { Footer } from '@/components/Footer';

// 对首屏以下的重型组件采用动态导入，不阻塞首屏渲染
const VideoSection = dynamic(() => import('@/components/VideoSection').then(mod => mod.VideoSection), { ssr: false });
const ProductionProcess = dynamic(() => import('@/components/ProductionProcess').then(mod => mod.ProductionProcess), { ssr: false });
const CaseStudies = dynamic(() => import('@/components/CaseStudies').then(mod => mod.CaseStudies), { ssr: false });
const GlobalMap = dynamic(() => import('@/components/GlobalMap').then(mod => mod.GlobalMap), { ssr: false });

export default function Home() {
  // 默认语言设置为英文
  const [locale, setLocale] = useState<Locale>('en');

  return (
    <main className="relative min-h-screen">
      <Navbar locale={locale} setLocale={setLocale} />
      
      {/* 核心展示区域保持标准导入以确保最快可见 */}
      <Hero locale={locale} />
      
      <ProductBento locale={locale} />
      
      <ProductGallery locale={locale} />
      
      {/* 以下重型组件将在空闲或滚动到附近时加载 */}
      <VideoSection locale={locale} />
      
      <ProductionProcess locale={locale} />
      
      <CaseStudies locale={locale} />
      
      <GlobalMap locale={locale} />
      
      <Footer locale={locale} />
    </main>
  );
}
