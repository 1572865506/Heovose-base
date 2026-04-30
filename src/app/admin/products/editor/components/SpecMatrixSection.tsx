'use client';

import React, { memo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const SpecMatrixSection = memo(({
  groups,
  setGroups,
  aiConfig,
  isAiProcessing,
  processingItems,
  onAiTranslate,
  onAiTranslateAll,
  onMoveGroup,
  onMoveItem,
  onDeleteGroup,
  specTemplates,
  onApplyTemplate,
  onSaveTemplate,
  onDeleteTemplate
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
    if (groups.length > 0) {
      setPendingTpl(tpl);
      setIsImportTplOpen(true);
    } else {
      onApplyTemplate(tpl);
    }
  };

  const handleAddGroup = () => {
    setGroups([...groups, { 
      uid: `g_${Date.now()}`, 
      titleEn: '', 
      titleZh: '', 
      items: [{ uid: `i_${Date.now()}`, labelEn: '', labelZh: '', valueEn: '', valueZh: '' }] 
    }]);
  };

  const handleAddItem = (gIdx: number) => {
    const newGroups = [...groups];
    newGroups[gIdx].items.push({ uid: `i_${Date.now()}`, labelEn: '', labelZh: '', valueEn: '', valueZh: '' });
    setGroups(newGroups);
  };

  const updateItem = (gIdx: number, iIdx: number, field: keyof ProductSpecEntry, value: string) => {
    const newGroups = [...groups];
    (newGroups[gIdx].items[iIdx][field] as string) = value;
    setGroups(newGroups);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 relative">
      {/* Sticky 顶栏操作区 */}
      <div className="sticky top-4 z-40 flex items-center justify-between bg-white/80 backdrop-blur-xl p-4 px-8 rounded-3xl border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all">
        <div className="space-y-1">
          <h3 className="text-xl font-headline font-bold text-slate-900 flex items-center gap-3">
            规格参数矩阵
          </h3>
        </div>
        <div className="flex gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="rounded-xl h-10 px-5 text-[10px] font-bold uppercase tracking-widest border-slate-200 gap-2 hover:bg-slate-100 hover:border-slate-300 hover:text-slate-900 transition-all duration-300 active:scale-95">
                <Library className="h-4 w-4" /> 管理模板
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 rounded-2xl border-slate-200 shadow-2xl overflow-hidden" align="end">
              <div className="bg-slate-900 p-5 text-white">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">TEMPLATE CENTER</p>
              </div>
              <div className="p-4 border-b border-slate-100 bg-slate-50/30">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start gap-3 rounded-xl h-11 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary/5 text-primary border border-primary/10 hover:bg-primary/10 transition-all"
                  onClick={() => setIsSaveTplOpen(true)}
                >
                  <Save className="h-3.5 w-3.5" /> 存为云端模板
                </Button>
              </div>
              <div className="p-4 max-h-[300px] overflow-y-auto space-y-1 text-slate-900">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest px-2 pb-2">从现有库导入</p>
                {specTemplates?.map(tpl => (
                  <div key={tpl.id} className="flex items-center justify-between group p-3 hover:bg-slate-50 rounded-xl transition-all cursor-pointer" onClick={() => handleApplyTemplateClick(tpl)}>
                    <span className="text-xs font-bold text-slate-700">{tpl.name}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 text-destructive/40 hover:text-destructive hover:bg-red-50 transition-all" onClick={(e) => { e.stopPropagation(); onDeleteTemplate(tpl.id, tpl.name); }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {aiConfig?.isEnabled && (
            <ShinyButton
              onClick={onAiTranslateAll}
              disabled={isAiProcessing}
              className="h-10 px-6"
              shape="capsule"
            >
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">全表AI智译</span>
              </div>
            </ShinyButton>
          )}
          
          <Button onClick={handleAddGroup} className="rounded-xl h-10 px-5 text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg transition-all duration-300">
            <PlusCircle className="h-4 w-4 mr-2" /> 新增规格组
          </Button>
        </div>
      </div>

      <div className="space-y-8 mt-10 text-slate-900">
        {groups.map((group, gIdx) => (
          <section key={group.uid} className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group/group transition-all">
            <div className="bg-slate-50/50 p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-6 flex-1 max-w-4xl">
                <div className="w-10 h-10 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400">
                  <Layers className="h-5 w-5" />
                </div>
                <div className="grid grid-cols-2 gap-4 flex-1">
                  <Input value={group.titleZh} onChange={e => { const n = [...groups]; n[gIdx].titleZh = e.target.value; setGroups(n); }} className="h-12 bg-white border-slate-200 rounded-xl font-bold text-sm" placeholder="分组标题 (中)" />
                  <Input value={group.titleEn} onChange={e => { const n = [...groups]; n[gIdx].titleEn = e.target.value; setGroups(n); }} className="h-12 bg-white border-slate-200 rounded-xl font-bold text-sm" placeholder="Group Title (En)" />
                </div>
              </div>
              <div className="flex items-center gap-2 ml-6">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100" disabled={gIdx === 0} onClick={() => onMoveGroup(gIdx, 'up')}><ChevronUp className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100" disabled={gIdx === groups.length - 1} onClick={() => onMoveGroup(gIdx, 'down')}><ChevronDown className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-destructive/40 hover:text-destructive hover:bg-red-50 transition-all duration-300" onClick={() => { setGroupToDelete(gIdx); setIsDeleteGroupOpen(true); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {group.items.map((item, iIdx) => (
                <div key={item.uid} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start group/item border-b border-slate-100/50 pb-4 last:border-0">
                  <div className="col-span-3 space-y-1.5">
                    {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">参数名 (中)</Label>}
                    <Input value={item.labelZh} onChange={e => updateItem(gIdx, iIdx, 'labelZh', e.target.value)} className="h-11 px-2 rounded-xl bg-white border-slate-200 text-sm placeholder:text-xs font-bold font-mono" placeholder="标签 (中)" />
                  </div>
                  <div className="col-span-7 space-y-1.5">
                    {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">参数值 (中)</Label>}
                    <Textarea value={item.valueZh} onChange={e => updateItem(gIdx, iIdx, 'valueZh', e.target.value)} onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px`; }} className="min-h-[44px] max-h-[100px] h-auto px-2 py-2 rounded-xl bg-white border-slate-200 text-sm placeholder:text-xs font-medium font-mono leading-5 overflow-y-auto resize-none transition-all" placeholder="数值内容 (中)" />
                  </div>
                  <div className="col-span-2 row-span-2 self-center flex items-center justify-start gap-6 pl-4 h-full pt-1.5">
                    {aiConfig?.isEnabled && (
                      <ShinyButton onClick={() => onAiTranslate(gIdx, iIdx)} disabled={isAiProcessing} className="w-10 h-10 !p-0 flex items-center justify-center shadow-sm" shape="rounded">
                        <Sparkles className={cn("h-4 w-4", processingItems.has(`i_${gIdx}_${iIdx}_label`) && "animate-spin")} />
                      </ShinyButton>
                    )}
                    <div className="flex flex-col items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="h-6 w-10 rounded-md text-slate-300 hover:bg-slate-100" disabled={iIdx === 0} onClick={() => onMoveItem(gIdx, iIdx, 'up')}><ChevronUp className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-6 w-10 rounded-md text-slate-300 hover:bg-slate-100" disabled={iIdx === group.items.length - 1} onClick={() => onMoveItem(gIdx, iIdx, 'down')}><ChevronDown className="h-4 w-4" /></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:bg-red-50 hover:text-destructive transition-all duration-300" onClick={() => { const n = [...groups]; n[gIdx].items.splice(iIdx, 1); setGroups(n); }}><X className="h-5 w-5" /></Button>
                  </div>
                  <div className="col-span-3 space-y-1.5">
                    {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">参数名 (En)</Label>}
                    <Input value={item.labelEn} onChange={e => updateItem(gIdx, iIdx, 'labelEn', e.target.value)} className="h-11 px-2 rounded-xl bg-slate-500/5 border-dashed border-slate-200 text-sm placeholder:text-xs font-bold font-mono" placeholder="Label (En)" />
                  </div>
                  <div className="col-span-7 space-y-1.5">
                    {iIdx === 0 && <Label className="text-[8px] font-bold uppercase tracking-widest text-slate-400 pl-1">参数值 (En)</Label>}
                    <Textarea value={item.valueEn} onChange={e => updateItem(gIdx, iIdx, 'valueEn', e.target.value)} onInput={(e) => { const t = e.target as HTMLTextAreaElement; t.style.height = 'auto'; t.style.height = `${t.scrollHeight}px`; }} className="min-h-[44px] max-h-[100px] h-auto px-2 py-2 rounded-xl bg-slate-500/5 border-dashed border-slate-200 text-sm placeholder:text-xs font-medium font-mono leading-5 overflow-y-auto resize-none transition-all" placeholder="Value Content (En)" />
                  </div>
                </div>
              ))}
              <Button variant="ghost" className="w-full h-14 rounded-2xl border-2 border-dashed border-slate-100 text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-4 hover:bg-slate-50 hover:text-slate-600 transition-all duration-300" onClick={() => handleAddItem(gIdx)}>
                <PlusCircle className="h-4 w-4 mr-2" /> 添加参数项
              </Button>
            </div>
          </section>
        ))}
      </div>

      <Dialog open={isSaveTplOpen} onOpenChange={setIsSaveTplOpen}>
        <DialogContent className="rounded-2xl max-w-md p-0 overflow-hidden border-none shadow-2xl bg-white">
          <div className="bg-slate-900 p-8 text-white relative">
            <DialogHeader className="relative z-10 space-y-1">
              <DialogTitle className="text-xl font-headline font-bold flex items-center gap-3">
                <Library className="h-5 w-5" /> 同步至云端规格库
              </DialogTitle>
              <DialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Template Center</DialogDescription>
            </DialogHeader>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 p-1 bg-slate-500/5 rounded-2xl border border-slate-100">
              <button 
                type="button"
                onClick={() => setSaveMode('create')} 
                className={cn(
                  "rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center", 
                  saveMode === 'create' ? "!bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-100"
                )}
              >
                另存为新模板
              </button>
              <button 
                type="button"
                onClick={() => setSaveMode('overwrite')} 
                className={cn(
                  "rounded-xl h-10 text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center", 
                  saveMode === 'overwrite' ? "!bg-slate-900 text-white shadow-xl" : "text-slate-400 hover:bg-slate-100"
                )}
              >
                覆盖现有模板
              </button>
            </div>
            
            {saveMode === 'create' ? (
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">模板名称</Label>
                <Input 
                  value={newTplName} 
                  onChange={e => setNewTplName(e.target.value)} 
                  className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-bold focus-visible:ring-slate-200 text-slate-900" 
                  placeholder="例如：高端标准规格" 
                />
              </div>
            ) : (
              <div className="space-y-2.5">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 pl-1">选择目标模板</Label>
                <Select value={selectedTplId} onValueChange={setSelectedTplId}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-500/5 border-transparent text-sm font-bold focus:ring-slate-200 shadow-none text-slate-900">
                    <SelectValue placeholder="选择模板..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-2xl bg-white">
                    {specTemplates?.map(tpl => (
                      <SelectItem 
                        key={tpl.id} 
                        value={tpl.id} 
                        className="text-xs font-bold uppercase tracking-widest py-3 focus:bg-slate-100 focus:text-slate-900 cursor-pointer"
                      >
                        {tpl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter className="bg-slate-50 p-8 border-t border-slate-200 gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsSaveTplOpen(false)} 
              className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest hover:bg-slate-100 hover:text-slate-900 border-slate-200 transition-all"
            >
              返回
            </Button>
            <Button 
              onClick={() => { onSaveTemplate(saveMode, newTplName, selectedTplId); setIsSaveTplOpen(false); }} 
              className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
            >
              确认同步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 AlertDialog */}
      <AlertDialog open={isDeleteGroupOpen} onOpenChange={setIsDeleteGroupOpen}>
        <AlertDialogContent className="rounded-3xl max-w-sm p-0 overflow-hidden border-none shadow-2xl">
          <div className="bg-red-600 p-8 text-white relative">
            <AlertDialogHeader className="relative z-10 space-y-1">
              <AlertDialogTitle className="text-xl font-headline font-bold flex items-center gap-3">
                <Trash2 className="h-5 w-5" /> 确认删除规格组？
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Permanent Action</AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <div className="p-8 bg-white/90 backdrop-blur-2xl">
            <p className="text-sm font-bold text-slate-900 leading-relaxed">
              确定要移除该规格分组吗？此操作将同时删除该组下的所有参数项，且不可撤销。
            </p>
          </div>
          <AlertDialogFooter className="bg-slate-50 p-8 border-t border-slate-200 gap-3">
            <AlertDialogCancel className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest hover:bg-slate-100 border-slate-200 transition-all">取消</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { if (groupToDelete !== null) onDeleteGroup(groupToDelete); setIsDeleteGroupOpen(false); }}
              className="flex-1 rounded-2xl h-14 font-bold uppercase text-xs tracking-widest bg-red-600 text-white hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
            >
              确定删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 导入模板选择 Dialog (极简版) */}
      <Dialog open={isImportTplOpen} onOpenChange={setIsImportTplOpen}>
        <DialogContent className="rounded-2xl max-w-sm p-6 border-none shadow-2xl bg-white space-y-6">
          <div className="space-y-2">
            <DialogTitle className="text-sm font-bold text-slate-900">导入规格模板</DialogTitle>
            <DialogDescription className="text-xs text-slate-500 leading-relaxed">
              列表已存在内容，您希望如何处理新模板？
            </DialogDescription>
          </div>
          
          <div className="flex items-center gap-2 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsImportTplOpen(false)}
              className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:bg-slate-100"
            >
              取消
            </Button>
            <div className="flex-1" />
            <Button 
              variant="outline"
              onClick={() => {
                onApplyTemplate(pendingTpl, true);
                setIsImportTplOpen(false);
              }}
              className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest text-red-600 border-red-100 hover:bg-red-50"
            >
              全量替换
            </Button>
            <Button 
              onClick={() => {
                onApplyTemplate(pendingTpl, false);
                setIsImportTplOpen(false);
              }}
              className="h-9 px-4 rounded-lg text-[10px] font-bold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800"
            >
              增量追加
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

SpecMatrixSection.displayName = 'SpecMatrixSection';

export default SpecMatrixSection;
