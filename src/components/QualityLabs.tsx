"use client";

import { motion } from "framer-motion";
import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import { Microscope, ShieldCheck, Activity, MoveDown, Wind, Beaker } from "lucide-react";
import { useLocalDoc } from "@/hooks/use-local-doc";

interface QualityLabsProps {
  locale: Locale;
}

export function QualityLabs({ locale }: QualityLabsProps) {
  const { t } = useTranslations(locale);
  const { data: aboutContent } = useLocalDoc<any>('settings', 'about_page_content');

  const iconMap: Record<string, any> = {
    'xray': Microscope,
    'drop': MoveDown,
    'salt': Wind,
    'vibration': Activity,
    'temp': Beaker
  };

  const labItems = aboutContent?.labItems || [];

  return (
    <section className="py-24 bg-slate-950 text-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 text-accent mb-6">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-sm font-bold uppercase tracking-[0.3em]">{t('ABOUT_QUALITY_TITLE')}</span>
            </div>
            <h2 className="text-4xl lg:text-6xl font-bold font-headline leading-tight">
              {locale === 'zh' ? '品质是生产出来的，不是检验出来的' : 'Quality is Built, Not Just Inspected'}
            </h2>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-8 md:mt-0"
          >
            <div className="text-slate-500 text-sm max-w-xs italic border-l-2 border-accent pl-6">
              "We implement strict IQC, IPQC, and OQA processes to ensure zero-defect delivery."
            </div>
          </motion.div>
        </div>

        {/* Labs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {labItems.map((lab: any, idx: number) => {
            const Icon = iconMap[lab.id] || Microscope;
            return (
              <motion.div
                key={lab.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group relative bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/10 transition-all duration-500"
              >
                <div className="flex flex-col h-full">
                  <div className="w-12 h-12 bg-accent/20 rounded-2xl flex items-center justify-center mb-8 text-accent group-hover:scale-110 transition-transform duration-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white group-hover:text-accent transition-colors duration-500">
                    {lab.name}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {lab.desc}
                  </p>
                  
                  {/* Visual Accent */}
                  <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">Lab Standard: ISO 9001</span>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  </div>
                </div>
              </motion.div>
            );
          })}
          
          {/* Certifications Quick Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-accent rounded-[2.5rem] p-10 flex flex-col justify-center text-white relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="w-40 h-40" />
            </div>
            <h3 className="text-3xl font-bold mb-6 relative z-10">Global Certification Wall</h3>
            <p className="text-white/80 mb-8 relative z-10">
              Heovose is fully certified with CE, FCC, RoHS, and ISO standards to meet international market requirements.
            </p>
            <div className="flex gap-4 relative z-10">
              <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">ISO 9001</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">3C</div>
              <div className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold">CE / FCC</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
