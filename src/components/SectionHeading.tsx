
import { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";
import dynamic from 'next/dynamic';

const SplitText = dynamic(() => import('./ui/SplitText'), { ssr: false });

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered = false, className }: SectionHeadingProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div 
      ref={ref}
      className={cn(
        "mb-12 md:mb-16 space-y-4",
        centered ? "text-center" : "text-left",
        className
      )}
    >
      <SplitText
        text={title}
        tag="h2"
        className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-headline font-bold text-slate-900 tracking-tight block drop-shadow-[0_5px_5px_rgba(255,255,255,0.5)] break-words whitespace-normal"
        textAlign={centered ? "center" : "left"}
        delay={30}
        duration={0.8}
        threshold={0.2}
      />
      {mounted && subtitle ? (
        <p className={cn(
          "text-muted-foreground text-lg md:text-xl max-w-2xl font-medium transition-all duration-1000 delay-300",
          centered ? "mx-auto" : "mx-0",
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        )}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
