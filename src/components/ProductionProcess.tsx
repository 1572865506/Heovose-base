
"use client";

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";

export function ProductionProcess({ locale }: { locale: Locale }) {
  const t = translations[locale].process;
  const [activeStep, setActiveStep] = useState(0);
  const [subImageIndex, setSubImageIndex] = useState(0);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = [
    { label: t.pmc, tag: '01', images: ['/Pipeline/1-1.jpg'], desc: t.pmc_desc },
    { label: t.procurement, tag: '02', images: ['/Pipeline/1-1.jpg'], desc: t.procurement_desc },
    { label: t.supplier, tag: '03', images: ['/Pipeline/1-1.jpg'], desc: t.supplier_desc },
    { label: t.receiving, tag: '04', images: ['/Pipeline/1-1.jpg'], desc: t.receiving_desc },
    { label: t.inspection, tag: '05', images: ['/Pipeline/2-1.jpg'], desc: t.inspection_desc },
    { label: t.warehousing, tag: '06', images: ['/Pipeline/2-1.jpg'], desc: t.warehousing_desc },
    { label: t.issuing, tag: '07', images: ['/Pipeline/2-2.png'], desc: t.issuing_desc },
    { label: t.manufacturing, tag: '08', images: ['/Pipeline/3-1.jpg'], desc: t.manufacturing_desc },
    { label: t.system, tag: '09', images: ['/Pipeline/4-1.jpg', '/Pipeline/4-2.png'], desc: t.system_desc },
    { label: t.fg_warehousing, tag: '10', images: ['/Pipeline/5-1.jpg', '/Pipeline/5-2.jpg'], desc: t.fg_warehousing_desc },
    { label: t.shipment, tag: '11', images: ['/Pipeline/6-1.JPG'], desc: t.shipment_desc },
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
            rootMargin: "-20% 0px -20% 0px"
          }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  useEffect(() => {
    setSubImageIndex(0);
    const currentStepImages = steps[activeStep]?.images || [];
    if (currentStepImages.length <= 1) return;

    const interval = setInterval(() => {
      setSubImageIndex((prev) => (prev + 1) % currentStepImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeStep]);

  return (
    <section id="process" className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative mt-20">
          
          {/* Left Column: Image (Sticky & Bleed) */}
          <div className="lg:col-span-7 hidden lg:block relative">
            <div className={cn(
              "sticky top-32 aspect-square overflow-hidden bg-muted/20 border-y border-r border-border/40 shadow-2xl transition-all duration-500",
              "rounded-r-[5rem] rounded-l-none",
              // Bleed to edge calculation: pulls to edge but caps at 1920px screen width logic
              "lg:-ml-[calc((min(100vw,1920px)-1280px)/2+1.5rem)] lg:w-[calc(100%+((min(100vw,1920px)-1280px)/2+1.5rem))]"
            )}>
              {steps.map((step, sIndex) => (
                <div
                  key={`step-img-${sIndex}`}
                  className={cn(
                    "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                    activeStep === sIndex ? "opacity-100" : "opacity-0 pointer-events-none"
                  )}
                >
                  {step.images.map((imgUrl, iIndex) => (
                    <div
                      key={`${sIndex}-${iIndex}`}
                      className={cn(
                        "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                        activeStep === sIndex && subImageIndex === iIndex ? "opacity-100" : "opacity-0"
                      )}
                    >
                      <Image
                        src={imgUrl}
                        alt={`${step.label} - ${iIndex}`}
                        fill
                        className="object-cover"
                        priority={sIndex === 0}
                      />
                    </div>
                  ))}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Text Steps (Scrollable) */}
          <div className="lg:col-span-5 space-y-[60vh] py-12">
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

                {/* Mobile View: Inline Images */}
                <div className="lg:hidden w-full aspect-video rounded-[2rem] overflow-hidden relative border border-border/40 mt-8 shadow-lg">
                   {step.images.map((imgUrl, iIndex) => (
                      <div
                        key={`mob-${index}-${iIndex}`}
                        className={cn(
                          "absolute inset-0 transition-opacity duration-1000",
                          activeStep === index && subImageIndex === iIndex ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <Image
                          src={imgUrl}
                          alt={step.label}
                          fill
                          className="object-cover"
                        />
                      </div>
                   ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>
    </section>
  );
}
