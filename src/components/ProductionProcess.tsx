
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";

export function ProductionProcess({ locale }: { locale: Locale }) {
  const t = translations[locale].process;
  const [activeStep, setActiveStep] = useState(0);
  const [subImageIndex, setSubImageIndex] = useState(0);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);

  const steps = useMemo(() => [
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
  ], [t, locale]);

  // Define visual segments to avoid redundant transitions when images are the same
  const imageSegments = useMemo(() => [
    { start: 0, end: 3, images: ['/Pipeline/1-1.jpg'] },
    { start: 4, end: 5, images: ['/Pipeline/2-1.jpg'] },
    { start: 6, end: 6, images: ['/Pipeline/2-2.png'] },
    { start: 7, end: 7, images: ['/Pipeline/3-1.jpg'] },
    { start: 8, end: 8, images: ['/Pipeline/4-1.jpg', '/Pipeline/4-2.png'] },
    { start: 9, end: 9, images: ['/Pipeline/5-1.jpg', '/Pipeline/5-2.jpg'] },
    { start: 10, end: 10, images: ['/Pipeline/6-1.JPG'] },
  ], []);

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

  // Handle internal slideshow for segments with multiple images
  useEffect(() => {
    setSubImageIndex(0);
    const activeImages = steps[activeStep]?.images || [];
    if (activeImages.length <= 1) return;

    const interval = setInterval(() => {
      setSubImageIndex((prev) => (prev + 1) % activeImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [activeStep, steps]);

  return (
    <section id="process" className="py-32 bg-white relative overflow-x-clip">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative mt-20">
          
          {/* Left Column: Image (Sticky & Bleed-to-edge) */}
          <div className="lg:col-span-7 hidden lg:block relative">
            <div className={cn(
              "sticky top-32 h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-muted/20 border-y border-r border-border/40 shadow-2xl transition-all duration-500",
              "rounded-r-[5rem] rounded-l-none",
              // Bleed-to-edge logic capped at 1920px width
              "lg:-ml-[calc((min(100vw,1920px)-1280px)/2+1.5rem)] lg:w-[calc(100%+((min(100vw,1920px)-1280px)/2+1.5rem))]"
            )}>
              {imageSegments.map((segment, segIndex) => {
                const isSegmentActive = activeStep >= segment.start && activeStep <= segment.end;
                return (
                  <div
                    key={`seg-img-${segIndex}`}
                    className={cn(
                      "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                      isSegmentActive ? "opacity-100" : "opacity-0 pointer-events-none"
                    )}
                  >
                    {segment.images.map((imgUrl, iIndex) => (
                      <div
                        key={`${segIndex}-${iIndex}`}
                        className={cn(
                          "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                          isSegmentActive && subImageIndex === iIndex ? "opacity-100" : "opacity-0"
                        )}
                      >
                        <Image
                          src={imgUrl}
                          alt={`Process Segment ${segIndex} - Image ${iIndex}`}
                          fill
                          className="object-cover"
                          priority={segIndex === 0}
                        />
                      </div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                );
              })}
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
