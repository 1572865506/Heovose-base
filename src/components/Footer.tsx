"use client";

import Image from 'next/image';
import { Locale } from "@/lib/translations";
import { Linkedin, Twitter, Facebook, Instagram, Youtube, Mail, Phone, MapPin, Link as LinkIcon } from "lucide-react";
import { useTranslations } from '@/hooks/use-translations';
import { useLocalDoc } from '@/hooks/use-local-doc';
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
  const { data: siteConfig } = useLocalDoc<SiteConfig>('settings', 'site');

  const companyAddr = tr('COMPANY_ADDR');
  const companyPhone = tr('COMPANY_PHONE');
  const companyEmail = tr('COMPANY_EMAIL');
  const companyName = tr('COMPANY_NAME') || 'Heovose Technology';

  return (
    <footer className="bg-primary text-primary-foreground py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Image
                src={siteConfig?.logoInverted ? getAssetUrl(siteConfig.logoInverted) : "/image/Heovose.svg"}
                alt="Heovose Logo"
                width={180}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <div className="space-y-1">
                <p className="text-accent font-bold text-sm tracking-wide">{tr('footer_slogan1')}</p>
                <p className="opacity-60 text-xs leading-relaxed max-w-[240px]">{tr('footer_slogan2')}</p>
              </div>
            </div>
            <div className="flex gap-4">
              {siteConfig?.socialLinks && siteConfig.socialLinks.length > 0 ? (
                siteConfig.socialLinks.map((link, idx) => {
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
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all"
                    >
                      <PlatformIcon className="h-5 w-5" />
                    </a>
                  );
                })
              ) : (
                <>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                    <Linkedin className="h-5 w-5" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                    <Twitter className="h-5 w-5" />
                  </div>
                  <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                    <Facebook className="h-5 w-5" />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Column 2: Products */}
          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-xs border-b border-white/10 pb-4">{tr('nav_products')}</h4>
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{tr('nav_wholesale')}</span>
                <ul className="space-y-3 opacity-60 text-[13px]">
                  <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_sub_aio')}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_sub_minipc')}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_sub_monitor')}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_sub_laptop')}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{tr('nav_projects')}</span>
                <ul className="space-y-3 opacity-60 text-[13px]">
                  <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_sub_conference')}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_sub_selfservice')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: Company Info */}
          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-xs border-b border-white/10 pb-4">{tr('nav_company')}</h4>
            <ul className="space-y-4 opacity-60 text-[13px]">
              <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_about')}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_career')}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{tr('nav_cases')}</li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-xs border-b border-white/10 pb-4">{tr('nav_contact')}</h4>
            <ul className="space-y-6 opacity-60 text-[13px]">
              {companyEmail && (
                <li className="group cursor-pointer">
                  <span className="block text-[10px] text-accent mb-1 uppercase font-bold tracking-tighter">Email</span>
                  <a href={`mailto:${companyEmail}`} className="flex items-center gap-3 group-hover:text-accent transition-colors">
                    <Mail className="h-4 w-4" /> {companyEmail}
                  </a>
                </li>
              )}
              {companyPhone && (
                <li className="group cursor-pointer">
                  <span className="block text-[10px] text-accent mb-1 uppercase font-bold tracking-tighter">Support</span>
                  <a href={`tel:${companyPhone}`} className="flex items-center gap-3 group-hover:text-accent transition-colors">
                    <Phone className="h-4 w-4" /> {companyPhone}
                  </a>
                </li>
              )}
              {companyAddr && (
                <li className="group cursor-pointer">
                  <span className="block text-[10px] text-accent mb-1 uppercase font-bold tracking-tighter">Office</span>
                  <div className="flex items-start gap-3 group-hover:text-accent transition-colors">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" /> 
                    <span className="leading-relaxed">{companyAddr}</span>
                  </div>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[9px] uppercase tracking-[0.2em] font-bold">
          <p>© {new Date().getFullYear()} {companyName}. Global Intelligence Manufacturing.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
