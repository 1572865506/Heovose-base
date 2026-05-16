"use client";

import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import {
  Building2, Target, Users, Zap, ShieldCheck, Microchip, Factory,
  Globe2, Award, CheckCircle2, FlaskConical, Search, Cpu,
  Lightbulb, Handshake, Heart, Shield, TrendingUp, Boxes,
  ArrowRight, FileText, ChevronRight, ChevronLeft, MapPin
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

export default function AboutContent({ initialLocale }: AboutContentProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const { openInquiry } = useInquiry();
  const searchParams = useSearchParams();
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
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

  return (
    <main ref={containerRef} className="relative min-h-screen bg-slate-50 overflow-hidden font-body selection:bg-primary selection:text-white">
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

      {/* 5. Quality Management Process */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight font-headline mb-8">
              {t('ABOUT_QUALITY_TITLE')}
            </h2>
            <div className="inline-block px-8 py-3 rounded-2xl bg-slate-900 text-white text-lg font-bold">
              {t('ABOUT_QUALITY_SUBTITLE')}
            </div>
          </div>

          <div className="relative max-w-5xl mx-auto">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden lg:block" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
              {[
                { step: '01', key: 'IQC' },
                { step: '02', key: 'IPQC' },
                { step: '03', key: 'OQA' }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.2 }}
                  className="bg-white p-10 rounded-[40px] shadow-xl border border-slate-100 text-center space-y-4 hover:translate-y-[-10px] transition-transform duration-500"
                >
                  <div className="text-[40px] font-black text-slate-100 mb-[-20px]">{item.step}</div>
                  <h3 className="text-4xl font-black text-primary">{t(`ABOUT_QUALITY_${item.key}_TITLE`)}</h3>
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    {t(`ABOUT_QUALITY_${item.key}_LABEL`)}
                  </div>
                  <p className="text-slate-500 font-light">
                    {t(`ABOUT_QUALITY_${item.key}_DESC`)}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Certification Wall */}
      <section className="py-32 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-24">
            <h2 className="text-4xl font-black text-slate-900 mb-6 font-headline">
              {t('ABOUT_CERT_TITLE')}
            </h2>
            <p className="text-slate-500 uppercase tracking-widest text-xs font-bold">{t('ABOUT_CERT_SUBTITLE')}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              { key: 'ISO', icon: Award },
              { key: '3C', icon: ShieldCheck },
              { key: 'CE', icon: CheckCircle2 },
              { key: 'FCC', icon: Shield },
              { key: 'ROHS', icon: Boxes },
              { key: 'ENERGY', icon: Zap }
            ].map((cert, idx) => (
              <motion.div
                key={cert.key}
                whileHover={{ scale: 1.05, y: -5 }}
                className="group p-8 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col items-center gap-6 hover:shadow-2xl transition-all duration-500 cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <cert.icon className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 group-hover:text-slate-900">{t(`ABOUT_CERT_${cert.key}`)}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Corporate Culture & Values */}
      <section className="relative py-24 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/image/hero-bg.png" alt="Team Culture" className="w-full h-full object-cover opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        </div>
        <div className="container mx-auto px-6 relative z-10">
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-white/95 backdrop-blur-2xl rounded-[40px] lg:rounded-[60px] p-10 lg:p-20 shadow-2xl border border-white/20 max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">{t('ABOUT_CULTURE_LABEL')}</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 font-headline leading-tight">
                  {t('ABOUT_CULTURE_TITLE')}
                </h2>
                <p className="text-xl text-slate-500 font-light leading-relaxed">
                  {t('ABOUT_CULTURE_SUBTITLE')}
                </p>
              </div>
              <div className="grid gap-6">
                {[
                  { icon: Handshake, key: 'VAL1' },
                  { icon: Lightbulb, key: 'VAL2' },
                  { icon: Heart, key: 'VAL3' }
                ].map((val, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex gap-6 p-6 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-primary transition-all duration-500"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-sm group-hover:bg-white/20">
                      <val.icon className="w-7 h-7 text-primary group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 group-hover:text-white mb-1">
                        {t(`ABOUT_CULTURE_${val.key}_TITLE`)}
                      </h4>
                      <p className="text-sm text-slate-500 group-hover:text-white/70 font-light leading-relaxed">
                        {t(`ABOUT_CULTURE_${val.key}_DESC`)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
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
