'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useLanguage } from '@/hooks/use-language';
import { useTranslations } from '@/hooks/use-translations';

export function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const { locale } = useLanguage();
  const { t } = useTranslations(locale);

  const handleScroll = useCallback(() => {
    // 页面滚动超过 300px 显示按钮
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const label = t('COMMON_BACK_TO_TOP') || 'Back to top';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 select-none"
        >
          <button
            type="button"
            onClick={scrollToTop}
            aria-label={label}
            title={label}
            className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md text-zinc-700 dark:text-zinc-200 border border-zinc-200/90 dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.45)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.14)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.7)] hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-400 transition-all duration-200 hover:-translate-y-1 active:translate-y-0"
          >
            <ArrowUp
              className="w-4 h-4 sm:w-[18px] sm:h-[18px] transition-transform duration-200 group-hover:-translate-y-0.5"
              strokeWidth={2.2}
            />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
