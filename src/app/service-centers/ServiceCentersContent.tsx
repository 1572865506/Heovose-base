'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Locale } from '@/lib/translations';
import { useTranslations } from '@/hooks/use-translations';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Building2,
  Copy,
  ChevronRight,
  Info,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  region: 'CN' | 'ID';
  subRegion: string; // Dynamic subRegion parameter
  phone: string;
  email?: string;
  hours?: string;
  note?: string;
}

interface ServiceCentersData {
  centers: ServiceCenter[];
}

interface ServiceCentersContentProps {
  initialLocale: Locale;
}

const ITEMS_PER_PAGE = 24;

export default function ServiceCentersContent({ initialLocale }: ServiceCentersContentProps) {
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'CN' | 'ID'>('ALL');
  const [selectedSubRegion, setSelectedSubRegion] = useState<string>('ALL');
  
  // Progressive loading count state
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  // Load configuration & translations
  const { data: langSettings } = useLocalDoc<any>('settings', 'languages');
  const { t } = useTranslations(locale);
  
  // Load PostgreSQL service centers
  const { data: serviceCentersData, isLoading } = useLocalDoc<ServiceCentersData>('settings', 'service_centers');

  const centers = useMemo(() => serviceCentersData?.centers || [], [serviceCentersData]);

  // Synchronize locale changes with cookie/localStorage
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

  // Aggregate dynamic sub-regions from centers list based on country selection
  const availableSubRegions = useMemo(() => {
    const countryFiltered = centers.filter(c => selectedRegion === 'ALL' || c.region === selectedRegion);
    const uniqueSubs = countryFiltered
      .map(c => c.subRegion?.trim())
      .filter((v, i, a) => v && a.indexOf(v) === i);
    return uniqueSubs.sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [centers, selectedRegion]);

  // Reset page pagination & sub-regions whenever search query or country region changes
  useEffect(() => {
    setSelectedSubRegion('ALL');
    setVisibleCount(ITEMS_PER_PAGE);
  }, [searchQuery, selectedRegion]);

  // Reset page pagination whenever sub-region filter changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedSubRegion]);

  // Filter centers based on Country, Sub-region, and Search query
  const filteredCenters = useMemo(() => {
    return centers.filter(c => {
      const matchesRegion = selectedRegion === 'ALL' || c.region === selectedRegion;
      const matchesSubRegion = selectedSubRegion === 'ALL' || c.subRegion === selectedSubRegion;
      const matchesSearch = searchQuery === '' ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.subRegion && c.subRegion.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.note && c.note.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesRegion && matchesSubRegion && matchesSearch;
    });
  }, [centers, selectedRegion, selectedSubRegion, searchQuery]);

  // Sliced list of centers for lazy rendering
  const displayedCenters = useMemo(() => {
    return filteredCenters.slice(0, visibleCount);
  }, [filteredCenters, visibleCount]);

  // Copy Address Helper
  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast({
      title: t('SERVICE_ADDRESS_COPIED'),
      className: "bg-primary text-white border-none rounded-2xl shadow-xl"
    });
  };

  return (
    <main className="relative min-h-screen bg-slate-50 overflow-x-clip font-body selection:bg-primary selection:text-white">
      {/* 1. Global Navigation Navbar */}
      <Navbar locale={locale} setLocale={setLocale} />

      {/* Aurora Background Lights */}
      <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[160px] pointer-events-none z-0" />
      <div className="absolute top-[40%] left-[-15%] w-[700px] h-[700px] rounded-full bg-accent/[0.03] blur-[140px] pointer-events-none z-0" />

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-32 pb-12 px-6 md:px-12 lg:px-24">
        <div className="max-w-7xl mx-auto space-y-5 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/5 border border-primary/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {t('SERVICE_HERO_BADGE')}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-headline"
          >
            {t('SERVICE_HERO_TITLE')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xs md:text-sm text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium"
          >
            {t('SERVICE_HERO_SUBTITLE')}
          </motion.p>
        </div>
      </section>

      {/* 3. Search and Filters Section */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pb-8">
        <div className="max-w-7xl mx-auto space-y-4">
          
          {/* Main search and Country filter Row */}
          <div className="p-3.5 bg-white/60 border border-slate-200/60 rounded-2.5xl backdrop-blur-xl shadow-sm flex flex-col md:flex-row items-center gap-4">
            
            {/* Live Search Input */}
            <div className="relative w-full md:flex-1">
              <Search className="absolute left-4 top-3 w-4 h-4 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={t('SERVICE_SEARCH_PLACEHOLDER')}
                className="pl-11 h-10.5 bg-white/80 border-slate-200/80 hover:border-primary/30 focus-visible:border-primary/50 rounded-xl text-xs font-semibold placeholder:text-slate-400/80 shadow-inner"
              />
            </div>

            {/* Region Country Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100/60 border border-slate-200/45 p-1 rounded-xl shrink-0 w-full md:w-auto">
              {[
                { key: 'ALL', label: t('SERVICE_TAB_ALL') },
                { key: 'CN', label: t('SERVICE_TAB_CN') },
                { key: 'ID', label: t('SERVICE_TAB_ID') },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedRegion(tab.key as any)}
                  className={cn(
                    "flex-1 md:flex-none px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all duration-300",
                    selectedRegion === tab.key
                      ? "bg-white text-primary shadow-sm border border-slate-200/60 scale-102"
                      : "text-slate-500 hover:text-slate-900 bg-transparent"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Level 2: Dynamic Sub-Regions Filters Row */}
          {availableSubRegions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-white/40 border border-slate-200/45 rounded-2.5xl backdrop-blur-md flex flex-wrap items-center gap-1.5"
            >
              <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 px-2 shrink-0">
                <Globe className="w-3 h-3 text-slate-400" />
                <span>{t('SERVICE_LABEL_SUBREGION')}:</span>
              </div>
              
              <button
                onClick={() => setSelectedSubRegion('ALL')}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200",
                  selectedSubRegion === 'ALL'
                    ? "bg-primary text-white shadow-sm scale-102"
                    : "bg-white/80 text-slate-500 hover:text-slate-900 border border-slate-200/60"
                )}
              >
                {t('SERVICE_SUB_ALL')}
              </button>

              {availableSubRegions.map(sub => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubRegion(sub)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200",
                    selectedSubRegion === sub
                      ? "bg-primary text-white shadow-sm scale-102"
                      : "bg-white/80 text-slate-500 hover:text-slate-900 border border-slate-200/60"
                  )}
                >
                  {sub}
                </button>
              ))}
            </motion.div>
          )}

        </div>
      </section>

      {/* 4. Grid Display Area */}
      <section className="relative z-10 px-6 md:px-12 lg:px-24 pb-32">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            /* Skeleton Loading States */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5 py-12">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-56 bg-white/40 border border-slate-200/40 rounded-2.5xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {/* Compact 4-Column Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
                <AnimatePresence mode="popLayout">
                  {displayedCenters.map(center => (
                    <motion.div
                      key={center.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4 }}
                      className="bg-white/85 backdrop-blur-xl border border-slate-200/50 hover:border-primary/20 shadow-[0_4px_20px_rgb(0,0,0,0.005)] hover:shadow-[0_12px_36px_rgba(59,130,246,0.04)] rounded-2.5xl overflow-hidden group flex flex-col justify-between"
                    >
                      {/* Card Body - Highly Compact Padding & Layout */}
                      <div className="p-4 md:p-5 space-y-3.5 flex-1 flex flex-col justify-between">
                        
                        {/* Upper Details */}
                        <div className="space-y-2.5">
                          {/* Card Header Info with country & subRegion badges */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border",
                                center.region === 'CN'
                                  ? "bg-blue-500/[0.04] text-blue-600 border-blue-500/10"
                                  : "bg-teal-500/[0.04] text-teal-600 border-teal-500/10"
                              )}>
                                {center.region === 'CN' ? t('SERVICE_TAB_CN') : t('SERVICE_TAB_ID')}
                              </span>
                              
                              {/* Subregion Badge Tag */}
                              <span className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border bg-slate-500/[0.04] text-slate-500 border-slate-500/10">
                                {center.subRegion}
                              </span>
                            </div>
                            <Building2 className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
                          </div>

                          <h3 className="text-xs md:text-sm font-extrabold text-slate-800 leading-tight font-headline group-hover:text-primary transition-colors">
                            {center.name}
                          </h3>

                          {/* Inline Address Info */}
                          <div className="flex gap-2 items-start text-[11px] text-slate-500 font-semibold group/addr">
                            <MapPin className="w-3.5 h-3.5 text-primary/70 shrink-0 mt-0.5" />
                            <span className="leading-relaxed flex-1">{center.address}</span>
                            <button
                              onClick={() => handleCopyAddress(center.address)}
                              title={t('SERVICE_COPY_ADDRESS')}
                              className="h-5.5 w-5.5 rounded bg-slate-50 border border-slate-200/60 hover:bg-primary/5 hover:text-primary flex items-center justify-center text-slate-400 opacity-0 group-hover/addr:opacity-100 transition-opacity shrink-0 shadow-sm ml-1"
                            >
                              <Copy className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        </div>

                        {/* Detail list */}
                        <div className="space-y-2 pt-3 border-t border-slate-100 border-dashed">
                          {/* Phone call row */}
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px] font-bold text-slate-700 truncate">{center.phone}</span>
                            </div>
                            <a
                              href={`tel:${center.phone}`}
                              className="text-[8px] font-black uppercase tracking-wider text-primary hover:text-primary/80 flex items-center gap-0.5 shrink-0 bg-primary/5 px-2 py-1 rounded-lg border border-primary/10 transition-colors"
                            >
                              {t('SERVICE_DIAL')}
                              <ChevronRight className="w-2.5 h-2.5" />
                            </a>
                          </div>

                          {/* Email row */}
                          {center.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                              <a href={`mailto:${center.email}`} className="text-[10px] font-semibold text-slate-500 hover:text-primary transition-colors truncate">{center.email}</a>
                            </div>
                          )}

                          {/* Hours row */}
                          {center.hours && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="text-[10px] font-semibold text-slate-500 truncate">{center.hours}</span>
                            </div>
                          )}

                          {/* Extra Notes row */}
                          {center.note && (
                            <div className="flex items-start gap-1.5 p-2 rounded-xl bg-orange-500/[0.02] border border-orange-500/10 mt-1">
                              <Info className="w-3 h-3 text-orange-500 shrink-0 mt-0.5" />
                              <p className="text-[9px] font-bold text-orange-600/80 leading-normal">{center.note}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty state when nothing matches */}
                {filteredCenters.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="col-span-full py-20 text-center bg-white border border-slate-200/50 rounded-2.5xl shadow-sm max-w-xl mx-auto w-full"
                  >
                    <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3 animate-bounce" />
                    <h4 className="text-xs font-black text-slate-800">{t('SERVICE_NO_DATA')}</h4>
                    <p className="text-[10px] font-medium text-slate-400 mt-2 px-6">{t('SERVICE_NO_DATA_DESC')}</p>
                  </motion.div>
                )}
              </div>

              {/* Progressive loading action */}
              {filteredCenters.length > visibleCount && (
                <div className="flex justify-center mt-12">
                  <button
                    onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
                    className="px-8 py-3 rounded-2xl bg-white border border-slate-200 hover:border-primary text-slate-700 hover:text-primary text-[10px] font-black uppercase tracking-wider shadow-sm transition-all hover:scale-103"
                  >
                    {t('SERVICE_LOAD_MORE')} ( {visibleCount} / {filteredCenters.length} )
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 5. Footer */}
      <Footer locale={locale} />
    </main>
  );
}
