"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { Play } from 'lucide-react';

interface HoverVideoPlayerProps {
  videoUrl?: string;
  mainImageUrl: string;
  alt: string;
  className?: string;
}

export function HoverVideoPlayer({ videoUrl, mainImageUrl, alt, className }: HoverVideoPlayerProps) {
  console.log("=== [HoverVideoPlayer Component Props] ===", { alt, videoUrl });
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isHovered) {
      setIsVideoLoaded(false);
    }
  }, [isHovered]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video || !container || isNaN(video.duration) || video.duration === 0) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));

    video.currentTime = pct * video.duration;
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={cn("relative w-full h-full overflow-hidden select-none cursor-pointer", className)}
    >
      <Image
        src={getAssetUrl(mainImageUrl || '/image/product-placeholder.png')}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          "object-cover transition-all duration-[1000ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
          isHovered && isVideoLoaded ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
      />

      {videoUrl && isHovered && (
        <video
          ref={videoRef}
          src={getAssetUrl(videoUrl)}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => {
            setIsVideoLoaded(true);
            videoRef.current?.play().catch(() => {});
          }}
          onPlay={() => setIsVideoLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            isVideoLoaded ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {videoUrl && !isHovered && (
        <div className="absolute top-4 left-4 h-6 w-6 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-lg pointer-events-none">
          <Play className="h-2.5 w-2.5 fill-white ml-0.5 animate-pulse" />
        </div>
      )}
    </div>
  );
}
