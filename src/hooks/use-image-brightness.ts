"use client";

import { useState, useEffect } from 'react';

export function useImageBrightness(imageUrl: string | undefined | null, precalculatedBrightness?: number | null) {
  const [brightness, setBrightness] = useState<number>(precalculatedBrightness ?? 128);
  const [theme, setTheme] = useState<'light' | 'dark'>((precalculatedBrightness ?? 128) > 140 ? 'light' : 'dark');

  useEffect(() => {
    if (precalculatedBrightness !== undefined && precalculatedBrightness !== null) {
      setBrightness(precalculatedBrightness);
      setTheme(precalculatedBrightness > 140 ? 'light' : 'dark');
    } else {
      // 彻底移除主线程 Canvas 图像解析，避免强制同步布局重排，使用默认 128 (深色背景兜底)
      setBrightness(128);
      setTheme('dark');
    }
  }, [precalculatedBrightness]);

  return { brightness, theme };
}
