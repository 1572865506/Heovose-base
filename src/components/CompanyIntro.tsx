"use client";

import { motion } from "framer-motion";
import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";
import { Building2, Target, Users, Zap } from "lucide-react";
import { useLocalDoc } from "@/hooks/use-local-doc";

interface CompanyIntroProps {
  locale: Locale;
}

export function CompanyIntro({ locale }: CompanyIntroProps) {
  const { t } = useTranslations(locale);
  const { data: aboutContent } = useLocalDoc<any>('settings', 'about_page_content');

  const iconMap: Record<string, any> = {
    'Brand Concept': Target,
    'Corporate Mission': Zap,
    'Development Concept': Users,
    '品牌理念': Target,
    '企业使命': Zap,
    '发展理念': Users
  };

  const cultureItems = aboutContent?.cultureItems || [];
  const introTitle = aboutContent?.introTitle?.[locale] || t('ABOUT_INTRO_TITLE');
  const introText = aboutContent?.introText?.[locale] || t('ABOUT_INTRO_TEXT');

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-center mb-32">
          {/* Left: Text */}
          <div className="lg:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6 font-headline break-words whitespace-normal">
                {introTitle}
              </h2>
              <div className="w-20 h-1.5 bg-accent mb-8 rounded-full" />
              <div className="space-y-6 text-lg text-slate-600 leading-relaxed font-light">
                {introText.split('\n').map((para: string, i: number) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right: Image Frame */}
          <div className="lg:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl border-[12px] border-slate-50"
            >
              <img 
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop" 
                alt="Heovose Office"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-accent/10 mix-blend-overlay" />
            </motion.div>
            
            {/* Stats Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-xl border border-slate-100 hidden lg:block"
            >
              <div className="flex items-center gap-6">
                <div className="bg-accent/10 p-4 rounded-2xl">
                  <Building2 className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <div className="text-3xl font-bold text-slate-900">3</div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest">Global Factories</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Corporate Culture Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cultureItems.map((item: any, idx: number) => {
            const Icon = iconMap[item.title] || Target;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-accent/30 hover:bg-white hover:shadow-xl transition-all duration-500 group"
              >
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-sm group-hover:bg-accent group-hover:text-white transition-all duration-500">
                  <Icon className="w-7 h-7" />
                </div>
                <div className="text-xs font-bold text-accent uppercase tracking-widest mb-2">{item.title}</div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.desc}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.detail}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
