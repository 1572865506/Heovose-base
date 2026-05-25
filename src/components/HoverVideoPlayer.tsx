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
  const isPlaying = playingProductId === productId;
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [hasBeenHovered, setHasBeenHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      setHasBeenHovered(true);
    }
  }, [isPlaying]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (isTouchDevice) return;
    
    // 清除离开延时器，保持继续播放
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }

    // 延迟 150ms 触发播放，防止快速滑过误触
    if (!enterTimerRef.current) {
      enterTimerRef.current = setTimeout(() => {
        setPlayingProductId(productId);
        enterTimerRef.current = null;
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;

    // 清除进入延时器，取消未发生的播放
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }

    // 延迟 200ms 触发暂停，防止边缘抖动导致频繁停播
    if (!leaveTimerRef.current) {
      leaveTimerRef.current = setTimeout(() => {
        if (playingProductId === productId) {
          setPlayingProductId(null);
        }
        leaveTimerRef.current = null;
      }, 200);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    
    // 如果视频正在播放，完全不做进度干预，让其平滑播放
    if (isPlaying) return;

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

      {videoUrl && hasBeenHovered && (
        <video
          ref={videoRef}
          src={getAssetUrl(videoUrl)}
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => setIsVideoLoaded(true)}
          onCanPlay={() => {
            setIsVideoLoaded(true);
            if (isPlaying) {
              videoRef.current?.play().catch(() => {});
            }
          }}
          onPlay={() => setIsVideoLoaded(true)}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-500",
            isPlaying && isVideoLoaded ? "opacity-100" : "opacity-0 pointer-events-none"
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
