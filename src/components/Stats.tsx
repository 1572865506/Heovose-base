
"use client";

import { Locale } from "@/lib/translations";
import { useTranslations } from "@/hooks/use-translations";
import { Factory, Cpu, Users, Award } from "lucide-react";

export function Stats({ locale }: { locale: Locale }) {
  const { t } = useTranslations(locale);

  const stats = [
    { icon: Factory, value: '3', label: t('SYS_STATS_FACTORIES') || (locale === 'en' ? 'Manufacturing Bases' : '智造基地'), sub: locale === 'en' ? 'CN / ID' : '中国 / 印尼' },
    { icon: Cpu, value: '30+', label: t('SYS_STATS_SERIES') || (locale === 'en' ? 'Product Series' : '产品系列'), sub: locale === 'en' ? 'Models' : '机型' },
    { icon: Users, value: '500+', label: t('SYS_STATS_CLIENTS') || (locale === 'en' ? 'Global Clients' : '全球客户'), sub: locale === 'en' ? 'Global' : '全球客户' },
    { icon: Award, value: '15+', label: t('SYS_STATS_EXPERIENCE') || (locale === 'en' ? 'Years Experience' : '行业经验'), sub: locale === 'en' ? 'Years' : '年行业积淀' },
  ];

  return (
    <section className="py-24 bg-primary text-primary-foreground overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {stats.map((stat, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center text-center space-y-4 group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-accent transition-colors duration-500">
                <stat.icon className="h-8 w-8 text-accent group-hover:text-white transition-colors" />
              </div>
              <div className="space-y-1">
                <span className="text-5xl md:text-6xl font-headline font-bold block">{stat.value}</span>
                <span className="text-xl font-medium opacity-90 block">{stat.label}</span>
                <span className="text-sm opacity-60 uppercase tracking-widest block">{stat.sub}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
