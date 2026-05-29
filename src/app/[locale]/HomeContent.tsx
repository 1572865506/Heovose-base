"use client";

import { useState, useEffect } from 'react';
import nextDynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
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
  initialTranslations: any[];
  initialConfigs: {
    hero: any;
    video: any;
    map: any;
    languages: any;
  };
}

export default function HomeContent({ initialLocale, initialTranslations, initialConfigs }: HomeContentProps) {
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
  
  // 使用本地 Doc Hook 获取配置，并注入服务端预加载的 initialData
  const { data: heroConfig, isLoading: isHeroLoading } = useLocalDoc<any>('homepageContent', 'hero', { initialData: initialConfigs.hero });
  const { data: videoConfig, isLoading: isVideoLoading } = useLocalDoc<any>('homepageContent', 'video', { initialData: initialConfigs.video });
  const { data: mapConfig, isLoading: isMapLoading } = useLocalDoc<any>('homepageContent', 'map', { initialData: initialConfigs.map });
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages', { initialData: initialConfigs.languages });
  
  // 预先注册并加载当前的翻译（通过 initialTranslations 直接填充缓存，完全避免二次加载闪烁）
  useLocalCollection<any>(`localizedStrings?lang=${locale}`, { initialData: initialTranslations });
  useTranslations(locale);

  useEffect(() => {
    const detectLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || 'en';

      // 1. 优先使用 URL 中匹配出来的 locale
      if (initialLocale && activeLangs.includes(initialLocale)) return initialLocale;
      
      // 2. 备用检测 URL 参数 (作后备支持)
      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      // 3. 检查本地存储
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
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

  // 更加健壮的锚点滚动逻辑：直接监听 hash 并等待 DOM 元素出现后自动平滑滚动
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleHashScroll = () => {
      const hash = window.location.hash;
      if (hash === '#cases') {
        // 每 100ms 轮询检查一次元素是否已经渲染到 DOM，最多等待 4 秒
        let attempts = 0;
        const intervalId = setInterval(() => {
          const element = document.getElementById('cases');
          if (element) {
            clearInterval(intervalId);
            setTimeout(() => {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 150); // 给浏览器留足绘制时间
          }
          attempts++;
          if (attempts > 40) {
            clearInterval(intervalId);
          }
        }, 100);
      }
    };

    // 1. 初始化时执行（处理从其他页面跳转过来的情况）
    handleHashScroll();

    // 2. 监听浏览器哈希变化（处理在当前页面点击的情况）
    window.addEventListener('hashchange', handleHashScroll);
    return () => {
      window.removeEventListener('hashchange', handleHashScroll);
    };
  }, [mountHeavyComponents]);

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
