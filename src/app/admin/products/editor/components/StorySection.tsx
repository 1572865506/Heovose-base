'use client';

import React, { memo } from 'react';
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import RichTextEditor from "@/components/RichTextEditor";

interface StorySectionProps {
  zhContent: string;
  targetContent: string;
  targetLang: string;
  onZhChange: (content: string) => void;
  onTargetChange: (content: string) => void;
  onTargetLangChange: (lang: string) => void;
  onAiTranslate: () => void;
  onImageClick: (target: string) => void;
  supportedLangs: { code: string; label: string }[];
  isAiProcessing: boolean;
  aiConfigEnabled?: boolean;
  zhEditorRef: React.RefObject<any>;
  targetEditorRef: React.RefObject<any>;
}

const StorySection = memo(({
  zhContent,
  targetContent,
  targetLang,
  onZhChange,
  onTargetChange,
  onTargetLangChange,
  onAiTranslate,
  onImageClick,
  supportedLangs,
  isAiProcessing,
  aiConfigEnabled,
  zhEditorRef,
  targetEditorRef
}: StorySectionProps) => {
  return (
    <section className="bg-card/60 backdrop-blur-md rounded-[2.5rem] border border-border/30 p-10 space-y-10 shadow-[0_8px_30px_rgb(0,0,0,0.08)] relative group overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/20 pb-6">
        <div className="space-y-1">
          <h3 className="text-xl font-headline font-bold text-foreground flex items-center gap-3">
            全息图文叙述
          </h3>
        </div>
        <div className="flex items-center gap-3 bg-muted/20 p-2 rounded-2xl border border-border/30">
          <Select value={targetLang} onValueChange={onTargetLangChange}>
            <SelectTrigger className="h-10 rounded-xl bg-card/60 border-border/30 text-[10px] font-bold uppercase tracking-widest w-[140px] shadow-sm text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[10002] rounded-2xl border-border/40 shadow-2xl">
              {supportedLangs.filter(l => l.code !== 'zh').map(l => (
                <SelectItem key={l.code} value={l.code} className="text-[10px] font-bold uppercase py-3">{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {aiConfigEnabled && (
            <ShinyButton
              onClick={onAiTranslate}
              disabled={isAiProcessing}
              className="h-10 px-6"
              shape="capsule"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-3.5 w-3.5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">深度智译同步</span>
              </div>
            </ShinyButton>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div className="space-y-4">
          <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 pl-1">源语言叙述 (ZH-CN)</Label>
          <div className="rounded-2xl border border-border/30 bg-card/60 overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <RichTextEditor
              ref={zhEditorRef}
              content={zhContent}
              onChange={onZhChange}
              placeholder="在此编排产品的视觉故事与核心卖点..."
              onImageClick={() => onImageClick('richtext-zh')}
              className="border-none shadow-none rounded-none"
            />
          </div>
        </div>
        <div className="space-y-4">
          <Label className="text-[10px] font-bold uppercase tracking-[0.25em] text-muted-foreground/60 pl-1">智译同步目标 (GLOBAL)</Label>
          <div className="rounded-2xl border border-dashed border-border/30 bg-muted/10 overflow-hidden focus-within:ring-4 focus-within:ring-primary/10 transition-all">
            <RichTextEditor
              ref={targetEditorRef}
              content={targetContent}
              onChange={onTargetChange}
              placeholder="Waiting for AI orchestration or manual input..."
              onImageClick={() => onImageClick('richtext-target')}
              className="border-none shadow-none rounded-none bg-transparent"
            />
          </div>
        </div>
      </div>
    </section>
  );
});

StorySection.displayName = 'StorySection';

export default StorySection;
