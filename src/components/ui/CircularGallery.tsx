"use client";

import React, { useEffect, useRef, useState, useMemo, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { Draggable } from 'gsap/dist/Draggable';
import { cn } from "@/lib/utils";

// 注册插件
if (typeof window !== 'undefined') {
  gsap.registerPlugin(Draggable);
}

interface GalleryItem {
  image: string;
  text: string;
  tag?: string;
  description?: string;
}

interface CircularGalleryProps {
  items?: GalleryItem[];
  bend?: number;
  borderRadius?: number;
  scrollEase?: number;
}

const CircularGallery = forwardRef(({
  items = [],
  bend = 3,
  borderRadius = 32,
  scrollEase = 0.08
}: CircularGalleryProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [activeItems, setActiveItems] = useState<GalleryItem[]>([]);

  // 核心动画状态
  const state = useRef({
    x: 0, // 虚拟滚动位置
    targetX: 0,
    itemWidth: 378 + 100, // 缩小10%并加大间距 (378 + 100)
    loopWidth: 0,
    cards: [] as HTMLElement[],
    setters: [] as any[],
    isDragging: false
  });

  // 1. 数据初始化
  useEffect(() => {
    if (items.length > 0) {
      // 复制三份以实现平滑无限循环
      setActiveItems([...items, ...items, ...items]);
      state.current.loopWidth = items.length * state.current.itemWidth;
      // 初始位置
      state.current.targetX = 0;
      state.current.x = 0;
    }
  }, [items]);

  useGSAP(() => {
    if (!wrapperRef.current || activeItems.length === 0) return;

    state.current.cards = gsap.utils.toArray<HTMLElement>('.gallery-card');
    state.current.setters = state.current.cards.map(card => ({
      x: gsap.quickSetter(card, "x", "px"),
      y: gsap.quickSetter(card, "y", "px"),
      rotation: gsap.quickSetter(card, "rotationZ", "deg"),
      opacity: gsap.quickSetter(card, "opacity")
    }));

    // 预计算常数以提速
    const itemWidth = state.current.itemWidth;
    const totalWidth = itemWidth * activeItems.length;
    const halfWidth = totalWidth / 2;
    const radius = 3500;
    const wrapX = gsap.utils.wrap(-halfWidth, halfWidth);

    // 唯一的渲染函数
    const render = () => {
      const x = state.current.x;
      state.current.cards.forEach((_, i) => {
        const setter = state.current.setters[i];
        const rawX = (i * itemWidth) + x;
        const wrappedX = wrapX(rawX);
        const angle = (wrappedX / radius) * (bend * 10);
        const yOffset = radius - Math.sqrt(Math.max(0, radius * radius - wrappedX * wrappedX));
        
        setter.x(wrappedX);
        setter.y(bend > 0 ? yOffset : -yOffset);
        setter.rotation(angle);
      });
    };

    // 驱动函数：使用 GSAP 驱动虚拟坐标
    (state.current as any).animateTo = (newX: number, isInertia = false) => {
      gsap.to(state.current, {
        x: newX,
        duration: isInertia ? 1.2 : 0.8,
        ease: isInertia ? "power2.out" : "power3.out",
        overwrite: true,
        onUpdate: render
      });
    };

    // 初始位置设置
    render();

    // 性能优化：只有在视口内才运行渲染循环
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.ticker.add(render);
        render(); // 重新进入时立即刷新一次
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
        state.current.targetX = state.current.x;
        render();
      },
      onThrowUpdate: function() {
        state.current.x += this.deltaX;
        state.current.targetX = state.current.x;
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
      onRelease: () => {
        state.current.isDragging = false;
        gsap.set(containerRef.current, { cursor: 'grab' });
        if (!drag[0].vars.inertia) {
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

  // API 暴露
  useImperativeHandle(ref, () => ({
    next: () => {
      const targetX = Math.round((state.current.x - state.current.itemWidth) / state.current.itemWidth) * state.current.itemWidth;
      (state.current as any).animateTo(targetX);
    },
    prev: () => {
      const targetX = Math.round((state.current.x + state.current.itemWidth) / state.current.itemWidth) * state.current.itemWidth;
      (state.current as any).animateTo(targetX);
    }
  }));

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
            className="gallery-card absolute left-[-189px] top-[-243px] w-[378px] h-[486px] rounded-[24px] overflow-hidden shadow-sm bg-white border border-slate-100 group will-change-transform"
            style={{ backfaceVisibility: 'hidden', transformStyle: 'preserve-3d' }}
          >
            {/* 封面图片 */}
            <div className="absolute inset-0 w-full h-full overflow-hidden">
              <img 
                src={item.image} 
                alt={item.text}
                className="w-full h-full object-cover will-change-transform"
              />
              {/* 轻量化浅色遮罩 */}
              <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-white/10 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-500" />
            </div>

            {/* 基础内容布局 */}
            <div className="absolute inset-0 p-10 flex flex-col justify-end text-slate-900 z-10 pointer-events-none">
              <div className="relative">
                {/* 常驻标签 */}
                {item.tag && (
                  <span className="inline-block px-3 py-1 bg-blue-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider mb-4 shadow-sm">
                    {item.tag}
                  </span>
                )}

                <div className="relative">
                  {/* 主标题：Hover 时淡出上移 */}
                  <div className="transition-all duration-500 ease-out transform opacity-100 translate-y-0 group-hover:opacity-0 group-hover:-translate-y-4">
                    <h3 className="text-3xl font-bold leading-tight text-slate-900 line-clamp-2">
                      {item.text}
                    </h3>
                  </div>

                  {/* 副标题：Hover 时淡入升起 */}
                  <div className="absolute inset-x-0 bottom-0 transition-all duration-500 ease-out transform opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0">
                    {item.description && (
                      <p className="text-sm text-slate-900 line-clamp-3 font-medium leading-relaxed">
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
});

CircularGallery.displayName = 'CircularGallery';

export default CircularGallery;
