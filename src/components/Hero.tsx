
"use client";

import Image from 'next/image';
import Link from 'next/link';
import { Locale, translations } from "@/lib/translations";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroProps {
  locale: Locale;
  homeConfig?: any;
}

export function Hero({ locale, homeConfig }: HeroProps) {
  const t = translations[locale].hero;

  // 动态解析云端文案
  const displayHeadline = locale === 'zh' 
    ? (homeConfig?.heroHeadlineZh || t.headline)
    : (homeConfig?.heroHeadlineEn || t.headline);

  const displaySubheadline = locale === 'zh'
    ? (homeConfig?.heroSubheadlineZh || t.subheadline)
    : (homeConfig?.heroSubheadlineEn || t.subheadline);

  const displayWholesaleButton = locale === 'zh'
    ? (homeConfig?.heroWholesaleButtonZh || t.wholesale)
    : (homeConfig?.heroWholesaleButtonEn || t.wholesale);

  const displayProjectButton = locale === 'zh'
    ? (homeConfig?.heroProjectButtonZh || t.project)
    : (homeConfig?.heroProjectButtonEn || t.project);

  // 动态解析跳转路径
  const wholesaleHref = homeConfig?.heroWholesaleCategoryId && homeConfig.heroWholesaleCategoryId !== 'none'
    ? `/products?category=${homeConfig.heroWholesaleCategoryId}`
    : "/products";

  const projectHref = homeConfig?.heroProjectCategoryId && homeConfig.heroProjectCategoryId !== 'none'
    ? `/products?category=${homeConfig.heroProjectCategoryId}`
    : "/products?category=Industrial";

  return (
    <section 
      className="relative min-h-screen flex items-center pt-20 overflow-hidden z-20"
    >
      {/* Background Image with Dynamic Glass Effect */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/image/hero-bg.png"
          alt="Heovose Hero Background"
          fill
          className="object-cover opacity-100"
          priority
        />
        
        {/* Left-to-Right Glass Blur Gradient */}
        <div 
          className="absolute inset-0 z-10 backdrop-blur-3xl [mask-image:linear-gradient(to_right,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_15%,rgba(0,0,0,0)_50%)]" 
        />
        
        {/* Subtle color overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-transparent z-20" />
      </div>

      <div className="container mx-auto px-6 relative z-30 h-[calc(100vh-160px)] min-h-[600px]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 h-full animate-fade-in-up">
          {/* Left Column: Headline and Subheadline - Vertically Centered */}
          <div className="flex items-center h-full">
            <div className="max-w-4xl space-y-10">
              <div className="space-y-6">
                <h1 className="text-6xl md:text-8xl lg:text-[120px] font-headline font-bold text-white leading-[0.8] tracking-[-0.05em] uppercase">
                  {displayHeadline}
                </h1>
                <h2 className="text-2xl md:text-4xl text-white/70 font-body max-w-2xl leading-tight">
                  {displaySubheadline}
                </h2>
              </div>
            </div>
          </div>
          
          {/* Right Column: Entry Cards - Bottom Aligned */}
          <div className="flex items-end h-full pb-12 lg:pb-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full lg:max-w-xl ml-auto">
              {/* Wholesale Card */}
              <Link 
                href={wholesaleHref}
                className="group relative h-48 rounded-[2.5rem] hover:border-[#005B99]/50 transition-all duration-700 cursor-pointer overflow-hidden shadow-2xl border border-white/10"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/image/Wholesale Product.png"
                    alt="Wholesale"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-700" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-[#005B99]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                
                <div className="relative z-20 h-full p-6 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-headline font-bold text-white leading-tight tracking-tight">
                        {displayWholesaleButton}
                      </h3>
                      <p className="text-white/60 text-[9px] uppercase tracking-widest font-bold group-hover:text-[#005B99] transition-colors">
                        Standard Wholesale
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full glass-frosted flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-[#005B99] transition-all duration-500 shadow-lg">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>

              {/* Project Card */}
              <Link 
                href={projectHref}
                className="group relative h-48 rounded-[2.5rem] hover:border-[#F97316]/50 transition-all duration-700 cursor-pointer overflow-hidden shadow-2xl border border-white/10"
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src="/image/Project Product-2.png"
                    alt="Projects"
                    fill
                    className="object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors duration-700" />
                </div>

                <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                
                <div className="relative z-20 h-full p-6 flex flex-col justify-end">
                  <div className="flex items-end justify-between">
                    <div className="space-y-1">
                      <h3 className="text-xl font-headline font-bold text-white leading-tight tracking-tight">
                        {displayProjectButton}
                      </h3>
                      <p className="text-white/60 text-[9px] uppercase tracking-widest font-bold group-hover:text-[#F97316] transition-colors">
                        Custom Projects
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full glass-frosted flex items-center justify-center text-white border border-white/20 group-hover:bg-white group-hover:text-[#F97316] transition-all duration-500 shadow-lg">
                      <ArrowUpRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 animate-bounce opacity-40">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-1.5">
          <div className="w-1.5 h-1.5 bg-white rounded-full" />
        </div>
      </div>
    </section>
  );
}
