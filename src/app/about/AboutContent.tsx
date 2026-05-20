"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import { useLocalDoc } from "@/hooks/use-local-doc";
import {
  Zap, ShieldCheck, Award, CheckCircle2, FlaskConical, Search, Cpu,
  TrendingUp, Boxes, ArrowRight, MapPin, ChevronDown, BookOpen,
  Microchip, Factory, Globe2, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getAssetUrl } from "@/lib/image-utils";
import { useInquiry } from "@/components/providers/InquiryProvider";

interface AboutContentProps {
  initialLocale: Locale;
}

export default function AboutContent({ initialLocale }: AboutContentProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const { openInquiry } = useInquiry();
  const searchParams = useSearchParams();
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { data: siteConfig } = useLocalDoc<any>('settings', 'site');
  const { t } = useTranslations(locale);

  useEffect(() => {
    const detectLocale = () => {
      const activeLangs = langSettings?.supportedLanguages?.map((l: any) => l.code) || ['en', 'zh', 'id', 'vi'];
      const defaultLang = (langSettings?.defaultLanguage as Locale) || 'en';
      const langParam = searchParams.get('lang');
      if (langParam && activeLangs.includes(langParam)) return langParam as Locale;
      
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      
      if (initialLocale && activeLangs.includes(initialLocale)) return initialLocale;
      
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
      document.cookie = `NEXT_LOCALE=${detected}; path=/; max-age=31536000`;
    }
  }, [searchParams, langSettings, initialLocale]);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Parallax for Hero
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  // Lab Data
  const labEquipment = useMemo(() => {
    const items = [
      {
        id: 'XRAY_2_5D',
        icon: Search,
        image: '/image/equip_xray_2_5d.png',
        defaultStandard: 'IPC-A-610G'
      },
      {
        id: 'HORIZONTAL_VERTICAL_VIBRATION',
        icon: Zap,
        image: '/image/equip_horiz_vert_vib.png',
        defaultStandard: 'GB/T 2423.10'
      },
      {
        id: 'VARIABLE_FREQUENCY_VIBRATION',
        icon: TrendingUp,
        image: '/image/equip_var_freq_vib.png',
        defaultStandard: 'IEC 60068-2-6'
      },
      {
        id: 'SALT_SPRAY',
        icon: FlaskConical,
        image: '/image/equip_salt_spray.png',
        defaultStandard: 'ASTM B117'
      },
      {
        id: 'SIMULATED_CAR_VIBRATION',
        icon: Boxes,
        image: '/image/equip_sim_car_vib.png',
        defaultStandard: 'ASTM D999'
      },
      {
        id: 'TRI_5DX',
        icon: Cpu,
        image: '/image/equip_tri_5dx.png',
        defaultStandard: 'IPC-7095C'
      },
      {
        id: 'DROP_TEST',
        icon: ShieldCheck,
        image: '/image/equip_drop_tester.png',
        defaultStandard: 'GB/T 2423.8'
      }
    ];

    return items.map(item => ({
      ...item,
      name: t(`ABOUT_LAB_NAME_${item.id}`) || item.id,
      desc: t(`ABOUT_LAB_DESC_${item.id}`) || '',
      standard: t(`ABOUT_LAB_STANDARD_${item.id}`) || item.defaultStandard,
      detail: t(`ABOUT_LAB_DETAIL_${item.id}`) || ''
    }));
  }, [t]);

  const scrollTrackRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: -440, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollTrackRef.current) {
      scrollTrackRef.current.scrollBy({ left: 440, behavior: "smooth" });
    }
  };

  const [activeCultureIndex, setActiveCultureIndex] = useState<number | null>(0);

  // Cert Marquee Infinite Loop State & Refs
  const [isCertHovered, setIsCertHovered] = useState(false);
  const certTrackRef = useRef<HTMLDivElement>(null);
  const certOffsetRef = useRef(0);
  const certSpeedRef = useRef(1.2);

  useEffect(() => {
    const targetSpeed = isCertHovered ? 0.25 : 1.2;
    let animationFrameId: number;

    const animate = () => {
      // Exponential smoothing (LERP) for dynamic deceleration and acceleration
      certSpeedRef.current += (targetSpeed - certSpeedRef.current) * 0.08;
      certOffsetRef.current -= certSpeedRef.current;

      if (certTrackRef.current) {
        const trackWidth = certTrackRef.current.scrollWidth / 3;
        if (trackWidth > 0 && Math.abs(certOffsetRef.current) >= trackWidth) {
          // Seamless reset of offset
          certOffsetRef.current = 0;
        }
        certTrackRef.current.style.transform = `translateX(${certOffsetRef.current}px)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isCertHovered]);
  const qualityContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Register GSAP ScrollTrigger in the client side hook
    gsap.registerPlugin(ScrollTrigger);

    const container = qualityContainerRef.current;
    if (!container) return;

    const panels = container.querySelectorAll(".quality-panel");
    if (panels.length === 0) return;

    // Responsive initialization: Stack all panels absolute-inset and hide non-first panels offscreen bottom (yPercent: 100)
    gsap.set(panels, {
      yPercent: (i) => (i === 0 ? 0 : 100),
      scale: 1,
      opacity: 1
    });

    // Build the layered panels pinning timeline with anticipatePin to prevent overlap
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        pin: true,
        start: "top top",
        end: `+=${(panels.length - 1) * 120}%`, // Scroll distance (120% per overlay for spacious timing)
        scrub: 1, // Smooth scrub to bind the animation speed to scroll wheel/touch
        anticipatePin: 1, // Prevent pinning jitter and content overlap
        invalidateOnRefresh: true
      }
    });

    // Configure the GSAP timelines for each panel slide-up and scale-down transitions
    panels.forEach((panel, index) => {
      if (index === 0) return; // Keep the base panel (IQC) as static underneath initially

      const prevPanel = panels[index - 1];
      const currentContent = panel.querySelector(".quality-content");

      // Slide up the current panel from bottom (yPercent: 100 -> 0)
      // while previous panel remains completely static underneath at scale 1
      tl.to(panel, {
        yPercent: 0,
        ease: "none"
      }, `panel-${index}`)
        .fromTo(currentContent, {
          y: 80
        }, {
          y: 0,
          duration: 0.5,
          ease: "power2.out"
        }, `panel-${index}+=0.15`);
    });

    // Recalibrate ScrollTrigger positions after all page images/styles hydrate and settle
    const refreshTimer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 450);

    // Watch for image loads to prevent layout shifts throwing off ScrollTrigger calculations
    const images = document.querySelectorAll("img");
    images.forEach(img => {
      if (img.complete) return;
      img.addEventListener("load", () => {
        ScrollTrigger.refresh();
      });
    });

    // Body ResizeObserver to dynamically update pin positions during runtime layout changes
    const resizeObserver = new ResizeObserver(() => {
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    return () => {
      clearTimeout(refreshTimer);
      resizeObserver.disconnect();
    };
  }, { scope: qualityContainerRef });
  const cultureSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cultureScrollYProgress } = useScroll({
    target: cultureSectionRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    return cultureScrollYProgress.on("change", (latest) => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        if (latest < 0.33) {
          setActiveCultureIndex(0);
        } else if (latest < 0.66) {
          setActiveCultureIndex(1);
        } else {
          setActiveCultureIndex(2);
        }
      }
    });
  }, [cultureScrollYProgress]);

  return (
    <main ref={containerRef} className="relative min-h-screen bg-slate-50 overflow-x-clip font-body selection:bg-primary selection:text-white">
      <Navbar locale={locale} setLocale={setLocale} />

      {/* 1. Brand Prologue: Hero Section */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden bg-slate-950">
        <motion.div
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="absolute inset-0 z-0"
        >
          <img
            src="/image/heovose_corporate_building.png"
            alt="Heovose Building"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/60 to-slate-950" />
        </motion.div>

        <div className="container relative z-10 mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">{t('ABOUT_HERO_BADGE')}</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] font-headline max-w-5xl mx-auto">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                {t('ABOUT_HERO_TITLE_1')}
              </span>
              <span className="block text-primary">
                {t('ABOUT_HERO_TITLE_2')}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed border-l border-white/10 pl-8 italic">
              {t('ABOUT_HERO_SUBTITLE')}
            </p>

            <div className="flex flex-wrap justify-center gap-8 pt-8">
              {[
                { label: t('ABOUT_HERO_VAL1_LABEL'), desc: t('ABOUT_HERO_VAL1_DESC') },
                { label: t('ABOUT_HERO_VAL2_LABEL'), desc: t('ABOUT_HERO_VAL2_DESC') },
                { label: t('ABOUT_HERO_VAL3_LABEL'), desc: t('ABOUT_HERO_VAL3_DESC') }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="text-3xl font-black text-white mb-1">{item.label}</div>
                  <div className="text-[9px] uppercase tracking-widest text-primary font-bold">{item.desc}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent" />
            <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em] whitespace-nowrap">
              {t('ABOUT_HERO_SCROLL')}
            </span>
          </motion.div>
        </div>
      </section>

      {/* 2. Global Manufacturing Infrastructure */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 font-headline">
                {t('ABOUT_MAP_TITLE')}
              </h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                {t('ABOUT_MAP_SUBTITLE')}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-slate-100 rounded-2xl flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{t('ABOUT_MAP_BADGE')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                location: t('ABOUT_MAP_BASE1_LOC'),
                title: t('ABOUT_MAP_BASE1_TITLE'),
                focus: t('ABOUT_MAP_BASE1_FOCUS'),
                tags: t('ABOUT_MAP_BASE1_TAGS') && !t('ABOUT_MAP_BASE1_TAGS').startsWith('ABOUT_')
                  ? t('ABOUT_MAP_BASE1_TAGS').split(',').map(s => s.trim()).filter(Boolean)
                  : [],
                icon: Microchip
              },
              {
                location: t('ABOUT_MAP_BASE2_LOC'),
                title: t('ABOUT_MAP_BASE2_TITLE'),
                focus: t('ABOUT_MAP_BASE2_FOCUS'),
                tags: t('ABOUT_MAP_BASE2_TAGS') && !t('ABOUT_MAP_BASE2_TAGS').startsWith('ABOUT_')
                  ? t('ABOUT_MAP_BASE2_TAGS').split(',').map(s => s.trim()).filter(Boolean)
                  : [],
                icon: Factory
              },
              {
                location: t('ABOUT_MAP_BASE3_LOC'),
                title: t('ABOUT_MAP_BASE3_TITLE'),
                focus: t('ABOUT_MAP_BASE3_FOCUS'),
                tags: t('ABOUT_MAP_BASE3_TAGS') && !t('ABOUT_MAP_BASE3_TAGS').startsWith('ABOUT_')
                  ? t('ABOUT_MAP_BASE3_TAGS').split(',').map(s => s.trim()).filter(Boolean)
                  : [],
                icon: Globe2
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
                className="group relative p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-primary hover:border-primary transition-all duration-500"
              >
                <div className="mb-8 w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center group-hover:bg-white/20 transition-colors">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-white/90 mb-2">{item.location}</div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-6">{item.title}</h3>
                <p className="text-slate-500 group-hover:text-white/80 mb-8 font-light">{item.focus}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white group-hover:bg-white/20 text-[10px] font-bold text-slate-600 group-hover:text-white">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>



      {/* 4. Quality Control Lab */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/image/qc_lab_equipment.png')] opacity-15 grayscale brightness-50" />

        <div className="container mx-auto px-6 relative z-10">
          {/* Section Header with Premium Scrolling Navigation Buttons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-6xl font-black tracking-tight font-headline">
                {t('ABOUT_LAB_TITLE')}
              </h2>
              <p className="text-xl text-slate-400 font-light leading-relaxed mt-6">
                {t('ABOUT_LAB_SUBTITLE')}
              </p>
            </div>

            {/* Apple-style smooth horizontal track nav controls */}
            <div className="flex gap-4 self-start md:self-end">
              <button
                onClick={scrollLeft}
                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-105 transition-all duration-300 active:scale-95 group"
                aria-label="Scroll Left"
              >
                <ChevronLeft className="w-6 h-6 text-white group-hover:text-white transition-colors" />
              </button>
              <button
                onClick={scrollRight}
                className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-primary hover:border-primary hover:scale-105 transition-all duration-300 active:scale-95 group"
                aria-label="Scroll Right"
              >
                <ChevronRight className="w-6 h-6 text-white group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Horizontal scroll track of gorgeous bento-style testing items cards */}
          <div
            ref={scrollTrackRef}
            className="relative w-full overflow-x-auto pb-10 flex gap-8 scrollbar-minimal snap-x snap-mandatory scroll-smooth"
          >
            {labEquipment.map((item, i) => (
              <div
                key={item.id}
                className="snap-start w-[300px] sm:w-[350px] md:w-[380px] shrink-0 relative overflow-hidden p-8 md:p-10 rounded-[32px] bg-slate-900/60 border border-white/10 backdrop-blur-md flex flex-col justify-start h-[380px] hover:border-primary/50 transition-all duration-500 group"
              >
                {/* Dynamic soft radial background glow on hover */}
                <div className="absolute -inset-px bg-gradient-to-br from-primary/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                {/* Icon (Header) */}
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors duration-500 mb-6 shrink-0 relative z-10">
                  {(() => {
                    const Icon = item.icon || Search;
                    return <Icon className="w-7 h-7 text-primary" />;
                  })()}
                </div>

                {/* Card Body */}
                <div className="space-y-3 relative z-10">
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight group-hover:text-primary transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-xs font-bold text-primary uppercase tracking-widest block">
                    {item.desc}
                  </p>
                  <p className="text-sm text-slate-400 font-light leading-relaxed text-left line-clamp-5 group-hover:text-slate-300 transition-colors duration-300">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Quality Management Process (Sticky Panels Layering via GSAP ScrollTrigger) */}
      <section ref={qualityContainerRef} className="relative w-full h-screen overflow-hidden bg-slate-950">

        {/* Global floating header outside the sliding panels */}
        <div className="absolute top-12 left-6 md:left-12 lg:left-16 z-40 flex items-center gap-4">
          <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)] animate-pulse" />
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white font-headline tracking-tight uppercase">
              {t('ABOUT_QUALITY_TITLE')}
            </h2>
            <div className="h-0.5 w-16 bg-primary/50 mt-1" />
          </div>
        </div>

        {/* IQC Section Panel (Base layer, fully visible initially) */}
        <div className="quality-panel w-full h-full absolute inset-0 z-10 overflow-hidden bg-slate-950">
          {/* Panel background image covers the entire screen */}
          <div className="absolute inset-0 z-0">
            <img src="/image/quality_bg.png" alt="IQC Facility" className="w-full h-full object-cover opacity-30" />
            {/* Dark premium gradient underlay to guarantee left-aligned text legibility */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
          </div>

          {/* Left-Aligned Frameless Typography Block */}
          <div className="container mx-auto px-6 md:px-16 lg:px-24 relative z-10 w-full h-full flex items-center max-w-7xl">
            <div className="quality-content max-w-xl md:max-w-2xl text-left space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  STAGE 01
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  {t('ABOUT_QUALITY_IQC_LABEL')}
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-headline tracking-tighter leading-none">
                {t('ABOUT_QUALITY_IQC_TITLE')}
              </h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light text-justify max-w-2xl border-l-2 border-primary/30 pl-6">
                {t('ABOUT_QUALITY_IQC_DESC')}
              </p>
            </div>
          </div>
        </div>

        {/* IPQC Section Panel (Second layer, overlays IQC) */}
        <div className="quality-panel w-full h-full absolute inset-0 z-20 overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <img src="/image/ipqc_bg.png" alt="IPQC Facility" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
          </div>

          {/* Left-Aligned Frameless Typography Block */}
          <div className="container mx-auto px-6 md:px-16 lg:px-24 relative z-10 w-full h-full flex items-center max-w-7xl">
            <div className="quality-content max-w-xl md:max-w-2xl text-left space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  STAGE 02
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  {t('ABOUT_QUALITY_IPQC_LABEL')}
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-headline tracking-tighter leading-none">
                {t('ABOUT_QUALITY_IPQC_TITLE')}
              </h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light text-justify max-w-2xl border-l-2 border-primary/30 pl-6">
                {t('ABOUT_QUALITY_IPQC_DESC')}
              </p>
            </div>
          </div>
        </div>

        {/* OQA Section Panel (Third layer, overlays IPQC) */}
        <div className="quality-panel w-full h-full absolute inset-0 z-30 overflow-hidden bg-slate-950">
          <div className="absolute inset-0 z-0">
            <img src="/image/oqa_bg.png" alt="OQA Facility" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
          </div>

          {/* Left-Aligned Frameless Typography Block */}
          <div className="container mx-auto px-6 md:px-16 lg:px-24 relative z-10 w-full h-full flex items-center max-w-7xl">
            <div className="quality-content max-w-xl md:max-w-2xl text-left space-y-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-black tracking-widest text-primary uppercase bg-primary/10 px-3 py-1 rounded border border-primary/20">
                  STAGE 03
                </span>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                  {t('ABOUT_QUALITY_OQA_LABEL')}
                </span>
              </div>
              <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white font-headline tracking-tighter leading-none">
                {t('ABOUT_QUALITY_OQA_TITLE')}
              </h3>
              <p className="text-slate-300 text-base md:text-lg leading-relaxed font-light text-justify max-w-2xl border-l-2 border-primary/30 pl-6">
                {t('ABOUT_QUALITY_OQA_DESC')}
              </p>
            </div>
          </div>
        </div>

      </section>

      {/* 6. Certification Wall */}
      <section className="py-32 bg-slate-50 relative overflow-hidden">
        <div className="container mx-auto px-6 mb-16">
          <div className="text-center">
            <h2 className="text-4xl font-black text-slate-900 mb-6 font-headline">
              {t('ABOUT_CERT_TITLE')}
            </h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{t('ABOUT_CERT_SUBTITLE')}</p>
          </div>
        </div>

        {/* Dynamic Horizontal Infinite Scrolling Loop with JS requestAnimationFrame deceleration */}
        <div className="relative w-full overflow-hidden py-4">
          {/* Fading Mask Overlay on both sides for premium look */}
          <div className="absolute inset-y-0 left-0 w-24 sm:w-48 bg-gradient-to-r from-slate-50 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-24 sm:w-48 bg-gradient-to-l from-slate-50 to-transparent z-10 pointer-events-none" />

          {/* Scrolling Track Container */}
          <div
            onMouseEnter={() => setIsCertHovered(true)}
            onMouseLeave={() => setIsCertHovered(false)}
            className="logo-loop-container flex overflow-hidden select-none"
          >
            <div ref={certTrackRef} className="logo-loop-track flex gap-8 py-4 px-4 will-change-transform">
              {(siteConfig?.certifications || [
                { key: 'ISO', image: '' },
                { key: '3C', image: '' },
                { key: 'CE', image: '' },
                { key: 'FCC', image: '' },
                { key: 'ROHS', image: '' },
                { key: 'ENERGY', image: '' }
              ]).concat(
                siteConfig?.certifications || [
                  { key: 'ISO', image: '' },
                  { key: '3C', image: '' },
                  { key: 'CE', image: '' },
                  { key: 'FCC', image: '' },
                  { key: 'ROHS', image: '' },
                  { key: 'ENERGY', image: '' }
                ]
              ).concat(
                siteConfig?.certifications || [
                  { key: 'ISO', image: '' },
                  { key: '3C', image: '' },
                  { key: 'CE', image: '' },
                  { key: 'FCC', image: '' },
                  { key: 'ROHS', image: '' },
                  { key: 'ENERGY', image: '' }
                ]
              ).map((cert: any, idx: number) => {
                return (
                  <div
                    key={`${cert.key}-${idx}`}
                    className="p-5 rounded-3xl bg-white border border-slate-100/80 shadow-sm flex flex-col items-center gap-4 w-48 shrink-0 select-none"
                  >
                    <div className="w-full aspect-[3/4] rounded-2xl bg-slate-50 overflow-hidden relative border border-slate-100/60 flex items-center justify-center shrink-0">
                      {cert.image ? (
                        <img
                          src={getAssetUrl(cert.image)}
                          alt={t(`ABOUT_CERT_${cert.key}`)}
                          className="w-full h-full object-contain p-2 transition-transform duration-500"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300 transition-colors">
                          <Award className="w-10 h-10" />
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">{t('ABOUT_CERT_NO_IMAGE')}</span>
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-center text-slate-500 transition-colors line-clamp-1">
                      {t(`ABOUT_CERT_${cert.key}`)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 7. Corporate Culture & Values */}
      <section ref={cultureSectionRef} className="relative h-auto lg:h-[220vh] bg-slate-950">
        <div className="relative lg:sticky lg:top-0 h-auto min-h-screen lg:h-screen w-full flex items-center justify-center overflow-hidden z-10 py-12 sm:py-20 lg:py-0">
          <div className="absolute inset-0 z-0">
            <img src="/image/Corporate Culture bg.jpg" alt="Team Culture" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
          </div>
          <div className="container mx-auto px-6 relative z-10 w-full">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] lg:rounded-[60px] p-6 sm:p-10 lg:p-20 shadow-2xl border border-white/20 max-w-6xl mx-auto w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                <div className="space-y-6 sm:space-y-8">
                  <h2 className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-900 font-headline leading-tight">
                    {t('ABOUT_CULTURE_TITLE')}
                  </h2>
                  <p className="text-base sm:text-lg lg:text-xl text-slate-500 font-light leading-relaxed">
                    {t('ABOUT_CULTURE_SUBTITLE')}
                  </p>
                </div>
                <div className="grid gap-4 sm:gap-6 min-h-0 content-start">
                  {[
                    { icon: CheckCircle2, key: 'VAL1' },
                    { icon: BookOpen, key: 'VAL2' },
                    { icon: BookOpen, key: 'VAL3' }
                  ].map((val, i) => {
                    const isActive = activeCultureIndex === i;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + i * 0.1, duration: 0.6 }}
                        onClick={() => setActiveCultureIndex(isActive ? null : i)}
                        className={cn(
                          "relative overflow-hidden p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2.5rem] border transition-all duration-500 cursor-pointer select-none group flex flex-col justify-center",
                          isActive
                            ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.01]"
                            : "bg-slate-50/60 backdrop-blur-md border-slate-100/50 hover:bg-[#f8fafc]/90"
                        )}
                      >
                        {/* Subtle bottom lighting gradient */}
                        {isActive && (
                          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/10 via-white/0 to-transparent pointer-events-none z-0" />
                        )}

                        <div className="flex items-center justify-between w-full relative z-10">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className={cn(
                              "w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500",
                              isActive ? "bg-white/20" : "bg-white"
                            )}>
                              <val.icon className={cn(
                                "w-5 h-5 sm:w-7 sm:h-7 transition-colors duration-500",
                                isActive ? "text-white" : "text-primary"
                              )} />
                            </div>
                            <h4 className={cn(
                              "text-lg sm:text-xl font-bold font-headline transition-colors duration-500",
                              isActive ? "text-white" : "text-slate-900"
                            )}>
                              {t(`ABOUT_CULTURE_${val.key}_TITLE`)}
                            </h4>
                          </div>
                          <ChevronDown className={cn(
                            "w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500 shrink-0",
                            isActive ? "text-white rotate-180" : "text-slate-400"
                          )} />
                        </div>

                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                            marginTop: isActive ? 12 : 0
                          }}
                          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden sm:pl-20 pl-0 relative z-10"
                        >
                          <p className={cn(
                            "text-sm font-light leading-relaxed transition-colors duration-500",
                            isActive ? "text-white/80" : "text-slate-500"
                          )}>
                            {t(`ABOUT_CULTURE_${val.key}_DESC`)}
                          </p>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 bg-slate-950 relative overflow-hidden group z-10 -mt-1 border-t border-white/5">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="container mx-auto px-6 relative z-10 text-center space-y-10">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {t('ABOUT_CTA_TITLE')}
          </h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openInquiry()}
            className="px-12 py-5 bg-primary text-white rounded-full font-black uppercase tracking-widest transition-all flex items-center gap-3 mx-auto shadow-none"
          >
            {t('ABOUT_CTA_BUTTON')}
            <ArrowRight className="w-5 h-5" />
          </motion.button>
        </div>
      </section>

      <Footer locale={locale} />
    </main>
  );
}
