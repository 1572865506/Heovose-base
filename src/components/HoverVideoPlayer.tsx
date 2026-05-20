"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { getAssetUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { Play, Pause } from 'lucide-react';

interface HoverVideoPlayerProps {
  videoUrl?: string;
  mainImageUrl: string;
  alt: string;
  className?: string;
  productId: string;
  playingProductId: string | null;
  setPlayingProductId: (id: string | null) => void;
}

export function HoverVideoPlayer({ 
  videoUrl, 
  mainImageUrl, 
  alt, 
  className,
  productId,
  playingProductId,
  setPlayingProductId
}: HoverVideoPlayerProps) {
  console.log("=== [HoverVideoPlayer Component Props] ===", { alt, videoUrl });
  const isPlaying = playingProductId === productId;
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (!isPlaying) {
      setIsVideoLoaded(false);
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    setPlayingProductId(productId);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    if (playingProductId === productId) {
      setPlayingProductId(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
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
          isPlaying && isVideoLoaded ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}
      />

      {videoUrl && isPlaying && (
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

      {videoUrl && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPlayingProductId(isPlaying ? null : productId);
          }}
          className={cn(
            "absolute top-3 right-3 h-8 w-8 rounded-full backdrop-blur-md flex items-center justify-center text-white border shadow-lg transition-all duration-300 active:scale-90 z-20",
            isPlaying ? "bg-primary/90 border-primary/30" : "bg-black/60 border-white/20 hover:bg-black/80"
          )}
        >
          {isPlaying ? (
            <Pause className="h-3 w-3 fill-white" />
          ) : (
            <Play className="h-3 w-3 fill-white ml-0.5 animate-pulse" />
          )}
        </button>
      )}
    </div>
  );
}
