
"use client";

import { useState, useEffect, useRef, useMemo } from 'react';
import Image from 'next/image';
import { Locale, translations } from "@/lib/translations";
import { SectionHeading } from "./SectionHeading";
import { cn } from "@/lib/utils";
import { Play, Pause } from "lucide-react";

export function ProductionProcess({ locale }: { locale: Locale }) {
  const t = translations[locale].process;
  const [activeStep, setActiveStep] = useState(0);
  const [subImageIndex, setSubImageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const scrollRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  const AUTOPLAY_DELAY = 4000;

  const steps = useMemo(() => [
    { label: t.pmc, tag: '01', images: ['/Pipeline/1-1.png'], desc: t.pmc_desc },
    { label: t.procurement, tag: '02', images: ['/Pipeline/1-1.png'], desc: t.procurement_desc },
    { label: t.supplier, tag: '03', images: ['/Pipeline/1-1.png'], desc: t.supplier_desc },
    { label: t.receiving, tag: '04', images: ['/Pipeline/1-1.png'], desc: t.receiving_desc },
    { label: t.inspection, tag: '05', images: ['/Pipeline/2-1.jpg'], desc: t.inspection_desc },
    { label: t.warehousing, tag: '06', images: ['/Pipeline/2-1.jpg'], desc: t.warehousing_desc },
    { label: t.issuing, tag: '07', images: ['/Pipeline/2-2.png'], desc: t.issuing_desc },
    { label: t.manufacturing, tag: '08', images: ['/Pipeline/3-1.png'], desc: t.manufacturing_desc },
    { label: t.system, tag: '09', images: ['/Pipeline/4-1.png', '/Pipeline/4-2.png'], desc: t.system_desc },
    { label: t.fg_warehousing, tag: '10', images: ['/Pipeline/5-1.jpg', '/Pipeline/5-2.jpg'], desc: t.fg_warehousing_desc },
    { label: t.shipment, tag: '11', images: ['/Pipeline/6-1.JPG'], desc: t.shipment_desc },
  ], [t]);

  const imageSegments = useMemo(() => [
    { start: 0, end: 3, images: ['/Pipeline/1-1.png'] },
    { start: 4, end: 5, images: ['/Pipeline/2-1.jpg'] },
    { start: 6, end: 6, images: ['/Pipeline/2-2.png'] },
    { start: 7, end: 7, images: ['/Pipeline/3-1.png'] },
    { start: 8, end: 8, images: ['/Pipeline/4-1.png', '/Pipeline/4-2.png'] },
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

  // Timer to handle the progress bar increment
  useEffect(() => {
    const activeImages = steps[activeStep]?.images || [];
    if (activeImages.length <= 1 || !isPlaying) {
      setProgress(0);
      return;
    }

    const intervalTime = 50;
    const increment = (intervalTime / AUTOPLAY_DELAY) * 100;

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + increment;
        return next;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [activeStep, isPlaying, steps, AUTOPLAY_DELAY]);

  // Decoupled effect to handle rotation when progress hits 100
  useEffect(() => {
    const activeImages = steps[activeStep]?.images || [];
    if (progress >= 100 && activeImages.length > 1) {
      setSubImageIndex((prev) => (prev + 1) % activeImages.length);
      setProgress(0);
    }
  }, [progress, activeStep, steps]);

  // Reset index when step changes
  useEffect(() => {
    setSubImageIndex(0);
    setProgress(0);
  }, [activeStep]);

  return (
    <section id="process" className="py-32 bg-white relative overflow-x-clip">
      <div className="container mx-auto px-6">
        <SectionHeading title={t.title} subtitle={t.subtitle} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 relative mt-20">
          
          {/* Left Column: Fixed Image with Bleed-to-Edge Design */}
          <div className="lg:col-span-7 hidden lg:block relative">
            <div className={cn(
              "sticky top-32 h-[70vh] min-h-[500px] max-h-[800px] overflow-hidden bg-muted/20 border-y border-r border-border/40 shadow-2xl transition-all duration-500",
              "rounded-r-[5rem] rounded-l-none",
              /* Dynamic calculation for Bleed-to-Edge restricted by 1920px container logic */
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
                    {segment.images.map((imgUrl, iIndex) => {
                      const isCurrentSubImage = segment.images.length > 1 ? subImageIndex === iIndex : iIndex === 0;
                      return (
                        <div
                          key={`${segIndex}-${iIndex}`}
                          className={cn(
                            "absolute inset-0 transition-opacity duration-1000 ease-in-out",
                            (isSegmentActive && isCurrentSubImage)
                              ? "opacity-100" 
                              : "opacity-0"
                          )}
                        >
                          <Image
                            src={imgUrl}
                            alt={`Process Step Image`}
                            fill
                            className="object-cover"
                            priority={segIndex === 0}
                          />
                        </div>
                      );
                    })}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
                  </div>
                );
              })}

              {/* Sub-image rotation controls */}
              {steps[activeStep]?.images.length > 1 && (
                <div className="absolute bottom-8 right-8 z-50 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex gap-1.5 items-center">
                    {steps[activeStep].images.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSubImageIndex(i);
                          setProgress(0);
                        }}
                        className={cn(
                          "relative h-1 rounded-full transition-all duration-500 overflow-hidden bg-white/30",
                          i === subImageIndex ? "w-8" : "w-2 hover:bg-white/50"
                        )}
                      >
                        {i === subImageIndex && isPlaying && (
                          <div 
                            className="absolute inset-0 bg-accent origin-left"
                            style={{ 
                              width: `${progress}%`,
                              transition: progress === 0 ? 'none' : 'width 50ms linear'
                            }}
                          />
                        )}
                        {i === subImageIndex && !isPlaying && (
                          <div className="absolute inset-0 bg-accent w-full" />
                        )}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-accent hover:text-accent-foreground transition-all shadow-lg border border-white/10"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Scrolling Steps */}
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

                   {step.images.length > 1 && activeStep === index && (
                      <div className="absolute bottom-4 right-4 z-10 flex items-center gap-3 bg-black/40 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
                        <div className="flex gap-1.5">
                          {step.images.map((_, i) => (
                            <div 
                              key={i} 
                              className={cn(
                                "h-1 rounded-full transition-all",
                                i === subImageIndex ? "bg-accent w-6" : "bg-white/30 w-1.5"
                              )} 
                            />
                          ))}
                        </div>
                      </div>
                   )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Background Decorative Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[20%] right-0 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[150px]" />
      </div>
    </section>
  );
}
