"use client";

import React, { useRef, useState, useMemo, forwardRef, useImperativeHandle, memo } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/dist/Draggable';
import { cn } from "@/lib/utils";

// 注册插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

interface GalleryItem {
  id?: string;
  image: string;
  text: string;
  tag?: string;
  description?: string;
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  gap?: number;
  onItemClick?: (item: GalleryItem) => void;
}

const CircularGallery = memo(forwardRef(({
  items = [],
  bend = 3,
  gap = 100,
  onItemClick
}: CircularGalleryProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeItems, setActiveItems] = useState<GalleryItem[]>([]);

  // 核心动画状态
  const state = useRef({
    x: 0,
    targetX: 0,
    itemWidth: 378 + (gap || 100),
    cards: [] as HTMLElement[],
    isDragging: false
  });

  // 数据初始化
  useMemo(() => {
    if (items.length > 0) {
      setActiveItems([...items, ...items, ...items]);
    }
  }, [items]);

  useGSAP(() => {
    if (!wrapperRef.current || activeItems.length === 0) return;

    state.current.cards = gsap.utils.toArray<HTMLElement>('.gallery-card');
    const itemWidth = state.current.itemWidth;
    const N = items.length;
    const groupWidth = itemWidth * N;
    const totalWidth = itemWidth * activeItems.length;
    const halfWidth = totalWidth / 2;

    const render = () => {
      if (!containerRef.current) return;
      
      // 保持坐标在周期内
      state.current.x = (state.current.x % groupWidth);

      const { x, cards } = state.current;
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = 378; 

      cards.forEach((card, i) => {
        const rawX = (i * itemWidth) + x;
        let wrappedX = ((rawX + halfWidth) % totalWidth);
        if (wrappedX < 0) wrappedX += totalWidth;
        wrappedX -= halfWidth;
        
        const centeredX = wrappedX;
        const normalizedDist = wrappedX / (containerWidth / 2);
        const absDist = Math.abs(normalizedDist);
        
        const angle = (wrappedX / 3500) * (bend * 10);
        const yOffset = 3500 - Math.sqrt(Math.max(0, 3500 * 3500 - wrappedX * wrappedX));
        
        const scale = 1 - Math.min(absDist * 0.15, 0.3);
        const opacity = 1 - Math.min(absDist * 0.4, 0.8);
        const zIndex = Math.round((1 - absDist) * 100);

        // 存储当前位移用于点击判定
        (card as any)._currentWrappedX = wrappedX;

        gsap.set(card, {
          x: centeredX,
          y: bend > 0 ? yOffset : -yOffset,
          rotationZ: angle,
          scale,
          opacity,
          zIndex,
          transformPerspective: 1000
        });

        // 给中心卡片加类名
        if (absDist < 0.15) {
          card.classList.add('is-active-center');
        } else {
          card.classList.remove('is-active-center');
        }
      });
    };

    (state.current as any).animateTo = (newX: number, isInertia = false) => {
      gsap.to(state.current, {
        x: newX,
        duration: isInertia ? 1.2 : 0.8,
        ease: isInertia ? "power2.out" : "power3.out",
        overwrite: true,
        onUpdate: render
      });
    };

    // 初始对齐
    const targetIndex = Math.floor(1.5 * N); 
    state.current.x = -(targetIndex * itemWidth);
    render();

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.ticker.add(render);
        render(); 
      } else {
        gsap.ticker.remove(render);
      }
    }, { threshold: 0.01 });

    if (containerRef.current) observer.observe(containerRef.current);

    const drag = Draggable.create(document.createElement('div'), {
      type: "x",
      trigger: containerRef.current,
      inertia: true,
      onDrag: function() {
        state.current.x += this.deltaX;
        render();
      },
      onThrowUpdate: function() {
        state.current.x += this.deltaX;
        render();
      },
      onThrowComplete: () => {
        const snapX = Math.round(state.current.x / itemWidth) * itemWidth;
        (state.current as any).animateTo(snapX, true);
      },
      onPress: () => {
        state.current.isDragging = true;
        gsap.killTweensOf(state.current);
        gsap.set(containerRef.current, { cursor: 'grabbing' });
      },
      onRelease: function() {
        state.current.isDragging = false;
        gsap.set(containerRef.current, { cursor: 'grab' });
        if (!this.vars?.inertia) {
          const snapX = Math.round(state.current.x / itemWidth) * itemWidth;
          (state.current as any).animateTo(snapX);
        }
      }
    });

    return () => {
      observer.disconnect();
      gsap.ticker.remove(render);
      if (drag[0]) drag[0].kill();
    };
  }, [activeItems, bend]);

  useImperativeHandle(ref, () => ({
    next: () => {
      const snapX = Math.round(state.current.x / state.current.itemWidth) * state.current.itemWidth;
      (state.current as any).animateTo(snapX - state.current.itemWidth);
    },
    prev: () => {
      const snapX = Math.round(state.current.x / state.current.itemWidth) * state.current.itemWidth;
      (state.current as any).animateTo(snapX + state.current.itemWidth);
    }
  }));

  const handleCardClick = (item: GalleryItem, e: React.MouseEvent<HTMLDivElement>) => {
    if (state.current.isDragging) return;
    
    const card = e.currentTarget;
    const wrappedX = (card as any)._currentWrappedX || 0;
    const itemWidth = state.current.itemWidth;

    // 点击中心卡片 -> 弹出详情
    if (Math.abs(wrappedX) < itemWidth / 4) {
      if (onItemClick) onItemClick(item);
    } else {
      // 点击侧边卡片 -> 滚动到中心
      const currentX = state.current.x;
      const moveNeeded = -wrappedX;
      (state.current as any).animateTo(currentX + moveNeeded);
    }
  };

  if (items.length === 0) return null;

  return (
    <div
      className="relative w-full h-[800px] overflow-hidden flex items-center justify-center cursor-grab select-none"
      ref={containerRef}
    >
      <div
        ref={wrapperRef}
        className="relative w-0 h-0 flex items-center justify-center will-change-transform -mt-28"
      >
        {activeItems.map((item, idx) => (
          <div 
            key={`${item.text}-${idx}`}
            className="gallery-card absolute left-[-189px] top-[-243px] w-[378px] h-[486px] rounded-[24px] overflow-hidden shadow-sm bg-white border border-slate-100 group will-change-transform cursor-pointer"
            style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
            onClick={(e) => handleCardClick(item, e)}
          >
            {/* 封面图片 */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img 
                src={item.image} 
                alt={item.text}
                className="w-full h-full object-cover will-change-transform group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/20 group-[.is-active-center]:group-hover:bg-black/40 transition-colors duration-500" />
            </div>

            {/* 内容布局 */}
            <div className="absolute inset-0 p-10 flex flex-col justify-end text-white z-10 pointer-events-none">
              <div className="relative">
                {item.tag && (
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 shadow-lg">
                    {item.tag}
                  </span>
                )}

                <div className="relative">
                  <div className="transition-all duration-500 ease-out transform opacity-100 translate-y-0 group-hover:opacity-0 group-hover:-translate-y-4">
                    <h3 className="text-3xl font-bold leading-tight text-white line-clamp-2 drop-shadow-md">
                      {item.text}
                    </h3>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-out transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                    {item.description && (
                      <p className="text-sm text-white/90 line-clamp-3 font-medium leading-relaxed drop-shadow-sm">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
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
