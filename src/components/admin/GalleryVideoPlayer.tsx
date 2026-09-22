'use client';

import React, { useEffect, useRef, useState } from 'react';
import { getAssetUrl } from '@/lib/image-utils';
import { cn } from '@/lib/utils';
import { Loader2, Play, VideoOff } from 'lucide-react';

interface GalleryVideoPlayerProps {
  url: string;
  thumbnailUrl?: string | null;
  mode: 'thumbnail' | 'preview';
  title?: string;
  className?: string;
  autoPlay?: boolean;
  onLoadedMetadata?: (dimensions: { width: number; height: number }) => void;
}

/**
 * 全功能自适应视频播放与缩略图组件 (完美兼容 MP4、WebM 及 HLS .m3u8 切片流)
 */
export function GalleryVideoPlayer({
  url,
  thumbnailUrl,
  mode,
  title,
  className,
  autoPlay = true,
  onLoadedMetadata,
}: GalleryVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [useFallbackPoster, setUseFallbackPoster] = useState(true);

  const fullUrl = getAssetUrl(url);
  const isHls = url.toLowerCase().includes('.m3u8');
  
  // 针对切片 HLS 视频，推导可能存在的同目录 poster.jpg 封面
  const inferredPosterUrl = isHls ? getAssetUrl(url.replace(/playlist\.m3u8.*$/i, 'poster.jpg')) : undefined;
  const activePoster = thumbnailUrl ? getAssetUrl(thumbnailUrl) : inferredPosterUrl;

  useEffect(() => {
    if (!fullUrl) return;

    let hlsInstance: any = null;
    let isMounted = true;
    const video = videoRef.current;

    if (!video) return;

    setHasError(false);
    setIsLoading(true);

    // 1. 如果是非 HLS 视频（普通 MP4/WebM），直接由原生 video 驱动
    if (!isHls) {
      video.src = mode === 'thumbnail' ? `${fullUrl}#t=0.001` : fullUrl;
      if (mode === 'thumbnail') {
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
      } else {
        video.preload = 'auto';
        video.playsInline = true;
        if (autoPlay) {
          video.play().catch(() => {
            // 浏览器拦截非静音自动播放时的容错
          });
        }
      }
      return;
    }

    // 2. 如果是 HLS (m3u8) 视频
    // a) Safari / iOS 原生支持 HLS
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = fullUrl;
      if (mode === 'thumbnail') {
        video.muted = true;
        video.playsInline = true;
        video.preload = 'metadata';
      } else {
        video.preload = 'auto';
        video.playsInline = true;
        if (autoPlay) {
          video.play().catch(() => {});
        }
      }
      return;
    }

    // b) Chrome / Edge / Firefox 依靠 Hls.js 解析流
    const initHls = () => {
      const HlsClass = (window as any).Hls;
      if (!HlsClass || !isMounted) return;

      if (HlsClass.isSupported()) {
        try {
          hlsInstance = new HlsClass({
            maxMaxBufferLength: mode === 'thumbnail' ? 2 : 15,
            enableWorker: true,
            lowLatencyMode: true,
          });

          hlsInstance.loadSource(fullUrl);
          hlsInstance.attachMedia(video);

          hlsInstance.on(HlsClass.Events.MANIFEST_PARSED, () => {
            if (!isMounted) return;
            setIsLoading(false);
            if (mode === 'preview' && autoPlay) {
              video.play().catch(() => {});
            }
          });

          hlsInstance.on(HlsClass.Events.ERROR, (_: any, data: any) => {
            if (data.fatal) {
              console.warn('[Gallery HLS Error]:', data);
              switch (data.type) {
                case HlsClass.ErrorTypes.NETWORK_ERROR:
                  hlsInstance.startLoad();
                  break;
                case HlsClass.ErrorTypes.MEDIA_ERROR:
                  hlsInstance.recoverMediaError();
                  break;
                default:
                  hlsInstance.destroy();
                  setHasError(true);
                  setIsLoading(false);
                  break;
              }
            }
          });
        } catch (e) {
          console.error('[Gallery HLS Init Exception]:', e);
          setHasError(true);
          setIsLoading(false);
        }
      } else {
        setHasError(true);
        setIsLoading(false);
      }
    };

    if ((window as any).Hls) {
      initHls();
    } else {
      // 动态按需加载 CDN 上的 Hls.js
      const existingScript = document.getElementById('hls-js-script');
      if (existingScript) {
        existingScript.addEventListener('load', initHls);
      } else {
        const script = document.createElement('script');
        script.id = 'hls-js-script';
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.8/hls.min.js';
        script.async = true;
        script.onload = () => initHls();
        script.onerror = () => {
          setHasError(true);
          setIsLoading(false);
        };
        document.head.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [fullUrl, isHls, mode, autoPlay]);

  // ================= 模式 1：缩略图模式 (Thumbnail) =================
  if (mode === 'thumbnail') {
    return (
      <div className={cn("w-full h-full relative flex items-center justify-center bg-black/40 overflow-hidden", className)}>
        {/* 若有明确封面图或推导的 poster.jpg，优先尝试图片渲染以达到极致性能与即开即显 */}
        {activePoster && useFallbackPoster ? (
          <img
            src={activePoster}
            alt={title || 'Video poster'}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            onError={() => setUseFallbackPoster(false)}
            onLoad={() => setIsLoading(false)}
          />
        ) : (
          /* 否则由轻量 video / Hls 解码渲染首帧 */
          <video
            ref={videoRef}
            muted
            playsInline
            preload="metadata"
            className="w-full h-full object-contain opacity-85 transition-transform duration-1000 group-hover:scale-110"
            onLoadedMetadata={(e) => {
              setIsLoading(false);
              const vid = e.currentTarget;
              if (onLoadedMetadata) {
                onLoadedMetadata({ width: vid.videoWidth, height: vid.videoHeight });
              }
            }}
            onError={() => {
              setHasError(true);
              setIsLoading(false);
            }}
          />
        )}

        {hasError && !useFallbackPoster && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-muted-foreground gap-1.5 p-3 text-center">
            <VideoOff className="h-6 w-6 text-muted-foreground/60" />
            <span className="text-[10px] font-mono tracking-tight text-white/60">无法解析视频封面</span>
          </div>
        )}
      </div>
    );
  }

  // ================= 模式 2：全屏大弹窗预览播放模式 (Preview) =================
  return (
    <div className={cn("relative flex items-center justify-center max-w-full max-h-full", className)}>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 pointer-events-none rounded-2xl">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      )}

      {hasError ? (
        <div className="p-12 text-center bg-black/80 rounded-2xl border border-white/10 text-muted-foreground space-y-3">
          <VideoOff className="h-12 w-12 mx-auto text-rose-500/80" />
          <div className="text-sm font-bold text-foreground">视频加载失败</div>
          <p className="text-xs text-muted-foreground/75 max-w-xs">
            该切片流或格式可能损坏或不可达：<br />
            <span className="font-mono text-[10px] break-all">{url}</span>
          </p>
        </div>
      ) : (
        <video
          ref={videoRef}
          controls
          playsInline
          className="shadow-[0_50px_100px_rgba(0,0,0,0.8)] border border-white/10 rounded-2xl max-h-[85vh] max-w-[90vw] object-contain"
          onLoadedMetadata={(e) => {
            setIsLoading(false);
            const vid = e.currentTarget;
            if (onLoadedMetadata) {
              onLoadedMetadata({ width: vid.videoWidth, height: vid.videoHeight });
            }
          }}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}
