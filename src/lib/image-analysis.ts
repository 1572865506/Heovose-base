
/**
 * Analyzes the average brightness of an image from a URL.
 * Returns a value between 0 (black) and 255 (white).
 */
export async function analyzeImageBrightness(imageUrl: string): Promise<number> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(128); // Fallback to middle
        return;
      }

      // We only need a small sample to get a general idea
      canvas.width = 100;
      canvas.height = 100;
      ctx.drawImage(img, 0, 0, 100, 100);

      try {
        const imageData = ctx.getImageData(0, 0, 100, 100);
        const data = imageData.data;
        let brightnessSum = 0;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // HSP (Highly Sensitive Poo) color model for perceived brightness
          // brightness = sqrt(0.299*R^2 + 0.587*G^2 + 0.114*B^2)
          const brightness = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
          );
          brightnessSum += brightness;
        }

        resolve(brightnessSum / (100 * 100));
      } catch (e) {
        // CORS issues might happen with remote images
        console.warn("Could not analyze image brightness due to CORS or other error:", e);
        resolve(128);
      }
    };

    img.onerror = () => {
      resolve(128);
    };
  });
}
