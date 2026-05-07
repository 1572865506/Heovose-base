
/**
 * Analyzes the average brightness of an image from a URL.
 * Returns a value between 0 (black) and 255 (white).
 */
const brightnessCache = new Map<string, number>();
const pendingBrightnessAnalysis = new Map<string, Promise<number>>();

export async function analyzeImageBrightness(imageUrl: string): Promise<number> {
  if (!imageUrl) return 128;
  
  // Check cache
  if (brightnessCache.has(imageUrl)) {
    return brightnessCache.get(imageUrl)!;
  }

  // Check pending analysis
  if (pendingBrightnessAnalysis.has(imageUrl)) {
    return pendingBrightnessAnalysis.get(imageUrl)!;
  }

  const analysisPromise = new Promise<number>((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(128);
        return;
      }

      canvas.width = 40; // Smaller sample size is enough for brightness
      canvas.height = 40;
      ctx.drawImage(img, 0, 0, 40, 40);

      try {
        const imageData = ctx.getImageData(0, 0, 40, 40);
        const data = imageData.data;
        let brightnessSum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // HSP (Highly Sensitive Poo) color model for perceived brightness
          const brightness = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
          );
          brightnessSum += brightness;
        }

        const avgBrightness = brightnessSum / (40 * 40);
        brightnessCache.set(imageUrl, avgBrightness);
        resolve(avgBrightness);
      } catch (e) {
        console.warn("Could not analyze image brightness due to CORS or other error:", e);
        resolve(128);
      } finally {
        pendingBrightnessAnalysis.delete(imageUrl);
      }
    };

    img.onerror = () => {
      pendingBrightnessAnalysis.delete(imageUrl);
      resolve(128);
    };
  });

  pendingBrightnessAnalysis.set(imageUrl, analysisPromise);
  return analysisPromise;
}
