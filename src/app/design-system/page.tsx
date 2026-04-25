
"use client";

import React, { useState } from 'react';
import { 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Loader2 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFrontendManifest, getAdminManifest } from './actions';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';

// Import extracted components
import { AiGradientDef } from '@/components/design-system/AiGradientDef';
import { TimelineNav } from '@/components/design-system/TimelineNav';
import { ColorSpecification } from '@/components/design-system/ColorSpecification';
import { TypographySpecification } from '@/components/design-system/TypographySpecification';
import { GeometrySpecification } from '@/components/design-system/GeometrySpecification';
import { ButtonSpecification } from '@/components/design-system/ButtonSpecification';
import { ControlSpecification } from '@/components/design-system/ControlSpecification';
import { InputSpecification } from '@/components/design-system/InputSpecification';
import { TableSpecification } from '@/components/design-system/TableSpecification';
import { TagSpecification } from '@/components/design-system/TagSpecification';
import { TreeSpecification } from '@/components/design-system/TreeSpecification';
import { PaginationSpecification } from '@/components/design-system/PaginationSpecification';
import { TabSpecification } from '@/components/design-system/TabSpecification';
import { CarouselSpecification } from '@/components/design-system/CarouselSpecification';
import { GlassSpecification } from '@/components/design-system/GlassSpecification';
import { MotionSpecification } from '@/components/design-system/MotionSpecification';
import { AiInteractionSpecification } from '@/components/design-system/AiInteractionSpecification';
import { FeedbackSpecification } from '@/components/design-system/FeedbackSpecification';
import { ExhibitionSpecification } from '@/components/design-system/ExhibitionSpecification';
import { ReadabilitySpecification } from '@/components/design-system/ReadabilitySpecification';
import { AdminSystemSpecification } from '@/components/design-system/AdminSystemSpecification';

export default function DesignSystemPage() {
  const [activeSystem, setActiveSystem] = useState<'frontend' | 'backend'>('frontend');
  const [manifestContent, setManifestContent] = useState('');
  const [isLoadingManifest, setIsLoadingManifest] = useState(false);

  const loadManifest = async () => {
    setIsLoadingManifest(true);
    const res = activeSystem === 'frontend' ? await getFrontendManifest() : await getAdminManifest();
    if (res.success) {
      setManifestContent(res.content);
    }
    setIsLoadingManifest(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-40 font-body">
      <AiGradientDef />
      
      {/* 顶部系统切换器 */}
      <header className="bg-white border-b border-border/40 sticky top-0 z-[110] px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-6">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Cpu className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-primary uppercase tracking-widest leading-none">Heovose Design Lab</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase opacity-60 mt-1">视觉实验室 • 核心版本 v1.9.8</p>
          </div>
        </div>

        <div className="flex bg-muted/40 p-1 rounded-full border border-border/20">
          <button 
            onClick={() => setActiveSystem('frontend')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSystem === 'frontend' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-primary"
            )}
          >
            前台系统 (用户端)
          </button>
          <button 
            onClick={() => setActiveSystem('backend')}
            className={cn(
              "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
              activeSystem === 'backend' ? "bg-white text-primary shadow-md" : "text-muted-foreground hover:text-primary"
            )}
          >
            管理后台 (管理员)
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-8 pt-12">
        {activeSystem === 'frontend' ? (
          <div className="space-y-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Timeline Navigation */}
            <TimelineNav activeSystem={activeSystem} />
            
            <ColorSpecification />
            <TypographySpecification />
            <GeometrySpecification />
            <ButtonSpecification />
            <ControlSpecification />
            <InputSpecification />
            <TableSpecification />
            <TagSpecification />
            <TreeSpecification />
            <PaginationSpecification />
            <TabSpecification />
            <CarouselSpecification />
            <GlassSpecification />
            <MotionSpecification />
            <AiInteractionSpecification />
            <FeedbackSpecification />
            <ExhibitionSpecification />
            <ReadabilitySpecification />
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Timeline Navigation */}
            <TimelineNav activeSystem={activeSystem} />
            
            <AdminSystemSpecification />
          </div>
        )}
      </div>

      {/* 固定底栏 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-border/40 px-12 py-3 flex items-center justify-between z-[110]">
        <div className="flex items-center gap-8">
          <Dialog modal={false}>
            <DialogTrigger asChild>
               <button onClick={loadManifest} className="inline-flex items-center justify-center rounded-full h-10 px-6 gap-2 font-bold uppercase tracking-widest text-[10px] shadow-lg bg-primary text-white hover:bg-primary/90 transition-colors">
                 <FileText className="h-4 w-4" /> 查阅{activeSystem === 'frontend' ? '前台' : '后台'}视觉白皮书
               </button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl h-[85vh] p-0 rounded-3xl overflow-hidden flex flex-col shadow-2xl border-none">
               <div className="bg-primary p-6 text-white shrink-0">
                  <DialogHeader>
                    <div className="flex items-center gap-3">
                       <ShieldCheck className="h-6 w-6 text-accent" />
                       <div>
                         <DialogTitle className="text-xl font-bold uppercase tracking-widest">Heovose Elevate {activeSystem === 'frontend' ? '前台' : '管理后台'}规范白皮书</DialogTitle>
                         <DialogDescription className="text-white/60 text-xs uppercase mt-1">本项目{activeSystem === 'frontend' ? '前台' : '管理后台'}视觉与交互治理的最高准则。</DialogDescription>
                       </div>
                    </div>
                  </DialogHeader>
               </div>
               <div className="flex-1 overflow-y-auto p-12 bg-white scrollbar-minimal">
                  {isLoadingManifest ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-20">
                      <Loader2 className="h-10 w-10 animate-spin" />
                      <p className="text-[10px] font-bold uppercase tracking-widest">正在调取云端规范...</p>
                    </div>
                  ) : (
                    <div className="prose prose-slate prose-sm max-w-none prose-headings:font-headline prose-headings:text-primary">
                       <pre className="whitespace-pre-wrap font-body text-sm leading-relaxed text-slate-700 bg-muted/5 p-4 rounded-xl border border-border/40">
                         {manifestContent}
                       </pre>
                    </div>
                  )}
               </div>
               <div className="bg-muted/10 p-4 border-t flex justify-end shrink-0">
                 <DialogClose asChild>
                   <Button variant="ghost" className="rounded-xl px-8 font-bold uppercase text-[10px]">返回设计 system</Button>
                 </DialogClose>
               </div>
            </DialogContent>
          </Dialog>

          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Lab Environment Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
