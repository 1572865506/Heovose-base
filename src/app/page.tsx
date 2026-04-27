
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductBento } from '@/components/ProductBento';
import { ProductGallery } from '@/components/ProductGallery';
import { Footer } from '@/components/Footer';

// 对首屏以下的重型组件采用动态导入
const VideoSection = dynamic(() => import('@/components/VideoSection').then(mod => mod.VideoSection), { ssr: false });
const ProductionProcess = dynamic(() => import('@/components/ProductionProcess').then(mod => mod.ProductionProcess), { ssr: false });
const CaseStudies = dynamic(() => import('@/components/CaseStudies').then(mod => mod.CaseStudies), { ssr: false });
const GlobalMap = dynamic(() => import('@/components/GlobalMap').then(mod => mod.GlobalMap), { ssr: false });

import { Suspense } from 'react';

function HomeContent() {
  const searchParams = useSearchParams();
  const firestore = useFirestore();
  
  // 默认语种，等待自动判定
  const [locale, setLocale] = useState<Locale>('en');

  // 获取云端语种及首页内容配置
  const langConfigRef = useMemoFirebase(() => 
    firestore ? doc(firestore, 'settings', 'languages') : null, 
    [firestore]
  );
  const homeHeroRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'homepageContent', 'hero') : null,
    [firestore]
  );
  const homeVideoRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'homepageContent', 'video') : null,
    [firestore]
  );
  const homeMapRef = useMemoFirebase(() =>
    firestore ? doc(firestore, 'homepageContent', 'map') : null,
    [firestore]
  );

  const { data: langSettings } = useDoc<any>(langConfigRef);
  const { data: heroConfig, isLoading: isHeroLoading } = useDoc<any>(homeHeroRef);
  const { data: videoConfig, isLoading: isVideoLoading } = useDoc<any>(homeVideoRef);
  const { data: mapConfig, isLoading: isMapLoading } = useDoc<any>(homeMapRef);

  useEffect(() => {
    // 智能语种判定逻辑
    const detectLocale = () => {
      // 1. 检查 URL 参数 (?lang=zh)
      const langParam = searchParams.get('lang');
      if (langParam && ['en', 'zh', 'id', 'vi'].includes(langParam)) {
        return langParam as Locale;
      }

      // 1.5 检查路径前缀 (处理直接访问 /zh 的情况)
      const pathSegments = window.location.pathname.split('/');
      if (pathSegments[1] && ['en', 'zh', 'id', 'vi'].includes(pathSegments[1])) {
        return pathSegments[1] as Locale;
      }

      // 2. 检查本地持久化存储
      const saved = localStorage.getItem('heovose-locale') as Locale;
      if (saved && ['en', 'zh', 'id', 'vi'].includes(saved)) {
        return saved;
      }

      // 3. 检查浏览器语系 (navigator.language)
      const browserLang = navigator.language.split('-')[0] as Locale;
      if (['en', 'zh', 'id', 'vi'].includes(browserLang)) {
        return browserLang;
      }

      // 4. 回退至云端设置的默认语种
      if (langSettings?.defaultLanguage) {
        return langSettings.defaultLanguage as Locale;
      }

      return 'en'; // 最终兜底
    };

    const finalLocale = detectLocale();
    setLocale(finalLocale);
  }, [searchParams, langSettings]);

  return (
    <main className="relative min-h-screen">
      <Navbar locale={locale} setLocale={setLocale} />
      
      <Hero locale={locale} homeConfig={heroConfig} isLoading={isHeroLoading} />
      
      <ProductBento locale={locale} />
      
      <ProductGallery locale={locale} />
      
      {/* 动态开关：视频/品牌故事模块 */}
      {(isVideoLoading || videoConfig?.isVideoEnabled !== false) && (
        <VideoSection locale={locale} homeConfig={videoConfig} isLoading={isVideoLoading} />
      )}
      
      <ProductionProcess locale={locale} />
      
      <CaseStudies locale={locale} />
      
      <GlobalMap locale={locale} homeConfig={mapConfig} isLoading={isMapLoading} />
      
      <Footer locale={locale} />
    </main>
  );

}

export default function Home() {
  return (
    <Suspense fallback={<main className="relative min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
