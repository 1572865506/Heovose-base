
"use client";

import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { CheckCircle2 } from "lucide-react";

export function ProductionProcess({ locale }: { locale: Locale }) {
  const t = translations[locale].process;

  const steps = [
    { label: t.iqc, tag: '01' },
    { label: t.smt, tag: '02' },
    { label: t.assembly, tag: '03' },
    { label: t.test, tag: '04' },
    { label: t.aging, tag: '05' },
    { label: t.ipqc, tag: '06' },
    { label: t.final, tag: '07' },
    { label: t.system, tag: '08' },
    { label: t.oqa, tag: '09' },
    { label: t.package, tag: '10' },
    { label: t.ship, tag: '11' },
  ];

  return (
    <section id="process" className="py-24 bg-background relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} centered />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((step, index) => (
            <div 
              key={index}
              className="flex items-center gap-6 p-6 bg-white rounded-2xl border border-border/40 hover:border-accent/30 hover:shadow-xl transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-muted group-hover:bg-accent group-hover:text-white transition-colors font-headline font-bold text-lg">
                {step.tag}
              </div>
              <div className="flex-grow">
                <h4 className="font-semibold text-primary group-hover:text-accent transition-colors">
                  {step.label}
                </h4>
              </div>
              <CheckCircle2 className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
          ))}
        </div>
      </div>

      {/* Parallax elements */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-accent/10 rounded-full -z-10" />
      <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-accent/5 rounded-full -z-10" />
    </section>
  );
}
