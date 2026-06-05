"use client";

import Image from 'next/image';
import { Locale, getLocalizedLink } from "@/lib/translations";
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Mail, Phone, MapPin, Link as LinkIcon, ArrowRight, MessagesSquare, MessageCircle, Globe } from "lucide-react";
import { useTranslations } from '@/hooks/use-translations';
import { useInquiry } from '@/components/providers/InquiryProvider';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useMemo, useEffect, useState } from 'react';
import { getAssetUrl } from '@/lib/image-utils';
import { injectTranslations } from '@/lib/translation-injector';

interface SiteConfig {
  primaryDomain?: string;
  logoStandard?: string;
  logoInverted?: string;
  favicon?: string;
  socialLinks?: { platform: string; url: string }[];
}

export function Footer({ locale }: { locale: Locale }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { t: tr } = useTranslations(locale);
  const { openInquiry } = useInquiry();
  const { data: siteConfig } = useLocalDoc<SiteConfig>('settings', 'site');

  const companyAddr = tr('COMPANY_ADDR');
  const companyPhone = tr('COMPANY_PHONE');
  const companyEmail = tr('COMPANY_EMAIL');
  const companyWechat = tr('COMPANY_WECHAT');
  const companyWhatsapp = tr('COMPANY_WHATSAPP');
  const companyName = tr('COMPANY_NAME') || 'Heovose Technology';

  const { data: remoteCats } = useLocalCollection<any>('productCategories');
  const { data: locs } = useLocalCollection<any>('mapLocations');
  const { data: mapData } = useLocalDoc<any>('homepageContent', 'map');

  const { dynamicWholesale, dynamicProject } = useMemo(() => {
    const isClient = typeof window !== 'undefined';
    const publicSettings = isClient 
      ? (window as any).__HEOVOSE_PUBLIC_SETTINGS__ 
      : (typeof global !== 'undefined' ? (global as any).__HEOVOSE_PUBLIC_SETTINGS__ : null);
    
    const availableCats = (remoteCats && remoteCats.length > 0) 
      ? remoteCats 
      : (publicSettings?.productCategories || []);

    return {
      dynamicWholesale: availableCats.filter((c: any) => c.parentId === 'WHOLESALE'),
      dynamicProject: availableCats.filter((c: any) => c.parentId === 'PROJECT')
    };
  }, [remoteCats]);

  const sortedLocs = useMemo(() => {
    if (!locs) return [];
    return [...locs].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [locs]);

  // 注入全球布局位置的翻译至客户端缓存
  useEffect(() => {
    if (locs && Array.isArray(locs)) {
      const trans: any[] = [];
      locs.forEach((loc: any) => {
        if (loc.titleTextId) {
          trans.push({
            id: loc.titleTextId,
            content: {
              zh: loc.titleZh || '',
              en: loc.titleEn || ''
            }
          });
        }
        if (loc.addressTextId) {
          trans.push({
            id: loc.addressTextId,
            content: {
              zh: loc.addressZh || '',
              en: loc.addressEn || ''
            }
          });
        }
        if (loc.descTextId) {
          trans.push({
            id: loc.descTextId,
            content: {
              zh: loc.descZh || '',
              en: loc.descEn || ''
            }
          });
        }
      });
      if (trans.length > 0) {
        injectTranslations(locale, trans);
      }
    }
  }, [locs, locale]);

  // 翻译兜底读取方法
  const getLocalized = (textId: string | null | undefined, zh: string, en: string) => {
    const translated = textId ? tr(textId) : undefined;
    if (translated && translated.trim() !== '') return translated;
    const direct = locale === 'zh' ? zh : en;
    if (direct && direct.trim() !== '') return direct;
    return (locale === 'zh' ? en : zh) || '';
  };

  return (
    <footer className="bg-primary text-primary-foreground pt-24 pb-8">
      <div className="container mx-auto px-6">
        {/* Top Section: Main Navigation Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12 mb-20">

          {/* Col 1: Brand & Action (3/12) */}
          <div className="lg:col-span-3 space-y-10">
            <div className="space-y-6">
              <Image
                src={siteConfig?.logoInverted ? getAssetUrl(siteConfig.logoInverted) : "/image/Heovose.svg"}
                alt="Heovose Logo"
                width={180}
                height={36}
                className="h-10 w-auto object-contain"
              />
              <div className="space-y-2">
                <p className="text-accent font-bold text-xl tracking-wide">{tr('footer_slogan1')}</p>
                <p className="opacity-60 text-sm leading-relaxed max-w-[280px]">{tr('footer_slogan2')}</p>
              </div>
            </div>
            <button
              onClick={() => openInquiry()}
              className="inline-flex items-center gap-3 px-3 py-3 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-500 group border border-white/10 cursor-pointer text-white"
            >
              <span className="text-sm font-bold uppercase tracking-widest leading-none">{tr('nav_contact')}</span>
              <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-all duration-500 cubic-bezier(0.34, 1.56, 0.64, 1) group-hover:translate-x-1.5">
                <ArrowRight className="h-4 w-4" />
              </div>
            </button>
          </div>

          {/* Col 2: Dynamic Products in 2 Columns (5/12) */}
          <div className="lg:col-span-5 lg:pl-32">
            <h4 className="font-bold mb-10 text-white uppercase tracking-[0.2em] text-[14px] opacity-100">{tr('nav_products')}</h4>
            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{tr('nav_wholesale')}</span>
                <ul className="space-y-4 text-[13px]">
                  {mounted && dynamicWholesale.length > 0 ? (
                    dynamicWholesale.map((cat: any) => (
                       <li key={cat.id} className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors">
                        <a href={getLocalizedLink(`/products?category=${encodeURIComponent(cat.slug || cat.id)}`, locale)}>{tr(cat.nameTextId)}</a>
                      </li>
                    ))
                  ) : (
                    <li className="italic opacity-40 text-xs">Loading...</li>
                  )}
                </ul>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{tr('nav_projects')}</span>
                <ul className="space-y-4 text-[13px]">
                  {mounted && dynamicProject.length > 0 ? (
                    dynamicProject.map((cat: any) => (
                      <li key={cat.id} className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors">
                        <a href={getLocalizedLink(`/products?category=${encodeURIComponent(cat.slug || cat.id)}`, locale)}>{tr(cat.nameTextId)}</a>
                      </li>
                    ))
                  ) : (
                    <li className="italic opacity-40 text-xs">Loading...</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Col 3: Company (2/12) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold mb-10 text-white uppercase tracking-[0.2em] text-[14px] opacity-100">{tr('nav_company')}</h4>
            <ul className="space-y-4 text-[13px] mt-[30px]">
              <li className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors"><a href={getLocalizedLink("/about", locale)}>{tr('nav_about')}</a></li>
              <li className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors"><a href={getLocalizedLink("/service-centers", locale)}>{tr('NAV_SERVICE_CENTERS')}</a></li>
              <li className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors"><a href={getLocalizedLink("/#cases", locale)}>{tr('nav_cases')}</a></li>
              <li className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors">{tr('nav_career')}</li>
              <li className="opacity-60 hover:opacity-100 hover:text-accent cursor-pointer transition-colors">{tr('nav_contact')}</li>
            </ul>
          </div>

          {/* Col 4: Follow Us (2/12) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold mb-10 text-white uppercase tracking-[0.2em] text-[14px] opacity-100">{tr('footer_follow_us')}</h4>
            <div className="flex flex-col gap-4 mt-[30px]">
              {(siteConfig?.socialLinks || []).map((link, idx) => {
                const PlatformIcon = (() => {
                  switch (link.platform?.toLowerCase() || '') {
                    case 'facebook': return Facebook;
                    case 'instagram': return Instagram;
                    case 'linkedin': return Linkedin;
                    case 'youtube': return Youtube;
                    case 'twitter':
                    case 'x': return Twitter;
                    case 'wechat': return MessagesSquare;
                    case 'whatsapp': return MessageCircle;
                    case 'weibo': return Globe;
                    default: return LinkIcon;
                  }
                })();
                return (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 opacity-60 hover:opacity-100 hover:text-accent transition-all text-[13px]">
                    <PlatformIcon className="h-4 w-4" /> {link.platform}
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="h-px w-full bg-white/10 mb-16" />

        {/* Bottom Section: Contact & Global Presence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">

          {/* Contact Left (3/12) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{tr('footer_email')}</span>
              <p className="text-md font-medium tracking-tight text-white flex items-center gap-3 hover:text-accent transition-colors">
                <span className="h-7 w-7 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Mail className="h-3.5 w-3.5 text-blue-400" />
                </span>
                <a href={`mailto:${companyEmail}`}>{companyEmail}</a>
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{tr('footer_support')}</span>
              <p className="text-md font-medium tracking-tight text-white flex items-center gap-3 hover:text-accent transition-colors">
                <span className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Phone className="h-3.5 w-3.5 text-green-400" />
                </span>
                <a href={`tel:${companyPhone}`}>{companyPhone}</a>
              </p>
            </div>
            {companyWechat && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{tr('footer_wechat')}</span>
                <p className="text-md font-medium tracking-tight text-white flex items-center gap-3 hover:text-accent transition-colors">
                  <span className="h-7 w-7 rounded-full bg-green-500/20 flex items-center justify-center">
                    <MessagesSquare className="h-3.5 w-3.5 text-green-400" />
                  </span>
                  <span>{companyWechat}</span>
                </p>
              </div>
            )}

            {companyWhatsapp && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{tr('footer_whatsapp')}</span>
                <p className="text-md font-medium tracking-tight text-white flex items-center gap-3 hover:text-accent transition-colors">
                  <span className="h-7 w-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                  </span>
                  <span>{companyWhatsapp}</span>
                </p>
              </div>
            )}
          </div>

          {/* Presence Right (9/12) */}
          <div className="lg:col-span-9 space-y-8 lg:pl-32">
            <h4 className="text-xl font-bold text-white min-h-[28px] flex items-center">
              {!mounted || !mapData ? (
                <span className="inline-block h-6 w-56 bg-white/10 rounded animate-pulse" />
              ) : (
                tr(mapData.mapTitleTextId) || "Global Manufacturing Presence"
              )}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {!mounted || sortedLocs.length === 0 ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={`skeleton-loc-${idx}`} className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-4 animate-pulse">
                    <div className="flex items-center justify-between">
                      <div className="h-5 w-7 bg-white/10 rounded" />
                      <div className="h-3 w-16 bg-white/10 rounded" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-3/4 bg-white/10 rounded" />
                      <div className="h-3 w-5/6 bg-white/10 rounded" />
                    </div>
                  </div>
                ))
              ) : (
                sortedLocs.map((loc: any) => {
                  // Determine flag based on address or title keywords
                  const flagCode = loc.countryCode || 'cn';
                  const countryMap: Record<string, { label: string, color: string }> = {
                    cn: { label: 'CHINA', color: 'rgba(238, 28, 37, 0.4)' },
                    hk: { label: 'HONG KONG', color: 'rgba(238, 28, 37, 0.4)' },
                    tw: { label: 'TAIWAN', color: 'rgba(238, 28, 37, 0.4)' },
                    id: { label: 'INDONESIA', color: 'rgba(255, 0, 0, 0.4)' },
                    my: { label: 'MALAYSIA', color: 'rgba(0, 51, 153, 0.4)' },
                    sg: { label: 'SINGAPORE', color: 'rgba(239, 51, 64, 0.4)' },
                    th: { label: 'THAILAND', color: 'rgba(0, 36, 125, 0.4)' },
                    vn: { label: 'VIETNAM', color: 'rgba(218, 37, 28, 0.4)' },
                    jp: { label: 'JAPAN', color: 'rgba(188, 0, 45, 0.4)' },
                    kr: { label: 'SOUTH KOREA', color: 'rgba(0, 71, 160, 0.4)' },
                    in: { label: 'INDIA', color: 'rgba(255, 153, 51, 0.4)' },
                    ph: { label: 'PHILIPPINES', color: 'rgba(0, 56, 168, 0.4)' },
                    de: { label: 'GERMANY', color: 'rgba(255, 206, 0, 0.4)' },
                    fr: { label: 'FRANCE', color: 'rgba(0, 35, 149, 0.4)' },
                    gb: { label: 'UNITED KINGDOM', color: 'rgba(0, 36, 125, 0.4)' },
                    it: { label: 'ITALY', color: 'rgba(0, 146, 70, 0.4)' },
                    es: { label: 'SPAIN', color: 'rgba(170, 21, 27, 0.4)' },
                    nl: { label: 'NETHERLANDS', color: 'rgba(174, 28, 40, 0.4)' },
                    ru: { label: 'RUSSIA', color: 'rgba(0, 57, 166, 0.4)' },
                    us: { label: 'USA', color: 'rgba(191, 10, 48, 0.4)' },
                    ca: { label: 'CANADA', color: 'rgba(255, 0, 0, 0.4)' },
                    mx: { label: 'MEXICO', color: 'rgba(0, 104, 71, 0.4)' },
                    au: { label: 'AUSTRALIA', color: 'rgba(0, 0, 139, 0.4)' },
                    br: { label: 'BRAZIL', color: 'rgba(0, 151, 57, 0.4)' },
                    ae: { label: 'UAE', color: 'rgba(0, 115, 47, 0.4)' },
                    sa: { label: 'SAUDI ARABIA', color: 'rgba(0, 108, 53, 0.4)' },
                    za: { label: 'SOUTH AFRICA', color: 'rgba(0, 124, 67, 0.4)' },
                    tr: { label: 'TURKEY', color: 'rgba(227, 10, 23, 0.4)' },
                  };
                  const countryInfo = countryMap[flagCode] || countryMap.cn;
                  const countryLabel = countryInfo.label;

                  return (
                    <div key={loc.id} className="relative p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-4 group overflow-hidden">
                      <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                          <div className="h-5 w-7 overflow-hidden">
                            <img
                              src={`https://flagcdn.com/${flagCode}.svg`}
                              alt={countryLabel}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[9px] font-bold opacity-30 group-hover:opacity-60 uppercase tracking-widest transition-opacity">{countryLabel}</span>
                        </div>
                        <div className="space-y-1">
                          <p className="font-bold text-sm text-white tracking-wide">{getLocalized(loc.titleTextId, loc.titleZh, loc.titleEn)}</p>
                          <p className="text-[11px] opacity-40 leading-relaxed">{getLocalized(loc.addressTextId, loc.addressZh, loc.addressEn)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Final Copyright */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-50 text-[12px] uppercase tracking-[0.02em]">
          <p>© {new Date().getFullYear()} {companyName}. {tr('footer_copyright_suffix')}</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">{tr('footer_privacy')}</span>
            <span className="hover:text-white cursor-pointer transition-colors">{tr('footer_terms')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
