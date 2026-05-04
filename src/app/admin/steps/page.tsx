
"use client";

import { useState, useMemo } from 'react';
import { useLocalDoc } from '@/hooks/use-local-doc';
import { useLocalCollection } from '@/hooks/use-local-collection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ClipboardList, 
  MoveUp, 
  MoveDown, 
  Loader2, 
  Sparkles, 
  Image as ImageIcon,
  Check,
  X,
  Search,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { translateContent } from '@/ai/flows/translate-flow';
import { cn } from '@/lib/utils';
import { ShinyButton } from '@/components/ui/shiny-button';
import { Badge } from '@/components/ui/badge';
import { MediaLibraryDialog } from '@/components/admin/media-library-dialog';
import Image from 'next/image';

interface ProductionStep {
  id: string;
  order: number;
  titleZh: string;
  titleEn: string;
  descZh: string;
  descEn: string;
  imageUrls: string[];
}

export default function ProductionStepsAdminPage() {
  const { toast } = useToast();
  
  const { data: steps, isLoading, mutate: mutateSteps } = useLocalCollection<ProductionStep>('productionSteps');
  const { data: aiConfig } = useLocalDoc<any>('settings', 'ai');
  const { data: galleryAssets } = useLocalCollection<any>('galleryAssets');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [editingStep, setEditingStep] = useState<ProductionStep | null>(null);
  
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [form, setForm] = useState<Partial<ProductionStep>>({
    titleZh: '',
    titleEn: '',
    descZh: '',
    descEn: '',
    imageUrls: []
  });

  const handleOpenDialog = (step?: ProductionStep) => {
    if (step) {
      setEditingStep(step);
      setForm(step);
    } else {
      setEditingStep(null);
      setForm({
        titleZh: '',
        titleEn: '',
        descZh: '',
        descEn: '',
        imageUrls: [],
        order: (steps?.length || 0) + 1
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.titleZh) return;
    
    const id = editingStep?.id || `step_${Date.now()}`;
    try {
      await fetch(`/api/productionSteps/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      mutateSteps();
      setIsDialogOpen(false);
      toast({ title: editingStep ? "步骤已更新" : "新步骤已添加" });
    } catch (e) {
      toast({ variant: "destructive", title: "保存失败" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定要永久删除此生产环节吗？')) return;
    try {
      await fetch(`/api/productionSteps/${id}`, { method: 'DELETE' });
      mutateSteps();
      toast({ title: "步骤已删除" });
    } catch (e) {
      toast({ variant: "destructive", title: "删除失败" });
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (!steps) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    const currentStep = steps[index];
    const targetStep = steps[targetIndex];

    try {
      await Promise.all([
        fetch(`/api/productionSteps/${currentStep.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...currentStep, order: targetStep.order }),
        }),
        fetch(`/api/productionSteps/${targetStep.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...targetStep, order: currentStep.order }),
        })
      ]);
      mutateSteps();
    } catch (e) {
      toast({ variant: "destructive", title: "排序更新失败" });
    }
  };

  const handleTranslate = async () => {
    if (!aiConfig?.isEnabled) {
      toast({ variant: "destructive", title: "AI 未启用" });
      return;
    }
    setIsAiProcessing(true);
    try {
      const results = await Promise.all([
        form.titleZh ? translateContent({ text: form.titleZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null,
        form.descZh ? translateContent({ text: form.descZh || '', targetLangs: ['en'], apiKey: aiConfig.apiKey }) : null
      ]);
      setForm(prev => ({
        ...prev,
        titleEn: results[0]?.en || prev.titleEn,
        descEn: results[1]?.en || prev.descEn
      }));
      toast({ title: "智译成功" });
    } catch (e: any) {
      toast({ variant: "destructive", title: "智译失败", description: e.message });
    } finally {
      setIsAiProcessing(false);
    }
  };

  const moveImage = (idx: number, dir: 'left' | 'right') => {
    const urls = [...(form.imageUrls || [])];
    const targetIdx = dir === 'left' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= urls.length) return;
    [urls[idx], urls[targetIdx]] = [urls[targetIdx], urls[idx]];
    setForm({ ...form, imageUrls: urls });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-headline font-bold text-primary flex items-center gap-2">
            <ClipboardList className="h-5 w-5" /> 生产流程管理
          </h2>
          <p className="text-sm text-muted-foreground">定义前台 11 步精密制造流程，支持多图轮播配置。</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="rounded-xl h-10 px-6 gap-2 text-xs font-bold uppercase tracking-widest shadow-md">
          <Plus className="h-4 w-4" /> 新增生产步骤
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
        <div className="p-6 space-y-4">
          {isLoading ? (
            <div className="py-20 text-center"><Loader2 className="h-8 w-8 animate-spin mx-auto opacity-10" /></div>
          ) : steps?.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed rounded-2xl bg-muted/5">
               <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic opacity-40">暂无生产步骤数据 / NO DATA</p>
            </div>
          ) : (
            <div className="space-y-3">
              {steps?.map((step, idx) => (
                <div key={step.id} className="group flex items-center gap-6 p-4 bg-muted/5 hover:bg-muted/10 rounded-2xl border border-transparent hover:border-border/60 transition-all">
                  <div className="w-10 h-10 shrink-0 bg-primary text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg">
                    {idx + 1}
                  </div>
                  
                  <div className="relative w-20 h-14 shrink-0 bg-white rounded-lg border overflow-hidden shadow-inner">
                    {step.imageUrls?.[0] ? (
                      <Image src={step.imageUrls[0]} alt="" fill className="object-cover" unoptimized />
                    ) : (
                      <div className="flex items-center justify-center h-full opacity-20"><ImageIcon className="h-5 w-5" /></div>
                    )}
                    {step.imageUrls && step.imageUrls.length > 1 && (
                      <Badge className="absolute bottom-1.5 right-1.5 h-4 px-1.5 text-[9px] bg-black/60 border-none font-bold">+{step.imageUrls.length-1}</Badge>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-bold text-primary">{step.titleZh}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1 italic uppercase tracking-wider font-medium">{step.titleEn || 'No English Translation'}</p>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={idx === 0} onClick={() => handleMove(idx, 'up')}><MoveUp className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={idx === steps.length - 1} onClick={() => handleMove(idx, 'down')}><MoveDown className="h-4 w-4" /></Button>
                    <div className="w-px h-4 bg-border mx-2" />
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleOpenDialog(step)}><Edit2 className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(step.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-5xl p-0 rounded-3xl overflow-hidden border-none shadow-2xl">
          <div className="bg-primary p-6 text-white">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <ClipboardList className="h-5 w-5" /> {editingStep ? '编辑生产步骤' : '新增生产环节'}
              </DialogTitle>
              <DialogDescription className="text-white/60 text-xs uppercase tracking-tight font-medium">配置制造流水线中的关键视觉与参数。</DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-8 bg-white grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">步骤标题 (ZH)</Label>
                  <Input value={form.titleZh} onChange={e => setForm({...form, titleZh: e.target.value})} className="h-11 rounded-xl" placeholder="例如: PMC 生产计划" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">核心描述 (ZH)</Label>
                  <Textarea value={form.descZh} onChange={e => setForm({...form, descZh: e.target.value})} className="min-h-[120px] rounded-xl" placeholder="详细说明此环节的操作逻辑与质量标准..." />
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-dashed">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">步骤关联素材 ({form.imageUrls?.length || 0})</Label>
                  <Button variant="outline" size="sm" onClick={() => setIsPickerOpen(true)} className="h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest gap-2">
                    <Plus className="h-3 w-3" /> 导入素材库
                  </Button>
                </div>
                <div className="flex gap-4 p-3 bg-muted/5 rounded-xl border border-border/40 overflow-x-auto min-h-[120px] items-center">
                  {form.imageUrls?.map((url, i) => (
                    <div key={i} className="group relative w-32 aspect-square shrink-0 rounded-lg border overflow-hidden bg-white shadow-sm transition-all hover:scale-105">
                      <Image src={url} alt="" fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                        <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full" disabled={i === 0} onClick={() => moveImage(i, 'left')}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="secondary" className="h-6 w-6 rounded-full" disabled={i === (form.imageUrls?.length || 0) - 1} onClick={() => moveImage(i, 'right')}><ChevronRight className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="destructive" className="h-6 w-6 rounded-full" onClick={() => setForm({...form, imageUrls: form.imageUrls?.filter((_,idx)=>idx!==i)})}><X className="h-3.5 w-3.5" /></Button>
                      </div>
                    </div>
                  ))}
                  {(!form.imageUrls || form.imageUrls.length === 0) && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 opacity-30">
                       <ImageIcon className="h-8 w-8" />
                       <span className="text-xs font-bold uppercase tracking-widest">请选择至少一张图片</span>
                    </div>
                  )}
                </div>
                <p className="text-[9px] text-muted-foreground italic">支持单张或多张配置。多张时前台自动启用进度条轮播。</p>
              </div>
            </div>

            <div className="space-y-6">
               <div className="flex justify-end border-l pl-8">
                {aiConfig?.isEnabled && (
                  <ShinyButton 
                    onClick={handleTranslate} 
                    disabled={isAiProcessing}
                    className="h-10 px-5"
                    shape="capsule"
                  >
                    <div className="flex items-center gap-2">
                      {isAiProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                      <span className="text-[11px] font-bold uppercase tracking-widest">AI 智译右侧信息</span>
                    </div>
                  </ShinyButton>
                )}
              </div>

              <div className="space-y-4 pt-4 border-l pl-8 border-dashed flex-1">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">Title (EN)</Label>
                  <Input value={form.titleEn} onChange={e => setForm({...form, titleEn: e.target.value})} className="h-11 rounded-xl border-dashed" placeholder="STEP TITLE IN ENGLISH" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">Description (EN)</Label>
                  <Textarea value={form.descEn} onChange={e => setForm({...form, descEn: e.target.value})} className="min-h-[120px] rounded-xl border-dashed" placeholder="DETAILED ENGLISH DESCRIPTION..." />
                </div>
              </div>
              
              <div className="pt-6 border-l pl-8 border-dashed">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase opacity-40 tracking-widest pl-1">步骤排序权重</Label>
                  <Input type="number" value={form.order} onChange={e => setForm({...form, order: parseInt(e.target.value)})} className="h-10 rounded-xl bg-muted/10 border-transparent font-mono" />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="bg-muted/10 p-6 flex gap-3 border-t">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl h-12 flex-1 font-bold uppercase text-xs tracking-widest">取消编辑</Button>
            <Button onClick={handleSave} className="rounded-xl h-12 flex-1 font-bold uppercase text-xs tracking-widest shadow-lg shadow-primary/20">确认步骤配置</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MediaLibraryDialog 
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={(assets) => {
          const newUrls = assets.map(a => a.url);
          setForm({ ...form, imageUrls: newUrls });
        }}
        selectionMode="multiple"
        title="选择生产步骤素材"
        subtitle="你可以选择多张图片，前台将以轮播形式展示"
      />
    </div>
  );
}
