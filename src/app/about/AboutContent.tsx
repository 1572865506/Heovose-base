"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import {
  Building2, Target, Users, Zap, ShieldCheck, Microchip, Factory,
  Globe2, Award, CheckCircle2, FlaskConical, Search, Cpu,
  Lightbulb, Handshake, Heart, Shield, TrendingUp, Boxes,
  ArrowRight, FileText, ChevronRight, ChevronLeft, MapPin, ChevronDown, BookOpen,
  Settings, ClipboardCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useLocalDoc } from "@/hooks/use-local-doc";
import { getAssetUrl } from "@/lib/image-utils";
import { useInquiry } from "@/components/providers/InquiryProvider";

interface AboutContentProps {
  initialLocale: Locale;
}

const CERT_ICONS: Record<string, any> = {
  Award,
  ShieldCheck,
  CheckCircle2,
  Shield,
  Boxes,
  Zap
};

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
      if (initialLocale && activeLangs.includes(initialLocale)) return initialLocale;
      const saved = typeof window !== 'undefined' ? localStorage.getItem('heovose-locale') as Locale : null;
      if (saved && activeLangs.includes(saved)) return saved;
      const browserLang = typeof navigator !== 'undefined' ? navigator.language.split('-')[0] as Locale : 'en';
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

  // Section Refs for scroll reveal
  const section1Ref = useRef(null);
  const section2Ref = useRef(null);
  const section3Ref = useRef(null);
  const section4Ref = useRef(null);

  // Lab Data
  const labEquipment = [
    { id: 'xray', name: 'X-RAY Tester', desc: 'Precision internal structure analysis', icon: Search, standard: 'IPC-A-610G' },
    { id: 'drop', name: 'Drop Tester', desc: 'Impact and durability simulation', icon: TrendingUp, standard: 'GB/T 2423.8' },
    { id: 'salt', name: 'Salt Spray Tester', desc: 'Corrosion resistance evaluation', icon: FlaskConical, standard: 'ASTM B117' },
    { id: 'vibration', name: 'Vibration Tester', desc: 'Transportation environment simulation', icon: Zap, standard: 'IEC 60068' },
    { id: 'temp', name: 'High/Low Temp', desc: 'Extreme environment stability', icon: Shield, standard: 'MIL-STD-810H' }
  ];

  const [activeLab, setActiveLab] = useState(0);
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

    // Build the layered panels pinning timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container,
        pin: true,
        start: "top top",
        end: `+=${(panels.length - 1) * 120}%`, // Scroll distance (120% per overlay for spacious timing)
        scrub: 1, // Smooth scrub to bind the animation speed to scroll wheel/touch
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

    return () => clearTimeout(refreshTimer);
  }, { scope: qualityContainerRef });
  const cultureSectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: cultureScrollYProgress } = useScroll({
    target: cultureSectionRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    return cultureScrollYProgress.on("change", (latest) => {
      if (latest < 0.33) {
        setActiveCultureIndex(0);
      } else if (latest < 0.66) {
        setActiveCultureIndex(1);
      } else {
        setActiveCultureIndex(2);
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
            src="/home/anthony/.gemini/antigravity/brain/18d52c97-fd15-46ee-91ea-9b6f8afd7edc/heovose_corporate_building_1778920630336.png"
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
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/90">Intelligence & Display Leader</span>
            </div>

            <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-[0.95] font-headline max-w-5xl mx-auto">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/60">
                {locale === 'zh' ? '智能计算与显示的' : 'Leader in Intelligent'}
              </span>
              <span className="block text-primary">
                {locale === 'zh' ? '全球引领者' : 'Computing & Display'}
              </span>
            </h1>

            <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed border-l border-white/10 pl-8 italic">
              {locale === 'zh'
                ? 'Heovose：从传统制造向“高新科技制造企业”的蜕变，致力于打造精品国货，让中国制造走向世界。'
                : 'Heovose: Transformed from traditional manufacturing to a high-tech enterprise, committed to premium products that bring Chinese manufacturing to the world.'}
            </p>

            <div className="flex flex-wrap justify-center gap-8 pt-8">
              {[
                { label: locale === 'zh' ? '专业' : 'Professional', desc: 'Expertise' },
                { label: locale === 'zh' ? '专注' : 'Focused', desc: 'Dedication' },
                { label: locale === 'zh' ? '创新' : 'Innovative', desc: 'Evolution' }
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

        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <div className="w-px h-16 bg-gradient-to-b from-primary to-transparent" />
          <span className="text-[9px] font-bold text-white/20 uppercase tracking-[0.3em]">Discover More</span>
        </motion.div>
      </section>

      {/* 2. Global Manufacturing Infrastructure */}
      <section className="py-32 bg-white relative overflow-hidden">
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-end mb-24 gap-8">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight mb-8 font-headline">
                {locale === 'zh' ? '全球制造版图' : 'Global Manufacturing'}
              </h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed">
                {locale === 'zh' ? '布局三厂联动体系，展示强大的全球交付与服务保证能力。' : 'Strategic three-factory ecosystem ensuring global delivery and service excellence.'}
              </p>
            </div>
            <div className="flex gap-4">
              <div className="px-6 py-3 bg-slate-100 rounded-2xl flex items-center gap-3">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">3 Production Bases</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                location: locale === 'zh' ? '中国·深圳' : 'Shenzhen, China',
                title: locale === 'zh' ? '智能研发中心' : 'Intelligent R&D Center',
                tags: locale === 'zh' ? ['一体机', '笔记本', 'Mini PC'] : ['AIO', 'Laptop', 'Mini PC'],
                focus: locale === 'zh' ? '专注小尺寸设备，走专业化、精细化路线。' : 'Precision small-size device engineering.',
                icon: Microchip
              },
              {
                location: locale === 'zh' ? '中国·广东' : 'Guangdong, China',
                title: locale === 'zh' ? '大尺寸商显基地' : 'Display Base',
                tags: locale === 'zh' ? ['会议机', '教育机', '人机交互'] : ['Conference', 'Education', 'Interaction'],
                focus: locale === 'zh' ? '专注规模化、高端化商用显示系统。' : 'High-end commercial display systems.',
                icon: Factory
              },
              {
                location: locale === 'zh' ? '印尼·东南亚' : 'Indonesia, SE Asia',
                title: locale === 'zh' ? '区域生产中心' : 'Regional Production',
                tags: locale === 'zh' ? ['本地化制造', '快速响应'] : ['Local Mfg', 'Fast Response'],
                focus: locale === 'zh' ? '全球化战略布局，实现本地化服务响应。' : 'Strategic global localized manufacturing.',
                icon: Globe2
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: idx * 0.15 }}
                className="group relative p-10 rounded-[40px] bg-slate-50 border border-slate-100 hover:bg-slate-900 hover:border-slate-800 transition-all duration-500"
              >
                <div className="mb-8 w-16 h-16 rounded-3xl bg-white shadow-xl flex items-center justify-center group-hover:bg-primary transition-colors">
                  <item.icon className="w-8 h-8 text-primary group-hover:text-white" />
                </div>
                <div className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">{item.location}</div>
                <h3 className="text-2xl font-bold text-slate-900 group-hover:text-white mb-6">{item.title}</h3>
                <p className="text-slate-500 group-hover:text-slate-400 mb-8 font-light">{item.focus}</p>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-lg bg-white group-hover:bg-white/10 text-[10px] font-bold text-slate-600 group-hover:text-white/60">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. R&D & Patents */}
      <section className="py-32 bg-slate-50 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <div>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 font-headline leading-tight">
                  {locale === 'zh' ? '软硬件自主研发' : 'Self-Developed R&D'}
                  <br />
                  <span className="text-primary">{locale === 'zh' ? '掌握核心技术优势' : 'Mastering Core Tech'}</span>
                </h2>
                <p className="text-lg text-slate-500 font-light">
                  {locale === 'zh'
                    ? '我们不仅拥有完善的硬件生产线，更深耕工业设计与软件集成，建立起全链路自主知识产权体系。'
                    : 'Beyond hardware lines, we deep dive into industrial design and software integration, building a full-link IP system.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {[
                  { icon: FileText, label: locale === 'zh' ? '外观专利' : 'Design Patents', val: '80+' },
                  { icon: Cpu, label: locale === 'zh' ? '实用新型' : 'Utility Model', val: '40+' },
                  { icon: Lightbulb, label: locale === 'zh' ? '软件著作权' : 'Soft Copyright', val: '30+' },
                  { icon: Boxes, label: locale === 'zh' ? '行业荣誉' : 'Industry Honors', val: '15+' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-slate-900">{item.val}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 relative">
                <div className="absolute top-0 right-10 -translate-y-1/2 w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <blockquote className="text-2xl font-bold text-slate-900 leading-snug italic">
                  {locale === 'zh' ? '"致力于打造精品国货，让中国制造走向世界"' : '"Dedicated to premium domestic products, bringing Chinese manufacturing to the world"'}
                </blockquote>
                <cite className="block mt-4 text-[10px] font-black uppercase tracking-widest text-primary">— Heovose Core Vision</cite>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-auto h-full min-h-[500px]">
              <div className="absolute inset-0 bg-slate-200 rounded-[60px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop"
                  alt="R&D Lab"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating Stats */}
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                className="absolute -right-8 top-20 p-8 rounded-3xl bg-white shadow-2xl z-20 border border-slate-100"
              >
                <div className="text-5xl font-black text-primary mb-2">150+</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">R&D Engineers</div>
              </motion.div>
              <div className="absolute -left-10 bottom-20 p-8 rounded-[40px] bg-slate-900 text-white shadow-2xl z-20 border border-slate-800 hidden md:block">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-2 h-2 rounded-full bg-primary animate-ping" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Innovation First</span>
                </div>
                <p className="text-lg font-light leading-snug max-w-[200px]">Leading the industry with independent innovation.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Quality Control Lab */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/home/anthony/.gemini/antigravity/brain/18d52c97-fd15-46ee-91ea-9b6f8afd7edc/qc_lab_equipment_1778920655750.png')] opacity-20 grayscale brightness-50" />

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-24">
            <div className="inline-block px-4 py-1 rounded-lg bg-primary/20 border border-primary/30 text-[10px] font-black uppercase tracking-widest text-primary mb-6">Laboratory Grade</div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight font-headline mb-8">
              {locale === 'zh' ? '严苛品质实验室' : 'Quality Control Lab'}
            </h2>
            <p className="text-xl text-slate-400 font-light leading-relaxed">
              {locale === 'zh' ? '通过“实验室级别”的极端环境测试，彻底打消客户对电子产品稳定性的疑虑。' : 'Eliminating stability concerns through laboratory-grade extreme environmental testing.'}
            </p>
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              <div className="w-full lg:w-1/2 space-y-4">
                {labEquipment.map((item, i) => (
                  <motion.div
                    key={item.id}
                    onClick={() => setActiveLab(i)}
                    className={cn(
                      "p-8 rounded-[32px] cursor-pointer transition-all duration-500 flex items-center justify-between group",
                      activeLab === i ? "bg-primary shadow-2xl shadow-primary/20 scale-[1.02]" : "bg-white/5 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center gap-6">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center transition-colors", activeLab === i ? "bg-white/20" : "bg-white/10 group-hover:bg-primary")}>
                        <item.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold">{item.name}</h4>
                        <p className={cn("text-xs transition-colors", activeLab === i ? "text-white/70" : "text-slate-500")}>{item.desc}</p>
                      </div>
                    </div>
                    {activeLab === i && <ArrowRight className="w-5 h-5 text-white/50" />}
                  </motion.div>
                ))}
              </div>

              <div className="w-full lg:w-1/2 relative aspect-video lg:aspect-auto lg:h-[600px]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeLab}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    className="w-full h-full rounded-[40px] bg-white/10 backdrop-blur-3xl p-12 border border-white/10 flex flex-col justify-between"
                  >
                    <div className="space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="w-20 h-20 rounded-3xl bg-primary/20 flex items-center justify-center">
                          {(() => {
                            const Icon = labEquipment[activeLab].icon;
                            return <Icon className="w-10 h-10 text-primary" />;
                          })()}
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Testing Standard</div>
                          <div className="text-xl font-black font-headline text-primary">{labEquipment[activeLab].standard}</div>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-4xl font-black mb-4">{labEquipment[activeLab].name}</h3>
                        <p className="text-lg text-slate-400 font-light leading-relaxed">
                          {t(`ABOUT_LAB_DESC_${labEquipment[activeLab].id.toUpperCase()}`) || (locale === 'zh' 
                            ? '该测试旨在通过模拟极端运输震动、高温高湿或高空跌落等极端工况，验证产品在各种严苛环境下的物理结构强度与电路连接稳定性。' 
                            : 'Designed to simulate extreme transportation vibration, high humidity, or high-altitude drops to verify structural integrity and circuit stability under harsh conditions.')}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('ABOUT_LAB_CONFIDENCE')}</div>
                        <div className="text-3xl font-black">99.9%</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('ABOUT_LAB_DURATION')}</div>
                        <div className="text-3xl font-black">72H+</div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
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
              <div className="h-[3px] w-24 bg-gradient-to-r from-primary to-transparent" />
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
              <div className="h-[3px] w-24 bg-gradient-to-r from-primary to-transparent" />
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
              <div className="h-[3px] w-24 bg-gradient-to-r from-primary to-transparent" />
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
                          <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400">暂无证书图</span>
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
      <section ref={cultureSectionRef} className="relative h-[220vh] bg-slate-950">
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-10">
          <div className="absolute inset-0 z-0">
            <img src="/image/Corporate Culture bg.jpg" alt="Team Culture" className="w-full h-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
          </div>
          <div className="container mx-auto px-6 relative z-10 w-full">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="bg-white/95 backdrop-blur-2xl rounded-[40px] lg:rounded-[60px] p-10 lg:p-20 shadow-2xl border border-white/20 max-w-6xl mx-auto w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <h2 className="text-4xl md:text-6xl font-black text-slate-900 font-headline leading-tight">
                    {t('ABOUT_CULTURE_TITLE')}
                  </h2>
                  <p className="text-xl text-slate-500 font-light leading-relaxed">
                    {t('ABOUT_CULTURE_SUBTITLE')}
                  </p>
                </div>
                <div className="grid gap-6 min-h-[380px] sm:min-h-[420px] lg:min-h-[460px] content-start">
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
                          "relative overflow-hidden p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer select-none group flex flex-col justify-center",
                          isActive
                            ? "bg-primary border-primary shadow-xl shadow-primary/20 scale-[1.02]"
                            : "bg-slate-50/60 backdrop-blur-md border-slate-100/50 hover:bg-[#f8fafc]/90"
                        )}
                      >
                        {/* Subtle bottom lighting gradient */}
                        {isActive && (
                          <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-white/10 via-white/0 to-transparent pointer-events-none z-0" />
                        )}
                        
                        <div className="flex items-center justify-between w-full relative z-10">
                          <div className="flex items-center gap-6">
                            <div className={cn(
                              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-all duration-500",
                              isActive ? "bg-white/20" : "bg-white"
                            )}>
                              <val.icon className={cn(
                                "w-7 h-7 transition-colors duration-500",
                                isActive ? "text-white" : "text-primary"
                              )} />
                            </div>
                            <h4 className={cn(
                              "text-xl font-bold font-headline transition-colors duration-500",
                              isActive ? "text-white" : "text-slate-900"
                            )}>
                              {t(`ABOUT_CULTURE_${val.key}_TITLE`)}
                            </h4>
                          </div>
                          <ChevronDown className={cn(
                            "w-6 h-6 transition-all duration-500 shrink-0",
                            isActive ? "text-white rotate-180" : "text-slate-400"
                          )} />
                        </div>
                        
                        <motion.div
                          initial={false}
                          animate={{
                            height: isActive ? "auto" : 0,
                            opacity: isActive ? 1 : 0,
                            marginTop: isActive ? 16 : 0
                          }}
                          transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                          className="overflow-hidden lg:pl-20 pl-0 relative z-10"
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
