'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface ProductSpecPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pages: string[];
  productName: string;
  isDownloadingPdf: boolean;
  onDownloadPdf: () => void;
  onShare: () => void;
  getSystemText: (key: string) => string;
}

export function ProductSpecPreviewModal({
  isOpen,
  onClose,
  pages,
  productName,
  isDownloadingPdf,
  onDownloadPdf,
  onShare,
  getSystemText,
}: ProductSpecPreviewModalProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const previewScrollRef = useRef<HTMLDivElement>(null);

  // 当弹窗打开时重置滚动位置
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(0);
      if (previewScrollRef.current) {
        previewScrollRef.current.scrollLeft = 0;
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePreviewScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    if (el.clientWidth > 0) {
      const newIdx = Math.round(el.scrollLeft / el.clientWidth);
      if (newIdx !== currentIndex && newIdx >= 0 && newIdx < pages.length) {
        setCurrentIndex(newIdx);
      }
    }
  };

  const scrollToPreviewPage = (idx: number) => {
    if (previewScrollRef.current) {
      previewScrollRef.current.scrollTo({
        left: idx * previewScrollRef.current.clientWidth,
        behavior: 'smooth',
      });
      setCurrentIndex(idx);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      style={{ backgroundColor: 'rgba(16, 24, 32, 0.45)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* 模态窗卡片主体 */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl sm:w-[540px] md:w-[580px] h-[85vh] sm:h-[86vh] bg-card/95 text-foreground border border-border/60 rounded-[2rem] overflow-hidden shadow-2xl shadow-primary/5 flex flex-col relative z-10 pointer-events-auto backdrop-blur-2xl animate-in zoom-in-95 duration-200"
      >
        {/* 模态窗 Header */}
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between border-b border-border/40 bg-card/60 backdrop-blur-md shrink-0 relative z-10">
          <div className="flex items-center gap-2.5 min-w-0 pr-3">
            <h3 className="text-sm sm:text-base font-bold font-headline text-foreground truncate">
              {getSystemText('preview') || '预览'}
            </h3>
            <Badge
              variant="outline"
              className="bg-primary/5 border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono shrink-0"
            >
              {currentIndex + 1} / {pages.length} (A4)
            </Badge>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors shrink-0"
            aria-label="关闭预览"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 核心横向分页视口 */}
        <div className="flex-1 min-h-0 relative flex flex-col justify-center bg-muted/20 overflow-hidden">
          {/* 横向滚动容器 */}
          <div
            ref={previewScrollRef}
            onScroll={handlePreviewScroll}
            className="w-full h-full flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-smooth touch-pan-x"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {pages.map((imgSrc, idx) => (
              <div
                key={idx}
                className="w-full h-full shrink-0 snap-center p-3 sm:p-5 flex items-center justify-center relative select-none box-border"
              >
                <div className="max-h-full max-w-full relative flex items-center justify-center rounded-2xl overflow-hidden shadow-xl shadow-foreground/5 border border-border/60 bg-white">
                  <img
                    src={imgSrc}
                    alt={`Spec page ${idx + 1}`}
                    className="max-h-[calc(85vh-165px)] sm:max-h-[calc(86vh-175px)] w-auto max-w-full object-contain block select-none pointer-events-auto"
                  />
                  {/* 半透明 PREVIEW 英文水印 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-10 overflow-hidden">
                    <span className="text-4xl sm:text-6xl md:text-7xl font-black tracking-[0.25em] text-slate-900/[0.12] dark:text-white/[0.12] uppercase -rotate-[30deg] select-none pointer-events-none drop-shadow-sm font-sans">
                      PREVIEW
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 左右快速切换悬浮箭头 */}
          {pages.length > 1 && (
            <>
              {currentIndex > 0 && (
                <button
                  type="button"
                  onClick={() => scrollToPreviewPage(currentIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/90 hover:bg-card text-foreground hover:text-primary flex items-center justify-center border border-border/60 shadow-md backdrop-blur-md active:scale-95 transition-all z-20"
                  aria-label="上一页"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}
              {currentIndex < pages.length - 1 && (
                <button
                  type="button"
                  onClick={() => scrollToPreviewPage(currentIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-card/90 hover:bg-card text-foreground hover:text-primary flex items-center justify-center border border-border/60 shadow-md backdrop-blur-md active:scale-95 transition-all z-20"
                  aria-label="下一页"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}
            </>
          )}

          {/* 底部横向分页圆点指示器 */}
          {pages.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 py-1 px-3 rounded-full bg-card/90 backdrop-blur-md border border-border/50 shadow-sm z-20 pointer-events-none">
              {pages.map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    dotIdx === currentIndex
                      ? "w-4 bg-primary"
                      : "w-1.5 bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* 模态窗 Footer：操作工具栏 */}
        <div className="p-3.5 sm:p-4 bg-card/80 backdrop-blur-md border-t border-border/40 shrink-0 flex items-center gap-2.5">
          <Button
            type="button"
            onClick={onDownloadPdf}
            disabled={isDownloadingPdf}
            className="flex-1 h-11 rounded-2xl font-bold bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20 text-xs sm:text-sm transition-all"
          >
            {isDownloadingPdf ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                正在打包生成 PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                下载完整规格书 (PDF)
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={onShare}
            className="h-11 px-4 sm:px-5 rounded-2xl font-bold border-border/60 bg-muted/40 hover:bg-muted text-foreground text-xs sm:text-sm shrink-0 transition-all"
          >
            <Share2 className="mr-1.5 h-4 w-4" />
            转发分享
          </Button>
        </div>
      </div>
    </div>
  );
}
