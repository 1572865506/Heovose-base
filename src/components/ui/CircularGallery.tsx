"use client";

import React, { useRef, useEffect, useState, useMemo, forwardRef, useImperativeHandle, memo } from 'react';
import { cn } from "@/lib/utils";

interface GalleryItem {
  id?: string;
  image: string;
  text: string;
  tag?: string;
  description?: string;
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number; // Kept for compatibility
  gap?: number;  // Kept for compatibility
  onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = memo(forwardRef(({
  items = [],
  onItemClick
}: CircularGalleryProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardCoords = useRef<{ offsetLeft: number; offsetWidth: number }[]>([]);
  const springRef = useRef<number | null>(null);
  const springTargetRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Duplicate items 3 times for infinite loop scrolling
  const activeItems = useMemo(() => {
    if (items.length > 0) {
      return [...items, ...items, ...items];
    }
    return [];
  }, [items]);

  // Dynamic custom spring physics scroll animator (Hooke's Law spring simulation)
  const springScrollTo = (target: number) => {
    const el = containerRef.current;
    if (!el) return;

    let velocity = 0;
    const stiffness = 0.075; // Lower = softer springiness
    const damping = 0.72;   // Lower = more bounce; higher = quicker settling
    
    springTargetRef.current = target;
    if (springRef.current) cancelAnimationFrame(springRef.current);

    const step = () => {
      const current = el.scrollLeft;
      const targetVal = springTargetRef.current ?? target;
      const diff = targetVal - current;
      
      velocity += diff * stiffness;
      velocity *= damping;
      
      el.scrollLeft = current + velocity;

      if (Math.abs(diff) > 0.3 || Math.abs(velocity) > 0.05) {
        springRef.current = requestAnimationFrame(step);
      } else {
        el.scrollLeft = targetVal;
        springRef.current = null;
        springTargetRef.current = null;
      }
    };
    
    springRef.current = requestAnimationFrame(step);
  };

  // Expose next/prev methods to parent navigation buttons with spring interpolation
  useImperativeHandle(ref, () => ({
    next: () => {
      const el = containerRef.current;
      if (el && cardCoords.current.length > 0) {
        const containerWidth = el.offsetWidth;
        const viewportCenter = el.scrollLeft + containerWidth / 2;
        
        let currentIdx = 0;
        let minDistance = Infinity;
        cardCoords.current.forEach((coord, idx) => {
          const cardCenter = coord.offsetLeft + coord.offsetWidth / 2;
          const dist = Math.abs(cardCenter - viewportCenter);
          if (dist < minDistance) {
            minDistance = dist;
            currentIdx = idx;
          }
        });

        const nextIdx = Math.min(currentIdx + 1, cardCoords.current.length - 1);
        const coord = cardCoords.current[nextIdx];
        if (coord) {
          const targetScroll = coord.offsetLeft - (containerWidth / 2) + (coord.offsetWidth / 2);
          springScrollTo(targetScroll);
        }
      }
    },
    prev: () => {
      const el = containerRef.current;
      if (el && cardCoords.current.length > 0) {
        const containerWidth = el.offsetWidth;
        const viewportCenter = el.scrollLeft + containerWidth / 2;
        
        let currentIdx = 0;
        let minDistance = Infinity;
        cardCoords.current.forEach((coord, idx) => {
          const cardCenter = coord.offsetLeft + coord.offsetWidth / 2;
          const dist = Math.abs(cardCenter - viewportCenter);
          if (dist < minDistance) {
            minDistance = dist;
            currentIdx = idx;
          }
        });

        const prevIdx = Math.max(currentIdx - 1, 0);
        const coord = cardCoords.current[prevIdx];
        if (coord) {
          const targetScroll = coord.offsetLeft - (containerWidth / 2) + (coord.offsetWidth / 2);
          springScrollTo(targetScroll);
        }
      }
    }
  }));

  // Coordinate caching & Infinite Scroll Wrap-around logic
  useEffect(() => {
    const el = containerRef.current;
    if (!el || items.length === 0) return;

    let isMounted = true;

    const cacheCoords = () => {
      if (!isMounted) return;
      const containerWidth = el.offsetWidth;
      
      if (containerWidth === 0) {
        requestAnimationFrame(cacheCoords);
        return;
      }

      const cards = el.querySelectorAll('.gallery-card');
      cardCoords.current = Array.from(cards).map((cardNode) => {
        const card = cardNode as HTMLElement;
        return {
          offsetLeft: card.offsetLeft,
          offsetWidth: card.offsetWidth
        };
      });

      // Align scroll to the beginning of the middle group
      const N = items.length;
      if (N > 0 && cardCoords.current[N]) {
        const middleCard = cardCoords.current[N];
        const initialScroll = middleCard.offsetLeft - (containerWidth / 2) + (middleCard.offsetWidth / 2);
        el.scrollLeft = initialScroll;
        setIsReady(true);
      }
    };

    // Passive listener strictly for loop wrap-around
    const onScroll = () => {
      const N = items.length;
      if (N > 0 && cardCoords.current.length >= 3 * N) {
        const cardN = cardCoords.current[N];
        const card2N = cardCoords.current[2 * N];
        if (cardN && card2N) {
          const containerWidth = el.offsetWidth;
          const minScroll = cardN.offsetLeft - containerWidth;
          const maxScroll = card2N.offsetLeft;
          const groupWidth = card2N.offsetLeft - cardN.offsetLeft;

          // CRITICAL: When scroll wraps around mid-animation, do NOT cancel the spring transition.
          // Instead, shift both the scroll position and the spring's targetScroll by groupWidth,
          // letting the slide animation continue seamlessly.
          if (el.scrollLeft < minScroll) {
            el.scrollLeft += groupWidth;
            if (springTargetRef.current !== null) {
              springTargetRef.current += groupWidth;
            }
          } else if (el.scrollLeft > maxScroll) {
            el.scrollLeft -= groupWidth;
            if (springTargetRef.current !== null) {
              springTargetRef.current -= groupWidth;
            }
          }
        }
      }
    };

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', cacheCoords);
    const timer = setTimeout(cacheCoords, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', cacheCoords);
    };
  }, [items.length]);

  // Desktop Mouse Grab-to-Scroll + Spring snap settling on release
  useEffect(() => {
    const el = containerRef.current;
    if (!el || activeItems.length === 0) return;

    let isDown = false;
    let startX: number;
    let scrollLeftVal: number;
    let isDragging = false;

    const onMouseDown = (e: MouseEvent) => {
      isDown = true;
      isDragging = false;
      startX = e.pageX - el.offsetLeft;
      scrollLeftVal = el.scrollLeft;
      
      if (springRef.current) cancelAnimationFrame(springRef.current);
      springTargetRef.current = null;
      
      el.style.scrollSnapType = 'none'; 
      el.style.cursor = 'grabbing';
    };

    const onMouseLeave = () => {
      if (isDown) {
        isDown = false;
        el.style.cursor = 'grab';
        snapToCenter();
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = 'grab';

      snapToCenter();

      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDown) return;
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5;
      if (Math.abs(walk) > 5) {
        isDragging = true;
      }
      el.scrollLeft = scrollLeftVal - walk;
    };

    const onClickCapture = (e: MouseEvent) => {
      if (isDragging) {
        e.stopPropagation();
        e.preventDefault();
        isDragging = false;
      }
    };

    const snapToCenter = () => {
      const containerWidth = el.offsetWidth;
      if (containerWidth === 0) return;
      const viewportCenter = el.scrollLeft + containerWidth / 2;
      
      let closestCardIndex = -1;
      let minDistance = Infinity;

      cardCoords.current.forEach((coord, idx) => {
        const cardCenter = coord.offsetLeft + coord.offsetWidth / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        if (dist < minDistance) {
          minDistance = dist;
          closestCardIndex = idx;
        }
      });

      if (closestCardIndex !== -1 && cardCoords.current[closestCardIndex]) {
        const coord = cardCoords.current[closestCardIndex];
        const targetScroll = coord.offsetLeft - (containerWidth / 2) + (coord.offsetWidth / 2);
        springScrollTo(targetScroll);
      }
    };

    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('mouseleave', onMouseLeave);
    el.addEventListener('mouseup', onMouseUp, true);
    el.addEventListener('mousemove', onMouseMove);
    el.addEventListener('click', onClickCapture, true);
    el.style.cursor = 'grab';

    return () => {
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('mouseleave', onMouseLeave);
      el.removeEventListener('mouseup', onMouseUp, true);
      el.removeEventListener('mousemove', onMouseMove);
      el.removeEventListener('click', onClickCapture, true);
    };
  }, [activeItems]);

  if (activeItems.length === 0) return null;

  return (
    <div className="relative w-full overflow-hidden py-10 select-none">
      {/* 
        Native CSS Scroll-driven animations with steep keyframe parabola
        for much more dramatic 3D arch depth and zero-jitter performance.
      */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        @keyframes cylinder-curve {
          0% {
            transform: translateY(60px) rotateY(16deg) rotateZ(6.5deg) scale(0.9) translateZ(0);
          }
          25% {
            transform: translateY(22px) rotateY(7.5deg) rotateZ(3deg) scale(0.96) translateZ(0);
          }
          50% {
            transform: translateY(0px) rotateY(0deg) rotateZ(0deg) scale(1) translateZ(0);
          }
          75% {
            transform: translateY(22px) rotateY(-7.5deg) rotateZ(-3deg) scale(0.96) translateZ(0);
          }
          100% {
            transform: translateY(60px) rotateY(-16deg) rotateZ(-6.5deg) scale(0.9) translateZ(0);
          }
        }
        .scroll-animated-card {
          animation: cylinder-curve linear both;
          animation-timeline: view(inline);
          animation-range: entry -15% exit 115%;
        }
      `}} />

      {/* Main Horizontal Scroll Deck */}
      <div
        ref={containerRef}
        className={cn(
          "no-scrollbar w-full overflow-x-auto overflow-y-hidden flex gap-6 px-6 md:px-12 lg:px-24 will-change-scroll pb-24 pt-8 transition-opacity duration-500 ease-out",
          isReady ? "opacity-100" : "opacity-0"
        )}
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
          overflowY: 'hidden',
          perspective: '1200px',
          transformStyle: 'preserve-3d'
        }}
      >
        {activeItems.map((item, idx) => (
          <div
            key={`${item.text}-${idx}`}
            onClick={() => onItemClick?.(item)}
            className="gallery-card scroll-animated-card group relative flex-shrink-0 w-[290px] xs:w-[330px] sm:w-[380px] md:w-[400px] lg:w-[410px] h-[500px] rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/5 hover:border-slate-200 cursor-pointer transform-gpu will-change-transform flex flex-col transition-[box-shadow,border-color] duration-500 ease-out"
            style={{ 
              transformStyle: 'preserve-3d',
              backfaceVisibility: 'hidden'
            }}
          >
            {/* Top Half: Background Image */}
            <div className="relative w-full h-[55%] overflow-hidden rounded-t-[2.5rem] bg-white shrink-0">
              <img
                src={item.image}
                alt={item.text}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 rounded-t-[2.5rem] select-none pointer-events-none"
                draggable="false"
                loading="lazy"
              />
            </div>

            {/* Bottom Half: Clean Google-Style Content Area */}
            <div className="w-full h-[45%] p-6 md:p-8 flex flex-col justify-start bg-white text-left z-10 pointer-events-none">
              <div className="space-y-3">
                {item.tag && (
                  <span className="inline-block px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-wider border border-blue-100/50 w-fit">
                    {item.tag}
                  </span>
                )}

                <h3 className="text-xl md:text-2xl font-headline font-bold leading-tight tracking-tight text-slate-800 line-clamp-1">
                  {item.text}
                </h3>

                <p className="text-[11px] md:text-[13px] text-slate-400 line-clamp-4 md:line-clamp-5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}));

CircularGallery.displayName = 'CircularGallery';

export default CircularGallery;
