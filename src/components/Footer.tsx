
"use client";

import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { Linkedin, Twitter, Facebook, Mail, Phone } from "lucide-react";

export function Footer({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const sub = translations[locale].nav_sub;
  const f = translations[locale].footer;

  return (
    <footer className="bg-primary text-primary-foreground py-24">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          
          {/* Column 1: Brand & Social */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Image
                src="/image/Heovose.svg"
                alt="Heovose Logo White"
                width={180}
                height={36}
                className="h-9 w-auto object-contain"
              />
              <div className="space-y-1">
                <p className="text-accent font-bold text-sm tracking-wide">{f.slogan1}</p>
                <p className="opacity-60 text-xs leading-relaxed max-w-[240px]">{f.slogan2}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                <Linkedin className="h-5 w-5" />
              </div>
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                <Twitter className="h-5 w-5" />
              </div>
              <div className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-accent hover:text-accent-foreground cursor-pointer transition-all">
                <Facebook className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Column 2: Products (Wholesale + Projects) */}
          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-xs border-b border-white/10 pb-4">{t.nav.products}</h4>
            <div className="grid grid-cols-1 gap-10">
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{t.nav.wholesale}</span>
                <ul className="space-y-3 opacity-60 text-[13px]">
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.aio}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.minipc}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.monitor}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.laptop}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.electromechanical}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.components}</li>
                </ul>
              </div>
              <div className="space-y-4">
                <span className="text-[10px] font-bold text-accent uppercase tracking-widest opacity-80">{t.nav.projects}</span>
                <ul className="space-y-3 opacity-60 text-[13px]">
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.conference}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.selfservice}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.industrial}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.led}</li>
                  <li className="hover:text-accent cursor-pointer transition-colors">{sub.showroom}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Column 3: Company Info */}
          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-xs border-b border-white/10 pb-4">{t.nav.company}</h4>
            <ul className="space-y-4 opacity-60 text-[13px]">
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.about}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.career}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.cases}</li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-widest text-xs border-b border-white/10 pb-4">{t.nav.contact}</h4>
            <ul className="space-y-6 opacity-60 text-[13px]">
              <li className="group cursor-pointer">
                <span className="block text-[10px] text-accent mb-1 uppercase font-bold tracking-tighter">Email</span>
                <div className="flex items-center gap-3 group-hover:text-accent transition-colors">
                  <Mail className="h-4 w-4" /> sales@heovose.com
                </div>
              </li>
              <li className="group cursor-pointer">
                <span className="block text-[10px] text-accent mb-1 uppercase font-bold tracking-tighter">Support</span>
                <div className="flex items-center gap-3 group-hover:text-accent transition-colors">
                  <Phone className="h-4 w-4" /> +86 0755 1234 5678
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 opacity-30 text-[9px] uppercase tracking-[0.2em] font-bold">
          <p>© 2024 Heovose Technology. Global Intelligence Manufacturing.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
