"use client";

import { useState, useEffect } from 'react';
import { analyzeImageBrightness } from '@/lib/image-analysis';

export function useImageBrightness(imageUrl: string | undefined | null) {
  const [brightness, setBrightness] = useState<number>(128);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    if (!imageUrl) return;

    analyzeImageBrightness(imageUrl).then((avgBrightness) => {
      setBrightness(avgBrightness);
      setTheme(avgBrightness > 160 ? 'light' : 'dark');
    });
  }, [imageUrl]);

  return { brightness, theme };
}
