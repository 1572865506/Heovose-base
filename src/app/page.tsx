"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Locale } from '@/lib/translations';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { ProductBento } from '@/components/ProductBento';
import { ProductGallery } from '@/components/ProductGallery';
import { Footer } from '@/components/Footer';
import { Suspense } from 'react';
import { useTranslations } from '@/hooks/use-translations';
import { Loader2 } from 'lucide-react';
import { InquiryProvider } from '@/components/providers/InquiryProvider';

// 对首屏以下的重型组件采用动态导入，通过 loading 维持高度解决刷新跳回顶部问题
const VideoSection = nextDynamic(() => import('@/components/VideoSection').then(mod => mod.VideoSection), { 
  ssr: false, 
  loading: () => <section className="h-[100vh] bg-black" /> 
});
const ProductionProcess = nextDynamic(() => import('@/components/ProductionProcess').then(mod => mod.ProductionProcess), { 
  ssr: false, 
  loading: () => <section className="py-32 min-h-[800px] bg-white" />
});
const CaseStudies = nextDynamic(() => import('@/components/CaseStudies').then(mod => mod.CaseStudies), { 
  ssr: false, 
  loading: () => <section className="py-32 min-h-[600px] bg-background" />
});
const GlobalMap = nextDynamic(() => import('@/components/GlobalMap').then(mod => mod.GlobalMap), { 
  ssr: false, 
  loading: () => <section className="py-24 min-h-[400px] bg-white" />
});

function HomeContent() {
  const [locale, setLocale] = useState<Locale>('en');
  const [isLocaleReady, setIsLocaleReady] = useState(false);
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('dark');
  const searchParams = useSearchParams();
  
  // 使用本地 Doc Hook 获取配置
  const { data: heroConfig, isLoading: isHeroLoading } = useLocalDoc<any>('homepageContent', 'hero');
  const { data: videoConfig, isLoading: isVideoLoading } = useLocalDoc<any>('homepageContent', 'video');
  const { data: mapConfig, isLoading: isMapLoading } = useLocalDoc<any>('homepageContent', 'map');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { isLoading: isTrLoading } = useTranslations(locale);

  useEffect(() => {
    // 智能语种判定逻辑
    const detectLocale = () => {
      // 获取当前激活的语言代码列表
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || 'en';

      // 1. 检查 URL 参数 (?lang=zh)
      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      // 2. 检查本地存储
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      // 3. 检查浏览器语言
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] as Locale : 'en';
      if (activeLangs.includes(browserLang)) return browserLang;
      
      return defaultLang;
    };
    
    setLocale(detectLocale());
    setIsLocaleReady(true);
  }, [searchParams, langSettings]);

  // 移除全屏 Loading 拦截，改为流式渲染
  // 以前这里会 return <Loader2 />，现在直接进入主体渲染

  return (
      <main className="relative min-h-screen">
        <Navbar locale={locale} setLocale={setLocale} headerTheme={headerTheme} />
        
        <Hero 
          locale={locale} 
          homeConfig={heroConfig} 
          isLoading={isHeroLoading} 
          onThemeChange={(theme) => setHeaderTheme(theme)}
        />
        
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
