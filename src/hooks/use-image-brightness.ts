"use client";

import { useState, useEffect } from 'react';
import { analyzeImageBrightness } from '@/lib/image-analysis';
import { getAssetUrl } from '@/lib/image-utils';

export function useImageBrightness(imageUrl: string | undefined | null, precalculatedBrightness?: number | null) {
  const [brightness, setBrightness] = useState<number>(precalculatedBrightness ?? 128);
  const [theme, setTheme] = useState<'light' | 'dark'>((precalculatedBrightness ?? 128) > 160 ? 'light' : 'dark');

  useEffect(() => {
    // If we already have a pre-calculated brightness, don't run the analysis
    if (!imageUrl || (precalculatedBrightness !== undefined && precalculatedBrightness !== null)) {
      if (precalculatedBrightness !== undefined && precalculatedBrightness !== null) {
        setBrightness(precalculatedBrightness);
        setTheme(precalculatedBrightness > 160 ? 'light' : 'dark');
      }
      return;
    }

    analyzeImageBrightness(getAssetUrl(imageUrl)).then((avgBrightness) => {
      setBrightness(avgBrightness);
      setTheme(avgBrightness > 160 ? 'light' : 'dark');
    });
  }, [imageUrl, precalculatedBrightness]);

  return { brightness, theme };
}
