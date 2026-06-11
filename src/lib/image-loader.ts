'use client';

interface ImageLoaderProps {
  src: string;
  width: number;
  quality?: number;
}

export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  // If the src starts with /storage/, and we are on the client side in a non-localhost environment,
  // we can request it via the internal docker service endpoint to bypass VPS loopback routing limitations.
  if (src.startsWith('/storage/')) {
    let isProd = false;
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname !== 'localhost' && hostname !== '127.0.0.1' && !hostname.startsWith('192.168.')) {
        isProd = true;
      }
    } else {
      // Server-side rendering (SSR) fallback
      if (process.env.NODE_ENV === 'production') {
        isProd = true;
      }
    }

    if (isProd) {
      // Map the public relative path `/storage/bucket/...` to the docker internal MinIO endpoint
      // e.g. /storage/heovose-assets/uploads/file.jpg -> http://heovose-storage:9000/heovose-assets/uploads/file.jpg
      const cleanPath = src.substring('/storage'.length);
      const internalStorageUrl = `http://heovose-storage:9000${cleanPath}`;
      return `/_next/image?url=${encodeURIComponent(internalStorageUrl)}&w=${width}&q=${quality || 75}`;
    }
  }

  // Default Next.js optimizer URL generator
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
