'use client';

import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Settings, AlertCircle, BarChart3, 
  Eye, EyeOff, Save, Loader2 
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface EditorHeaderProps {
  isEditing: boolean;
  formData: {
    id: string;
    categoryId: string;
    status: 'published' | 'draft' | 'archived';
  };
  categories: any[];
  translations: any[];
  translationCoverage: {
    global: number;
    basic: number;
    specs: number;
    details: number;
  };
  idConflict: boolean;
  onUpdateField: (field: string, value: any) => void;
  onSave: () => void;
  onIdChange: (id: string) => void;
}

const EditorHeader = memo(({
  isEditing,
  formData,
  categories,
  translations,
  translationCoverage,
  idConflict,
  onUpdateField,
  onSave,
  onIdChange
}: EditorHeaderProps) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-center justify-between sticky top-[-40px] -mt-10 z-50 bg-white/90 backdrop-blur-xl py-2 border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-2xl px-8 relative mb-8">
      <div className="flex items-center gap-8 flex-1 min-w-0">
        <div className="flex items-center gap-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-2xl h-10 w-10 hover:bg-slate-100 hover:text-slate-900 transition-all duration-300">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="space-y-1">
            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1 block">Heovose Admin / 资源中心</span>
            <h2 className="text-xl font-headline font-bold text-slate-900 whitespace-nowrap tracking-tight flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Settings className="h-4 w-4" />
              </div>
              {isEditing ? '修改产品' : '创建产品'}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-1 min-w-0 max-w-4xl">
          <div className="space-y-1 w-[200px] shrink-0">
            <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">资源归属分类</Label>
            <Select value={formData.categoryId} onValueChange={v => onUpdateField('categoryId', v)}>
              <SelectTrigger className="h-10 rounded-xl bg-slate-500/5 border-transparent text-xs font-bold uppercase tracking-widest text-slate-600 focus:ring-primary/20">
                <SelectValue placeholder="选择所属分类..." />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-slate-200 shadow-2xl">
                {categories?.map(c => {
                  const trans = translations?.find(t => t.id === c.nameTextId);
                  const name = trans ? (trans.zh || trans.en || c.id) : c.id;
                  return (
                    <SelectItem key={c.id} value={c.id} className="text-[10px] font-bold uppercase py-3">
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1 w-[280px] shrink-0">
            <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">资产唯一标识 (ID)</Label>
            <div className="relative group">
              <Input 
                disabled={isEditing} 
                value={formData.id} 
                onChange={e => onIdChange(e.target.value)} 
                className={cn("h-10 rounded-xl bg-slate-500/5 border-transparent font-mono text-xs font-bold w-full focus-visible:ring-primary/20", idConflict && "border-destructive")} 
                placeholder="GLOBAL_RESOURCE_ID" 
              />
              {idConflict && <AlertCircle className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">智译完整度诊断</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help h-10 px-4 bg-slate-500/5 rounded-xl border border-transparent hover:border-primary/20 transition-all">
                    <BarChart3 className="h-4 w-4 text-primary opacity-60" />
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold h-5 px-2 border-none uppercase tracking-widest",
                        translationCoverage.global === 100 ? "text-green-600 bg-green-50" :
                          translationCoverage.global > 70 ? "text-orange-600 bg-orange-50" : "text-muted-foreground bg-muted/20"
                      )}
                    >
                      HEALTH {translationCoverage.global}%
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" align="end" sideOffset={12} className="w-64 p-6 rounded-[2rem] shadow-2xl border-white/40 bg-white/95 backdrop-blur-2xl">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-bold text-slate-900 uppercase tracking-widest">智译健康度诊断</span>
                      <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-none">{translationCoverage.global}%</Badge>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">基础信息配置</span>
                        <span className={cn(translationCoverage.basic === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.basic}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">技术规格矩阵</span>
                        <span className={cn(translationCoverage.specs === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.specs}%</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                        <span className="text-slate-400">产品详细介绍</span>
                        <span className={cn(translationCoverage.details === 100 ? "text-green-600" : "text-orange-600")}>{translationCoverage.details}%</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-400 pt-2 italic leading-relaxed border-t border-slate-100 mt-2 font-medium">提示：资产多语言完整度直接影响全球分销渠道的同步质量与 SEO 表现。</p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="space-y-1 w-[140px] shrink-0">
            <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">发布状态 (Toggle)</Label>
            <button
              onClick={() => onUpdateField('status', formData.status === 'published' ? 'draft' : 'published')}
              className={cn(
                "w-full h-10 rounded-xl flex items-center px-4 gap-3 transition-all duration-500 border",
                formData.status === 'published'
                  ? "bg-green-50 text-green-700 border-green-200/50 shadow-[0_4px_15px_rgba(34,197,94,0.15)] hover:bg-green-100 hover:border-green-300"
                  : "bg-slate-500/5 text-slate-400 border-transparent hover:bg-slate-200 hover:text-slate-600"
              )}
            >
              {formData.status === 'published' ? (
                <><Eye className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">已发布 / LIVE</span></>
              ) : (
                <><EyeOff className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">草稿 / DRAFT</span></>
              )}
            </button>
          </div>
        </div>
      </div>
      <div className="flex gap-3 ml-6 shrink-0 relative z-10">
        <Button onClick={onSave} className="rounded-2xl h-10 px-8 text-xs font-bold uppercase tracking-widest gap-3 shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
          <Save className="h-5 w-5" /> 同步至云端
        </Button>
      </div>
    </div>
  );
});

EditorHeader.displayName = 'EditorHeader';

export default EditorHeader;
