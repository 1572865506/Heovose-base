
"use client";

import { Locale, translations } from "@/lib/translations";
import { Linkedin, Twitter, Facebook, Mail, Phone } from "lucide-react";

export function Footer({ locale }: { locale: Locale }) {
  const t = translations[locale];
  const sub = translations[locale].nav_sub;

  return (
    <footer className="bg-primary text-primary-foreground py-20">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-6">
            <h3 className="text-2xl font-headline font-bold tracking-tighter">HEOVOSE</h3>
            <p className="opacity-60 max-w-xs text-sm leading-relaxed">
              {locale === 'en' 
                ? 'Leading the way in advanced technology manufacturing and hardware innovation across Asia.'
                : '亚洲先进技术制造与硬件创新的领航者。'}
            </p>
            <div className="flex gap-4">
              <Linkedin className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
              <Facebook className="h-5 w-5 hover:text-accent cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-wider text-xs">{t.nav.products}</h4>
            <ul className="space-y-4 opacity-60 text-sm">
              <li className="hover:text-accent cursor-pointer transition-colors">{sub.aio}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{sub.minipc}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{sub.monitor}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{sub.selfservice}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{sub.industrial}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-wider text-xs">{t.nav.company}</h4>
            <ul className="space-y-4 opacity-60 text-sm">
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.about}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.career}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.projects}</li>
              <li className="hover:text-accent cursor-pointer transition-colors">{t.nav.cases}</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-8 text-white uppercase tracking-wider text-xs">{t.nav.contact}</h4>
            <ul className="space-y-4 opacity-60 text-sm">
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-accent" /> sales@heovose.com
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-accent" /> +86 0755 1234 5678
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 opacity-40 text-[10px] uppercase tracking-widest font-bold">
          <p>© 2024 Heovose Technology. All rights reserved.</p>
          <div className="flex gap-8">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
