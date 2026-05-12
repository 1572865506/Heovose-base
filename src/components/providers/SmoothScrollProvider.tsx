
"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 注册 GSAP 插件
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // 1. 初始化 Lenis
    const lenis = new Lenis({
      lerp: 0.08,           // 使用 lerp 代替 duration，能提供更线性、稳定的手感
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // 2. 帧驱动循环
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    let scrollTimer: NodeJS.Timeout;

    // 3. 将 Lenis 的滚动事件与 ScrollTrigger 同步
    lenis.on("scroll", () => {
      ScrollTrigger.update();
      
      // 性能模式：滚动时禁用昂贵特效
      document.body.classList.add("is-scrolling");
      
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        document.body.classList.remove("is-scrolling");
      }, 150);
    });

    // 4. 优化 GSAP
    gsap.ticker.lagSmoothing(0);

    // 销毁逻辑
    return () => {
      lenis.destroy();
      cancelAnimationFrame(rafId);
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
}
