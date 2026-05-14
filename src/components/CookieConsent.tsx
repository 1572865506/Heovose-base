'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/hooks/use-language';
import { useTranslations } from '@/hooks/use-translations';
import { Button } from '@/components/ui/button';
import { ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const pathname = usePathname();
  const { locale, isReady } = useLanguage();
  const { t } = useTranslations(locale);

  useEffect(() => {
    // 禁用后台路由弹出
    if (pathname?.startsWith('/admin')) return;

    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000); // Delay for better UX
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setIsVisible(false);
  };

  if (!isReady || pathname?.startsWith('/admin')) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:max-w-md z-[100]"
        >
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 shadow-2xl rounded-[2.5rem] p-6 md:p-8 relative overflow-hidden group">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -z-10 group-hover:bg-primary/10 transition-colors duration-500" />
            
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0 shadow-inner">
                <ShieldCheck className="h-6 w-6" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Cookie Privacy</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium">
                    {t('COOKIE_CONSENT_MESSAGE')}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Button 
                    onClick={handleAccept}
                    className="rounded-full bg-slate-900 text-white hover:bg-primary hover:shadow-lg hover:shadow-primary/20 transition-all font-bold text-[10px] uppercase tracking-widest px-6 h-10"
                  >
                    {t('COOKIE_CONSENT_ACCEPT')}
                  </Button>
                  <Button 
                    variant="ghost"
                    className="rounded-full text-slate-400 hover:text-slate-900 font-bold text-[10px] uppercase tracking-widest h-10"
                  >
                    {t('COOKIE_CONSENT_PRIVACY')}
                  </Button>
                </div>
              </div>

              <button 
                onClick={() => setIsVisible(false)}
                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-slate-900 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
