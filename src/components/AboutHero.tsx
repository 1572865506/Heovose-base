"use client";

import { motion } from "framer-motion";
import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import { cn } from "@/lib/utils";

interface AboutHeroProps {
  locale: Locale;
}

export function AboutHero({ locale }: AboutHeroProps) {
  const { t } = useTranslations(locale);

  return (
    <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-slate-950">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/60 to-slate-950 z-10" />
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.6 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="w-full h-full"
        >
          {/* Placeholder for high-quality building image or video */}
          <img 
            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop" 
            alt="Heovose Headquarters"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 relative z-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <span className="inline-block px-4 py-1.5 bg-accent/20 text-accent rounded-full text-xs font-bold uppercase tracking-[0.3em] mb-8 backdrop-blur-md border border-accent/30">
            {t('ABOUT_HERO_BADGE')}
          </span>
          <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-8xl font-bold text-white mb-8 tracking-tight font-headline break-words whitespace-normal">
            {t('ABOUT_HERO_TITLE')}
          </h1>
          <p className="text-xl lg:text-2xl text-white/60 max-w-3xl mx-auto leading-relaxed font-light">
            {t('ABOUT_HERO_SUBTITLE')}
          </p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{t('ABOUT_HERO_SCROLL')}</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-accent to-transparent" />
        </motion.div>
      </div>
    </section>
  );
}
