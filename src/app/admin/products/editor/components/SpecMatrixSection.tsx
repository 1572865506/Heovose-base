'use client';

import React, { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, Trash2, ChevronUp, ChevronDown, 
  Layers, Sparkles, X, Library, Save 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ShinyButton } from "@/components/ui/shiny-button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductSpecEntry {
  uid: string;
  labelEn: string;
  labelZh: string;
  valueEn: string;
  valueZh: string;
}

interface ProductSpecGroup {
  uid: string;
  titleEn: string;
  titleZh: string;
  items: ProductSpecEntry[];
}

interface SpecMatrixSectionProps {
  groups: ProductSpecGroup[];
  setGroups: (groups: ProductSpecGroup[]) => void;
  aiConfig?: { isEnabled: boolean };
  isAiProcessing: boolean;
  processingItems: Set<string>;
  onAiTranslate: (gIdx: number, iIdx: number) => void;
  onAiTranslateAll: () => void;
  onMoveGroup: (idx: number, dir: 'up' | 'down') => void;
  onMoveItem: (gIdx: number, iIdx: number, dir: 'up' | 'down') => void;
  onDeleteGroup: (idx: number) => void;
  specTemplates?: any[];
  onApplyTemplate: (tpl: any, replace?: boolean) => void;
  onSaveTemplate: (mode: 'create' | 'overwrite', name: string, id: string) => void;
  onDeleteTemplate: (id: string, name: string) => void;
}

// 全局 AI 资源（只渲染一次）
const GlobalAiResources = memo(() => (
  <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
    <defs>
      <linearGradient id="ai-button-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#06B6D4" />
        <stop offset="33%" stopColor="#4F46E5" />
        <stop offset="66%" stopColor="#D946EF" />
        <stop offset="100%" stopColor="#F43F5E" />
      </linearGradient>
    </defs>
  </svg>
));

// 轻量级 AI 按钮：暗黑模式自适应
const LiteAiButton = memo(({ onClick, disabled, isProcessing }: { onClick: () => void, disabled: boolean, isProcessing: boolean }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "group relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 overflow-hidden",
      "bg-card border border-border/40 shadow-sm hover:shadow-md hover:border-transparent",
      isProcessing && "ring-2 ring-primary/20"
    )}
  >
    <div className={cn(
      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500",
      isProcessing && "opacity-100 animate-[spin_3s_linear_infinite]"
    )}
    style={{ 
      background: 'conic-gradient(from 0deg, transparent, #06B6D4, #4F46E5, #D946EF, #F43F5E, transparent 25%)',
      margin: '-1px'
    }} />
    <div className="absolute inset-[1px] bg-card rounded-[11px] z-0" />
    <Sparkles 
      className={cn(
        "h-4 w-4 relative z-10 transition-all duration-500",
        "text-muted-foreground group-hover:text-primary group-hover:scale-110",
        isProcessing ? "text-primary animate-pulse" : ""
      )}
      style={(!disabled && !isProcessing) ? { stroke: 'url(#ai-button-gradient)' } : {}}
    />
  </button>
));

