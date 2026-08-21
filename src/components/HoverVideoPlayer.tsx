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
  onPlayStateChange?: (playing: boolean) => void;
}

export function HoverVideoPlayer({ 
  videoUrl, 
  mainImageUrl, 
  alt, 
  className,
  productId,
  onPlayStateChange
}: HoverVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasBeenHovered, setHasBeenHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const enterTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [videoProgress, setVideoProgress] = useState(0);
  const [hoveringProgress, setHoveringProgress] = useState(false);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isPlaying) {
      setHasBeenHovered(true);
    }
  }, [isPlaying]);

  // 监听视频进度更新
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video && video.duration) {
      setVideoProgress((video.currentTime / video.duration) * 100);
    }
  };

  // 强制确保 DOM 节点的 muted 属性（修复 React muted 属性在 Chrome 中不生效被 Autoplay 拦截的著名 Bug）
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.defaultMuted = true;
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      // 只有在非进度条 Hover 的情况下才去 play()
      if (!hoveringProgress) {
        video.muted = true;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setIsVideoLoaded(true);
              setIsBuffering(false);
              onPlayStateChange?.(true);
            })
            .catch((err) => {
              console.warn("[HoverVideoPlayer] Autoplay fallback retry:", err);
              video.muted = true;
              video.play().catch(() => {});
            });
        }
      } else {
        video.pause();
        onPlayStateChange?.(false);
      }
      // 发送自定义广播事件，通知其他卡片视频暂停
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('heovose-video-play', { detail: { productId } }));
      }
    } else {
      video.pause();
      onPlayStateChange?.(false);
    }
  }, [isPlaying, productId, hoveringProgress, onPlayStateChange]);

  // 监听全局其他卡片的播放事件，实现移动端（以及多设备/桌面多重操作）下的排他式唯一播放
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleGlobalPlay = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.productId !== productId) {
        setIsPlaying(false);
      }
    };

    window.addEventListener('heovose-video-play', handleGlobalPlay);
    return () => {
      window.removeEventListener('heovose-video-play', handleGlobalPlay);
    };
  }, [productId]);

  // HLS (m3u8 / ts 切片) 播放器流控制 (仅在用户真正 hover 过该卡片时才按需初始化)
  useEffect(() => {
    if (typeof window === 'undefined' || !videoUrl || !hasBeenHovered) return;
    const isHls = videoUrl.toLowerCase().endsWith('.m3u8');
    if (!isHls) return;

    const video = videoRef.current;
    if (!video) return;

    // Safari / iOS Native support
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = getAssetUrl(videoUrl);
      return;
    }

    // Chrome/Firefox HLS.js support
    let hlsInstance: any = null;
    let isDestroyed = false;

    const loadHls = () => {
      const HlsClass = (window as any).Hls;
      if (!HlsClass || isDestroyed) return;

      try {
        hlsInstance = new HlsClass({
          maxMaxBufferLength: 8, // 限制缓冲区大小以节省带宽
          enableWorker: true,
          lowLatencyMode: true,
        });
        hlsInstance.loadSource(getAssetUrl(videoUrl));
        hlsInstance.attachMedia(video);
        hlsInstance.on(HlsClass.Events.MANIFEST_PARSED, () => {
          setIsVideoLoaded(true);
          setIsBuffering(false);
          if (isPlaying && !hoveringProgress) {
            video.play().catch(() => {});
          }
        });
        hlsInstance.on(HlsClass.Events.ERROR, (event: any, data: any) => {
          if (data.fatal) {
            console.warn('[HLS Player Fatal Error]:', data);
            switch (data.type) {
              case HlsClass.ErrorTypes.NETWORK_ERROR:
                hlsInstance.startLoad();
                break;
              case HlsClass.ErrorTypes.MEDIA_ERROR:
                hlsInstance.recoverMediaError();
                break;
              default:
                break;
            }
          }
        });
      } catch (err) {
        console.error('[HLS Init Error]:', err);
      }
    };

    if ((window as any).Hls) {
      loadHls();
    } else {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.8/hls.min.js';
      script.async = true;
      script.onload = () => {
        loadHls();
      };
      document.head.appendChild(script);
    }

    return () => {
      isDestroyed = true;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [videoUrl, hasBeenHovered]);

  useEffect(() => {
    return () => {
      if (enterTimerRef.current) clearTimeout(enterTimerRef.current);
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }

    setHasBeenHovered(true);
    setIsPlaying(true);
  };

  const handleMouseLeave = () => {
    if (enterTimerRef.current) {
      clearTimeout(enterTimerRef.current);
      enterTimerRef.current = null;
    }

    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
    }
    leaveTimerRef.current = setTimeout(() => {
      setIsPlaying(false);
      setHoveringProgress(false);
      leaveTimerRef.current = null;
    }, 50);
  };

  // 进度条的进度调节
  const handleProgressAdjust = (clientX: number) => {
    const track = progressTrackRef.current;
    const video = videoRef.current;
    if (!track || !video || isNaN(video.duration) || video.duration === 0) return;

    const rect = track.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(0, Math.min(1, x / rect.width));

    video.currentTime = pct * video.duration;
    setVideoProgress(pct * 100);
  };

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!hoveringProgress) return;
    handleProgressAdjust(e.clientX);
  };

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn("relative w-full h-full overflow-hidden select-none cursor-pointer group/player", className)}
    >
      <Image
        src={getAssetUrl(mainImageUrl || '/image/product-placeholder.png')}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className={cn(
          "object-cover transition-all duration-[700ms] ease-[cubic-bezier(0.23,1,0.32,1)]",
          videoUrl && isPlaying ? "opacity-0 scale-105 pointer-events-none" : "opacity-100 scale-100"
        )}
      />

      {videoUrl && isPlaying && (!isVideoLoaded || isBuffering) && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[2px] transition-all duration-300 z-10 pointer-events-none">
          <div className="flex flex-col items-center gap-2 scale-90">
            {/* Elegant glassmorphism spinner */}
            <div className="h-6 w-6 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <span className="text-[8px] font-black text-white/80 uppercase tracking-widest bg-slate-900/60 px-2 py-0.5 rounded-full border border-white/5 backdrop-blur-md">
              Loading
            </span>
          </div>
        </div>
      )}

      {videoUrl && hasBeenHovered && (
        <video
          ref={(node) => {
            (videoRef as any).current = node;
            if (node) {
              node.muted = true;
              node.defaultMuted = true;
              if (isPlaying && !hoveringProgress) {
                node.play().catch(() => {});
              }
            }
          }}
          src={videoUrl.toLowerCase().endsWith('.m3u8') ? undefined : getAssetUrl(videoUrl)}
          muted
          loop
          playsInline
          preload="auto"
          onTimeUpdate={handleTimeUpdate}
          onLoadedData={() => {
            setIsVideoLoaded(true);
            setIsBuffering(false);
          }}
          onCanPlay={() => {
            setIsVideoLoaded(true);
            setIsBuffering(false);
            if (isPlaying && !hoveringProgress) {
              videoRef.current?.play().catch(() => {});
            }
          }}
          onWaiting={() => setIsBuffering(true)}
          onPlaying={() => {
            setIsVideoLoaded(true);
            setIsBuffering(false);
          }}
          onPlay={() => {
            setIsVideoLoaded(true);
            setIsBuffering(false);
          }}
          className={cn(
            "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
            isPlaying ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        />
      )}

      {/* 底部悬浮控制进度条 */}
      {videoUrl && isPlaying && (
        <div 
          ref={progressTrackRef}
          onMouseEnter={() => setHoveringProgress(true)}
          onMouseLeave={() => setHoveringProgress(false)}
          onMouseMove={handleProgressMouseMove}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleProgressAdjust(e.clientX);
          }}
          className="absolute bottom-0 left-0 right-0 h-8 flex items-end justify-center pb-2 px-3 z-30 transition-all duration-300 translate-y-2 opacity-0 group-hover/player:translate-y-0 group-hover/player:opacity-100 cursor-ew-resize group/progress"
        >
          {/* 进度条轨道 */}
          <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden transition-all duration-300 relative group-hover/progress:h-2">
            <div 
              className="absolute left-0 top-0 bottom-0 bg-primary transition-all duration-75"
              style={{ width: `${videoProgress}%` }}
            />
          </div>
        </div>
      )}

      {videoUrl && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const nextPlaying = !isPlaying;
            if (nextPlaying) {
              setHasBeenHovered(true);
            }
            setIsPlaying(nextPlaying);
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
