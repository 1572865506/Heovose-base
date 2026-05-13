'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ArrowLeft, MousePointer2, Maximize2, Layers, Monitor, Laptop, Smartphone, HelpCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export default function HeatmapPage() {
  const { data: events, isLoading } = useLocalCollection<any>('analytics/events');
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [previewWidth, setPreviewWidth] = useState<number>(1280);
  const [contentHeight, setContentHeight] = useState<number>(2000);
  const [isIframeLoading, setIsIframeLoading] = useState(false);
  const scalerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const pathsWithClicks = useMemo(() => {
    if (!events) return [];
    const paths = new Set<string>();
    events.forEach((e: any) => {
      const eType = String(e.type).toUpperCase();
      if (eType === 'CLICK' && e.path) {
        paths.add(String(e.path).trim());
      }
    });
    return Array.from(paths).sort();
  }, [events]);

  const widthStats = useMemo(() => {
    if (!events || !selectedPath) return { mobile: 0, tablet: 0, desktop: 0 };
    const pathClicks = events.filter((e: any) => {
      const eType = String(e.type).toUpperCase();
      return eType === 'CLICK' && String(e.path || '').trim() === selectedPath.trim();
    });
    return {
      mobile: pathClicks.filter((e: any) => {
        const w = e.extraData?.layout?.innerWidth || e.extraData?.screenWidth || e.screenWidth || 0;
        return w > 0 && w < 640;
      }).length,
      tablet: pathClicks.filter((e: any) => {
        const w = e.extraData?.layout?.innerWidth || e.extraData?.screenWidth || e.screenWidth || 0;
        return w >= 640 && w < 1024;
      }).length,
      desktop: pathClicks.filter((e: any) => {
        const w = e.extraData?.layout?.innerWidth || e.extraData?.screenWidth || e.screenWidth || 0;
        return w >= 1024 || w === 0;
      }).length,
    };
  }, [events, selectedPath]);

  const filteredDots = useMemo(() => {
    if (!events || !selectedPath) return [];
    const normalizedSelected = selectedPath.trim();
    
    const filtered = events.filter((e: any) => {
      const eType = String(e.type).toUpperCase();
      if (eType !== 'CLICK') return false;
      
      const ePath = String(e.path || '').trim();
      if (ePath !== normalizedSelected) return false;
      
      const w = e.extraData?.layout?.innerWidth || e.extraData?.screenWidth || e.screenWidth || 0;
      if (previewWidth === 375) return w > 0 && w < 640;
      if (previewWidth === 1024) return w >= 640 && w < 1024;
      return w >= 1024 || w === 0;
    });

    console.log(`[Heatmap] Filtered ${filtered.length} dots for ${selectedPath} at width ${previewWidth}`);
    return filtered;
  }, [events, selectedPath, previewWidth]);

  const measureHeight = () => {
    if (isIframeLoading) return;

    const iframe = iframeRef.current;
    if (iframe?.contentWindow) {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        
        // 1. Inject a style to stabilize vh-based elements
        if (!doc.getElementById('heatmap-stabilizer')) {
          const style = doc.createElement('style');
          style.id = 'heatmap-stabilizer';
          // Force screen-sized elements to a fixed logical height to avoid recursive expansion
          style.textContent = `
            section.min-h-screen, .h-screen, [class*="h-screen"], [class*="min-h-screen"] {
              min-height: 800px !important;
              height: 800px !important;
            }
            .h-\\[500vh\\] { height: 500px !important; }
          `;
          doc.head.appendChild(style);
        }

        // 2. Temporarily shrink to measure natural scroll height
        iframe.style.height = '100px'; 
        
        const height = Math.max(
          doc.body.scrollHeight, 
          doc.documentElement.scrollHeight,
          doc.body.offsetHeight,
          doc.documentElement.offsetHeight
        );
        
        iframe.style.height = '100%';

        if (height > 100) {
          setContentHeight(height);
        }
      } catch (err) {
        // Ignored
      }
    }
  };

  const updateScale = () => {
    if (scalerRef.current && scalerRef.current.parentElement) {
      const container = scalerRef.current.parentElement;
      const scale = container.offsetWidth / previewWidth;
      scalerRef.current.style.transform = `scale(${scale})`;
      measureHeight();
    }
  };

  const handleIframeLoad = () => {
    console.log('[Heatmap] Iframe fully loaded, starting measurements');
    setIsIframeLoading(false);
    updateScale();
  };

  useEffect(() => {
    // Reset and Lock
    setIsIframeLoading(true);
    setContentHeight(500); 
    
    updateScale();
    const timers = [1000, 2500, 5000, 8000].map(t => setTimeout(updateScale, t));
    window.addEventListener('resize', updateScale);
    return () => {
      window.removeEventListener('resize', updateScale);
      timers.forEach(clearTimeout);
    };
  }, [selectedPath, previewWidth]);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary/20" />
        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest animate-pulse">加载热力数据 / RELOADING METRICS</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <Link href="/admin/analytics">
              <Button variant="outline" size="icon" className="h-8 w-8 rounded-full border-slate-200">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h2 className="text-2xl font-headline font-bold text-slate-900">交互热力图</h2>
          </div>
          <p className="text-sm text-slate-500 ml-11">可视化分析用户在各个页面的点击分布热度。</p>
        </div>
      </div>

      <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/30">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg font-headline font-bold">分析对象</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Path and viewport selection</CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Select value={selectedPath || ''} onValueChange={setSelectedPath}>
                <SelectTrigger className="w-full md:w-[300px] h-12 rounded-xl bg-white border-slate-200">
                  <SelectValue placeholder="选择要分析的页面路径..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {pathsWithClicks.map(path => (
                    <SelectItem key={path} value={path} className="font-mono text-xs">{path}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-10 px-4 rounded-lg gap-2 text-[10px] font-bold uppercase tracking-widest transition-all", previewWidth === 1280 ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                  onClick={() => setPreviewWidth(1280)}
                >
                  <Monitor className="h-3.5 w-3.5" /> Desktop ({widthStats.desktop})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-10 px-4 rounded-lg gap-2 text-[10px] font-bold uppercase tracking-widest transition-all", previewWidth === 1024 ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                  onClick={() => setPreviewWidth(1024)}
                >
                  <Laptop className="h-3.5 w-3.5" /> Tablet ({widthStats.tablet})
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn("h-10 px-4 rounded-lg gap-2 text-[10px] font-bold uppercase tracking-widest transition-all", previewWidth === 375 ? "bg-white text-primary shadow-sm" : "text-slate-400")}
                  onClick={() => setPreviewWidth(375)}
                >
                  <Smartphone className="h-3.5 w-3.5" /> Mobile ({widthStats.mobile})
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          {selectedPath ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                   <div className="px-4 py-1.5 bg-primary/5 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/10">
                     {filteredDots.length} CLICKS ON {previewWidth === 1280 ? 'DESKTOP' : previewWidth === 1024 ? 'TABLET' : 'MOBILE'}
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-slate-300 cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-[10px] font-medium leading-relaxed">
                      由于响应式布局会导致元素位置发生位移，我们按访问设备宽度对数据进行了分类展示。请选择对应的预览模式以获得最精确的对齐效果。
                    </TooltipContent>
                  </Tooltip>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest gap-2" onClick={() => updateScale()}>
                    刷新高度 <RefreshCw className={cn("h-3 w-3", isIframeLoading && "animate-spin")} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[10px] font-bold uppercase tracking-widest gap-2" onClick={() => window.open(selectedPath, '_blank')}>
                    访问原始页面 <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Heatmap Container */}
              <div className="relative w-full h-[650px] bg-slate-900/5 rounded-[2.5rem] border-8 border-slate-100/50 overflow-hidden shadow-2xl group flex justify-center">
                {/* Scaled Content Wrapper */}
                <div className="absolute inset-0 overflow-auto scrollbar-minimal">
                   <div 
                     key={`scaler-${selectedPath}-${previewWidth}`}
                     className={cn("relative shadow-[0_0_100px_rgba(0,0,0,0.1)]", !isIframeLoading && "transition-all duration-500")} 
                     style={{ 
                       width: `${previewWidth}px`, 
                       height: isIframeLoading ? '500px' : `${contentHeight}px`, 
                       transformOrigin: '0 0',
                       margin: previewWidth < 1280 ? '0 auto' : '0'
                     }} 
                     ref={scalerRef}
                   >
                     {/* Background Iframe */}
                     <iframe 
                       key={`iframe-${selectedPath}-${previewWidth}`}
                       src={selectedPath} 
                       scrolling="no"
                       ref={iframeRef}
                       className="border-none absolute inset-0 w-full pointer-events-none opacity-40 grayscale-[0.5]"
                       onLoad={handleIframeLoad}
                     />

                     {/* The actual dots */}
                     <div className="absolute inset-0 z-10 pointer-events-none">
                       {filteredDots.map((dot, i) => (
                         <div 
                           key={i}
                           className="absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/20 blur-xl animate-pulse"
                           style={{ 
                             left: `${dot.x}%`, 
                             top: `${dot.y}%`,
                             transition: 'all 0.8s ease-out',
                             transitionDelay: `${i * 5}ms`
                           }}
                         />
                       ))}
                       {filteredDots.map((dot, i) => (
                         <div 
                           key={`core-${i}`}
                           className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-white/20"
                           style={{ 
                             left: `${dot.x}%`, 
                             top: `${dot.y}%` 
                           }}
                         />
                       ))}
                     </div>
                   </div>
                </div>

                {/* Loading State Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-300 font-bold uppercase tracking-[0.2em] text-xs pointer-events-none z-0">
                  <div className="text-center space-y-4 opacity-5">
                    <MousePointer2 className="h-16 w-16 mx-auto animate-bounce" />
                    <p>HOLOGRAPHIC POSITION SYNCING</p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-start gap-6">
                <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center text-primary shadow-md shrink-0">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-900 uppercase tracking-widest">精确对齐指南 (Alignment Guide)</p>
                  <p className="text-[11px] leading-relaxed text-slate-500 font-medium max-w-3xl">
                    我们采用了**自适应重构技术**。系统检测到您的部分点击是在不同尺寸的屏幕上产生的。
                    由于响应式布局会自动调整元素位置（如从多列变单列），请通过上方的 **Desktop / Tablet / Mobile** 切换到对应视图，
                    系统会自动缩放画布以还原真实的交互现场。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[40vh] flex flex-col items-center justify-center text-slate-300 gap-6">
               <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100">
                 <MousePointer2 className="h-16 w-16 opacity-10 mx-auto" />
               </div>
               <p className="text-sm font-bold uppercase tracking-[0.2em] opacity-30 text-center">请先从上方选择一个页面路径以开启全息热力分析</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
    </TooltipProvider>
  );
}