const SpecItemRow = memo(({ 
  item, gIdx, iIdx, aiConfig, isAiProcessing, processingItems, onAiTranslate, onUpdate, onMove, onDelete 
}: any) => {
  const isThisProcessing = processingItems.has(`i_${gIdx}_${iIdx}_label`);
  const [localLabelZh, setLocalLabelZh] = useState(item.labelZh);
  const [localValueZh, setLocalValueZh] = useState(item.valueZh);
  const [localLabelEn, setLocalLabelEn] = useState(item.labelEn);
  const [localValueEn, setLocalValueEn] = useState(item.valueEn);

  React.useEffect(() => {
    setLocalLabelZh(item.labelZh);
    setLocalValueZh(item.valueZh);
    setLocalLabelEn(item.labelEn);
    setLocalValueEn(item.valueEn);
  }, [item.labelZh, item.valueZh, item.labelEn, item.valueEn]);

  return (
    <div className="grid grid-cols-12 gap-x-4 gap-y-2 items-start group/item border-b border-border/20 pb-4 last:border-0">
      <div className="col-span-3 space-y-1.5">
        {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 pl-1">参数名 (中)</Label>}
        <Input value={localLabelZh} onChange={e => setLocalLabelZh(e.target.value)} onBlur={() => onUpdate(gIdx, iIdx, 'labelZh', localLabelZh)} className="h-11 px-2 rounded-xl bg-muted/20 border-border/30 text-sm font-bold font-mono text-foreground" />
      </div>
      <div className="col-span-7 space-y-1.5">
        {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 pl-1">参数值 (中)</Label>}
        <Textarea value={localValueZh} onChange={e => setLocalValueZh(e.target.value)} onBlur={() => onUpdate(gIdx, iIdx, 'valueZh', localValueZh)} onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} className="min-h-[44px] max-h-[100px] h-auto px-2 py-2 rounded-xl bg-muted/20 border-border/30 text-sm font-medium font-mono leading-5 overflow-y-auto resize-none text-foreground" />
      </div>
      <div className="col-span-2 row-span-2 self-center flex items-center justify-start gap-6 pl-4 h-full pt-1.5">
        {aiConfig?.isEnabled && <LiteAiButton onClick={() => onAiTranslate(gIdx, iIdx)} disabled={isAiProcessing} isProcessing={isThisProcessing} />}
        <div className="flex flex-col items-center gap-1.5">
          <Button variant="ghost" size="icon" className="h-6 w-10 text-muted-foreground/40 hover:text-foreground" onClick={() => onMove(gIdx, iIdx, 'up')}><ChevronUp className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="h-6 w-10 text-muted-foreground/40 hover:text-foreground" onClick={() => onMove(gIdx, iIdx, 'down')}><ChevronDown className="h-4 w-4" /></Button>
        </div>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-muted-foreground/40 hover:text-destructive" onClick={() => onDelete(gIdx, iIdx)}><X className="h-5 w-5" /></Button>
      </div>
      <div className="col-span-3 space-y-1.5">
        {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 pl-1">参数名 (En)</Label>}
        <Input value={localLabelEn} onChange={e => setLocalLabelEn(e.target.value)} onBlur={() => onUpdate(gIdx, iIdx, 'labelEn', localLabelEn)} className="h-11 px-2 rounded-xl bg-muted/10 border-dashed border-border/30 text-sm font-bold font-mono text-foreground" />
      </div>
      <div className="col-span-7 space-y-1.5">
        {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground/50 pl-1">参数值 (En)</Label>}
        <Textarea value={localValueEn} onChange={e => setLocalValueEn(e.target.value)} onBlur={() => onUpdate(gIdx, iIdx, 'valueEn', localValueEn)} onInput={(e: any) => { e.target.style.height = 'auto'; e.target.style.height = `${e.target.scrollHeight}px`; }} className="min-h-[44px] max-h-[100px] h-auto px-2 py-2 rounded-xl bg-muted/10 border-dashed border-border/30 text-sm font-medium font-mono leading-5 overflow-y-auto resize-none text-foreground" />
      </div>
    </div>
  );
});

const SpecMatrixSection = memo(({
  groups, setGroups, aiConfig, isAiProcessing, processingItems, onAiTranslate, onAiTranslateAll, onMoveGroup, onMoveItem, onDeleteGroup, specTemplates, onApplyTemplate, onSaveTemplate, onDeleteTemplate
}: SpecMatrixSectionProps) => {
  const [isSaveTplOpen, setIsSaveTplOpen] = useState(false);
  const [isDeleteGroupOpen, setIsDeleteGroupOpen] = useState(false);
  const [isImportTplOpen, setIsImportTplOpen] = useState(false);
  const [pendingTpl, setPendingTpl] = useState<any>(null);
  const [groupToDelete, setGroupToDelete] = useState<number | null>(null);
  const [saveMode, setSaveMode] = useState<'create' | 'overwrite'>('create');
  const [newTplName, setNewTplName] = useState('');
  const [selectedTplId, setSelectedTplId] = useState('');

  const handleApplyTemplateClick = (tpl: any) => {
    if (groups.length > 0) { setPendingTpl(tpl); setIsImportTplOpen(true); } else { onApplyTemplate(tpl); }
  };

  const handleAddGroup = () => {
    setGroups([...groups, { uid: `g_${Date.now()}`, titleEn: '', titleZh: '', items: [{ uid: `i_${Date.now()}`, labelEn: '', labelZh: '', valueEn: '', valueZh: '' }] }]);
  };

  const handleAddItem = (gIdx: number) => {
    const newGroups = [...groups];
    newGroups[gIdx].items = [...newGroups[gIdx].items, { uid: `i_${Date.now()}`, labelEn: '', labelZh: '', valueEn: '', valueZh: '' }];
    setGroups(newGroups);
  };

  const updateItem = (gIdx: number, iIdx: number, field: keyof ProductSpecEntry, value: string) => {
    const newGroups = [...groups];
    newGroups[gIdx] = { ...newGroups[gIdx], items: [...newGroups[gIdx].items] };
    newGroups[gIdx].items[iIdx] = { ...newGroups[gIdx].items[iIdx], [field]: value };
    setGroups(newGroups);
  };

  const deleteItem = (gIdx: number, iIdx: number) => {
    const newGroups = [...groups];
    newGroups[gIdx] = { ...newGroups[gIdx], items: newGroups[gIdx].items.filter((_, idx) => idx !== iIdx) };
    setGroups(newGroups);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
      <GlobalAiResources />
      {/* Sticky toolbar */}
      <div className="sticky top-4 z-40 flex items-center justify-between bg-card/80 backdrop-blur-xl p-4 px-8 rounded-3xl border border-border/30 shadow-lg">
        <h3 className="text-xl font-headline font-bold text-foreground">规格参数矩阵</h3>
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl h-10 px-5 text-[10px] font-bold uppercase tracking-widest border-border/40 gap-2 hover:bg-muted/20">
                <Library className="h-4 w-4" /> 管理模板
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-2xl border-border/40 shadow-2xl overflow-hidden bg-card" align="end">
              <div className="bg-foreground/90 p-5 text-background">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">TEMPLATE CENTER</p>
              </div>
              <div className="p-4 border-b border-border/20 bg-muted/10">
                <Button variant="ghost" className="w-full justify-start gap-3 rounded-xl h-11 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary hover:bg-primary/10" onClick={() => setIsSaveTplOpen(true)}>
                  <Save className="h-3.5 w-3.5" /> 存为云端模板
                </Button>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto space-y-1">
                <p className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-widest px-2 pb-2">从现有库导入</p>
                {specTemplates?.map(tpl => (
                  <div key={tpl.id} className="flex items-center justify-between group p-3 hover:bg-muted/20 rounded-xl transition-all cursor-pointer" onClick={() => handleApplyTemplateClick(tpl)}>
                    <span className="text-xs font-bold text-foreground">{tpl.name}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive/50" onClick={(e) => { e.stopPropagation(); onDeleteTemplate(tpl.id, tpl.name); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {aiConfig?.isEnabled && <ShinyButton onClick={onAiTranslateAll} disabled={isAiProcessing} className="h-10 px-6" shape="capsule"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4" /><span className="text-[10px] font-bold uppercase tracking-widest">全表AI智译</span></div></ShinyButton>}
          <Button onClick={handleAddGroup} className="rounded-xl h-10 px-5 text-[10px] font-bold uppercase tracking-widest bg-foreground text-background hover:bg-foreground/90">
            <PlusCircle className="h-4 w-4 mr-2" /> 新增规格组
          </Button>
        </div>
      </div>

      <div className="space-y-8 mt-10">
        {groups.map((group, gIdx) => (
          <section key={group.uid} className="bg-card/60 backdrop-blur-md rounded-[2.5rem] border border-border/30 shadow-sm overflow-hidden">
            {/* 规格组头部 */}
            <div className="bg-muted/20 p-6 border-b border-border/20 flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1 max-w-4xl">
                <div className="w-10 h-10 rounded-2xl bg-card border border-border/30 shadow-sm flex items-center justify-center text-muted-foreground">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <Input value={group.titleZh} onChange={e => { const n = [...groups]; n[gIdx] = {...n[gIdx], titleZh: e.target.value}; setGroups(n); }} className="h-12 bg-card/60 border-border/30 rounded-xl font-bold text-sm text-foreground placeholder:text-muted-foreground/30" placeholder="分组标题 (中)" />
                  <Input value={group.titleEn} onChange={e => { const n = [...groups]; n[gIdx] = {...n[gIdx], titleEn: e.target.value}; setGroups(n); }} className="h-12 bg-card/60 border-border/30 rounded-xl font-bold text-sm text-foreground placeholder:text-muted-foreground/30" placeholder="Group Title (En)" />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted/40" disabled={gIdx === 0} onClick={() => onMoveGroup(gIdx, 'up')}><ChevronUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted/40" disabled={gIdx === groups.length - 1} onClick={() => onMoveGroup(gIdx, 'down')}><ChevronDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-destructive/10" onClick={() => { setGroupToDelete(gIdx); setIsDeleteGroupOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {group.items.map((item, iIdx) => (
                <SpecItemRow key={item.uid} item={item} gIdx={gIdx} iIdx={iIdx} aiConfig={aiConfig} isAiProcessing={isAiProcessing} processingItems={processingItems} onAiTranslate={onAiTranslate} onUpdate={updateItem} onMove={onMoveItem} onDelete={deleteItem} />
              ))}
              <Button variant="ghost" className="w-full h-14 rounded-2xl border-2 border-dashed border-border/20 text-muted-foreground/50 hover:text-foreground hover:border-primary/30 font-bold uppercase text-[10px] tracking-widest mt-4" onClick={() => handleAddItem(gIdx)}>
                <PlusCircle className="h-4 w-4 mr-2" /> 添加参数项
              </Button>
            </div>
          </section>
        ))}
      </div>

      {/* 存为模板弹窗 */}
      <Dialog open={isSaveTplOpen} onOpenChange={setIsSaveTplOpen}>
        <DialogContent className="rounded-2xl max-w-md p-0 overflow-hidden bg-card border-border/40">
          <div className="bg-foreground/90 p-8 text-background">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-background">
                <Library className="h-5 w-5" /> 同步至云端规格库
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 p-1 bg-muted/20 rounded-2xl border border-border/30">
              <button onClick={() => setSaveMode('create')} className={cn("rounded-xl h-10 text-[10px] font-bold uppercase transition-all", saveMode === 'create' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>另存为新模板</button>
              <button onClick={() => setSaveMode('overwrite')} className={cn("rounded-xl h-10 text-[10px] font-bold uppercase transition-all", saveMode === 'overwrite' ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}>覆盖现有模板</button>
            </div>
            {saveMode === 'create' ? (
              <div className="space-y-2.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground/60">模板名称</Label><Input value={newTplName} onChange={e => setNewTplName(e.target.value)} className="h-12 rounded-xl bg-muted/20 border-border/30 text-sm font-bold text-foreground" placeholder="例如：高端标准规格" /></div>
            ) : (
              <div className="space-y-2.5"><Label className="text-[10px] font-bold uppercase text-muted-foreground/60">选择目标模板</Label><Select value={selectedTplId} onValueChange={setSelectedTplId}><SelectTrigger className="h-12 rounded-xl bg-muted/20 border-border/30 text-sm font-bold"><SelectValue placeholder="选择模板..." /></SelectTrigger><SelectContent>{specTemplates?.map(tpl => (<SelectItem key={tpl.id} value={tpl.id} className="text-xs font-bold uppercase">{tpl.name}</SelectItem>))}</SelectContent></Select></div>
            )}
          </div>
          <DialogFooter className="bg-muted/10 p-8 border-t border-border/20 gap-3">
            <Button variant="outline" onClick={() => setIsSaveTplOpen(false)} className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs border-border/30">返回</Button>
            <Button onClick={() => { onSaveTemplate(saveMode, newTplName, selectedTplId); setIsSaveTplOpen(false); }} className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs bg-foreground text-background">确认同步</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除规格组确认弹窗 */}
      <AlertDialog open={isDeleteGroupOpen} onOpenChange={setIsDeleteGroupOpen}>
        <AlertDialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden bg-card border-border/40">
          <div className="bg-red-600 p-8 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">确认删除规格组？</AlertDialogTitle>
            </AlertDialogHeader>
          </div>
          <div className="p-8"><p className="text-sm font-bold text-foreground">确定要移除该规格分组吗？此操作将同时删除该组下的所有参数项。</p></div>
          <AlertDialogFooter className="bg-muted/10 p-8 border-t border-border/20 gap-3">
            <AlertDialogCancel className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs border-border/30">取消</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (groupToDelete !== null) onDeleteGroup(groupToDelete); setIsDeleteGroupOpen(false); }} className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs bg-red-600 text-white">确定删除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 导入模板冲突弹窗 */}
      <Dialog open={isImportTplOpen} onOpenChange={setIsImportTplOpen}>
        <DialogContent className="rounded-2xl max-w-sm p-6 bg-card border-border/40 space-y-6">
          <DialogTitle className="text-sm font-bold text-foreground">导入规格模板</DialogTitle>
          <p className="text-xs text-muted-foreground">列表已存在内容，您希望如何处理新模板？</p>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="ghost" onClick={() => setIsImportTplOpen(false)} className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase hover:bg-muted/20">取消</Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => { onApplyTemplate(pendingTpl, true); setIsImportTplOpen(false); }} className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase text-red-500 border-red-500/20 hover:bg-red-500/10">全量替换</Button>
            <Button onClick={() => { onApplyTemplate(pendingTpl, false); setIsImportTplOpen(false); }} className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase bg-foreground text-background">增量追加</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

SpecMatrixSection.displayName = 'SpecMatrixSection';

export default SpecMatrixSection;
