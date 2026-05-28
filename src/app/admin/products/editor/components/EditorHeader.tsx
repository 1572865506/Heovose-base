'use client';

import React, { memo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AdminEditorHeader } from "@/components/admin/AdminEditorHeader";
import {
  Settings, AlertCircle, BarChart3,
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
  isSaving?: boolean;
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
  onIdChange,
  isSaving
}: EditorHeaderProps) => {

  const middleContent = (
    <>
      {/* 资源归属分类 */}
      <div className="space-y-1 flex-1 min-w-[120px] max-w-[200px]">
        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">产品分类</Label>
        <Select value={formData.categoryId} onValueChange={v => onUpdateField('categoryId', v)}>
          <SelectTrigger className="h-10 rounded-xl bg-muted/20 border-border/30 text-xs font-bold uppercase tracking-widest text-foreground focus:ring-primary/20">
            <SelectValue placeholder="选择分类..." />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
            {(() => {
              const buildTree = (parentId: string | null, depth = 0): React.ReactNode[] => {
                const children = categories?.filter(c => c.parentId === parentId) || [];
                return children.flatMap(c => {
                  const trans = translations?.find(t => t.id === c.nameTextId);
                  const name = trans ? (trans.zh || trans.content?.zh || trans.en || trans.content?.en || c.id) : c.id;

                  const item = (
                    <SelectItem
                      key={c.id}
                      value={c.id}
                      className={cn(
                        "text-[10px] font-bold uppercase py-3",
                        depth > 0 && "pl-8 opacity-70",
                        depth === 0 && "bg-muted/20 font-black"
                      )}
                    >
                      {depth > 0 ? `— ${name}` : name}
                    </SelectItem>
                  );

                  return [item, ...buildTree(c.id, depth + 1)];
                });
              };

              const roots = categories?.filter(c => !c.parentId) || [];
              if (roots.length === 0 && categories?.length > 0) {
                const mainRoots = ['WHOLESALE', 'PROJECT'];
                return categories
                  .filter(c => mainRoots.includes(c.id))
                  .flatMap(c => {
                    const trans = translations?.find(t => t.id === c.nameTextId);
                    const name = trans ? (trans.zh || trans.content?.zh || trans.en || trans.content?.en || c.id) : c.id;
                    return [
                      <SelectItem key={c.id} value={c.id} className="text-[10px] font-black uppercase py-3 bg-muted/20">
                        {name}
                      </SelectItem>,
                      ...buildTree(c.id, 1)
                    ];
                  });
              }

              return buildTree(null);
            })()}
          </SelectContent>
        </Select>
      </div>

      {/* 资产唯一标识 (ID) */}
      <div className="space-y-1 flex-1 min-w-[140px] max-w-[260px]">
        <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/60 pl-1">产品 (ID)</Label>
        <div className="relative group">
          <Input
            disabled={isEditing}
            value={formData.id}
            onChange={e => onIdChange(e.target.value)}
            className={cn("h-10 rounded-xl bg-muted/20 border-border/30 font-mono text-xs font-bold w-full focus-visible:ring-primary/20 text-foreground", idConflict && "border-destructive")}
            placeholder="GLOBAL_RESOURCE_ID"
          />
          {idConflict && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
        </div>
      </div>
    </>
  );

  const rightExtraActions = (
    <>
      {/* 智译完整度诊断 */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-2 cursor-help h-10 px-3 bg-muted/20 rounded-xl border border-border/30 hover:border-primary/20 transition-all shrink-0">
              <BarChart3 className="h-4 w-4 text-primary opacity-60" />
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-bold h-5 px-2 border-none uppercase tracking-widest",
                  translationCoverage.global === 100 ? "text-emerald-500 bg-emerald-500/10" :
                    translationCoverage.global > 70 ? "text-orange-500 bg-orange-500/10" : "text-muted-foreground bg-muted/20"
                )}
              >
                {translationCoverage.global}%
              </Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent side="bottom" align="end" sideOffset={12} className="w-64 p-6 rounded-[2rem] shadow-2xl border-border/40 bg-card/95 backdrop-blur-2xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border/30 pb-3">
                <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">智译健康度诊断</span>
                <Badge variant="secondary" className="text-[9px] font-bold bg-primary/10 text-primary border-none">{translationCoverage.global}%</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground/60">基础信息配置</span>
                  <span className={cn(translationCoverage.basic === 100 ? "text-emerald-500" : "text-orange-500")}>{translationCoverage.basic}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground/60">技术规格矩阵</span>
                  <span className={cn(translationCoverage.specs === 100 ? "text-emerald-500" : "text-orange-500")}>{translationCoverage.specs}%</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-muted-foreground/60">产品详细介绍</span>
                  <span className={cn(translationCoverage.details === 100 ? "text-emerald-500" : "text-orange-500")}>{translationCoverage.details}%</span>
                </div>
              </div>
              <p className="text-[9px] text-muted-foreground/50 pt-2 italic leading-relaxed border-t border-border/20 mt-2 font-medium">提示：资产多语言完整度直接影响全球分销渠道的同步质量与 SEO 表现。</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* 发布状态 (Toggle) */}
      <div className="w-[100px] shrink-0">
        <button
          onClick={() => onUpdateField('status', formData.status === 'published' ? 'draft' : 'published')}
          className={cn(
            "w-full h-10 rounded-xl flex items-center justify-center gap-2 transition-all duration-500 border",
            formData.status === 'published'
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_4px_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 hover:border-emerald-500/40"
              : "bg-muted/20 text-muted-foreground border-border/30 hover:bg-muted/40 hover:text-foreground"
          )}
        >
          {formData.status === 'published' ? (
            <><Eye className="h-3.5 w-3.5 text-emerald-500" /><span className="text-[10px] font-bold uppercase tracking-widest">已发布</span></>
          ) : (
            <><EyeOff className="h-3.5 w-3.5 text-muted-foreground" /><span className="text-[10px] font-bold uppercase tracking-widest">草稿箱</span></>
          )}
        </button>
      </div>
    </>
  );

  return (
    <AdminEditorHeader
      title={isEditing ? '修改产品' : '创建产品'}
      icon={Settings}
      onSave={onSave}
      isSaving={isSaving}
      saveText="同步至云端"
      middleContent={middleContent}
      rightExtraActions={rightExtraActions}
    />
  );
});

EditorHeader.displayName = 'EditorHeader';

export default EditorHeader;
