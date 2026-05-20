"use client";

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
import { useTranslations } from '@/hooks/use-translations';

// 对首屏以下的重型组件采用动态导入，维持代码分割优势
const VideoSection = nextDynamic(() => import('@/components/VideoSection').then(mod => mod.VideoSection), { 
  loading: () => <section className="h-[100vh] bg-black" /> 
});
const ProductionProcess = nextDynamic(() => import('@/components/ProductionProcess').then(mod => mod.ProductionProcess), { 
  loading: () => <section className="py-32 min-h-[800px] bg-white" />
});
const CaseStudies = nextDynamic(() => import('@/components/CaseStudies').then(mod => mod.CaseStudies), { 
  loading: () => <section className="py-32 min-h-[600px] bg-background" />
});
const GlobalMap = nextDynamic(() => import('@/components/GlobalMap').then(mod => mod.GlobalMap), { 
  loading: () => <section className="py-24 min-h-[400px] bg-white" />
});

interface HomeContentProps {
  initialLocale: Locale;
}

export default function HomeContent({ initialLocale }: HomeContentProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [headerTheme, setHeaderTheme] = useState<'light' | 'dark'>('dark');
  const [mountHeavyComponents, setMountHeavyComponents] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const idleId = window.requestIdleCallback(() => {
        setMountHeavyComponents(true);
      }, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    } else {
      const timer = setTimeout(() => {
        setMountHeavyComponents(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);
  
  // 使用本地 Doc Hook 获取配置
  const { data: heroConfig, isLoading: isHeroLoading } = useLocalDoc<any>('homepageContent', 'hero');
  const { data: videoConfig, isLoading: isVideoLoading } = useLocalDoc<any>('homepageContent', 'video');
  const { data: mapConfig, isLoading: isMapLoading } = useLocalDoc<any>('homepageContent', 'map');
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  
  // 预加载翻译
  useTranslations(locale);

  useEffect(() => {
    const detectLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || 'en';

      // 1. 优先 URL 参数
      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      // 2. 其次检查本地存储
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      // 3. 再次使用服务端渲染初始值
      if (initialLocale && activeLangs.includes(initialLocale)) return initialLocale;
      
      // 4. 检查浏览器语言
      const browserLang = typeof navigator !== 'undefined' 
        ? (navigator.languages && navigator.languages.length > 0 
           ? navigator.languages[0].split('-')[0].toLowerCase() 
           : navigator.language.split('-')[0].toLowerCase()) as Locale
        : 'en';
      if (activeLangs.includes(browserLang)) return browserLang;
      
      return defaultLang;
    };
    
    const detected = detectLocale();
    setLocale(detected);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('heovose-locale', detected);
      document.cookie = `NEXT_LOCALE=${detected}; path=/; max-age=31536000`; // 1 year
    }
  }, [searchParams, langSettings, initialLocale]);

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
        {mountHeavyComponents && (isVideoLoading || videoConfig?.isVideoEnabled !== false) && (
          <VideoSection locale={locale} homeConfig={videoConfig} isLoading={isVideoLoading} />
        )}
        
        {mountHeavyComponents && <ProductionProcess locale={locale} />}
        
        {mountHeavyComponents && <CaseStudies locale={locale} />}
        
        {mountHeavyComponents && <GlobalMap locale={locale} homeConfig={mapConfig} isLoading={isMapLoading} />}
        
        <Footer locale={locale} />
      </main>
  );
}
