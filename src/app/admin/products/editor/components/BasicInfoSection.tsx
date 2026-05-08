'use client';

import React, { memo } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Languages, RotateCcw, Upload, Info } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import Image from "next/image";
import { getAssetUrl } from '@/lib/image-utils';

interface BasicInfoSectionProps {
  formData: {
    nameZh: string;
    nameEn: string;
    descZh: string;
    descEn: string;
    mainImageUrl: string;
  };
  updateField: (field: string, value: any) => void;
  aiConfigEnabled?: boolean;
  isAiProcessing: boolean;
  onAiTranslate: () => void;
  onOpenPicker: (target: string) => void;
}

const BasicInfoSection = memo(({
  formData,
  updateField,
  aiConfigEnabled,
  isAiProcessing,
  onAiTranslate,
  onOpenPicker
}: BasicInfoSectionProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
      <div className="lg:col-span-7 space-y-10">
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-10 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden">
          <div className="border-b border-slate-100 pb-6 relative z-10">
            <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
              核心名称与叙述
            </h3>
          </div>

          <div className="space-y-10 relative z-10">
            <div className="space-y-6">
              <div className="flex items-center justify-between pl-1">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400">产品型号/名称 (中)</Label>
                {aiConfigEnabled && (
                  <ShinyButton
                    onClick={onAiTranslate}
                    disabled={isAiProcessing}
                    className="h-7 px-3"
                    shape="capsule"
                  >
                    <div className="flex items-center gap-2">
                      {isAiProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      <span className="text-[9px] font-bold uppercase tracking-widest">极光智译</span>
                    </div>
                  </ShinyButton>
                )}
              </div>
              <Input
                value={formData.nameZh}
                onChange={e => updateField('nameZh', e.target.value)}
                className="h-12 rounded-xl bg-slate-500/5 border-slate-200 text-sm font-bold tracking-tight px-5 focus-visible:ring-4 focus-visible:ring-primary/5 placeholder:font-normal placeholder:text-slate-300"
                placeholder="例如: Heovose Elevate 全能商用一体机"
              />
              <div className="space-y-2">
                <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">Product Model / Name (English)</Label>
                <Input
                  value={formData.nameEn}
                  onChange={e => updateField('nameEn', e.target.value)}
                  className="h-12 rounded-xl bg-slate-500/5 border-dashed border-slate-200 text-sm font-bold tracking-tight px-5 focus-visible:ring-4 focus-visible:ring-primary/5 placeholder:font-normal placeholder:text-slate-300"
                  placeholder="e.g. Heovose Elevate Pro AIO Series"
                />
              </div>
            </div>

            <div className="space-y-5">
              <Label className="text-[11px] font-bold uppercase tracking-widest text-slate-400 pl-1">产品核心卖点描述 (中/英)</Label>
              <div className="space-y-4">
                <div className="relative group/area">
                  <Textarea
                    value={formData.descZh}
                    onChange={e => updateField('descZh', e.target.value)}
                    className="min-h-[80px] rounded-xl bg-slate-500/5 border-slate-200 text-xs font-medium leading-relaxed px-5 py-3 focus-visible:ring-4 focus-visible:ring-primary/5 placeholder:text-slate-300"
                    placeholder="输入产品的核心优势或市场定位叙述..."
                  />
                  <div className="absolute top-3 right-5 pointer-events-none opacity-5">
                    <Languages className="h-6 w-6" />
                  </div>
                </div>
                <div className="relative group/area">
                  <Textarea
                    value={formData.descEn}
                    onChange={e => updateField('descEn', e.target.value)}
                    className="min-h-[80px] rounded-xl bg-slate-500/5 border-dashed border-slate-200 text-xs font-medium leading-relaxed px-5 py-3 focus-visible:ring-4 focus-visible:ring-primary/5 placeholder:text-slate-300"
                    placeholder="Product USP Narrative in English..."
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-5 space-y-10">
        <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 p-10 space-y-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative group overflow-hidden h-full">
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
              产品视觉头图
            </h3>
          </div>

          <div className="space-y-8">
            <div
              className="relative aspect-[11/9] rounded-[2rem] bg-slate-500/5 border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center group cursor-pointer hover:bg-primary/[0.02] hover:border-primary/40 transition-all duration-700"
              onClick={() => onOpenPicker('main')}
            >
              {formData.mainImageUrl ? (
                <>
                  <Image src={getAssetUrl(formData.mainImageUrl)} alt="Main" fill className="object-cover transition-transform duration-1000 group-hover:scale-110" unoptimized />
                  <div className="absolute inset-0 rounded-[2rem] bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center gap-4 backdrop-blur-md">
                    <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md border border-white/20 scale-50 group-hover:scale-100 transition-transform duration-700">
                      <RotateCcw className="h-6 w-6" />
                    </div>
                    <p className="text-[10px] font-bold text-white uppercase tracking-[0.3em]">更换主视觉资产</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-6 text-slate-400 group-hover:text-primary transition-all duration-500">
                  <div className="h-20 w-20 rounded-[1.75rem] bg-white shadow-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-slate-900">点击进入资产库选择</p>
                    <p className="text-[10px] uppercase font-bold tracking-[0.2em] opacity-60">Master Hero Image Selection</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-slate-500/5 p-6 rounded-2xl border border-white/40 space-y-3">
              <div className="flex items-center gap-3 text-slate-400">
                <Info className="h-4 w-4 shrink-0" />
                <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">头图建议规格 (Recommended Specs):</p>
              </div>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-7">
                <li>• PNG/WebP 透明底</li>
                <li>• 尺寸 1000x1000+</li>
                <li>• 居中构图</li>
                <li>• 体积 {'<'} 700KB</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
});

BasicInfoSection.displayName = 'BasicInfoSection';

export default BasicInfoSection;
