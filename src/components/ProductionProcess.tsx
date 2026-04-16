
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { cn } from "@/lib/utils";

export function ProductionProcess({ locale }: { locale: Locale }) {
  const t = translations[locale].process;
  const [activeStep, setActiveStep] = useState(0);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    { label: t.pmc, tag: '01', imageUrl: '/Pipeline/1-1.jpg', desc: t.pmc_desc },
    { label: t.procurement, tag: '02', imageUrl: '/Pipeline/1-1.jpg', desc: t.procurement_desc },
    { label: t.supplier, tag: '03', imageUrl: '/Pipeline/1-1.jpg', desc: t.supplier_desc },
    { label: t.receiving, tag: '04', imageUrl: '/Pipeline/1-1.jpg', desc: t.receiving_desc },
    { label: t.inspection, tag: '05', imageUrl: '/Pipeline/2-1.jpg', desc: t.inspection_desc },
    { label: t.warehousing, tag: '06', imageUrl: '/Pipeline/2-2.png', desc: t.warehousing_desc },
    { label: t.issuing, tag: '07', imageUrl: '/Pipeline/2-1.jpg', desc: t.issuing_desc },
    { label: t.system, tag: '08', imageId: 'process-smt', desc: locale === 'en' ? 'Custom OS deployment and driver configuration for specific client needs.' : '根据客户需求进行定制化 OS 部署和驱动配置。' },
    { label: t.oqa, tag: '09', imageId: 'process-qc', desc: locale === 'en' ? 'Outgoing Quality Assurance: Final gatekeeper before product release.' : '出货品质保证：产品发布前的最后一道关口。' },
    { label: t.package, tag: '10', imageId: 'process-logistics', desc: locale === 'en' ? 'Industrial-grade protective packaging designed for global transit.' : '为全球运输设计的工业级防护包装。' },
    { label: t.ship, tag: '11', imageId: 'process-logistics', desc: locale === 'en' ? 'Coordinated global dispatch to over 50 countries via premium partners.' : '通过优质合作伙伴协调向全球 50 多个国家发货。' },
  ];

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    scrollRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveStep(index);
            }
          },
          { 
            threshold: 0.5,
            rootMargin: "-25% 0px -25% 0px"
          }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <section id="process" className="py-32 bg-white relative">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 relative mt-20">
          
          {/* Sticky Image Column - Now constrained within grid */}
          <div className="lg:block hidden relative">
            <div className="sticky top-32 aspect-square rounded-[3rem] overflow-hidden bg-muted/20 border border-border/40 shadow-2xl group">
              {steps.map((step, index) => {
                const imgUrl = step.imageUrl || PlaceHolderImages.find(img => img.id === step.imageId)?.imageUrl;
                return (
                  <div
                    key={index}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-700 ease-in-out",
                      activeStep === index ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    {imgUrl && (
                      <Image
                        src={imgUrl}
                        alt={step.label}
                        fill
                        className="object-cover"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Scrolling Text Column */}
          <div className="space-y-48 py-12">
            {steps.map((step, index) => (
              <div
                key={index}
                ref={(el) => (scrollRefs.current[index] = el)}
                className={cn(
                  "transition-all duration-700 space-y-8 pl-4 lg:pl-0",
                  activeStep === index ? "opacity-100 translate-x-4" : "opacity-15 translate-x-0"
                )}
              >
                <div className="flex items-center gap-6">
                  <div className={cn(
                    "w-16 h-16 flex items-center justify-center rounded-2xl font-headline font-bold text-2xl transition-all duration-500 shrink-0",
                    activeStep === index ? "bg-primary text-white shadow-xl scale-110" : "bg-muted text-muted-foreground"
                  )}>
                    {step.tag}
                  </div>
                  <h3 className={cn(
                    "text-3xl md:text-4xl font-headline font-bold transition-colors duration-500",
                    activeStep === index ? "text-primary" : "text-muted-foreground/60"
                  )}>
                    {step.label}
                  </h3>
                </div>
                
                <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed pl-6 border-l-4 border-accent">
                  {step.desc}
                </p>

                {/* Mobile view image */}
                <div className="lg:hidden w-full aspect-video rounded-[2rem] overflow-hidden relative border border-border/40 mt-8 shadow-lg">
                   { (step.imageUrl || PlaceHolderImages.find(img => img.id === step.imageId)?.imageUrl) && (
                      <Image
                        src={step.imageUrl || PlaceHolderImages.find(img => img.id === step.imageId)!.imageUrl}
                        alt={step.label}
                        fill
                        className="object-cover"
                      />
                   )}
                </div>
              </div>
            ))}
            {/* Spacer for last step visibility */}
            <div className="h-[40vh] hidden lg:block" />
          </div>
        </div>
      </div>

      {/* Decorative element */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>
    </section>
  );
}
