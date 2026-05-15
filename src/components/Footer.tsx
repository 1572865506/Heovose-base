"use client";

import Image from 'next/image';
import { Locale } from "@/lib/translations";
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Mail, Phone, MapPin, Link as LinkIcon, ArrowRight } from "lucide-react";
import { useTranslations } from '@/hooks/use-translations';
import { useInquiry } from '@/components/providers/InquiryProvider';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { useMemo } from 'react';
import { getAssetUrl } from '@/lib/image-utils';

interface SiteConfig {
  primaryDomain?: string;
  logoStandard?: string;
  logoInverted?: string;
  favicon?: string;
  socialLinks?: { platform: string; url: string }[];
}

export function Footer({ locale }: { locale: Locale }) {
  const { t: tr } = useTranslations(locale);
  const { openInquiry } = useInquiry();
  const { data: siteConfig } = useLocalDoc<SiteConfig>('settings', 'site');

  const companyAddr = tr('COMPANY_ADDR');
  const companyPhone = tr('COMPANY_PHONE');
  const companyEmail = tr('COMPANY_EMAIL');
  const companyName = tr('COMPANY_NAME') || 'Heovose Technology';

  const { data: remoteCats } = useLocalCollection<any>('productCategories');
  
  const { dynamicWholesale, dynamicProject } = useMemo(() => {
    if (!remoteCats) return { dynamicWholesale: [], dynamicProject: [] };
    
    return {
      dynamicWholesale: remoteCats.filter((c: any) => c.parentId === 'WHOLESALE'),
      dynamicProject: remoteCats.filter((c: any) => c.parentId === 'PROJECT')
    };
  }, [remoteCats]);

  return (
    <footer className="bg-primary text-primary-foreground py-24">
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
                <p className="text-accent font-bold text-base tracking-wide">{tr('footer_slogan1')}</p>
                <p className="opacity-60 text-xs leading-relaxed max-w-[260px]">{tr('footer_slogan2')}</p>
              </div>
            </div>
            <button 
              onClick={() => openInquiry()}
              className="inline-flex items-center gap-3 px-8 py-3 rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground transition-all group border border-white/10 cursor-pointer"
            >
              <span className="text-xs font-bold uppercase tracking-widest">{tr('nav_contact')}</span>
              <div className="h-6 w-6 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20">
                <ArrowRight className="h-3 w-3" />
              </div>
            </button>
          </div>

          {/* Col 2: Dynamic Products in 2 Columns (5/12) */}
          <div className="lg:col-span-5">
            <h4 className="font-bold mb-10 text-white uppercase tracking-[0.2em] text-[10px] opacity-40">{tr('nav_products')}</h4>
            <div className="grid grid-cols-2 gap-x-12 gap-y-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{tr('nav_wholesale')}</span>
                <ul className="space-y-3 opacity-60 text-[13px]">
                  {dynamicWholesale.length > 0 ? (
                    dynamicWholesale.map(cat => (
                      <li key={cat.id} className="hover:text-accent cursor-pointer transition-colors">
                        <a href={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}>{tr(cat.nameTextId)}</a>
                      </li>
                    ))
                  ) : (
                    <li className="italic opacity-40 text-xs">Loading...</li>
                  )}
                </ul>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{tr('nav_projects')}</span>
                <ul className="space-y-3 opacity-60 text-[13px]">
                  {dynamicProject.length > 0 ? (
                    dynamicProject.map(cat => (
                      <li key={cat.id} className="hover:text-accent cursor-pointer transition-colors">
                        <a href={`/products?category=${encodeURIComponent(cat.slug || cat.id)}`}>{tr(cat.nameTextId)}</a>
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
            <h4 className="font-bold mb-10 text-white uppercase tracking-[0.2em] text-[10px] opacity-40">{tr('nav_company')}</h4>
            <ul className="space-y-4 opacity-60 text-[13px]">
              <li className="hover:text-accent cursor-pointer transition-colors"><a href="/#about">{tr('nav_about')}</a></li>
              <li className="hover:text-accent cursor-pointer transition-colors"><a href="/#cases">{tr('nav_cases')}</a></li>
              <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_career')}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_contact')}</li>
            </ul>
          </div>

          {/* Col 4: Follow Us (2/12) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold mb-10 text-white uppercase tracking-[0.2em] text-[10px] opacity-40">Follow Us</h4>
            <div className="flex flex-col gap-4">
              {siteConfig?.socialLinks?.map((link, idx) => {
                const PlatformIcon = (() => {
                  switch (link.platform.toLowerCase()) {
                    case 'facebook': return Facebook;
                    case 'instagram': return Instagram;
                    case 'linkedin': return Linkedin;
                    case 'youtube': return Youtube;
                    case 'twitter':
                    case 'x': return Twitter;
                    default: return LinkIcon;
                  }
                })();
                return (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 opacity-60 hover:opacity-100 hover:text-accent transition-all text-[13px]">
                    <PlatformIcon className="h-4 w-4" /> {link.platform}
                  </a>
                );
              }) || (
                <div className="space-y-4 opacity-40 text-[13px]">
                  <p className="flex items-center gap-3"><Linkedin className="h-4 w-4" /> LinkedIn</p>
                  <p className="flex items-center gap-3"><Twitter className="h-4 w-4" /> Twitter</p>
                  <p className="flex items-center gap-3"><Facebook className="h-4 w-4" /> Facebook</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Separator Line */}
        <div className="h-px w-full bg-white/10 mb-20" />

        {/* Bottom Section: Contact & Global Presence */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          
          {/* Contact Left (3/12) */}
          <div className="lg:col-span-3 space-y-12">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{tr('footer_email')}</span>
              <p className="text-xl font-medium tracking-tight text-white hover:text-accent transition-colors">
                <a href={`mailto:${companyEmail}`}>{companyEmail}</a>
              </p>
            </div>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-accent uppercase tracking-widest">{tr('footer_support')}</span>
              <p className="text-xl font-medium tracking-tight text-white flex items-center gap-3">
                <span className="h-8 w-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-green-400" />
                </span>
                <a href={`tel:${companyPhone}`}>{companyPhone}</a>
              </p>
            </div>
          </div>

          {/* Presence Right (9/12) */}
          <div className="lg:col-span-9 space-y-8">
            <h4 className="text-xl font-bold text-white">Global Manufacturing Presence In</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: 'panyu', country: 'CHINA', name: 'PANYU HQ', flag: '🇨🇳', addr: 'Guangzhou, Guangdong' },
                { id: 'shunde', country: 'CHINA', name: 'SHUNDE FACILITY', flag: '🇨🇳', addr: 'Foshan, Guangdong' },
                { id: 'beijiao', country: 'CHINA', name: 'BEIJIAO FACILITY', flag: '🇨🇳', addr: 'Foshan, Guangdong' },
                { id: 'jakarta', country: 'INDONESIA', name: 'JAKARTA BASE', flag: '🇮🇩', addr: 'Jakarta, Indonesia' }
              ].map((loc) => (
                <div key={loc.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all space-y-4 group">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{loc.flag}</span>
                    <span className="text-[9px] font-bold opacity-30 group-hover:opacity-60 uppercase tracking-widest transition-opacity">{loc.country}</span>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-white tracking-wide">{loc.name}</p>
                    <p className="text-[11px] opacity-40 leading-relaxed">{loc.addr}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Copyright */}
        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[9px] uppercase tracking-[0.2em] font-bold">
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
